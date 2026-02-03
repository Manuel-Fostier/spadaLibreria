/**
 * @jest-environment node
 */

// Mock Next.js server components before imports
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

import { POST } from '../term/route';
import fs from 'fs';
import yaml from 'js-yaml';

jest.mock('fs');
jest.mock('js-yaml');

describe('POST /api/glossary/term', () => {
  const mockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as any;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if termKey is missing', async () => {
    const request = mockRequest({ field: 'category', value: 'Test' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });

  it('should return 400 if field is missing', async () => {
    const request = mockRequest({ termKey: 'mandritto', value: 'Test' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });

  it('should return 400 if value is missing', async () => {
    const request = mockRequest({ termKey: 'mandritto', field: 'category' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });

  it('should return 400 if field is invalid', async () => {
    const request = mockRequest({
      termKey: 'mandritto',
      field: 'invalid_field',
      value: 'Test'
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid field');
  });

  it('should return 404 if term does not exist', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('mandritto:\n  term: Mandritto');
    (yaml.load as jest.Mock).mockReturnValue({
      mandritto: { term: 'Mandritto' }
    });

    const request = mockRequest({
      termKey: 'nonexistent',
      field: 'category',
      value: 'Test'
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('Term not found');
  });

  it('should successfully update category field', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('mandritto:\n  term: Mandritto');
    (yaml.load as jest.Mock).mockReturnValue({
      mandritto: { term: 'Mandritto', category: 'Old Category' }
    });
    (yaml.dump as jest.Mock).mockReturnValue('updated yaml');

    const request = mockRequest({
      termKey: 'mandritto',
      field: 'category',
      value: 'New Category'
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should successfully update definition_fr field', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('mandritto:\n  term: Mandritto');
    (yaml.load as jest.Mock).mockReturnValue({
      mandritto: {
        term: 'Mandritto',
        definition: { it: 'Italian', fr: 'Old French' }
      }
    });
    (yaml.dump as jest.Mock).mockReturnValue('updated yaml');

    const request = mockRequest({
      termKey: 'mandritto',
      field: 'definition_fr',
      value: 'New French definition'
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should handle definition_fr field when definition object does not exist', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('mandritto:\n  term: Mandritto');
    (yaml.load as jest.Mock).mockReturnValue({
      mandritto: { term: 'Mandritto' }
    });
    (yaml.dump as jest.Mock).mockReturnValue('updated yaml');

    const request = mockRequest({
      termKey: 'mandritto',
      field: 'definition_fr',
      value: 'New French definition'
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 500 if glossary file does not exist', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const request = mockRequest({
      termKey: 'mandritto',
      field: 'category',
      value: 'Test'
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Glossary file not found');
  });

  it('should handle file read errors gracefully', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File read error');
    });

    const request = mockRequest({
      termKey: 'mandritto',
      field: 'category',
      value: 'Test'
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});

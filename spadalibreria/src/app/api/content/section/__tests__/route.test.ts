/**
 * @jest-environment node
 */

import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: async () => body,
      status: init?.status || 200,
    })),
  },
}));

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock path module
jest.mock('path');
const mockedPath = path as jest.Mocked<typeof path>;

describe('/api/content/section POST endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default path mock
    mockedPath.join.mockImplementation((...args) => args.join('/'));
    mockedPath.basename.mockImplementation((p) => p.split('/').pop() || '');
  });

  it('should create a new treatise section successfully', async () => {
    const requestBody = {
      master: 'Achille Marozzo',
      work: 'Opera Nova',
      book: 2,
      chapter: 95,
      year: 1536,
      title: 'Test Chapter',
      content: {
        fr: 'Contenu test en français'
      }
    };

    const existingSections = [
      {
        id: 'achille_marozzo_opera_nova_l2_c94',
        title: 'Existing Chapter',
        metadata: {
          master: 'Achille Marozzo',
          work: 'Opera Nova',
          book: 2,
          chapter: 94,
          year: 1536
        },
        content: {
          fr: 'Existing content'
        }
      }
    ];

    // Mock file system
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue(['achille_marozzo_opera_nova_livre2.yaml'] as any);
    mockedFs.readFileSync.mockReturnValue(yaml.dump(existingSections));
    mockedFs.writeFileSync.mockImplementation(() => {});

    // Mock NextRequest
    (NextRequest as jest.Mock).mockImplementation(() => ({
      json: async () => requestBody
    }));

    const request = new NextRequest('http://localhost/api/content/section', {
      method: 'POST'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sectionId).toBe('achille_marozzo_opera_nova_l2_c95');
    expect(mockedFs.writeFileSync).toHaveBeenCalled();
  });

  it('should handle accents in master and work names', async () => {
    const requestBody = {
      master: 'Achille Marozzo',
      work: 'Opéra Nôva',
      book: 1,
      year: 1536,
      title: 'Test',
      content: {
        fr: 'Test content'
      }
    };

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue(['achille_marozzo_opera_nova_livre1.yaml'] as any);
    mockedFs.readFileSync.mockReturnValue(yaml.dump([]));
    mockedFs.writeFileSync.mockImplementation(() => {});

    (NextRequest as jest.Mock).mockImplementation(() => ({
      json: async () => requestBody
    }));

    const request = new NextRequest('http://localhost/api/content/section');
    const response = await POST(request);
    const data = await response.json();

    expect(data.sectionId).toBe('achille_marozzo_opera_nova_l1');
  });

  it('should prevent duplicate section IDs', async () => {
    const requestBody = {
      master: 'Achille Marozzo',
      work: 'Opera Nova',
      book: 2,
      chapter: 94,
      year: 1536,
      title: 'Duplicate Chapter',
      content: {
        fr: 'Duplicate content'
      }
    };

    const existingSections = [
      {
        id: 'achille_marozzo_opera_nova_l2_c94',
        title: 'Existing Chapter',
        metadata: {
          master: 'Achille Marozzo',
          work: 'Opera Nova',
          book: 2,
          chapter: 94,
          year: 1536
        },
        content: {
          fr: 'Existing content'
        }
      }
    ];

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue(['achille_marozzo_opera_nova_livre2.yaml'] as any);
    mockedFs.readFileSync.mockReturnValue(yaml.dump(existingSections));

    (NextRequest as jest.Mock).mockImplementation(() => ({
      json: async () => requestBody
    }));

    const request = new NextRequest('http://localhost/api/content/section');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Section ID already exists');
  });

  it('should return 400 for missing master field', async () => {
    const requestBody = {
      work: 'Opera Nova',
      book: 2,
      year: 1536,
      title: 'Test',
      content: { fr: 'Test' }
    };

    (NextRequest as jest.Mock).mockImplementation(() => ({
      json: async () => requestBody
    }));

    const request = new NextRequest('http://localhost/api/content/section');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing or invalid master field');
  });

  it('should return 400 for missing work field', async () => {
    const requestBody = {
      master: 'Achille Marozzo',
      book: 2,
      year: 1536,
      title: 'Test',
      content: { fr: 'Test' }
    };

    (NextRequest as jest.Mock).mockImplementation(() => ({
      json: async () => requestBody
    }));

    const request = new NextRequest('http://localhost/api/content/section');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing or invalid work field');
  });

  it('should return 400 for missing book field', async () => {
    const requestBody = {
      master: 'Achille Marozzo',
      work: 'Opera Nova',
      year: 1536,
      title: 'Test',
      content: { fr: 'Test' }
    };

    (NextRequest as jest.Mock).mockImplementation(() => ({
      json: async () => requestBody
    }));

    const request = new NextRequest('http://localhost/api/content/section');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing or invalid book field');
  });

  it('should return 400 for missing content.fr field', async () => {
    const requestBody = {
      master: 'Achille Marozzo',
      work: 'Opera Nova',
      book: 2,
      year: 1536,
      title: 'Test',
      content: {}
    };

    (NextRequest as jest.Mock).mockImplementation(() => ({
      json: async () => requestBody
    }));

    const request = new NextRequest('http://localhost/api/content/section');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing or invalid content.fr field');
  });

  it('should return 404 when no matching treatise file found', async () => {
    const requestBody = {
      master: 'Unknown Master',
      work: 'Unknown Work',
      book: 99,
      year: 2000,
      title: 'Test',
      content: { fr: 'Test' }
    };

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue([]);

    (NextRequest as jest.Mock).mockImplementation(() => ({
      json: async () => requestBody
    }));

    const request = new NextRequest('http://localhost/api/content/section');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('No matching treatise file found');
  });

  it('should handle optional fields (chapter, it, notes)', async () => {
    const requestBody = {
      master: 'Achille Marozzo',
      work: 'Opera Nova',
      book: 2,
      year: 1536,
      title: 'Test',
      content: {
        fr: 'French content',
        it: 'Italian content',
        notes: 'Some notes'
      }
    };

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue(['achille_marozzo_opera_nova_livre2.yaml'] as any);
    mockedFs.readFileSync.mockReturnValue(yaml.dump([]));
    mockedFs.writeFileSync.mockImplementation(() => {});

    (NextRequest as jest.Mock).mockImplementation(() => ({
      json: async () => requestBody
    }));

    const request = new NextRequest('http://localhost/api/content/section');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sectionId).toBe('achille_marozzo_opera_nova_l2');
  });

  it('should handle file system errors gracefully', async () => {
    const requestBody = {
      master: 'Achille Marozzo',
      work: 'Opera Nova',
      book: 2,
      year: 1536,
      title: 'Test',
      content: { fr: 'Test' }
    };

    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue(['achille_marozzo_opera_nova_livre2.yaml'] as any);
    mockedFs.readFileSync.mockImplementation(() => {
      throw new Error('File read error');
    });

    (NextRequest as jest.Mock).mockImplementation(() => ({
      json: async () => requestBody
    }));

    const request = new NextRequest('http://localhost/api/content/section');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create section');
  });
});

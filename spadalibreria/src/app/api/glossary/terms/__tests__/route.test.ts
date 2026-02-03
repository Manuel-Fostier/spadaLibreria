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

import { POST } from '../route';
import fs from 'fs';
import yaml from 'js-yaml';

// Mock fs and yaml modules
jest.mock('fs');
jest.mock('js-yaml');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockYaml = yaml as jest.Mocked<typeof yaml>;
const { NextRequest } = jest.requireMock('next/server');

describe('/api/glossary/terms POST endpoint', () => {
  const mockGlossaryData = {
    mandritto: {
      term: 'Mandritto',
      category: 'Coups et Techniques',
      type: 'Attaque / Frappe de taille',
      definition: {
        it: 'Un colpo di spada',
        fr: 'Un coup d\'épée',
        en: 'A sword strike'
      },
      translation: {
        it: 'Mandritto',
        fr: 'Mandritto',
        en: 'Right-hand Strike'
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.readFileSync.mockReturnValue('mock yaml content');
    mockYaml.load.mockReturnValue({ ...mockGlossaryData });
  });

  it('should create a new glossary term successfully', async () => {
    const requestBody = {
      category: 'Coups et Techniques',
      type: 'Attaque / Frappe de taille',
      term: 'Falso Dritto',
      definition: {
        fr: 'Un coup d\'épée exécuté en diagonale'
      }
    };

    NextRequest.mockImplementation(() => ({
      json: async () => requestBody,
    }));

    const request = new NextRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.termKey).toBe('falso_dritto');
    expect(mockFs.writeFileSync).toHaveBeenCalled();
  });

  it('should generate correct term key from name with accents', async () => {
    const requestBody = {
      category: 'Test Category',
      type: 'Test Type',
      term: 'Épaule Gauche',
      definition: {
        fr: 'Test definition'
      }
    };

    NextRequest.mockImplementation(() => ({
      json: async () => requestBody,
    }));

    const request = new NextRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.termKey).toBe('epaule_gauche');
  });

  it('should return 409 if term key already exists', async () => {
    const requestBody = {
      category: 'Coups et Techniques',
      type: 'Attaque / Frappe de taille',
      term: 'Mandritto', // Already exists in mock data
      definition: {
        fr: 'Un coup d\'épée'
      }
    };

    NextRequest.mockImplementation(() => ({
      json: async () => requestBody,
    }));

    const request = new NextRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain('already exists');
    expect(data.termKey).toBe('mandritto');
    expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  });

  it('should return 400 if category is missing', async () => {
    const requestBody = {
      type: 'Test Type',
      term: 'Test Term',
      definition: {
        fr: 'Test definition'
      }
    };

    NextRequest.mockImplementation(() => ({
      json: async () => requestBody,
    }));

    const request = new NextRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('category');
  });

  it('should return 400 if type is missing', async () => {
    const requestBody = {
      category: 'Test Category',
      term: 'Test Term',
      definition: {
        fr: 'Test definition'
      }
    };

    NextRequest.mockImplementation(() => ({
      json: async () => requestBody,
    }));

    const request = new NextRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('type');
  });

  it('should return 400 if term is missing', async () => {
    const requestBody = {
      category: 'Test Category',
      type: 'Test Type',
      definition: {
        fr: 'Test definition'
      }
    };

    NextRequest.mockImplementation(() => ({
      json: async () => requestBody,
    }));

    const request = new NextRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('term');
  });

  it('should return 400 if definition.fr is missing', async () => {
    const requestBody = {
      category: 'Test Category',
      type: 'Test Type',
      term: 'Test Term',
      definition: {}
    };

    NextRequest.mockImplementation(() => ({
      json: async () => requestBody,
    }));

    const request = new NextRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('definition.fr');
  });

  it('should use default translations if not provided', async () => {
    mockYaml.dump.mockReturnValue('updated yaml content');

    const requestBody = {
      category: 'Test Category',
      type: 'Test Type',
      term: 'New Term',
      definition: {
        fr: 'Test definition'
      }
    };

    NextRequest.mockImplementation(() => ({
      json: async () => requestBody,
    }));

    const request = new NextRequest();
    await POST(request);

    const dumpCall = mockYaml.dump.mock.calls[0][0] as Record<string, any>;
    const newTerm = dumpCall['new_term'];
    
    expect(newTerm.translation).toEqual({
      it: 'New Term',
      fr: 'New Term',
      en: 'New Term'
    });
  });

  it('should handle file system errors gracefully', async () => {
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });

    const requestBody = {
      category: 'Test Category',
      type: 'Test Type',
      term: 'Test Term',
      definition: {
        fr: 'Test definition'
      }
    };

    NextRequest.mockImplementation(() => ({
      json: async () => requestBody,
    }));

    const request = new NextRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});

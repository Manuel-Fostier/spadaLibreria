import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface NewSectionRequest {
  master: string;
  work: string;
  book: number;
  chapter?: number;
  year: number;
  title: string;
  content: {
    fr: string;
    it?: string;
    en?: string;
    en_versions?: Array<{
      translator: string;
      text: string;
    }>;
    notes?: string;
  };
}

interface TreatiseSection {
  id: string;
  title: string;
  metadata: {
    master: string;
    work: string;
    book: number;
    chapter?: number;
    year: number;
  };
  content: {
    fr: string;
    it?: string;
    en_versions?: Array<{
      translator: string;
      text: string;
    }>;
    notes?: string;
  };
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Generate a unique section ID from metadata
 */
function generateSectionId(master: string, work: string, book: number, chapter?: number): string {
  // Normalize master name (lowercase, remove accents, replace spaces with underscores)
  const masterNorm = normalizeName(master);
  
  // Normalize work name
  const workNorm = normalizeName(work);
  
  // Build ID: master_work_l{book}_c{chapter}
  let id = `${masterNorm}_${workNorm}_l${book}`;
  if (chapter !== undefined) {
    id += `_c${chapter}`;
  }
  
  return id;
}

/**
 * Find the correct YAML file based on master, work, and book metadata
 */
function findTreatiseFile(master: string, work: string, book: number): string | null {
  const treatisesDir = path.join(process.cwd(), 'data', 'treatises');
  
  if (!fs.existsSync(treatisesDir)) {
    return null;
  }
  
  const files = fs.readdirSync(treatisesDir).filter(f => f.endsWith('.yaml'));
  
  // Try exact filename match first (common pattern: master_work_livre{book}.yaml)
  const masterNorm = normalizeName(master);
  
  const workNorm = normalizeName(work);
  
  const expectedFilename = `${masterNorm}_${workNorm}_livre${book}.yaml`;
  
  if (files.includes(expectedFilename)) {
    return path.join(treatisesDir, expectedFilename);
  }
  
  // Fallback: Search file content for matching metadata
  for (const file of files) {
    const filePath = path.join(treatisesDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const sections = yaml.load(content) as TreatiseSection[];
      
      if (sections && sections.length > 0) {
        const firstSection = sections[0];
        if (
          firstSection.metadata?.master === master &&
          firstSection.metadata?.work === work &&
          firstSection.metadata?.book === book
        ) {
          return filePath;
        }
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: NewSectionRequest = await request.json();
    
    // Validate required fields
    if (!body.master || typeof body.master !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid master field' },
        { status: 400 }
      );
    }
    
    if (!body.work || typeof body.work !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid work field' },
        { status: 400 }
      );
    }
    
    if (!body.book || typeof body.book !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid book field' },
        { status: 400 }
      );
    }
    
    if (!body.year || typeof body.year !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid year field' },
        { status: 400 }
      );
    }
    
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid title field' },
        { status: 400 }
      );
    }
    
    if (!body.content || !body.content.fr || typeof body.content.fr !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid content.fr field' },
        { status: 400 }
      );
    }
    
    const treatisesDir = path.join(process.cwd(), 'data', 'treatises');
    if (!fs.existsSync(treatisesDir)) {
      fs.mkdirSync(treatisesDir, { recursive: true });
    }

    // Find the correct YAML file or create a new one
    const existingFilePath = findTreatiseFile(body.master, body.work, body.book);
    const masterNorm = normalizeName(body.master);
    const workNorm = normalizeName(body.work);
    const fallbackFilePath = path.join(
      treatisesDir,
      `${masterNorm}_${workNorm}_livre${body.book}.yaml`
    );
    const filePath = existingFilePath || fallbackFilePath;

    let sections: TreatiseSection[] = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const loaded = yaml.load(fileContent);
      if (!Array.isArray(loaded)) {
        return NextResponse.json(
          { error: 'Invalid treatise file format' },
          { status: 500 }
        );
      }
      sections = loaded as TreatiseSection[];
    }
    
    // Generate section ID
    const sectionId = generateSectionId(body.master, body.work, body.book, body.chapter);
    
    // Check for duplicate ID
    const existingSection = sections.find(s => s.id === sectionId);
    if (existingSection) {
      return NextResponse.json(
        { 
          error: 'Section ID already exists',
          details: `A section with id="${sectionId}" already exists. Please specify a different chapter number.`
        },
        { status: 409 }
      );
    }
    
    // Create new section
    const newSection: TreatiseSection = {
      id: sectionId,
      title: body.title,
      metadata: {
        master: body.master,
        work: body.work,
        book: body.book,
        ...(body.chapter !== undefined && { chapter: body.chapter }),
        year: body.year
      },
      content: {
        fr: body.content.fr,
        ...(body.content.it && { it: body.content.it }),
        ...(!body.content.en_versions && body.content.en
          ? { en_versions: [{ translator: 'Inconnu', text: body.content.en }] }
          : {}),
        ...(body.content.en_versions && { en_versions: body.content.en_versions }),
        ...(body.content.notes && { notes: body.content.notes })
      }
    };
    
    // Append new section
    sections.push(newSection);
    
    // Write back to file
    const yamlContent = yaml.dump(sections, {
      lineWidth: -1, // Disable line wrapping
      noRefs: true
    });
    
    fs.writeFileSync(filePath, yamlContent, 'utf-8');
    
    return NextResponse.json({
      success: true,
      sectionId,
      filePath: path.basename(filePath)
    });
    
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create section',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

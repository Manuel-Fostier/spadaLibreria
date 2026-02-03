import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Generate a term key from a term name by slugifying it
 * - Convert to lowercase
 * - Replace accented characters
 * - Replace spaces and special characters with underscores
 * - Remove leading/trailing underscores
 */
function generateTermKey(termName: string): string {
  return termName
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric with underscore
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, type, term, definition, translation } = body;

    // Validate required fields
    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { error: 'category is required and must be a string' },
        { status: 400 }
      );
    }

    if (!type || typeof type !== 'string') {
      return NextResponse.json(
        { error: 'type is required and must be a string' },
        { status: 400 }
      );
    }

    if (!term || typeof term !== 'string') {
      return NextResponse.json(
        { error: 'term is required and must be a string' },
        { status: 400 }
      );
    }

    if (!definition?.fr || typeof definition.fr !== 'string') {
      return NextResponse.json(
        { error: 'definition.fr is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate term key
    const termKey = generateTermKey(term);

    // Load glossary YAML
    const glossaryPath = path.join(process.cwd(), 'data', 'glossary.yaml');
    const fileContent = fs.readFileSync(glossaryPath, 'utf-8');
    const glossaryData = yaml.load(fileContent) as Record<string, any>;

    // Check for duplicate term key
    if (glossaryData[termKey]) {
      return NextResponse.json(
        { error: `Term with key "${termKey}" already exists`, termKey },
        { status: 409 }
      );
    }

    // Create new term entry
    const newTerm = {
      term,
      category,
      type,
      definition: {
        it: definition.it || '',
        fr: definition.fr,
        en: definition.en || ''
      },
      translation: translation || {
        it: term,
        fr: term,
        en: term
      }
    };

    // Add to glossary data
    glossaryData[termKey] = newTerm;

    // Write back to YAML file
    const updatedContent = yaml.dump(glossaryData, {
      lineWidth: -1, // Don't wrap lines
      noRefs: true,
    });
    fs.writeFileSync(glossaryPath, updatedContent, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      termKey,
      message: `Term "${term}" created successfully`
    });

  } catch (error) {
    console.error('Error creating glossary term:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

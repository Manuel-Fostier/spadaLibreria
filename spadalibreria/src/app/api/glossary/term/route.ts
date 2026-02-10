import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface GlossaryTermUpdateRequest {
  termKey: string;
  field: 'category' | 'type' | 'term' | 'definition_fr';
  value: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json() as GlossaryTermUpdateRequest;
    const { termKey, field, value } = body;

    // 2. Validate inputs
    if (!termKey || !field || value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Missing required fields: termKey, field, and value are required' },
        { status: 400 }
      );
    }

    const validFields: Array<'category' | 'type' | 'term' | 'definition_fr'> = [
      'category',
      'type',
      'term',
      'definition_fr'
    ];

    if (!validFields.includes(field)) {
      return NextResponse.json(
        { error: `Invalid field. Must be one of: ${validFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 3. Load glossary YAML
    const glossaryPath = path.join(process.cwd(), 'data', 'glossary.yaml');
    
    if (!fs.existsSync(glossaryPath)) {
      return NextResponse.json(
        { error: 'Glossary file not found' },
        { status: 500 }
      );
    }

    const fileContent = fs.readFileSync(glossaryPath, 'utf-8');
    const glossaryData = yaml.load(fileContent) as Record<string, any>;

    // 4. Update term
    if (!glossaryData[termKey]) {
      return NextResponse.json(
        { error: `Term not found: ${termKey}` },
        { status: 404 }
      );
    }

    // Map field names to YAML structure
    if (field === 'definition_fr') {
      if (!glossaryData[termKey].definition) {
        glossaryData[termKey].definition = {};
      }
      glossaryData[termKey].definition.fr = value;
    } else {
      glossaryData[termKey][field] = value;
    }

    // 5. Write back to YAML
    const updatedContent = yaml.dump(glossaryData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
    
    fs.writeFileSync(glossaryPath, updatedContent, 'utf-8');

    // 6. Return success
    return NextResponse.json({ 
      success: true,
      message: `Successfully updated ${field} for term ${termKey}`
    });

  } catch (error) {
    console.error('Error updating glossary term:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const TREATISES_DIR = path.join(process.cwd(), 'data', 'treatises');

interface TreatiseSection {
  id: string;
  title: string;
  metadata: {
    master: string;
    work: string;
    book: number;
    chapter: number;
    year: number;
  };
  content: {
    it?: string;
    fr: string;
    en_versions?: Array<{ translator: string; text: string }>;
    notes?: string;
  };
  annotation?: unknown;
}

interface ContentUpdate {
  sectionId: string;
  field: 'fr' | 'notes';
  value: string;
}

// POST - Sauvegarder une modification de contenu texte
export async function POST(request: NextRequest) {
  try {
    const { sectionId, field, value }: ContentUpdate = await request.json();

    // Valider les paramètres
    if (!sectionId || !field || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (field !== 'fr' && field !== 'notes') {
      return NextResponse.json(
        { success: false, error: 'Invalid field. Only "fr" and "notes" are supported.' },
        { status: 400 }
      );
    }

    // Parcourir tous les fichiers YAML pour trouver la section
    const treatiseFiles = fs.readdirSync(TREATISES_DIR).filter(f => f.endsWith('.yaml'));
    
    let found = false;
    for (const filename of treatiseFiles) {
      const filePath = path.join(TREATISES_DIR, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const sections = yaml.load(fileContents) as TreatiseSection[];

      // Chercher la section à modifier
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex !== -1) {
        // Mettre à jour le champ spécifié
        sections[sectionIndex].content[field] = value;
        
        // Sauvegarder le fichier
        const yamlStr = yaml.dump(sections, {
          indent: 2,
          lineWidth: -1,
          noRefs: true,
          quotingType: '"',
        });
        fs.writeFileSync(filePath, yamlStr, 'utf8');
        
        found = true;
        break;
      }
    }

    if (!found) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Content saved successfully',
      sectionId,
      field 
    });
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save content' },
      { status: 500 }
    );
  }
}

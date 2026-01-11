import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Annotation } from '@/lib/annotation';

const TREATISES_DIR = path.join(process.cwd(), 'data', 'treatises');

interface AnnotationsMap {
  [sectionId: string]: Annotation;
}

interface TreatiseSection {
  id: string;
  annotation?: Annotation;
}

// POST - Sauvegarder toutes les annotations
export async function POST(request: NextRequest) {
  try {
    const annotationsMap: AnnotationsMap = await request.json();

    // Organiser les annotations par fichier de traité
    const treatiseFiles = fs.readdirSync(TREATISES_DIR).filter(f => f.endsWith('.yaml'));
    
    for (const filename of treatiseFiles) {
      const filePath = path.join(TREATISES_DIR, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const sections = yaml.load(fileContents) as TreatiseSection[];

      let modified = false;

      // Mettre à jour chaque section avec son annotation unique
      for (const section of sections) {
        if (annotationsMap[section.id]) {
          section.annotation = annotationsMap[section.id];
          modified = true;
        }
      }

      // Sauvegarder seulement si modifié
      if (modified) {
        const yamlStr = yaml.dump(sections, {
          indent: 2,
          lineWidth: -1,
          noRefs: true,
          quotingType: '"',
        });
        fs.writeFileSync(filePath, yamlStr, 'utf8');
      }
    }

    return NextResponse.json({ success: true, message: 'Annotations sauvegardées' });
  } catch (error) {
    console.error('Error saving annotations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save annotations' },
      { status: 500 }
    );
  }
}

// GET - Charger toutes les annotations (utilisé au démarrage)
export async function GET() {
  try {
    const annotationsMap: AnnotationsMap = {} as AnnotationsMap;
    const treatiseFiles = fs.readdirSync(TREATISES_DIR).filter(f => f.endsWith('.yaml'));

    for (const filename of treatiseFiles) {
      const filePath = path.join(TREATISES_DIR, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const sections = yaml.load(fileContents) as TreatiseSection[];

      for (const section of sections) {
        if (section.annotation) {
          annotationsMap[section.id] = section.annotation as Annotation;
        }
      }
    }

    return NextResponse.json(annotationsMap);
  } catch (error) {
    console.error('Error loading annotations:', error);
    return NextResponse.json(
      { error: 'Failed to load annotations' },
      { status: 500 }
    );
  }
}

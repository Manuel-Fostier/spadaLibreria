import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Annotation, MEASURES, STRATEGIES } from '@/lib/annotationTypes';
import { GlossaryData, TreatiseSection, GlossaryEntry, EnglishVersion } from '@/types/data';

export type { GlossaryData, TreatiseSection, GlossaryEntry, EnglishVersion };

export function loadGlossary(): GlossaryData {
  const filePath = path.join(process.cwd(), 'data', 'glossary.yaml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return yaml.load(fileContents) as GlossaryData;
}

export function loadAllTreatises(): TreatiseSection[] {
  const treatisesDir = path.join(process.cwd(), 'data', 'treatises');
  const files = fs.readdirSync(treatisesDir).filter(file => file.endsWith('.yaml'));
  
  let allSections: TreatiseSection[] = [];
  for (const file of files) {
    const filePath = path.join(treatisesDir, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const sections = yaml.load(fileContents) as TreatiseSection[];
    // Inject filename into each section
    const sectionsWithFile = sections.map(section => ({
      ...section,
      fileName: file
    }));
    allSections = allSections.concat(sectionsWithFile);
  }
  
  return allSections;
}
// Re-export constants and types for server-side consumers
export { MEASURES, STRATEGIES };
export type { Annotation };

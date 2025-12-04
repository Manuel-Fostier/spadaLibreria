import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Annotation, MEASURES, STRATEGIES } from '@/lib/annotation';

export interface GlossaryEntry {
  term: string;
  type: string;
  definition: {
    fr: string;
    en: string;
  };
  translation: {
    fr: string;
    en: string;
  };
}

export interface GlossaryData {
  [key: string]: GlossaryEntry;
}

export interface EnglishVersion {
  translator: string;
  text: string;
}

// Annotation type is defined in ./annotation to avoid client bundling fs

export interface TreatiseSection {
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
    en_versions?: EnglishVersion[];
  };
  annotation?: Annotation;
}

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
    allSections = allSections.concat(sections);
  }
  
  return allSections;
}
// Re-export constants and types for server-side consumers
export { MEASURES, STRATEGIES };
export type { Annotation };

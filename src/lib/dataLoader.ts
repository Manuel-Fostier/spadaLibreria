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
    weapons: string[];
    guards_mentioned?: string[];
    techniques?: string[];
  };
  content: {
    it: string;
    fr: string;
    en_versions: EnglishVersion[];
  };
  annotation?: Annotation;
}

export function loadGlossary(): GlossaryData {
  const filePath = path.join(process.cwd(), 'data', 'glossary.yaml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return yaml.load(fileContents) as GlossaryData;
}

export function loadTreatise(filename: string): TreatiseSection[] {
  const filePath = path.join(process.cwd(), 'data', 'treatises', filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return yaml.load(fileContents) as TreatiseSection[];
}

export function getAllTreatises(): string[] {
  const treatisesDir = path.join(process.cwd(), 'data', 'treatises');
  return fs.readdirSync(treatisesDir).filter(file => file.endsWith('.yaml'));
}
// Re-export constants and types for server-side consumers
export { MEASURES, STRATEGIES };
export type { Annotation };

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

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

export interface Annotation {
  id: string;
  language: 'it' | 'fr' | 'en';
  translator: string | null;
  note: string;
  tags: string[];
  created_at: string;
  updated_at: string | null;
}

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
  annotations?: Annotation[];
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

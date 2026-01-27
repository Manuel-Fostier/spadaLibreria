import { Annotation } from '@/lib/annotationTypes';

export interface GlossaryEntry {
  term: string;
  type: string;
  category?: string; // Optional for backward compatibility
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

export interface GlossaryCategory {
  name: string;
  terms: Array<{
    key: string;
    entry: GlossaryEntry;
  }>;
}

export interface CategorizedGlossary {
  categories: GlossaryCategory[];
  uncategorized: Array<{
    key: string;
    entry: GlossaryEntry;
  }>;
}

export interface EnglishVersion {
  translator: string;
  text: string;
}

export interface TreatiseSection {
  id: string;
  fileName?: string;
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
    notes?: string;
  };
  annotation?: Annotation;
}

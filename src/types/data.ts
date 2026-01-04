import { Annotation } from '@/lib/annotation';

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

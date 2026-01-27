import { Annotation } from '@/lib/annotationTypes';

export interface GlossaryEntry {
  term: string;
  category: string;
  type: string;
  definition: {
    it?: string;
    fr: string;
    en: string;
  };
  translation: {
    it?: string;
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

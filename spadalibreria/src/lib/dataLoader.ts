// Re-export types for both client and server consumers
// NOTE: This file is imported from client components (Term.tsx, TextParser.tsx, etc.) 
// so it can only export types, not server-side code like fs/path operations
export type { GlossaryData, TreatiseSection, GlossaryEntry, EnglishVersion } from '@/types/data';
export type { Annotation } from '@/lib/annotationTypes';
export { MEASURES, STRATEGIES } from '@/lib/annotationTypes';

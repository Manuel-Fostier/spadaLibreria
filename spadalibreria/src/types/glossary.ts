/**
 * Glossary Page Type Definitions
 * 
 * These types extend the base GlossaryEntry for the glossary page feature.
 * They support hierarchical display (Category → Type → Terms) and search functionality.
 */

import { GlossaryEntry } from './data';

/**
 * Extended glossary term with ID for glossary page
 * Includes all fields from GlossaryEntry plus unique identifier
 */
export interface GlossaryTerm extends GlossaryEntry {
  /** Unique identifier (term key from YAML) */
  id: string;
}

/**
 * Language codes supported in glossary
 */
export type GlossaryLanguage = 'it' | 'fr' | 'en';

/**
 * Grouped glossary structure for hierarchical display
 * Structure: { category: { type: [terms...] } }
 * 
 * Example:
 * {
 *   "Les Guardes": {
 *     "Garde": [term1, term2],
 *     "Garde Haute": [term3]
 *   }
 * }
 */
export interface GroupedGlossary {
  [category: string]: {
    [type: string]: GlossaryTerm[];
  };
}

/**
 * Category information with term count
 */
export interface GlossaryCategory {
  name: string;
  termCount: number;
}

/**
 * Search result with highlighting context
 */
export interface GlossarySearchResult {
  term: GlossaryTerm;
  matchedIn: ('term' | 'category' | 'type' | 'definition' | 'translation')[];
}

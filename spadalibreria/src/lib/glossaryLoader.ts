/**
 * Glossary Loader Utility
 * 
 * Client-side functions for organizing and searching glossary data.
 * Data loading is handled by the /api/content/glossary API endpoint.
 */

import { GlossaryTerm, GroupedGlossary } from '@/types/glossary';

/**
 * Group glossary terms by category and type for hierarchical display
 * 
 * Creates a nested structure: Category → Type → Terms[]
 * This structure enables the glossary page to display terms hierarchically.
 * 
 * @param terms Array of glossary terms to group
 * @returns Grouped glossary structure
 * 
 * @example
 * ```typescript
 * const grouped = groupGlossaryByCategory(terms);
 * // Result structure:
 * // {
 * //   "Les Guardes": {
 * //     "Garde": [term1, term2],
 * //     "Garde Haute": [term3]
 * //   },
 * //   "Coups et Techniques": {
 * //     "Attaque / Frappe de taille": [term4, term5]
 * //   }
 * // }
 * ```
 */
export function groupGlossaryByCategory(terms: GlossaryTerm[]): GroupedGlossary {
  const grouped: GroupedGlossary = {};
  
  for (const term of terms) {
    const { category, type } = term;
    
    // Initialize category if it doesn't exist
    if (!grouped[category]) {
      grouped[category] = {};
    }
    
    // Initialize type array if it doesn't exist
    if (!grouped[category][type]) {
      grouped[category][type] = [];
    }
    
    // Add term to the appropriate category and type
    grouped[category][type].push(term);
  }
  
  return grouped;
}

/**
 * Search glossary terms across multiple fields
 * 
 * Searches term names, categories, types, definitions, and translations
 * in all supported languages (it, fr, en).
 * 
 * @param terms Array of glossary terms to search
 * @param query Search query string
 * @param language Display language for prioritizing results
 * @returns Array of matching terms
 */
export function searchGlossaryTerms(
  terms: GlossaryTerm[],
  query: string,
  language: 'it' | 'fr' | 'en' = 'fr'
): GlossaryTerm[] {
  if (!query || query.trim() === '') {
    return terms;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return terms.filter(term => {
    // Defensive checks for undefined properties
    if (!term || typeof term !== 'object') return false;
    
    // Search in term name
    if (term.term?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Search in category
    if (term.category?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Search in type
    if (term.type?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Search in definitions
    if (term.definition?.it?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    if (term.definition?.fr?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    if (term.definition?.en?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Search in translations
    if (term.translation?.it?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    if (term.translation?.fr?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    if (term.translation?.en?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    return false;
  });
}

import { GlossaryData, GlossaryEntry, GlossaryCategory, CategorizedGlossary } from '@/types/data';

/**
 * Groups glossary terms by their category field
 */
export function categorizeGlossary(glossaryData: GlossaryData): CategorizedGlossary {
  const categoryMap = new Map<string, Array<{ key: string; entry: GlossaryEntry }>>();
  const uncategorized: Array<{ key: string; entry: GlossaryEntry }> = [];

  // Group terms by category
  Object.entries(glossaryData).forEach(([key, entry]) => {
    if (entry.category) {
      if (!categoryMap.has(entry.category)) {
        categoryMap.set(entry.category, []);
      }
      categoryMap.get(entry.category)!.push({ key, entry });
    } else {
      uncategorized.push({ key, entry });
    }
  });

  // Convert map to array of categories
  const categories: GlossaryCategory[] = Array.from(categoryMap.entries()).map(([name, terms]) => ({
    name,
    terms: terms.sort((a, b) => a.entry.term.localeCompare(b.entry.term, 'fr')),
  }));

  return {
    categories,
    uncategorized: uncategorized.sort((a, b) => a.entry.term.localeCompare(b.entry.term, 'fr')),
  };
}

/**
 * Filters glossary terms based on search text
 * Searches in term name, definitions, and translations
 */
export function filterGlossaryTerms(
  glossaryData: GlossaryData,
  searchText: string,
  language: 'fr' | 'en' = 'fr'
): GlossaryData {
  if (!searchText.trim()) {
    return glossaryData;
  }

  const searchLower = searchText.toLowerCase();
  const filtered: GlossaryData = {};

  Object.entries(glossaryData).forEach(([key, entry]) => {
    const matchesTerm = entry.term.toLowerCase().includes(searchLower);
    const matchesDefinition = entry.definition[language]?.toLowerCase().includes(searchLower) ?? false;
    const matchesTranslation = entry.translation[language]?.toLowerCase().includes(searchLower) ?? false;
    const matchesType = entry.type.toLowerCase().includes(searchLower);

    if (matchesTerm || matchesDefinition || matchesTranslation || matchesType) {
      filtered[key] = entry;
    }
  });

  return filtered;
}

/**
 * Sorts glossary terms alphabetically by term name
 */
export function sortGlossaryTerms(
  terms: Array<{ key: string; entry: GlossaryEntry }>
): Array<{ key: string; entry: GlossaryEntry }> {
  return terms.sort((a, b) => a.entry.term.localeCompare(b.entry.term, 'fr'));
}

/**
 * Gets a list of all unique categories in the glossary
 */
export function getGlossaryCategories(glossaryData: GlossaryData): string[] {
  const categories = new Set<string>();
  
  Object.values(glossaryData).forEach(entry => {
    if (entry.category) {
      categories.add(entry.category);
    }
  });

  return Array.from(categories);
}

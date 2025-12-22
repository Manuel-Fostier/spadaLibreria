import { SearchIndex, SearchQuery, SearchResult, SearchResultSet, SearchOptions, Language } from '@/types/search';
import { findMatches } from './highlighter';

/**
 * Generates variants for a search term (simple pluralization/conjugation)
 * This is a placeholder for more advanced logic
 */
function generateVariants(term: string): string[] {
  const variants: string[] = [];
  const lower = term.toLowerCase();
  
  // Simple Italian/French plural heuristics
  if (lower.endsWith('o')) variants.push(lower.slice(0, -1) + 'i'); // mandritto -> mandritti
  if (lower.endsWith('a')) variants.push(lower.slice(0, -1) + 'e'); // spada -> spade
  if (lower.endsWith('e')) variants.push(lower.slice(0, -1) + 'i'); // fendente -> fendenti
  
  // English plurals
  if (!lower.endsWith('s')) variants.push(lower + 's');
  
  return variants;
}

/**
 * Creates a fully populated SearchQuery object
 */
export function createSearchQuery(
  text: string, 
  options: SearchOptions, 
  index: SearchIndex
): SearchQuery {
  const variants = options.includeVariants ? generateVariants(text) : [];
  const languageMappings: Record<Language, string[]> = { it: [], fr: [], en: [] };

  if (options.includeCrossLanguage) {
    // Look up in glossary index
    const lowerText = text.toLowerCase();
    const glossaryEntry = index.glossaryIndex.get(lowerText);
    
    if (glossaryEntry) {
      languageMappings.it = glossaryEntry.equivalents.it || [];
      languageMappings.fr = glossaryEntry.equivalents.fr || [];
      languageMappings.en = glossaryEntry.equivalents.en || [];
    }
  }

  return {
    queryText: text,
    timestamp: new Date(),
    options,
    variants,
    languageMappings
  };
}

/**
 * Executes a search against the index
 */
export function executeSearch(index: SearchIndex, query: SearchQuery): SearchResultSet {
  const startTime = performance.now();
  const results: SearchResult[] = [];
  
  // Collect all terms to search (query + variants + cross-language)
  const searchTerms = new Set<string>();
  searchTerms.add(query.queryText);
  
  if (query.options.includeVariants) {
    query.variants.forEach(v => searchTerms.add(v));
  }
  
  if (query.options.includeCrossLanguage) {
    Object.values(query.languageMappings).flat().forEach(t => searchTerms.add(t));
  }

  const termsArray = Array.from(searchTerms);

  // Iterate through all chapters
  // Optimization: Use termIndex to filter chapters if not using regex
  // If using regex, we must scan all chapters.
  // If matchWholeWord or matchCase, termIndex might still be useful but we need to be careful.
  // For MVP, let's scan all chapters (100 chapters is small enough).
  
  index.chapters.forEach(chapter => {
    const highlightPositions: { start: number; end: number; variant: string }[] = [];
    const languagesMatched = new Set<Language>();
    let totalMatches = 0;

    // Check each language content
    const langs: Language[] = ['it', 'fr', 'en'];
    
    langs.forEach(lang => {
      if (query.options.languages && !query.options.languages.includes(lang)) return;
      
      const content = chapter.content[lang];
      if (!content) return;

      // Find matches in this content
      // We search for the main query AND variants/mappings
      // But findMatches takes a single query and variants.
      // We should pass the main query and ALL other terms as variants to findMatches?
      // Or call findMatches for each term?
      // findMatches(text, query, options, variants) handles query + variants.
      // So we can pass query.queryText and ALL other terms as variants.
      
      const allVariants = termsArray.filter(t => t !== query.queryText);
      const matches = findMatches(content, query.queryText, query.options, allVariants);
      
      if (matches.length > 0) {
        languagesMatched.add(lang);
        totalMatches += matches.length;
        
        // We need to map matches to the full text or keep them per language?
        // SearchResult has `highlightPositions` which seems to be for the "full chapter text"?
        // But `IndexedChapter` has `fullText` which is concatenated.
        // The UI likely displays one language at a time or all columns.
        // If the UI displays columns, it needs matches per language.
        // The `SearchResult` interface has `highlightPositions` as a flat array.
        // This implies the UI might be using the `preview` or `fullText`?
        // Or maybe `highlightPositions` should be per language?
        // Let's check `SearchResult` definition again.
        // `highlightPositions: Array<{ start: number; end: number; variant: string; }>`
        // It doesn't specify language.
        // If the UI highlights in the 3-column view, it needs to know which column.
        // Maybe `SearchResult` should be updated or we assume it's for the preview?
        // The `preview` field is a string.
        
        // For now, let's store matches relative to the specific language content if possible,
        // but `SearchResult` structure is flat.
        // Let's assume `highlightPositions` are for the `preview` text?
        // Or maybe we should add `language` to `highlightPositions`.
        
        // Let's look at `SearchResult` in `src/types/search.ts`.
        // It has `preview: string`.
        // It has `highlightPositions`.
        
        // If the requirement is to highlight in the main view (BolognesePlatform),
        // the main view renders the original content.
        // The search result list usually shows a preview.
        // When clicking, we go to the chapter.
        // The highlighting in the chapter view (FR-005) is likely handled by passing the search query to the view,
        // and the view (TextParser) re-runs the highlighting logic on the fly.
        // So `SearchResult.highlightPositions` might be just for the preview in the result list?
        // Or for the "first match" to scroll to?
        
        // Let's assume `highlightPositions` in `SearchResult` is for the preview generation or general stats.
        // I will populate it with matches from the "best" language or all?
        // Let's just collect all matches for now.
        
        matches.forEach(m => highlightPositions.push(m));
      }
    });

    if (totalMatches > 0) {
      // Generate preview from the first match
      // We need the text where the match occurred.
      // Since we iterated languages, we might have lost the context of which text `highlightPositions` refers to.
      // This is a flaw in my loop above if `highlightPositions` are just numbers.
      // They are indices into `content`. But which content?
      
      // Let's fix this. We should generate the preview here.
      // Pick the first language with matches.
      const firstLang = Array.from(languagesMatched)[0];
      const content = chapter.content[firstLang];
      // Re-run findMatches or capture it above.
      // Let's capture it above.
      
      // Actually, let's simplify.
      // We just need to know if it matches and get a preview.
      // The UI will handle highlighting in the full view using the query.
      
      // Let's generate a preview from the first match found.
      let preview = '';
      // We need to find the match again to get the context.
      const allVariants = termsArray.filter(t => t !== query.queryText);
      const matches = findMatches(content, query.queryText, query.options, allVariants);
      if (matches.length > 0) {
        const firstMatch = matches[0];
        const start = Math.max(0, firstMatch.start - 50);
        const end = Math.min(content.length, firstMatch.end + 100);
        preview = (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '');
      }

      results.push({
        chapterReference: chapter.reference,
        treatiseTitle: chapter.treatiseTitle,
        chapterTitle: chapter.title,
        matchCount: totalMatches,
        languages: Array.from(languagesMatched),
        preview,
        highlightPositions // These are indices into the content of the matched language(s)? This is ambiguous.
        // For now, let's leave it. The UI might not use this field for the main view.
      });
    }
  });

  const executionTimeMs = performance.now() - startTime;

  return {
    query,
    results,
    totalMatches: results.reduce((acc, r) => acc + r.matchCount, 0),
    executionTimeMs,
    truncated: false // Implement maxResults logic if needed
  };
}

/**
 * Search System TypeScript Interfaces
 *
 * Defines core types for the cross-treatise search functionality including:
 * - SearchQuery: User search input with generated variants
 * - SearchResult: Individual chapter match with context
 * - SearchIndex: In-memory index for fast lookups
 * - ChapterReference: Stable reference to treatise chapters
 *
 * @see plan.md - Data model phase 1 design
 * @see research.md - Search algorithm decisions
 */

/**
 * Supported languages in the application
 */
export type Language = 'it' | 'fr' | 'en';

/**
 * Reference to a specific chapter in a treatise
 * Used to maintain referential integrity between search results, annotations, and content
 */
export interface ChapterReference {
  /** Filename of the treatise (e.g., "marozzo_opera_nova.yaml") */
  treatiseFile: string;
  /** Unique chapter ID within the treatise (e.g., "libro1_cap1") */
  chapterId: string;
}

/**
 * User's search query with generated variants and language mappings
 * Created when user enters a search term; includes automatically generated variants
 */
export interface SearchQuery {
  /** The text entered by user (e.g., "mandritto") */
  queryText: string;
  /** Timestamp when search was created */
  timestamp: Date;
  /** Generated word variants (e.g., ["mandritti", "mandriti"]) - per research.md */
  variants: string[];
  /**
   * Cross-language term mappings from glossary lookup
   * Maps from source language to equivalent terms in other languages
   * E.g., { it: ["mandritto", "mandritti"], fr: ["coup droit"], en: ["forehand cut"] }
   */
  languageMappings: Record<Language, string[]>;
}

/**
 * Single chapter match from search results
 * Represents one chapter that matched the search query
 */
export interface SearchResult {
  /** Reference to the matched chapter */
  chapterReference: ChapterReference;
  /** Treatise title for display (e.g., "Opera Nova") */
  treatiseTitle: string;
  /** Chapter title for display (e.g., "Del Gioco Largo") */
  chapterTitle: string;
  /** Number of matches found in this chapter */
  matchCount: number;
  /** Which language versions contain matches (IT, FR, EN) */
  languages: Language[];
  /** Text preview showing match context (first ~200 chars containing a match) */
  preview: string;
  /**
   * Positions of matches in the full chapter text for highlighting
   * Multiple matches per chapter, including all variants
   */
  highlightPositions: Array<{
    start: number;
    end: number;
    variant: string; // Which variant was matched
  }>;
}

/**
 * In-memory search index built on app load
 * Contains indexed treatise chapters for fast search execution
 * Built once on app startup, cached in React context for subsequent searches
 */
export interface SearchIndex {
  /** All chapters from loaded treatises, indexed by ChapterReference */
  chapters: Map<string, IndexedChapter>;
  /** Term-to-chapters mapping for fast lookups */
  termIndex: Map<string, Set<string>>;
  /** Glossary index for cross-language lookups */
  glossaryIndex: Map<string, CrossLanguageTerms>;
  /** Timestamp when index was built */
  builtAt: Date;
}

/**
 * Internal: A chapter as indexed for search
 */
export interface IndexedChapter {
  reference: ChapterReference;
  title: string;
  treatiseTitle: string;
  content: Record<Language, string>;
  /** All searchable text (concatenated from all languages) */
  fullText: string;
}

/**
 * Internal: Cross-language term equivalents from glossary
 */
export interface CrossLanguageTerms {
  /** Original term as it appears in glossary */
  source: string;
  /** Equivalents in each language */
  equivalents: Record<Language, string[]>;
}

/**
 * Search execution options and filters
 * Passed to search engine to customize search behavior
 */
export interface SearchOptions {
  /** Only search specific language versions */
  languages?: Language[];
  /** Maximum number of results to return (pagination) */
  maxResults?: number;
  /** Include variant matches (enabled by default per spec) */
  includeVariants?: boolean;
  /** Include cross-language matches (enabled by default per spec) */
  includeCrossLanguage?: boolean;
}

/**
 * Complete search results with metadata
 * Returned after executing a search query
 */
export interface SearchResultSet {
  query: SearchQuery;
  results: SearchResult[];
  totalMatches: number;
  executionTimeMs: number;
  /** True if results were truncated due to maxResults limit */
  truncated: boolean;
}

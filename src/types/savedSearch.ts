/**
 * Saved Search TypeScript Interfaces
 *
 * Defines types for the saved searches feature (P2):
 * - SavedSearch: Individual saved search term with metadata
 * - SavedSearchStorage: Browser localStorage persistence format
 * - SavedSearchList: Collection of saved searches
 *
 * @see plan.md - Data model phase 1 design
 * @see research.md - localStorage strategy for search persistence
 */

/**
 * Individual saved search term with usage metadata
 * Stored in browser localStorage for quick re-execution
 */
export interface SavedSearch {
  /** Unique identifier (UUID v4) */
  id: string;
  /** The search term to save (e.g., "mandritto") */
  searchTerm: string;
  /** When this search was first saved */
  createdAt: Date;
  /** Last time this saved search was used */
  lastUsedAt: Date;
  /** Number of times this search has been executed */
  usageCount: number;
}

/**
 * Browser localStorage schema for saved searches
 * Persists as JSON in localStorage under key "spada:savedSearches"
 */
export interface SavedSearchStorage {
  /** Version of the storage format (for future migrations) */
  version: number;
  /** Array of saved searches */
  searches: SavedSearchStorageEntry[];
  /** Last time the list was updated */
  lastUpdated: string; // ISO 8601 date string (localStorage can't store Date objects)
}

/**
 * Internal: Single entry as stored in localStorage (with date strings)
 */
export interface SavedSearchStorageEntry {
  id: string;
  searchTerm: string;
  createdAt: string; // ISO 8601 date string
  lastUsedAt: string; // ISO 8601 date string
  usageCount: number;
}

/**
 * Converted in-memory representation of saved searches
 * Created by converting storage format from localStorage
 */
export interface SavedSearchList {
  searches: SavedSearch[];
  total: number;
}

/**
 * Options for saving a new search
 */
export interface SaveSearchOptions {
  /** Maximum number of searches to keep (default: 100) */
  maxSavedSearches?: number;
}

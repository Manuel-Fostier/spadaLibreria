'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SearchIndex, SearchQuery, SearchResultSet, SearchOptions } from '@/types/search';
import { TreatiseSection, GlossaryData } from '@/types/data';
import { buildSearchIndex } from '@/lib/searchIndex';
import { executeSearch, createSearchQuery } from '@/lib/searchEngine';

interface SearchContextType {
  index: SearchIndex | null;
  lastQuery: SearchQuery | null;
  results: SearchResultSet | null;
  isSearching: boolean;
  performSearch: (text: string, options: SearchOptions) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ 
  children, 
  treatiseData, 
  glossaryData 
}: { 
  children: ReactNode;
  treatiseData: TreatiseSection[];
  glossaryData: GlossaryData;
}) {
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [lastQuery, setLastQuery] = useState<SearchQuery | null>(null);
  const [results, setResults] = useState<SearchResultSet | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Build index on mount or when data changes
  useEffect(() => {
    if (treatiseData && glossaryData) {
      // Use setTimeout to avoid blocking the main thread immediately on mount
      const timer = setTimeout(() => {
        const newIndex = buildSearchIndex(treatiseData, glossaryData);
        setIndex(newIndex);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [treatiseData, glossaryData]);

  const performSearch = (text: string, options: SearchOptions) => {
    if (!index || !text.trim()) return;

    setIsSearching(true);
    
    // Use setTimeout to allow UI to update (show loading state)
    setTimeout(() => {
      try {
        const query = createSearchQuery(text, options, index);
        const searchResults = executeSearch(index, query);
        
        setLastQuery(query);
        setResults(searchResults);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 10);
  };

  const clearSearch = () => {
    setLastQuery(null);
    setResults(null);
    setIsSearching(false);
  };

  return (
    <SearchContext.Provider value={{
      index,
      lastQuery,
      results,
      isSearching,
      performSearch,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

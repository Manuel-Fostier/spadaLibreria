/**
 * GlossaryContext - State management for glossary page
 * 
 * Provides centralized state for:
 * - Loading and storing glossary terms
 * - Search query and filtering
 * - Language selection
 * - Computed values (filtered terms, grouped terms)
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { GlossaryTerm, GroupedGlossary, GlossaryLanguage } from '@/types/glossary';
import { loadGlossaryTerms, searchGlossaryTerms, groupGlossaryByCategory } from '@/lib/glossaryLoader';

interface GlossaryContextType {
  // State
  terms: GlossaryTerm[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSearchQuery: (query: string) => void;

  // Computed values
  filteredTerms: GlossaryTerm[];
  groupedTerms: GroupedGlossary;
}

const GlossaryContext = createContext<GlossaryContextType | undefined>(undefined);

interface GlossaryProviderProps {
  children: ReactNode;
}

export function GlossaryProvider({ children }: GlossaryProviderProps) {
  // State
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load terms on mount
  useEffect(() => {
    const loadTerms = () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedTerms = loadGlossaryTerms();
        setTerms(loadedTerms);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load glossary';
        setError(errorMessage);
        setTerms([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTerms();
  }, []);

  // Computed: Filtered terms based on search query (French-only)
  const filteredTerms = useMemo(() => {
    return searchGlossaryTerms(terms, searchQuery, 'fr');
  }, [terms, searchQuery]);

  // Computed: Grouped terms (Category → Type → Terms)
  // Glossary display should remain complete; search only highlights matches.
  const groupedTerms = useMemo(() => {
    return groupGlossaryByCategory(terms);
  }, [terms]);

  const value: GlossaryContextType = {
    terms,
    searchQuery,
    isLoading,
    error,
    setSearchQuery,
    filteredTerms,
    groupedTerms,
  };

  return (
    <GlossaryContext.Provider value={value}>
      {children}
    </GlossaryContext.Provider>
  );
}

/**
 * Hook to access glossary context
 * Must be used within a GlossaryProvider
 */
export function useGlossary(): GlossaryContextType {
  const context = useContext(GlossaryContext);
  
  if (context === undefined) {
    throw new Error('useGlossary must be used within a GlossaryProvider');
  }
  
  return context;
}

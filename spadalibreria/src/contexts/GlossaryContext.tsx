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
  selectedLanguage: GlossaryLanguage;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedLanguage: (language: GlossaryLanguage) => void;

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
  const [selectedLanguage, setSelectedLanguage] = useState<GlossaryLanguage>('fr');
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

  // Computed: Filtered terms based on search query
  const filteredTerms = useMemo(() => {
    return searchGlossaryTerms(terms, searchQuery, selectedLanguage);
  }, [terms, searchQuery, selectedLanguage]);

  // Computed: Grouped terms (Category → Type → Terms)
  const groupedTerms = useMemo(() => {
    return groupGlossaryByCategory(filteredTerms);
  }, [filteredTerms]);

  const value: GlossaryContextType = {
    terms,
    searchQuery,
    selectedLanguage,
    isLoading,
    error,
    setSearchQuery,
    setSelectedLanguage,
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

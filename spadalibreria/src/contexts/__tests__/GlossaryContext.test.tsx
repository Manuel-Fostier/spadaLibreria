/**
 * Tests for GlossaryContext
 * 
 * Tests state management for the glossary page including:
 * - Initial data loading
 * - Search filtering
 * - Error handling
 * 
 * Note: Language switching tests removed (French-only mode - no language switching)
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { GlossaryProvider, useGlossary } from '../GlossaryContext';
import * as glossaryLoader from '@/lib/glossaryLoader';
import { GlossaryTerm } from '@/types/glossary';

// Mock the glossary loader module
jest.mock('@/lib/glossaryLoader');

const mockTerms: GlossaryTerm[] = [
  {
    id: 'mandritto',
    term: 'Mandritto',
    category: 'Coups et Techniques',
    type: 'Attaque / Frappe de taille',
    definition: {
      it: 'Colpo portato da destra a sinistra.',
      fr: 'Coup porté de la droite vers la gauche.',
      en: 'A cut delivered from right to left.'
    },
    translation: {
      it: 'Mandritto',
      fr: 'Coup droit',
      en: 'Forehand cut'
    }
  },
  {
    id: 'fendente',
    term: 'Fendente',
    category: 'Coups et Techniques',
    type: 'Attaque / Frappe de taille',
    definition: {
      fr: 'Coup vertical descendant.',
      en: 'Vertical descending cut.'
    },
    translation: {
      fr: 'Coup fendant',
      en: 'Cleaving cut'
    }
  },
  {
    id: 'guardia_di_testa',
    term: 'Guardia di Testa',
    category: 'Les Guardes',
    type: 'Garde Haute',
    definition: {
      fr: 'Garde haute avec épée au-dessus de la tête.',
      en: 'High guard with sword above the head.'
    },
    translation: {
      fr: 'Garde de la Tête',
      en: 'Head Guard'
    }
  }
];

describe('GlossaryContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GlossaryProvider>{children}</GlossaryProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Properly mock the functions
    (glossaryLoader as any).loadGlossaryTerms = jest.fn(() => mockTerms);
    (glossaryLoader as any).searchGlossaryTerms = jest.fn(
      (terms: GlossaryTerm[], query: string) => {
        if (!query) return terms;
        return terms.filter(t => 
          t.term.toLowerCase().includes(query.toLowerCase())
        );
      }
    );
    (glossaryLoader as any).groupGlossaryByCategory = jest.fn(
      (terms: GlossaryTerm[]) => {
        const grouped: any = {};
        terms.forEach((term: GlossaryTerm) => {
          if (!grouped[term.category]) grouped[term.category] = {};
          if (!grouped[term.category][term.type]) grouped[term.category][term.type] = [];
          grouped[term.category][term.type].push(term);
        });
        return grouped;
      }
    );
  });

  describe('initialization', () => {
    it('should initialize with default state and load terms (French-only)', async () => {
      const { result } = renderHook(() => useGlossary(), { wrapper });

      // Initial loading state
      expect(result.current.searchQuery).toBe('');
      expect(result.current.error).toBeNull();

      // Wait for terms to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.terms).toEqual(mockTerms);
    });

    it('should load terms on mount', async () => {
      const { result } = renderHook(() => useGlossary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.terms).toEqual(mockTerms);
      expect(glossaryLoader.loadGlossaryTerms).toHaveBeenCalled();
    });

    it('should handle loading errors', async () => {
      const error = new Error('Failed to load glossary');
      (glossaryLoader.loadGlossaryTerms as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useGlossary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load glossary');
      expect(result.current.terms).toEqual([]);
    });
  });

  describe('search functionality', () => {
    it('should update search query', async () => {
      const { result } = renderHook(() => useGlossary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSearchQuery('mandritto');
      });

      expect(result.current.searchQuery).toBe('mandritto');
    });

    it('should filter terms based on search query', async () => {
      const { result } = renderHook(() => useGlossary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSearchQuery('mandritto');
      });

      expect(result.current.filteredTerms).toHaveLength(1);
      expect(result.current.filteredTerms[0].id).toBe('mandritto');
    });

    it('should return all terms when search query is empty', async () => {
      const { result } = renderHook(() => useGlossary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSearchQuery('mandritto');
      });

      expect(result.current.filteredTerms).toHaveLength(1);

      act(() => {
        result.current.setSearchQuery('');
      });

      expect(result.current.filteredTerms).toHaveLength(3);
    });

    it('should call searchGlossaryTerms with correct parameters', async () => {
      const { result } = renderHook(() => useGlossary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(glossaryLoader.searchGlossaryTerms).toHaveBeenCalledWith(
        mockTerms,
        'test',
        'fr'
      );
    });
  });

  describe('grouped terms', () => {
    it('should return grouped terms by category and type', async () => {
      const { result } = renderHook(() => useGlossary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const grouped = result.current.groupedTerms;

      expect(grouped).toHaveProperty('Coups et Techniques');
      expect(grouped).toHaveProperty('Les Guardes');
      expect(grouped['Coups et Techniques']).toHaveProperty('Attaque / Frappe de taille');
    });

    it('should keep grouped terms complete when search is active', async () => {
      const { result } = renderHook(() => useGlossary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSearchQuery('mandritto');
      });

      const grouped = result.current.groupedTerms;

      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['Coups et Techniques']['Attaque / Frappe de taille']).toHaveLength(2);
      expect(grouped['Les Guardes']['Garde Haute']).toHaveLength(1);
    });

    it('should call groupGlossaryByCategory with filtered terms', async () => {
      const { result } = renderHook(() => useGlossary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Access groupedTerms to trigger computation
      const _ = result.current.groupedTerms;

      expect(glossaryLoader.groupGlossaryByCategory).toHaveBeenCalledWith(mockTerms);
    });
  });

  describe('error handling', () => {
    it('should set error state when loading fails', async () => {
      const error = new Error('Failed to load');
      (glossaryLoader.loadGlossaryTerms as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useGlossary(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load');
      expect(result.current.terms).toEqual([]);
    });
  });

  describe('context provider', () => {
    it('should throw error when useGlossary is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useGlossary());
      }).toThrow('useGlossary must be used within a GlossaryProvider');

      console.error = originalError;
    });
  });
});

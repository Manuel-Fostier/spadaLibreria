import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlossaryProvider, useGlossary } from '@/contexts/GlossaryContext';
import GlossarySearchBar from '@/components/GlossarySearchBar';
import GlossaryContent from '@/components/GlossaryContent';
import * as glossaryLoader from '@/lib/glossaryLoader';
import { GlossaryTerm } from '@/types/glossary';

jest.mock('@/lib/glossaryLoader');

const mockTerms: GlossaryTerm[] = [
  {
    id: 'mandritto',
    term: 'Mandritto',
    category: 'Coups et Techniques',
    type: 'Attaque / Frappe de taille',
    definition: {
      it: 'Un colpo di spada',
      fr: 'Un coup d\'épée',
      en: 'A sword strike',
    },
    translation: {
      it: 'Mandritto',
      fr: 'Mandritto',
      en: 'Right-hand Strike',
    },
  },
  {
    id: 'coda_longa',
    term: 'Coda Longa',
    category: 'Les Guardes',
    type: 'Garde de protection',
    definition: {
      it: 'Una guardia',
      fr: 'Une garde',
      en: 'A guard position',
    },
    translation: {
      it: 'Coda Longa',
      fr: 'Coda Longa',
      en: 'Long Tail Guard',
    },
  },
];

const groupByCategory = (terms: GlossaryTerm[]) => {
  return terms.reduce((acc, term) => {
    if (!acc[term.category]) acc[term.category] = {};
    if (!acc[term.category][term.type]) acc[term.category][term.type] = [];
    acc[term.category][term.type].push(term);
    return acc;
  }, {} as Record<string, Record<string, GlossaryTerm[]>>);
};

function GlossaryHarness() {
  const { groupedTerms, selectedLanguage, searchQuery } = useGlossary();

  return (
    <div>
      <GlossarySearchBar />
      <GlossaryContent
        groupedTerms={groupedTerms}
        language={selectedLanguage}
        searchQuery={searchQuery}
      />
    </div>
  );
}

describe('Glossary search integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (glossaryLoader.loadGlossaryTerms as jest.Mock).mockReturnValue(mockTerms);
    (glossaryLoader.searchGlossaryTerms as jest.Mock).mockImplementation(
      (terms, query) => {
        if (!query) return terms;
        return terms.filter((term: GlossaryTerm) => {
          const searchTarget = [
            term.term,
            term.category,
            term.type,
            term.definition.en,
            term.definition.fr,
            term.definition.it,
            term.translation.en,
            term.translation.fr,
            term.translation.it,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return searchTarget.includes(String(query).toLowerCase());
        });
      }
    );
    (glossaryLoader.groupGlossaryByCategory as jest.Mock).mockImplementation(groupByCategory);
  });

  it('highlights matches without hiding non-matching terms', async () => {
    jest.useFakeTimers();
    render(
      <GlossaryProvider>
        <GlossaryHarness />
      </GlossaryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Rechercher un terme');
    fireEvent.change(input, { target: { value: 'coup' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(document.querySelectorAll('mark').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Coda Longa', { selector: 'h4' })).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('clears highlights when search is cleared', async () => {
    jest.useFakeTimers();
    render(
      <GlossaryProvider>
        <GlossaryHarness />
      </GlossaryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Rechercher un terme');
    fireEvent.change(input, { target: { value: 'coup' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(document.querySelectorAll('mark').length).toBeGreaterThan(0);
    });

    const clearButton = screen.getByRole('button', { name: /effacer la recherche/i });
    fireEvent.click(clearButton);

    expect(document.querySelectorAll('mark').length).toBe(0);
    jest.useRealTimers();
  });

  it('shows a no results message when nothing matches', async () => {
    jest.useFakeTimers();
    render(
      <GlossaryProvider>
        <GlossaryHarness />
      </GlossaryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Rechercher un terme');
    fireEvent.change(input, { target: { value: 'xyz' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText('Aucun résultat.')).toBeInTheDocument();
    expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    jest.useRealTimers();
  });
});

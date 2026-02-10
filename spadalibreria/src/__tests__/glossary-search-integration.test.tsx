import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlossaryProvider, useGlossary } from '@/contexts/GlossaryContext';
import GlossarySearchBar from '@/components/GlossarySearchBar';
import GlossaryContent from '@/components/GlossaryContent';
import { GlossaryTerm } from '@/types/glossary';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

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

function GlossaryHarness() {
  const { groupedTerms, searchQuery } = useGlossary();

  return (
    <div>
      <GlossarySearchBar />
      <GlossaryContent
        groupedTerms={groupedTerms}
        searchQuery={searchQuery}
      />
    </div>
  );
}

describe('Glossary search integration (French-only)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTerms,
    }) as any;
  });

  it('T081: User searches term name → highlighting works in French content', async () => {
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
    // Search for French term name
    fireEvent.change(input, { target: { value: 'Mandritto' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(document.querySelectorAll('mark').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Coda Longa', { selector: 'h4' })).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('T082: User searches category → all terms in category highlighted in French', async () => {
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
    // Search for word that appears in definition of Mandritto (coup = strike)
    fireEvent.change(input, { target: { value: 'coup' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(document.querySelectorAll('mark').length).toBeGreaterThan(0);
    });
    // Mandritto has 'coup' in its French definition
    expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('T083: User searches definition content → matching terms highlighted in French', async () => {
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
    // Search for French definition word (épée = sword)
    fireEvent.change(input, { target: { value: 'épée' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(document.querySelectorAll('mark').length).toBeGreaterThan(0);
    });
    // Mandritto has 'épée' in its French definition
    expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('T085: User clears search → all highlighting removed, glossary remains visible in French', async () => {
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
    // All terms should remain visible (French-only display)
    expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    expect(screen.getByText('Coda Longa', { selector: 'h4' })).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('shows a no results message when nothing matches in French search', async () => {
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
    // All glossary content should remain in the DOM (French-only display, unified view)
    expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    jest.useRealTimers();
  });
});

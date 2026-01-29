import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlossaryProvider, useGlossary } from '@/contexts/GlossaryContext';
import GlossaryPage from '@/components/GlossaryPage';
import GlossaryPageWrapper from '@/components/GlossaryPageWrapper';
import * as glossaryLoader from '@/lib/glossaryLoader';
import { GlossaryTerm } from '@/types/glossary';

jest.mock('@/lib/glossaryLoader');
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
      it: 'Un colpo di spada eseguito da destra a sinistra',
      fr: 'Un coup d\'épée exécuté de droite à gauche',
      en: 'A sword strike executed from right to left',
    },
    translation: {
      it: 'Mandritto',
      fr: 'Mandritto',
      en: 'Right-hand Strike',
    },
  },
  {
    id: 'roveresco',
    term: 'Roveresco',
    category: 'Coups et Techniques',
    type: 'Attaque / Frappe di punta',
    definition: {
      it: 'Un colpo da sinistra a destra',
      fr: 'Un coup de gauche à droite',
      en: 'A strike from left to right',
    },
    translation: {
      it: 'Roveresco',
      fr: 'Roveresco',
      en: 'Left-hand Strike',
    },
  },
  {
    id: 'coda_longa',
    term: 'Coda Longa',
    category: 'Les Guardes',
    type: 'Garde de protection',
    definition: {
      it: 'Una guardia lunga',
      fr: 'Une garde longue',
      en: 'A long guard position',
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

describe('Glossary browse integration (T080 - French-only unified view)', () => {
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
            term.definition.fr,
            term.translation.fr,
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

  it('user loads glossary → all terms visible in French-only unified view', async () => {
    render(
      <GlossaryPageWrapper>
        <GlossaryPage />
      </GlossaryPageWrapper>
    );

    // Wait for glossary to load
    await waitFor(() => {
      expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    });

    // Verify sticky header shows current category/type
    expect(screen.getByText('Coups et Techniques')).toBeInTheDocument();
    expect(screen.getByText('Attaque / Frappe de taille')).toBeInTheDocument();

    // Verify data attributes exist for category/type tracking
    expect(
      document.querySelectorAll('[data-glossary-category="Coups et Techniques"]').length
    ).toBeGreaterThan(0);
    expect(
      document.querySelectorAll('[data-glossary-type="Attaque / Frappe di punta"]').length
    ).toBeGreaterThan(0);

    // Verify all terms are visible
    expect(screen.getAllByText('Mandritto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Roveresco').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Coda Longa').length).toBeGreaterThan(0);

    // Verify French definitions are visible
    expect(screen.getByText(/Un coup d'épée exécuté de droite à gauche/)).toBeInTheDocument();
    expect(screen.getByText(/Un coup de gauche à droite/)).toBeInTheDocument();
    expect(screen.getByText(/Une garde longue/)).toBeInTheDocument();

    // Verify English content is NOT visible (French-only mode)
    expect(screen.queryByText(/A sword strike executed from right to left/)).not.toBeInTheDocument();
    expect(screen.queryByText('Right-hand Strike')).not.toBeInTheDocument();
    expect(screen.queryByText('Left-hand Strike')).not.toBeInTheDocument();
    expect(screen.queryByText('Long Tail Guard')).not.toBeInTheDocument();
  });

  it('all content visible simultaneously (no expand/collapse interaction needed)', async () => {
    render(
      <GlossaryPageWrapper>
        <GlossaryPage />
      </GlossaryPageWrapper>
    );

    // Wait for glossary to load
    await waitFor(() => {
      expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    });

    // All categories, types, and terms should be visible at the same time
    // Verify each term is visible along with its definition
    const mandritto = screen.getAllByText('Mandritto');
    expect(mandritto.length).toBeGreaterThan(0);
    expect(screen.getByText(/Un coup d'épée exécuté de droite à gauche/)).toBeVisible();

    const roveresco = screen.getAllByText('Roveresco');
    expect(roveresco.length).toBeGreaterThan(0);
    expect(screen.getByText(/Un coup de gauche à droite/)).toBeVisible();

    const codaLonga = screen.getAllByText('Coda Longa');
    expect(codaLonga.length).toBeGreaterThan(0);
    expect(screen.getByText(/Une garde longue/)).toBeVisible();

    // Verify no expand/collapse icons are present (no ChevronDown/ChevronUp)
    expect(screen.queryByTestId('chevron-icon')).not.toBeInTheDocument();
  });

  it('glossary displays hierarchical structure: Category → Type → Terms (all expanded)', async () => {
    render(
      <GlossaryPageWrapper>
        <GlossaryPage />
      </GlossaryPageWrapper>
    );

    // Wait for glossary to load
    await waitFor(() => {
      expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    });

    // Verify hierarchy exists via data attributes
    expect(
      document.querySelectorAll('[data-glossary-category="Coups et Techniques"]').length
    ).toBeGreaterThan(0);
    expect(
      document.querySelectorAll('[data-glossary-category="Les Guardes"]').length
    ).toBeGreaterThan(0);
    expect(
      document.querySelectorAll('[data-glossary-type="Attaque / Frappe de taille"]').length
    ).toBeGreaterThan(0);
    expect(
      document.querySelectorAll('[data-glossary-type="Garde de protection"]').length
    ).toBeGreaterThan(0);

    // Terms visible under types
    expect(screen.getAllByText('Mandritto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Roveresco').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Coda Longa').length).toBeGreaterThan(0);
  });

  it('glossary displays complete term information: name and French definition', async () => {
    render(
      <GlossaryPageWrapper>
        <GlossaryPage />
      </GlossaryPageWrapper>
    );

    // Wait for glossary to load
    await waitFor(() => {
      expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
    });

    // Find and verify one complete term entry (Mandritto)
    const mandrittoName = screen.getAllByText('Mandritto');
    expect(mandrittoName.length).toBeGreaterThan(0);

    // Verify French definition
    expect(screen.getByText(/Un coup d'épée exécuté de droite à gauche/)).toBeInTheDocument();

    // Verify English content is NOT visible
    expect(screen.queryByText('Right-hand Strike')).not.toBeInTheDocument();
  });
});

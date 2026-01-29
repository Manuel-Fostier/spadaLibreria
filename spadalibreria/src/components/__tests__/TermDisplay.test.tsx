import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TermDisplay from '../TermDisplay';
import { GlossaryTerm } from '@/types/glossary';

describe('TermDisplay Component', () => {
  const mockTerm: GlossaryTerm = {
    id: 'test-001',
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
  };

  it('renders term name', () => {
    render(
      <TermDisplay
        term={mockTerm}
        searchQuery=""
        highlightMatches={false}
      />
    );
    expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
  });

  it('renders French definition only (not Italian or English)', () => {
    render(
      <TermDisplay
        term={mockTerm}
        searchQuery=""
        highlightMatches={false}
      />
    );
    // French definition should be visible
    expect(screen.getByText(/Un coup d'épée/)).toBeInTheDocument();
    // Italian and English definitions should NOT be visible
    expect(screen.queryByText(/Un colpo di spada/)).not.toBeInTheDocument();
    expect(screen.queryByText(/A sword strike/)).not.toBeInTheDocument();
  });

  it('displays French content in unified single view (no interaction needed)', () => {
    render(
      <TermDisplay
        term={mockTerm}
        searchQuery=""
        highlightMatches={false}
      />
    );
    // All French content should be visible at once
    expect(screen.getAllByText('Mandritto').length).toBeGreaterThan(0);
    expect(screen.getByText(/Un coup d'épée/)).toBeVisible();
  });

  it('does not render category or type labels', () => {
    render(
      <TermDisplay
        term={mockTerm}
        searchQuery=""
        highlightMatches={false}
      />
    );
    expect(screen.queryByText('Coups et Techniques')).not.toBeInTheDocument();
    expect(screen.queryByText('Attaque / Frappe de taille')).not.toBeInTheDocument();
  });

  it('highlights search matches in French content when highlightMatches is true', () => {
    const { container } = render(
      <TermDisplay
        term={mockTerm}
        searchQuery="coup"
        highlightMatches={true}
      />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
  });

  it('does not highlight when highlightMatches is false', () => {
    const { container } = render(
      <TermDisplay
        term={mockTerm}
        searchQuery="coup"
        highlightMatches={false}
      />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBe(0);
  });

  it('handles missing French translation gracefully', () => {
    const termWithMissingTranslation: GlossaryTerm = {
      ...mockTerm,
      translation: {
        it: mockTerm.translation.it,
        fr: '',
        en: mockTerm.translation.en,
      },
    };

    render(
      <TermDisplay
        term={termWithMissingTranslation}
        searchQuery=""
        highlightMatches={false}
      />
    );
    // Should render without crashing and show term name
    expect(screen.getByText('Mandritto')).toBeInTheDocument();
  });

  it('handles empty search query gracefully in French', () => {
    render(
      <TermDisplay
        term={mockTerm}
        searchQuery=""
        highlightMatches={true}
      />
    );
    expect(screen.getAllByText('Mandritto').length).toBeGreaterThan(0);
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <TermDisplay
        term={mockTerm}
        searchQuery=""
        highlightMatches={false}
      />
    );
    expect(container.firstChild).toHaveClass('term-display');
  });
});

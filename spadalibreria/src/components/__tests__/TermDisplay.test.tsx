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
        language="en"
        searchQuery=""
        highlightMatches={false}
      />
    );
    expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
  });

  it('renders definition in selected language', () => {
    render(
      <TermDisplay
        term={mockTerm}
        language="en"
        searchQuery=""
        highlightMatches={false}
      />
    );
    expect(screen.getByText(/A sword strike/)).toBeInTheDocument();
  });

  it('renders translation in selected language', () => {
    render(
      <TermDisplay
        term={mockTerm}
        language="en"
        searchQuery=""
        highlightMatches={false}
      />
    );
    expect(screen.getByText('Right-hand Strike')).toBeInTheDocument();
  });

  it('switches language when language prop changes', () => {
    const { rerender } = render(
      <TermDisplay
        term={mockTerm}
        language="en"
        searchQuery=""
        highlightMatches={false}
      />
    );
    expect(screen.getByText('Right-hand Strike')).toBeInTheDocument();

    rerender(
      <TermDisplay
        term={mockTerm}
        language="fr"
        searchQuery=""
        highlightMatches={false}
      />
    );
    expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
  });

  it('renders term category and type', () => {
    render(
      <TermDisplay
        term={mockTerm}
        language="en"
        searchQuery=""
        highlightMatches={false}
      />
    );
    expect(screen.getByText('Coups et Techniques')).toBeInTheDocument();
    expect(screen.getByText('Attaque / Frappe de taille')).toBeInTheDocument();
  });

  it('highlights search matches when searchQuery and highlightMatches are true', () => {
    const { container } = render(
      <TermDisplay
        term={mockTerm}
        language="en"
        searchQuery="strike"
        highlightMatches={true}
      />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
    const highlighted = screen.getAllByText(/strike/i, { selector: 'mark' });
    expect(highlighted.length).toBeGreaterThan(0);
  });

  it('does not highlight when highlightMatches is false', () => {
    const { container } = render(
      <TermDisplay
        term={mockTerm}
        language="en"
        searchQuery="strike"
        highlightMatches={false}
      />
    );
    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBe(0);
  });

  it('handles missing translation gracefully', () => {
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
        language="fr"
        searchQuery=""
        highlightMatches={false}
      />
    );
    // Should render without crashing and show term name
    expect(screen.getByText('Mandritto')).toBeInTheDocument();
  });

  it('handles empty search query gracefully', () => {
    render(
      <TermDisplay
        term={mockTerm}
        language="en"
        searchQuery=""
        highlightMatches={true}
      />
    );
    expect(screen.getByText('Mandritto')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <TermDisplay
        term={mockTerm}
        language="en"
        searchQuery=""
        highlightMatches={false}
      />
    );
    expect(container.firstChild).toHaveClass('term-display');
  });
});

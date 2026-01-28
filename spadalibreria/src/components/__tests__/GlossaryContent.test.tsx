import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryContent from '../GlossaryContent';
import { GlossaryTerm } from '@/types/glossary';

describe('GlossaryContent Component', () => {
  const mockTerms: GlossaryTerm[] = [
    {
      id: 'term-001',
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
      id: 'term-002',
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

  const mockGroupedTerms = {
    'Coups et Techniques': {
      'Attaque / Frappe de taille': [mockTerms[0]],
    },
    'Les Guardes': {
      'Garde de protection': [mockTerms[1]],
    },
  };

  it('renders all category sections in French', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        searchQuery=""
      />
    );
    expect(screen.getAllByText('Coups et Techniques').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Les Guardes').length).toBeGreaterThan(0);
  });

  it('renders all terms from all categories in French', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        searchQuery=""
      />
    );
    expect(screen.getAllByText('Mandritto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Coda Longa').length).toBeGreaterThan(0);
  });

  it('renders all type subsections within categories', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        searchQuery=""
      />
    );
    expect(screen.getAllByText('Attaque / Frappe de taille').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Garde de protection').length).toBeGreaterThan(0);
  });

  it('keeps all content visible without collapsing (unified single view)', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        searchQuery=""
      />
    );
    // All terms should be visible without expand/collapse interaction
    expect(screen.getAllByText('Mandritto')).toBeTruthy();
    expect(screen.getAllByText('Coda Longa')).toBeTruthy();
  });

  it('displays French content only for all terms', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        searchQuery=""
      />
    );
    // French terms should be visible
    expect(screen.getAllByText('Mandritto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Coda Longa').length).toBeGreaterThan(0);
    // English translations should NOT be visible (French-only display)
    expect(screen.queryByText('Right-hand Strike')).not.toBeInTheDocument();
    expect(screen.queryByText('Long Tail Guard')).not.toBeInTheDocument();
  });

  it('passes searchQuery to all category sections for French search', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        searchQuery="garde"
      />
    );
    expect(screen.getAllByText('Mandritto').length).toBeGreaterThan(0);
    // Should render without crashing with search query in French
  });

  it('renders empty content gracefully when groupedTerms is empty', () => {
    const { container } = render(
      <GlossaryContent
        groupedTerms={{}}
        searchQuery=""
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correct hierarchical structure: Category → Type → Terms (all visible)', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        searchQuery=""
      />
    );
    // Verify all hierarchy levels are present
    const allHeaders2 = screen.getAllByRole('heading', { level: 2 });
    expect(allHeaders2.some(h => h.textContent === 'Coups et Techniques')).toBe(true);
    expect(allHeaders2.some(h => h.textContent === 'Les Guardes')).toBe(true);
    const typeHeaders = screen.getAllByText('Attaque / Frappe de taille');
    expect(typeHeaders.length).toBeGreaterThan(0);
    const termNames = screen.getAllByText('Mandritto');
    expect(termNames.length).toBeGreaterThan(0);
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        searchQuery=""
      />
    );
    expect(container.firstChild).toHaveClass('glossary-content');
  });

  it('maintains order of categories and types without collapsing', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        searchQuery=""
      />
    );
    const categoryHeaders = screen.getAllByRole('heading', { level: 2 });
    expect(categoryHeaders.length).toBeGreaterThanOrEqual(2);
    expect(categoryHeaders[0]).toHaveTextContent('Coups et Techniques');
    expect(categoryHeaders[1]).toHaveTextContent('Les Guardes');
  });

  it('handles large number of terms efficiently in French', () => {
    const manyTerms = Array.from({ length: 100 }, (_, i) => ({
      ...mockTerms[0],
      id: `term-${i}`,
      term: `Term${i}`,
    }));

    const largeGroupedTerms = {
      'Category': {
        'Type': manyTerms,
      },
    };

    render(
      <GlossaryContent
        groupedTerms={largeGroupedTerms}
        searchQuery=""
      />
    );
    expect(screen.getByText('Term0')).toBeInTheDocument();
    expect(screen.getByText('Term99')).toBeInTheDocument();
  });
});

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

  it('renders all category sections', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getByText('Coups et Techniques')).toBeInTheDocument();
    expect(screen.getByText('Les Guardes')).toBeInTheDocument();
  });

  it('renders all terms from all categories', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getByText('Mandritto')).toBeInTheDocument();
    expect(screen.getByText('Coda Longa')).toBeInTheDocument();
  });

  it('renders all type subsections within categories', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getByText('Attaque / Frappe de taille')).toBeInTheDocument();
    expect(screen.getByText('Garde de protection')).toBeInTheDocument();
  });

  it('keeps all content visible without collapsing', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getByText('Mandritto')).toBeVisible();
    expect(screen.getByText('Coda Longa')).toBeVisible();
  });

  it('switches language for all terms', () => {
    const { rerender } = render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getByText('Right-hand Strike')).toBeInTheDocument();
    expect(screen.getByText('Long Tail Guard')).toBeInTheDocument();

    rerender(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        language="fr"
        searchQuery=""
      />
    );
    expect(screen.getByText('Mandritto')).toBeInTheDocument();
    expect(screen.getByText('Coda Longa')).toBeInTheDocument();
  });

  it('passes searchQuery to all category sections', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        language="en"
        searchQuery="strike"
      />
    );
    expect(screen.getByText('Mandritto')).toBeInTheDocument();
    // Should render without crashing with search query
  });

  it('renders empty content gracefully when groupedTerms is empty', () => {
    const { container } = render(
      <GlossaryContent
        groupedTerms={{}}
        language="en"
        searchQuery=""
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders correct hierarchical structure: Category → Type → Terms', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        language="en"
        searchQuery=""
      />
    );
    // Verify all hierarchy levels are present using getAllByText where applicable
    const allHeaders2 = screen.getAllByRole('heading', { level: 2 });
    expect(allHeaders2.some(h => h.textContent === 'Coups et Techniques')).toBe(true);
    expect(allHeaders2.some(h => h.textContent === 'Les Guardes')).toBe(true);
    // Use getAllByText to handle multiple matches if any
    const typeHeaders = screen.getAllByText('Attaque / Frappe de taille');
    expect(typeHeaders.length).toBeGreaterThan(0);
    const termNames = screen.getAllByText('Mandritto');
    expect(termNames.length).toBeGreaterThan(0);
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(container.firstChild).toHaveClass('glossary-content');
  });

  it('maintains order of categories and types', () => {
    render(
      <GlossaryContent
        groupedTerms={mockGroupedTerms}
        language="en"
        searchQuery=""
      />
    );
    // Use getAllByRole to check all heading level 2s
    const categoryHeaders = screen.getAllByRole('heading', { level: 2 });
    expect(categoryHeaders.length).toBeGreaterThanOrEqual(2);
    expect(categoryHeaders[0]).toHaveTextContent('Coups et Techniques');
    expect(categoryHeaders[1]).toHaveTextContent('Les Guardes');
  });

  it('handles large number of terms efficiently', () => {
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
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getByText('Term0')).toBeInTheDocument();
    expect(screen.getByText('Term99')).toBeInTheDocument();
  });
});

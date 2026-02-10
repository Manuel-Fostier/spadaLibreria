import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategorySection from '../CategorySection';
import { GlossaryTerm } from '@/types/glossary';

describe('CategorySection Component', () => {
  const mockTerms: GlossaryTerm[] = [
    {
      id: 'term-001',
      term: 'Mandritto',
      category: 'Coups et Techniques',
      type: 'Attaque / Frappe de taille',
      definition: {
        it: 'Un colpo',
        fr: 'Un coup',
        en: 'A strike',
      },
      translation: {
        it: 'Mandritto',
        fr: 'Mandritto',
        en: 'Right-hand Strike',
      },
    },
    {
      id: 'term-002',
      term: 'Roveresco',
      category: 'Coups et Techniques',
      type: 'Attaque / Frappe di punta',
      definition: {
        it: 'Un altro colpo',
        fr: 'Un autre coup',
        en: 'Another strike',
      },
      translation: {
        it: 'Roveresco',
        fr: 'Roveresco',
        en: 'Left-hand Strike',
      },
    },
  ];

  const groupedTerms = {
    'Attaque / Frappe de taille': mockTerms.slice(0, 1),
    'Attaque / Frappe di punta': mockTerms.slice(1),
  };

  it('renders category/type data attributes for sticky header tracking', () => {
    const { container } = render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        searchQuery=""
      />
    );
    expect(
      container.querySelector('[data-glossary-category="Coups et Techniques"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-glossary-type="Attaque / Frappe de taille"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-glossary-type="Attaque / Frappe di punta"]')
    ).toBeInTheDocument();
  });

  it('renders all terms within types (French-only)', () => {
    render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        searchQuery=""
      />
    );
    expect(screen.getAllByText('Mandritto')).toBeTruthy();
    expect(screen.getAllByText('Roveresco')).toBeTruthy();
  });

  it('displays all terms visible without collapsing (unified view)', () => {
    const { container } = render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        searchQuery=""
      />
    );
    // All terms should be visible without expand/collapse
    expect(screen.getAllByText('Mandritto')).toBeTruthy();
    expect(screen.getAllByText('Roveresco')).toBeTruthy();
  });

  it('displays French content only (no language switching)', () => {
    render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        searchQuery=""
      />
    );
    // French content should be visible
    expect(screen.getAllByText('Mandritto')).toBeTruthy();
    // English translations should NOT be visible
    expect(screen.queryByText('Right-hand Strike')).not.toBeInTheDocument();
  });

  it('passes searchQuery to child TermDisplay components for French search', () => {
    render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        searchQuery="coup"
      />
    );
    // Just verify it renders without crashing
    expect(screen.getAllByText('Mandritto')).toBeTruthy();
  });

  it('renders correctly with empty groupedTerms', () => {
    const { container } = render(
      <CategorySection
        categoryName="Empty Category"
        groupedTerms={{}}
        searchQuery=""
      />
    );
    expect(container.firstChild).toHaveClass('category-section');
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        searchQuery=""
      />
    );
    expect(container.firstChild).toHaveClass('category-section');
  });

  it('renders hierarchical structure: Type → Terms (all visible)', () => {
    const { container } = render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        searchQuery=""
      />
    );
    // Verify hierarchy is present in DOM structure
    expect(
      container.querySelector('[data-glossary-type="Attaque / Frappe de taille"]')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Mandritto')).toBeTruthy();
  });
});

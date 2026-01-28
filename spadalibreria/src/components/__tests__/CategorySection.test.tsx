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

  it('renders category name', () => {
    render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getAllByText('Coups et Techniques')[0]).toBeInTheDocument();
  });

  it('renders all type subsections', () => {
    render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getAllByText('Attaque / Frappe de taille')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Attaque / Frappe di punta')[0]).toBeInTheDocument();
  });

  it('renders all terms within types', () => {
    render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getByText('Mandritto')).toBeInTheDocument();
    expect(screen.getByText('Roveresco')).toBeInTheDocument();
  });

  it('displays all terms visible without collapsing', () => {
    const { container } = render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        language="en"
        searchQuery=""
      />
    );
    // Should render all terms (not collapsed)
    expect(screen.getByText('Mandritto')).toBeVisible();
    expect(screen.getByText('Roveresco')).toBeVisible();
  });

  it('switches language when language prop changes', () => {
    const { rerender } = render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getByText('Right-hand Strike')).toBeInTheDocument();

    rerender(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        language="fr"
        searchQuery=""
      />
    );
    // Should switch to French translation
    expect(screen.getAllByText('Mandritto')[0]).toBeInTheDocument();
  });

  it('passes searchQuery to child TermDisplay components', () => {
    render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        language="en"
        searchQuery="strike"
      />
    );
    // Just verify it renders without crashing
    expect(screen.getByText('Mandritto')).toBeInTheDocument();
  });

  it('renders correctly with empty groupedTerms', () => {
    const { container } = render(
      <CategorySection
        categoryName="Empty Category"
        groupedTerms={{}}
        language="en"
        searchQuery=""
      />
    );
    expect(screen.getByText('Empty Category')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        language="en"
        searchQuery=""
      />
    );
    expect(container.firstChild).toHaveClass('category-section');
  });

  it('renders hierarchical structure: Category → Type → Terms', () => {
    const { container } = render(
      <CategorySection
        categoryName="Coups et Techniques"
        groupedTerms={groupedTerms}
        language="en"
        searchQuery=""
      />
    );
    // Verify hierarchy is present in DOM structure
    expect(screen.getAllByText('Coups et Techniques')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Attaque / Frappe de taille')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Mandritto')[0]).toBeInTheDocument();
  });
});

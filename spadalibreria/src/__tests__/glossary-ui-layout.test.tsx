import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryPage from '@/components/GlossaryPage';
import * as GlossaryContext from '@/contexts/GlossaryContext';

jest.mock('@/contexts/GlossaryContext', () => ({
  useGlossary: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/components/GlossarySearchBar', () => {
  return function MockGlossarySearchBar() {
    return <div data-testid="glossary-search-bar" />;
  };
});

jest.mock('@/components/GlossaryContent', () => {
  return function MockGlossaryContent() {
    return <div data-testid="glossary-content" />;
  };
});

describe('Glossary UI layout (Phase 1.10)', () => {
  const mockUseGlossary = GlossaryContext.useGlossary as jest.Mock;

  beforeEach(() => {
    mockUseGlossary.mockReturnValue({
      groupedTerms: {
        'Coups et Techniques': {
          'Attaque / Frappe de taille': [
            {
              id: 'mandritto',
              term: 'Mandritto',
              category: 'Coups et Techniques',
              type: 'Attaque / Frappe de taille',
              definition: { it: 'IT', fr: 'FR', en: 'EN' },
              translation: { it: 'IT', fr: 'FR', en: 'EN' },
            },
          ],
        },
      },
      searchQuery: '',
      isLoading: false,
      error: null,
      terms: [],
      filteredTerms: [],
    });
  });

  it('renders top bar layout with logo, title, and back button', () => {
    render(<GlossaryPage />);

    expect(screen.getByText('SPADA LIBRERIA')).toBeInTheDocument();
    expect(screen.getByText('platform v1.0')).toBeInTheDocument();
    expect(screen.getByText('GLOSSAIRE')).toBeInTheDocument();
    expect(screen.getByText('← Back')).toBeInTheDocument();
  });

  it('renders search bar, sticky header, and content area', () => {
    const { container } = render(<GlossaryPage />);

    expect(screen.getByTestId('glossary-search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('glossary-content')).toBeInTheDocument();
    expect(screen.getByText('Catégorie par défaut')).toBeInTheDocument();
    expect(screen.getByText('Type par défaut')).toBeInTheDocument();
    expect(container.querySelector('.overflow-y-auto')).toBeInTheDocument();
  });
});

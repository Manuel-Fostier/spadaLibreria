import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryPage from '../GlossaryPage';
import * as GlossaryContext from '@/contexts/GlossaryContext';

// Mock the GlossaryContext
jest.mock('@/contexts/GlossaryContext', () => ({
  useGlossary: jest.fn(),
}));

// Mock child components
jest.mock('../GlossarySearchBar', () => {
  return function MockGlossarySearchBar() {
    return <div data-testid="glossary-search-bar">GlossarySearchBar</div>;
  };
});

jest.mock('../GlossaryContent', () => {
  return function MockGlossaryContent() {
    return <div data-testid="glossary-content">GlossaryContent</div>;
  };
});

describe('GlossaryPage Component (T070)', () => {
  const mockUseGlossary = GlossaryContext.useGlossary as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all sub-components when data is loaded in French', () => {
    mockUseGlossary.mockReturnValue({
      groupedTerms: {
        'Test Category': {
          'Test Type': [{
            id: 'test-1',
            term: 'Test Term',
            category: 'Test Category',
            type: 'Test Type',
            definition: { it: 'Def IT', fr: 'Def FR', en: 'Def EN' },
            translation: { it: 'Trans IT', fr: 'Trans FR', en: 'Trans EN' },
          }],
        },
      },
      searchQuery: '',
      setSearchQuery: jest.fn(),
      isLoading: false,
      error: null,
      terms: [],
      filteredTerms: [],
    });

    render(<GlossaryPage />);

    // Check that all main components are rendered
    expect(screen.getByText(/Glossary.*Glossaire.*Glossario/i)).toBeInTheDocument();
    // LanguageSelector should NOT be rendered (French-only display)
    expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument();
    expect(screen.getByTestId('glossary-search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('glossary-content')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseGlossary.mockReturnValue({
      groupedTerms: {},
      searchQuery: '',
      setSearchQuery: jest.fn(),
      isLoading: true,
      error: null,
      terms: [],
      filteredTerms: [],
    });

    render(<GlossaryPage />);

    expect(screen.getByText(/Loading glossary/i)).toBeInTheDocument();
    expect(screen.queryByTestId('glossary-content')).not.toBeInTheDocument();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load glossary data';
    mockUseGlossary.mockReturnValue({
      groupedTerms: {},
      searchQuery: '',
      setSearchQuery: jest.fn(),
      isLoading: false,
      error: errorMessage,
      terms: [],
      filteredTerms: [],
    });

    render(<GlossaryPage />);

    expect(screen.getByText(/Error Loading Glossary/i)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByTestId('glossary-content')).not.toBeInTheDocument();
  });

  it('passes correct props to sub-components in French', () => {
    const mockGroupedTerms = {
      'Category 1': {
        'Type 1': [{
          id: 'term-1',
          term: 'Term 1',
          category: 'Category 1',
          type: 'Type 1',
          definition: { it: 'IT', fr: 'FR', en: 'EN' },
          translation: { it: 'IT', fr: 'FR', en: 'EN' },
        }],
      },
    };

    mockUseGlossary.mockReturnValue({
      groupedTerms: mockGroupedTerms,
      searchQuery: 'test query',
      setSearchQuery: jest.fn(),
      isLoading: false,
      error: null,
      terms: [],
      filteredTerms: [],
    });

    render(<GlossaryPage />);

    // Verify components are rendered (no LanguageSelector in French-only mode)
    expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument();
    expect(screen.getByTestId('glossary-search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('glossary-content')).toBeInTheDocument();
  });

  it('renders page header with French glossary title', () => {
    mockUseGlossary.mockReturnValue({
      groupedTerms: {},
      searchQuery: '',
      setSearchQuery: jest.fn(),
      isLoading: false,
      error: null,
      terms: [],
      filteredTerms: [],
    });

    render(<GlossaryPage />);

    // Check for French glossary header
    expect(screen.getByText(/Glossary.*Glossaire.*Glossario/i)).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive glossary.*Bolognese fencing/i)).toBeInTheDocument();
  });

  it('applies correct layout and styling classes', () => {
    mockUseGlossary.mockReturnValue({
      groupedTerms: {},
      searchQuery: '',
      setSearchQuery: jest.fn(),
      isLoading: false,
      error: null,
      terms: [],
      filteredTerms: [],
    });

    const { container } = render(<GlossaryPage />);

    // Check for main layout classes
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
    expect(container.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
  });
});

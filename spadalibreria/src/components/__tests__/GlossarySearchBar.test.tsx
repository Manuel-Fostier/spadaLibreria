import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossarySearchBar from '../GlossarySearchBar';
import { useGlossary } from '@/contexts/GlossaryContext';

jest.mock('@/contexts/GlossaryContext', () => ({
  useGlossary: jest.fn(),
}));

const mockUseGlossary = useGlossary as jest.MockedFunction<typeof useGlossary>;

describe('GlossarySearchBar Component', () => {
  const setSearchQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGlossary.mockReturnValue({
      searchQuery: '',
      setSearchQuery,
      filteredTerms: [],
      isLoading: false,
      selectedLanguage: 'fr',
      setSelectedLanguage: jest.fn(),
      terms: [],
      groupedTerms: {},
      error: null,
    });
  });

  it('renders search input with placeholder', () => {
    render(<GlossarySearchBar />);
    expect(screen.getByPlaceholderText('Rechercher un terme')).toBeInTheDocument();
  });

  it('updates search query with debounce', () => {
    jest.useFakeTimers();
    render(<GlossarySearchBar />);

    const input = screen.getByPlaceholderText('Rechercher un terme');
    fireEvent.change(input, { target: { value: 'mandritto' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(setSearchQuery).toHaveBeenCalledWith('mandritto');
    jest.useRealTimers();
  });

  it('clears search query when clear button is clicked', () => {
    mockUseGlossary.mockReturnValue({
      searchQuery: 'mandritto',
      setSearchQuery,
      filteredTerms: [{ id: '1' } as any],
      isLoading: false,
      selectedLanguage: 'fr',
      setSelectedLanguage: jest.fn(),
      terms: [],
      groupedTerms: {},
      error: null,
    });

    render(<GlossarySearchBar />);
    const clearButton = screen.getByRole('button', { name: /effacer la recherche/i });
    fireEvent.click(clearButton);

    expect(setSearchQuery).toHaveBeenCalledWith('');
  });

  it('shows no results message when search yields no matches', () => {
    mockUseGlossary.mockReturnValue({
      searchQuery: 'xyz',
      setSearchQuery,
      filteredTerms: [],
      isLoading: false,
      selectedLanguage: 'fr',
      setSelectedLanguage: jest.fn(),
      terms: [],
      groupedTerms: {},
      error: null,
    });

    render(<GlossarySearchBar />);
    expect(screen.getByText('Aucun résultat.')).toBeInTheDocument();
  });
});

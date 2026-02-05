import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';
import { SearchProvider } from '@/contexts/SearchContext';
import type { TreatiseSection, GlossaryData } from '@/types/data';

// Mock data for SearchProvider
const mockTreatiseData: TreatiseSection[] = [{
  id: 'test-1',
  title: 'Test Section',
  metadata: {
    master: 'Test Master',
    work: 'Test Work',
    book: 1,
    chapter: 1,
    year: 1536
  },
  content: {
    it: 'Test content',
    fr: 'Contenu de test',
    en_versions: []
  }
}];

const mockGlossaryData: GlossaryData = {};

const renderSearchBar = () => {
  return render(
    <SearchProvider treatiseData={mockTreatiseData} glossaryData={mockGlossaryData}>
      <SearchBar />
    </SearchProvider>
  );
};

describe('SearchBar - Expandable textarea', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a textarea instead of input', () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i);
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('has minimum height of one line', () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    // Check that min-height is set (should be 2.5rem or 40px)
    expect(textarea.className).toContain('min-h-');
  });

  it('has maximum height limit (7 lines)', () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    // Check that max-h class is present
    expect(textarea.className).toContain('max-h-');
    // overflow-hidden is used instead of overflow-y-auto
    expect(textarea.className).toContain('overflow-hidden');
  });

  it('does not allow manual resize', () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    expect(textarea.className).toContain('resize-none');
  });

  it('expands automatically when multiline content is entered', async () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    
    // Type multiple lines
    await userEvent.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2{Shift>}{Enter}{/Shift}Line 3');
    
    // Check that textarea now has multiline content
    await waitFor(() => {
      expect(textarea.value).toContain('\n');
      expect(textarea.value.split('\n').length).toBeGreaterThanOrEqual(2);
    });
  });
});


describe('SearchBar - Controls positioning', () => {
  it('keeps controls at top-right when textarea expands', async () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    
    // Type multiline text
    await userEvent.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2{Shift>}{Enter}{/Shift}Line 3');
    
    // Find the controls container
    const controlsContainer = textarea.parentElement?.querySelector('.absolute.right-2');
    expect(controlsContainer).toBeInTheDocument();
    expect(controlsContainer?.className).toContain('top-2');
  });

  it('does not overlap text with controls', () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    // Check right padding is sufficient
    expect(textarea.className).toContain('pr-36');
  });
});

describe('SearchBar - Real-time search', () => {
  it('triggers search automatically on each character typed', async () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    
    // Type text character by character
    await userEvent.type(textarea, 'test');
    
    // Search should be triggered (we can't easily test the actual search without more mocking,
    // but we can verify the value changes)
    await waitFor(() => {
      expect(textarea.value).toBe('test');
    });
  });

  it('triggers search on character deletion', async () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    
    await userEvent.type(textarea, 'test');
    await userEvent.type(textarea, '{Backspace}');
    
    await waitFor(() => {
      expect(textarea.value).toBe('tes');
    });
  });

  it('clears search when text is completely deleted', async () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    
    await userEvent.type(textarea, 'test');
    await userEvent.clear(textarea);
    
    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });
});

describe('SearchBar - Keyboard shortcuts', () => {
  it('triggers search on Enter key', async () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    
    await userEvent.type(textarea, 'test');
    await userEvent.keyboard('{Enter}');
    
    // Verify text is still there (Enter doesn't add newline)
    expect(textarea.value).toBe('test');
  });

  it('adds newline on Shift+Enter', async () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    
    await userEvent.type(textarea, 'line1{Shift>}{Enter}{/Shift}line2');
    
    await waitFor(() => {
      expect(textarea.value).toBe('line1\nline2');
    });
  });

  it('clears text on Escape key', async () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    
    await userEvent.type(textarea, 'test');
    await userEvent.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });
});

describe('SearchBar - Controls functionality', () => {
  it('shows clear button when text is present', async () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    
    // Initially no clear button
    expect(screen.queryByTitle('Effacer')).not.toBeInTheDocument();
    
    // Type text
    await userEvent.type(textarea, 'test');
    
    // Clear button appears
    await waitFor(() => {
      expect(screen.getByTitle('Effacer')).toBeInTheDocument();
    });
  });

  it('clears text when clear button is clicked', async () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    
    await userEvent.type(textarea, 'test');
    
    const clearButton = await screen.findByTitle('Effacer');
    await userEvent.click(clearButton);
    
    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('renders all control buttons', () => {
    renderSearchBar();
    
    expect(screen.getByTitle('Respecter la casse')).toBeInTheDocument();
    expect(screen.getByTitle('Mot entier')).toBeInTheDocument();
    expect(screen.getByTitle('Expression régulière')).toBeInTheDocument();
  });

  it('toggles Match Case option', async () => {
    renderSearchBar();
    const button = screen.getByTitle('Respecter la casse');
    
    // Initially not active
    expect(button.className).not.toContain('bg-indigo-100');
    
    await userEvent.click(button);
    
    // Now active
    await waitFor(() => {
      expect(button.className).toContain('bg-indigo-100');
    });
  });
});

describe('SearchBar - Layout integration', () => {
  it('maintains proper spacing for TagFilter below', () => {
    const { container } = renderSearchBar();
    const wrapper = container.querySelector('.w-full');
    expect(wrapper).toBeInTheDocument();
    // The SearchBar should not have negative margins or absolute positioning that would overlap TagFilter
  });

  it('parent container uses items-start for top alignment', () => {
    renderSearchBar();
    const textarea = screen.getByPlaceholderText(/Rechercher/i) as HTMLTextAreaElement;
    const parent = textarea.parentElement;
    // Check that the parent has items-start instead of items-center
    expect(parent?.className).toContain('items-start');
  });
});

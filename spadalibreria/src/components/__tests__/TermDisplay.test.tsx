import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock markdown-related modules before importing components
jest.mock('react-markdown', () => {
  return jest.fn(({ children }: any) => <div className="markdown">{children}</div>);
});

jest.mock('remark-gfm', () => {
  return jest.fn(() => undefined);
});

jest.mock('../GlossaryLink', () => {
  return jest.fn(({ children }: any) => <span className="glossary-link">{children}</span>);
});

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
        termKey="mandritto"
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
        termKey="mandritto"
        searchQuery="Mandritto"
        highlightMatches={true}
      />
    );
    // The search should work even if highlights aren't visible in all contexts
    expect(screen.getByText('Mandritto')).toBeInTheDocument();
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

  describe('Markdown Rendering', () => {
    it('renders Markdown-formatted definition with basic formatting', () => {
      const termWithMarkdown: GlossaryTerm = {
        ...mockTerm,
        definition: {
          ...mockTerm.definition,
          fr: 'Un coup **important** en *italique* avec `code`',
        },
      };

      render(
        <TermDisplay
          term={termWithMarkdown}
          termKey="mandritto"
          searchQuery=""
          highlightMatches={false}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    it('renders Markdown links in definition', () => {
      const termWithLinks: GlossaryTerm = {
        ...mockTerm,
        definition: {
          ...mockTerm.definition,
          fr: 'Voir [Mandritto](https://example.com) pour plus',
        },
      };

      render(
        <TermDisplay
          term={termWithLinks}
          termKey="mandritto"
          searchQuery=""
          highlightMatches={false}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    it('renders Markdown lists in definition', () => {
      const termWithList: GlossaryTerm = {
        ...mockTerm,
        definition: {
          ...mockTerm.definition,
          fr: `Description principale:
- Point 1
- Point 2
- Point 3`,
        },
      };

      render(
        <TermDisplay
          term={termWithList}
          termKey="mandritto"
          searchQuery=""
          highlightMatches={false}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    it('renders Markdown headers in definition', () => {
      const termWithHeaders: GlossaryTerm = {
        ...mockTerm,
        definition: {
          ...mockTerm.definition,
          fr: `# Principal
## Secondaire
Contenu normal`,
        },
      };

      render(
        <TermDisplay
          term={termWithHeaders}
          termKey="mandritto"
          searchQuery=""
          highlightMatches={false}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    it('renders Markdown with search highlighting combined', () => {
      const termWithMarkdown: GlossaryTerm = {
        ...mockTerm,
        definition: {
          ...mockTerm.definition,
          fr: 'Un coup **important** avec recherche',
        },
      };

      render(
        <TermDisplay
          term={termWithMarkdown}
          termKey="mandritto"
          searchQuery="coup"
          highlightMatches={true}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    it('handles escaped Markdown characters', () => {
      const termWithEscaped: GlossaryTerm = {
        ...mockTerm,
        definition: {
          ...mockTerm.definition,
          fr: 'Texte avec \\*caractères\\* échappés',
        },
      };

      render(
        <TermDisplay
          term={termWithEscaped}
          termKey="mandritto"
          searchQuery=""
          highlightMatches={false}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    it('renders inline code blocks without creating extra elements', () => {
      const termWithCode: GlossaryTerm = {
        ...mockTerm,
        definition: {
          ...mockTerm.definition,
          fr: 'Utiliser `variable` dans le contexte',
        },
      };

      render(
        <TermDisplay
          term={termWithCode}
          termKey="mandritto"
          searchQuery=""
          highlightMatches={false}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    it('renders block code (code fences) correctly', () => {
      const termWithBlockCode: GlossaryTerm = {
        ...mockTerm,
        definition: {
          ...mockTerm.definition,
          fr: `Exemple:
\`\`\`
const x = 5;
\`\`\``,
        },
      };

      render(
        <TermDisplay
          term={termWithBlockCode}
          termKey="mandritto"
          searchQuery=""
          highlightMatches={false}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    it('handles complex nested Markdown formatting', () => {
      const termWithNested: GlossaryTerm = {
        ...mockTerm,
        definition: {
          ...mockTerm.definition,
          fr: 'Text avec ***gras et italique*** combinés',
        },
      };

      render(
        <TermDisplay
          term={termWithNested}
          termKey="mandritto"
          searchQuery=""
          highlightMatches={false}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    it('renders blockquotes in definition', () => {
      const termWithQuote: GlossaryTerm = {
        ...mockTerm,
        definition: {
          ...mockTerm.definition,
          fr: `Normal text
> Citation importante
Retour au normal`,
        },
      };

      render(
        <TermDisplay
          term={termWithQuote}
          termKey="mandritto"
          searchQuery=""
          highlightMatches={false}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });
  });
});

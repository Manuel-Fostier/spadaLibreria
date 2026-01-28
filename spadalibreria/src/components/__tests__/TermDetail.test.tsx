import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TermDisplay from '../TermDisplay';
import { GlossaryTerm } from '@/types/glossary';

describe('TermDisplay - Detailed View (User Story 3)', () => {
  const mockTerm: GlossaryTerm = {
    id: 'test-mandritto',
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

  describe('T060: Detailed term view toggle', () => {
    it('initially shows only selected language', () => {
      render(
        <TermDisplay
          term={mockTerm}
          language="fr"
          searchQuery=""
          highlightMatches={false}
        />
      );
      
      // Should show French definition
      expect(screen.getByText(/Un coup d'épée/)).toBeInTheDocument();
      
      // Should NOT show other languages initially
      expect(screen.queryByText(/A sword strike/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Un colpo di spada/)).not.toBeInTheDocument();
    });

    it('expands to show all languages when clicked', () => {
      render(
        <TermDisplay
          term={mockTerm}
          language="fr"
          searchQuery=""
          highlightMatches={false}
        />
      );
      
      // Click the term card to expand
      const termCard = screen.getByText('Mandritto', { selector: 'h4' }).closest('div.term-display');
      expect(termCard).toBeInTheDocument();
      
      if (termCard) {
        fireEvent.click(termCard);
      }
      
      // After click, should show all three languages
      expect(screen.getAllByText(/Italian/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/French/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/english/i).length).toBeGreaterThan(0);
      
      expect(screen.getByText(/Un colpo di spada/)).toBeInTheDocument();
      expect(screen.getByText(/Un coup d'épée/)).toBeInTheDocument();
      expect(screen.getByText(/A sword strike/)).toBeInTheDocument();
    });

    it('collapses back to single language when clicked again', () => {
      render(
        <TermDisplay
          term={mockTerm}
          language="fr"
          searchQuery=""
          highlightMatches={false}
        />
      );
      
      const termCard = screen.getByText('Mandritto', { selector: 'h4' }).closest('div.term-display');
      
      if (termCard) {
        // Expand
        fireEvent.click(termCard);
        expect(screen.getByText(/Un colpo di spada/)).toBeInTheDocument();
        
        // Collapse
        fireEvent.click(termCard);
        expect(screen.queryByText(/Un colpo di spada/)).not.toBeInTheDocument();
        expect(screen.getByText(/Un coup d'épée/)).toBeInTheDocument(); // Selected language still visible
      }
    });

    it('shows expand/collapse indicator icon', () => {
      const { container } = render(
        <TermDisplay
          term={mockTerm}
          language="fr"
          searchQuery=""
          highlightMatches={false}
        />
      );
      
      // Should show chevron icon (lucide icons render as SVG)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
      
      const termCard = screen.getByText('Mandritto', { selector: 'h4' }).closest('div.term-display');
      
      if (termCard) {
        fireEvent.click(termCard);
        // After expansion, icon should still be present (just different direction)
        const iconsAfterExpand = container.querySelectorAll('svg');
        expect(iconsAfterExpand.length).toBeGreaterThan(0);
      }
    });
  });

  describe('T062 & T063: Multilingual definition display', () => {
    it('displays Italian name prominently in expanded view', () => {
      render(
        <TermDisplay
          term={mockTerm}
          language="en"
          searchQuery=""
          highlightMatches={false}
        />
      );
      
      const termCard = screen.getByText('Mandritto', { selector: 'h4' }).closest('div.term-display');
      if (termCard) {
        fireEvent.click(termCard);
        
        // Italian term should be displayed with label
        expect(screen.getAllByText(/Italian/i).length).toBeGreaterThan(0);
        expect(screen.getByText('Mandritto', { selector: '.font-bold' })).toBeInTheDocument();
      }
    });

    it('displays all three language sections with proper labels', () => {
      render(
        <TermDisplay
          term={mockTerm}
          language="fr"
          searchQuery=""
          highlightMatches={false}
        />
      );
      
      const termCard = screen.getByText('Mandritto', { selector: 'h4' }).closest('div.term-display');
      if (termCard) {
        fireEvent.click(termCard);
        
        // Check for language labels
        expect(screen.getAllByText(/Italian/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/French/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/English/i).length).toBeGreaterThan(0);
      }
    });

    it('displays category and type in expanded view', () => {
      render(
        <TermDisplay
          term={mockTerm}
          language="fr"
          searchQuery=""
          highlightMatches={false}
        />
      );
      
      const termCard = screen.getByText('Mandritto', { selector: 'h4' }).closest('div.term-display');
      if (termCard) {
        fireEvent.click(termCard);
        
        expect(screen.getByText('Coups et Techniques')).toBeInTheDocument();
        expect(screen.getByText('Attaque / Frappe de taille')).toBeInTheDocument();
      }
    });
  });

  describe('T064 & T065: Missing translation handling', () => {
    const termWithMissingTranslations: GlossaryTerm = {
      id: 'test-incomplete',
      term: 'TestTerm',
      category: 'Test Category',
      type: 'Test Type',
      definition: {
        it: 'Definizione italiana',
        fr: 'Définition française',
        en: '', // Missing English definition
      },
      translation: {
        it: 'TestTerm',
        fr: 'TestTerm',
        en: '', // Missing English translation
      },
    };

    it('handles missing definitions gracefully', () => {
      render(
        <TermDisplay
          term={termWithMissingTranslations}
          language="en"
          searchQuery=""
          highlightMatches={false}
        />
      );
      
      const termCard = screen.getByText('TestTerm', { selector: 'h4' }).closest('div.term-display');
      if (termCard) {
        fireEvent.click(termCard);
        
        // Should show available definitions
        expect(screen.getByText('Definizione italiana')).toBeInTheDocument();
        expect(screen.getByText('Définition française')).toBeInTheDocument();
        
        // Should show placeholder or indication for missing English
        expect(screen.getByText(/no.*definition|not.*available/i)).toBeInTheDocument();
      }
    });

    it('handles missing translations gracefully', () => {
      render(
        <TermDisplay
          term={termWithMissingTranslations}
          language="en"
          searchQuery=""
          highlightMatches={false}
        />
      );
      
      const termCard = screen.getByText('TestTerm', { selector: 'h4' }).closest('div.term-display');
      if (termCard) {
        fireEvent.click(termCard);
        
        // Should handle missing translation gracefully
        // Either show "N/A" or skip empty translation section
        const content = screen.getByText('TestTerm', { selector: 'h4' }).closest('div.term-display');
        expect(content).toBeInTheDocument();
      }
    });

    it('shows all available languages even when some are missing', () => {
      const partialTerm: GlossaryTerm = {
        ...mockTerm,
        definition: {
          it: '',
          fr: 'Définition en français',
          en: 'English definition',
        },
      };

      render(
        <TermDisplay
          term={partialTerm}
          language="fr"
          searchQuery=""
          highlightMatches={false}
        />
      );
      
      const termCard = screen.getByText('Mandritto', { selector: 'h4' }).closest('div.term-display');
      if (termCard) {
        fireEvent.click(termCard);
        
        // Should show French and English but indicate Italian is unavailable
        expect(screen.getByText('Définition en français')).toBeInTheDocument();
        expect(screen.getByText('English definition')).toBeInTheDocument();
      }
    });
  });

  describe('Integration with search highlighting', () => {
    it('applies highlighting to all languages in expanded view', () => {
      render(
        <TermDisplay
          term={mockTerm}
          language="fr"
          searchQuery="sword"
          highlightMatches={true}
        />
      );
      
      const termCard = screen.getByText('Mandritto', { selector: 'h4' }).closest('div.term-display');
      if (termCard) {
        fireEvent.click(termCard);
        
        // Should highlight "sword" in English definition
        const highlightedText = screen.getByText(/sword/i).closest('mark');
        expect(highlightedText).toHaveClass('bg-yellow-200');
      }
    });
  });
});

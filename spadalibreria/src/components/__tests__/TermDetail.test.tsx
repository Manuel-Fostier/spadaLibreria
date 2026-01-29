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
      import React from 'react';
      import { render, screen } from '@testing-library/react';
      import '@testing-library/jest-dom';
      import TermDisplay from '../TermDisplay';
      import { GlossaryTerm } from '@/types/glossary';

      describe('TermDisplay - Detailed View (French-only)', () => {
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

        it('renders Italian term name and French definition', () => {
          render(
            <TermDisplay
              term={mockTerm}
              searchQuery=""
              highlightMatches={false}
            />
          );

          expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
          expect(screen.getByText(/Un coup d'épée/)).toBeInTheDocument();
        });

        it('does not render English or Italian definitions', () => {
          render(
            <TermDisplay
              term={mockTerm}
              searchQuery=""
              highlightMatches={false}
            />
          );

          expect(screen.queryByText(/A sword strike/)).not.toBeInTheDocument();
          expect(screen.queryByText(/Un colpo di spada/)).not.toBeInTheDocument();
        });

        it('does not render category, type, or translation content', () => {
          render(
            <TermDisplay
              term={mockTerm}
              searchQuery=""
              highlightMatches={false}
            />
          );

          expect(screen.queryByText('Coups et Techniques')).not.toBeInTheDocument();
          expect(screen.queryByText('Attaque / Frappe de taille')).not.toBeInTheDocument();
          expect(screen.queryByText('Right-hand Strike')).not.toBeInTheDocument();
        });
      });
});

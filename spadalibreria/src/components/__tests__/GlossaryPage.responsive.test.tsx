/**
 * Responsive Design Tests for GlossaryPage (T090)
 * 
 * Tests glossary page responsiveness across:
 * - Mobile: 375px viewport
 * - Tablet: 768px viewport
 * - Desktop: 1920px viewport
 * 
 * Verifies that content is readable and functional at all breakpoints.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryPageWrapper from '../GlossaryPageWrapper';
import GlossaryPage from '../GlossaryPage';
import { GlossaryTerm } from '@/types/glossary';

const mockTerms: GlossaryTerm[] = [
  {
    id: 'mandritto',
    term: 'Mandritto',
    category: 'Coups et Techniques',
    type: 'Attaque / Frappe de taille',
    definition: {
      it: 'Colpo portato da destra a sinistra.',
      fr: 'Coup porté de la droite vers la gauche.',
      en: 'A cut delivered from right to left.',
    },
    translation: {
      it: 'Mandritto',
      fr: 'Coup droit',
      en: 'Forehand cut',
    },
  },
];

describe('GlossaryPage Responsive Design (T090)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTerms,
    }) as any;
  });

  describe('Mobile viewport (375px)', () => {
    beforeEach(() => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;
    });

    it('renders page header with readable text on mobile', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('GLOSSAIRE')).toBeInTheDocument();
      });

      const header = screen.getByText('GLOSSAIRE');
      expect(header).toBeInTheDocument();
      expect(header.className).toContain('text-lg');
    });

    it('renders search bar with proper mobile layout', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        const searchInput = screen.getByRole('searchbox');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveClass('w-full'); // Full width on mobile
    });

    it('renders glossary content with proper spacing on mobile', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
      });

      const categorySection = screen.getAllByText('Coups et Techniques', { selector: 'h2' })[0];
      expect(categorySection).toBeInTheDocument();
      expect(categorySection.className).toContain('text-2xl');
    });

    it('renders terms with adequate padding on mobile', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
      });

      // Terms should have responsive padding for touch targets
      const termElements = document.querySelectorAll('.term-display');
      expect(termElements.length).toBeGreaterThan(0);
      termElements.forEach((term) => {
        expect(term.className).toContain('p-3');
        expect(term.className).toContain('sm:p-4');
      });
    });
  });

  describe('Tablet viewport (768px)', () => {
    beforeEach(() => {
      global.innerWidth = 768;
      global.innerHeight = 1024;
    });

    it('renders page with tablet-optimized layout', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
      });

      const mainContainer = document.querySelector('.max-w-4xl');
      expect(mainContainer).toBeInTheDocument();
    });

    it('renders search bar with tablet spacing', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        const searchInput = screen.getByRole('searchbox');
        expect(searchInput).toBeInTheDocument();
      });

      const searchContainer = document.querySelector('.w-full.max-w-3xl');
      expect(searchContainer).toBeInTheDocument();
    });

    it('renders category sections with proper hierarchy on tablet', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Coups et Techniques')[0]).toBeInTheDocument();
      });

      const categoryHeader = screen.getAllByText('Coups et Techniques', { selector: 'h2' })[0];
      expect(categoryHeader.className).toContain('text-xl');
      expect(categoryHeader.className).toContain('sm:text-2xl');
      expect(categoryHeader.className).toContain('mb-4');
      expect(categoryHeader.className).toContain('sm:mb-6');
    });
  });

  describe('Desktop viewport (1920px)', () => {
    beforeEach(() => {
      global.innerWidth = 1920;
      global.innerHeight = 1080;
    });

    it('renders page with desktop layout and max-width constraint', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
      });

      const mainContainer = document.querySelector('.max-w-4xl');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('mx-auto'); // Centered on desktop
    });

    it('renders search bar centered with max-width on desktop', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        const searchInput = screen.getByRole('searchbox');
        expect(searchInput).toBeInTheDocument();
      });

      const searchContainer = document.querySelector('.max-w-3xl');
      expect(searchContainer).toBeInTheDocument();
      expect(searchContainer).toHaveClass('mx-auto');
    });

    it('renders terms with optimal line length on desktop', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
      });

      // Content should be constrained to max-w-4xl for readability
      const mainContainer = document.querySelector('.max-w-4xl');
      expect(mainContainer).toBeInTheDocument();
    });

    it('renders category headers with proper font sizes on desktop', async () => {
      render(
        <GlossaryPageWrapper>
          <GlossaryPage />
        </GlossaryPageWrapper>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Coups et Techniques')[0]).toBeInTheDocument();
      });

      const categoryHeader = screen.getAllByText('Coups et Techniques', { selector: 'h2' })[0];
      expect(categoryHeader.className).toContain('text-xl');
      expect(categoryHeader.className).toContain('sm:text-2xl');
      
      const termHeader = screen.getByText('Mandritto', { selector: 'h4' });
      expect(termHeader.className).toContain('text-base');
      expect(termHeader.className).toContain('sm:text-lg');
    });
  });

  describe('Cross-viewport consistency', () => {
    it('maintains content hierarchy across all viewports', async () => {
      const viewports = [
        { width: 375, height: 667 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ];

      for (const viewport of viewports) {
        global.innerWidth = viewport.width;
        global.innerHeight = viewport.height;

        const { unmount } = render(
          <GlossaryPageWrapper>
            <GlossaryPage />
          </GlossaryPageWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText('Mandritto', { selector: 'h4' })).toBeInTheDocument();
        });

        // Verify hierarchy is preserved: H1 → H2 (category) → H3 (type) → H4 (term)
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();

        unmount();
      }
    });

    it('search functionality works on all viewports', async () => {
      const viewports = [375, 768, 1920];

      for (const width of viewports) {
        global.innerWidth = width;

        const { unmount } = render(
          <GlossaryPageWrapper>
            <GlossaryPage />
          </GlossaryPageWrapper>
        );

        await waitFor(() => {
          const searchInput = screen.getByRole('searchbox');
          expect(searchInput).toBeInTheDocument();
        });

        const searchInput = screen.getByRole('searchbox');
        expect(searchInput).toBeEnabled();

        unmount();
      }
    });
  });
});

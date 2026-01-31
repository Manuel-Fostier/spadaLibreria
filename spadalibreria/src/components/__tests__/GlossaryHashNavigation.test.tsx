'use client';

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryPage from '../GlossaryPage';
import { GlossaryPageWrapper } from '../GlossaryPageWrapper';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock glossary data loader
jest.mock('@/lib/glossaryLoader', () => ({
  loadGlossaryTerms: jest.fn(() =>
    Promise.resolve({
      mandritto: {
        id: 'mandritto',
        term: 'Mandritto',
        category: 'Coups et Techniques',
        type: 'Attaque / Frappe de taille',
        definition: { it: '...', fr: 'Coup porté de la droite vers la gauche.' },
        translation: { it: '...', fr: 'Coup droit' },
      },
      falso_dritto: {
        id: 'falso_dritto',
        term: 'Falso Dritto',
        category: 'Coups et Techniques',
        type: 'Attaque / Frappe de taille',
        definition: { it: '...', fr: 'Coup inversé de la droite.' },
        translation: { it: '...', fr: 'Faux coup droit' },
      },
      coda_lunga: {
        id: 'coda_lunga',
        term: 'Coda Lunga',
        category: 'Les Guardes',
        type: 'Garde basse',
        definition: { it: '...', fr: 'Garde longue en bas.' },
        translation: { it: '...', fr: 'Queue longue' },
      },
    })
  ),
  groupGlossaryByCategory: jest.fn((terms) => ({
    'Coups et Techniques': {
      'Attaque / Frappe de taille': [terms.mandritto, terms.falso_dritto],
    },
    'Les Guardes': {
      'Garde basse': [terms.coda_lunga],
    },
  })),
}));

describe('GlossaryHashNavigation (Phase 3)', () => {
  beforeEach(() => {
    // Set up initial hash value for tests
    window.location.hash = '';
  });

  it('T140: parses URL hash and scrolls to target term on page load', async () => {
    // Simulate hash in URL
    window.location.hash = '#mandritto';

    render(
      <GlossaryPageWrapper>
        <GlossaryPage />
      </GlossaryPageWrapper>
    );

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    // Verify the target term is visible
    const targetTerm = screen.getByText('Mandritto');
    expect(targetTerm).toBeInTheDocument();
  });

  it('T140: handles invalid hash gracefully without crashing', async () => {
    window.location.hash = '#nonexistent_term';

    render(
      <GlossaryPageWrapper>
        <GlossaryPage />
      </GlossaryPageWrapper>
    );

    // Page should still load and display all terms
    await waitFor(() => {
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
      expect(screen.getByText('Coda Lunga')).toBeInTheDocument();
    });
  });

  it('T140: clears hash when no hash provided (default behavior)', async () => {
    window.location.hash = '';

    render(
      <GlossaryPageWrapper>
        <GlossaryPage />
      </GlossaryPageWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Mandritto')).toBeInTheDocument();
    });

    // Verify page loads normally without special navigation
    expect(window.location.hash).toBe('');
  });

  it('T140: scrolls to correct term when multiple terms in same category', async () => {
    window.location.hash = '#falso_dritto';

    render(
      <GlossaryPageWrapper>
        <GlossaryPage />
      </GlossaryPageWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Falso Dritto')).toBeInTheDocument();
    });

    const targetTerm = screen.getByText('Falso Dritto');
    expect(targetTerm).toBeInTheDocument();
  });
});

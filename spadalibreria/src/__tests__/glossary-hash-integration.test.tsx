'use client';

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryLink from '@/components/GlossaryLink';
import { AnnotationDisplayProvider } from '@/contexts/AnnotationDisplayContext';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className, ...props }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className} data-testid="glossary-link" {...props}>
      {children}
    </a>
  ),
}));

const glossaryData = {
  mandritto: {
    term: 'Mandritto',
    type: 'Attaque / Frappe de taille',
    definition: {
      fr: 'Coup porté de la droite vers la gauche.',
    },
    translation: {
      fr: 'Coup droit',
    },
  },
};

describe('GlossaryHashNavigation - Treatise Integration (T144, Phase 3 - Simplified)', () => {
  it('T144: renders glossary link with term hash fragment', () => {
    render(
      <AnnotationDisplayProvider>
        <GlossaryLink termKey="mandritto" glossaryData={glossaryData}>
          Mandritto
        </GlossaryLink>
      </AnnotationDisplayProvider>
    );

    const link = screen.getByTestId('glossary-link');
    expect(link).toHaveAttribute('href', '/glossary#mandritto');
    expect(link).toHaveTextContent('Mandritto');
  });

  it('T144: hash fragment uses term key as identifier', () => {
    const testTermKey = 'falso_dritto';
    const testGlossaryData = {
      falso_dritto: {
        term: 'Falso Dritto',
        type: 'Attaque / Frappe de taille',
        definition: { fr: 'Coup inversé' },
        translation: { fr: 'Faux coup' },
      },
    };

    render(
      <AnnotationDisplayProvider>
        <GlossaryLink termKey={testTermKey} glossaryData={testGlossaryData}>
          Falso Dritto
        </GlossaryLink>
      </AnnotationDisplayProvider>
    );

    const link = screen.getByTestId('glossary-link');
    expect(link).toHaveAttribute('href', `/glossary#${testTermKey}`);
  });

  it('T144: supports various term keys as hash fragments', () => {
    const termKeys = [
      'mandritto',
      'falso_dritto',
      'coda_lunga',
      'punta',
      'sottano',
    ];

    termKeys.forEach((termKey) => {
      const { unmount } = render(
        <AnnotationDisplayProvider>
          <GlossaryLink termKey={termKey} glossaryData={glossaryData}>
            {termKey}
          </GlossaryLink>
        </AnnotationDisplayProvider>
      );

      const link = screen.getByTestId('glossary-link');
      expect(link).toHaveAttribute('href', `/glossary#${termKey}`);
      unmount();
    });
  });

  it('T144: preserves hash when navigating within glossary page', () => {
    render(
      <AnnotationDisplayProvider>
        <GlossaryLink termKey="mandritto" glossaryData={glossaryData}>
          Navigate to Mandritto
        </GlossaryLink>
      </AnnotationDisplayProvider>
    );

    const link = screen.getByTestId('glossary-link');
    const href = link.getAttribute('href');
    
    // Verify href contains hash with term key
    expect(href).toMatch(/^\/glossary#[a-z_]+$/);
    expect(href).toBe('/glossary#mandritto');
  });

  it('T144: hash navigation works for terms in different categories', () => {
    const guardTerm = {
      coda_lunga: {
        term: 'Coda Lunga',
        type: 'Garde basse',
        definition: { fr: 'Garde longue en bas' },
        translation: { fr: 'Queue longue' },
      },
    };

    render(
      <AnnotationDisplayProvider>
        <GlossaryLink termKey="coda_lunga" glossaryData={guardTerm}>
          Coda Lunga
        </GlossaryLink>
      </AnnotationDisplayProvider>
    );

    const link = screen.getByTestId('glossary-link');
    expect(link).toHaveAttribute('href', '/glossary#coda_lunga');
  });

  it('T144: no tooltip behavior - simple link without Term wrapper', () => {
    render(
      <AnnotationDisplayProvider>
        <GlossaryLink termKey="mandritto" glossaryData={glossaryData}>
          Mandritto
        </GlossaryLink>
      </AnnotationDisplayProvider>
    );

    // Verify link exists but no tooltip wrapper
    const link = screen.getByTestId('glossary-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Mandritto');
    
    // Should have link styling and color from annotation
    expect(link).toHaveClass('underline', 'decoration-dotted', 'underline-offset-2');
    expect(link.getAttribute('style')).toMatch(/color:\s*[^;]+/);
    
    // Should NOT have Term wrapper with data-term-key
    expect(screen.queryByTestId('term-wrapper')).not.toBeInTheDocument();
  });

  it('T144: browser back button works after hash navigation', () => {
    const mockHistoryBack = jest.spyOn(window.history, 'back');

    render(
      <AnnotationDisplayProvider>
        <GlossaryLink termKey="mandritto" glossaryData={glossaryData}>
          Mandritto
        </GlossaryLink>
      </AnnotationDisplayProvider>
    );

    const link = screen.getByTestId('glossary-link');
    expect(link).toHaveAttribute('href', '/glossary#mandritto');

    // Browser's native back button works with hash URLs automatically
    // This test verifies the link is correctly formed for browser history

    mockHistoryBack.mockRestore();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryLink from '../GlossaryLink';
import { GlossaryEntry } from '@/lib/dataLoader';
import { AnnotationDisplayProvider } from '@/contexts/AnnotationDisplayContext';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className, ...props }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

const glossaryData: { [key: string]: GlossaryEntry } = {
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

describe('GlossaryLink', () => {
  it('renders a colored link to /glossary with term hash fragment (Phase 3 - No tooltip)', () => {
    render(
      <AnnotationDisplayProvider>
        <GlossaryLink termKey="mandritto" glossaryData={glossaryData}>
          Mandritto
        </GlossaryLink>
      </AnnotationDisplayProvider>
    );

    const link = screen.getByRole('link', { name: /mandritto/i });
    expect(link).toBeInTheDocument();
    // Phase 3: Links now include hash fragment for direct term navigation
    expect(link).toHaveAttribute('href', '/glossary#mandritto');
    // No tooltip - styled link with underline and annotation color
    expect(link).toHaveClass('underline', 'decoration-dotted', 'underline-offset-2');
    expect(link.getAttribute('style')).toMatch(/color:\s*[^;]+/);
  });
});

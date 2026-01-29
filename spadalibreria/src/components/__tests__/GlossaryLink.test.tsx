import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryLink from '../GlossaryLink';
import { GlossaryEntry } from '@/lib/dataLoader';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('../Term', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="term-wrapper">{children}</span>
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
  it('renders a link to /glossary with term content', () => {
    render(
      <GlossaryLink termKey="mandritto" glossaryData={glossaryData}>
        Mandritto
      </GlossaryLink>
    );

    const link = screen.getByRole('link', { name: /mandritto/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/glossary');
    expect(screen.getByTestId('term-wrapper')).toBeInTheDocument();
  });
});

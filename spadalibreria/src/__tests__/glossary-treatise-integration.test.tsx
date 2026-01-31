import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextParser from '@/components/TextParser';
import { AnnotationDisplayProvider } from '@/contexts/AnnotationDisplayContext';
import { GlossaryEntry } from '@/lib/dataLoader';

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children, components }: { children: React.ReactNode; components?: any }) => {
    if (components?.p) {
      return components.p({ children });
    }
    return <p>{children}</p>;
  },
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        window.history.pushState({}, '', href);
      }}
      {...props}
    >
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

describe('Treatise to Glossary Integration (Phase 2)', () => {
  it('T123: renders glossary term links that navigate to /glossary', () => {
    render(
      <AnnotationDisplayProvider>
        <TextParser
          text="Le {mandritto} est une attaque classique."
          glossaryData={glossaryData}
        />
      </AnnotationDisplayProvider>
    );

    const link = screen.getByRole('link', { name: /mandritto/i });
    expect(link).toBeInTheDocument();
    // Phase 3: Links now include hash fragment for direct term navigation
    expect(link).toHaveAttribute('href', '/glossary#mandritto');
  });

  it('T124: browser back returns to treatise after navigating to glossary', async () => {
    window.history.pushState({}, '', '/treatise');

    render(
      <AnnotationDisplayProvider>
        <TextParser
          text="Le {mandritto} est une attaque classique."
          glossaryData={glossaryData}
        />
      </AnnotationDisplayProvider>
    );

    const link = screen.getByRole('link', { name: /mandritto/i });
    fireEvent.click(link);

    expect(window.location.pathname).toBe('/glossary');

    window.history.back();

    await waitFor(() => {
      expect(window.location.pathname).toBe('/treatise');
    });
  });
});

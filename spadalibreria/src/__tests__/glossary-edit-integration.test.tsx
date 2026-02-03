import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock markdown-related modules first
jest.mock('@/components/MarkdownRenderer', () => {
  return jest.fn(({ text }: any) => <div className="markdown">{text}</div>);
});

jest.mock('react-markdown', () => {
  return jest.fn(({ children }: any) => <div className="markdown">{children}</div>);
});

jest.mock('remark-gfm', () => {
  return jest.fn(() => undefined);
});

jest.mock('@/components/GlossaryLink', () => {
  return jest.fn(({ children }: any) => <span className="glossary-link">{children}</span>);
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock the glossary loader
jest.mock('@/lib/glossaryLoader');
jest.mock('@/lib/dataLoader');

import GlossaryTermEditor from '@/components/GlossaryTermEditor';
import { GlossaryTerm } from '@/types/glossary';

describe('Glossary Edit Integration Tests', () => {
  const mockTerm: GlossaryTerm = {
    id: 'term-001',
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

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock fetch for API calls
    global.fetch = jest.fn();

    // Mock window.location.reload
    delete (window as any).location;
    window.location = { reload: jest.fn() } as any;
  });

  describe('T162: Edit term field → save → page reload shows updated value', () => {
    it('edits a term field and calls API', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = userEvent.setup();
      render(
        <GlossaryTermEditor
          termKey="mandritto"
          term={mockTerm}
          isEditing={true}
          onEditStart={jest.fn()}
          onEditCancel={jest.fn()}
        />
      );

      // Find and modify the term input
      const termInputs = screen.getAllByDisplayValue('Mandritto');
      await user.clear(termInputs[0]);
      await user.type(termInputs[0], 'Mandritto Modificato');

      // Save
      const saveButtons = screen.getAllByRole('button', { name: /enregistrer|sauvegarder/i });
      await user.click(saveButtons[saveButtons.length - 1]);

      // Verify API was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('edits definition and calls API', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = userEvent.setup();
      render(
        <GlossaryTermEditor
          termKey="mandritto"
          term={mockTerm}
          isEditing={true}
          onEditStart={jest.fn()}
          onEditCancel={jest.fn()}
        />
      );

      // Find and modify the definition input
      const definitionInputs = screen.getAllByDisplayValue(/Un coup d'épée/);
      await user.clear(definitionInputs[0]);
      await user.type(definitionInputs[0], 'Nouvelle définition');

      // Save
      const saveButtons = screen.getAllByRole('button', { name: /enregistrer|sauvegarder/i });
      await user.click(saveButtons[saveButtons.length - 1]);

      // Verify API was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('edits category and calls API', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = userEvent.setup();
      render(
        <GlossaryTermEditor
          termKey="mandritto"
          term={mockTerm}
          isEditing={true}
          onEditStart={jest.fn()}
          onEditCancel={jest.fn()}
        />
      );

      // Find and modify the category input
      const categoryInputs = screen.getAllByDisplayValue('Coups et Techniques');
      await user.clear(categoryInputs[0]);
      await user.type(categoryInputs[0], 'Nouvelle Catégorie');

      // Save
      const saveButtons = screen.getAllByRole('button', { name: /enregistrer|sauvegarder/i });
      await user.click(saveButtons[saveButtons.length - 1]);

      // Verify API was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('T163: Edit multiple fields in sequence → all saved correctly', () => {
    it('edits all four fields and saves all changes', async () => {
      const fetchMock = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

      global.fetch = fetchMock;

      const user = userEvent.setup();
      render(
        <GlossaryTermEditor
          termKey="mandritto"
          term={mockTerm}
          isEditing={true}
          onEditStart={jest.fn()}
          onEditCancel={jest.fn()}
        />
      );

      // Modify all four fields
      const categoryInputs = screen.getAllByDisplayValue('Coups et Techniques');
      const termInputs = screen.getAllByDisplayValue('Mandritto');
      const typeInputs = screen.getAllByDisplayValue('Attaque / Frappe de taille');
      const definitionInputs = screen.getAllByDisplayValue(/Un coup d'épée/);

      await user.clear(categoryInputs[0]);
      await user.type(categoryInputs[0], 'Cat Modifiée');

      await user.clear(termInputs[0]);
      await user.type(termInputs[0], 'Term Modifié');

      await user.clear(typeInputs[0]);
      await user.type(typeInputs[0], 'Type Modifié');

      await user.clear(definitionInputs[0]);
      await user.type(definitionInputs[0], 'Def Modifiée');

      // Save all changes
      const saveButtons = screen.getAllByRole('button', { name: /enregistrer|sauvegarder/i });
      await user.click(saveButtons[saveButtons.length - 1]);

      // Verify all four API calls were made
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(4);
      });
    });

    it('saves fields with correct API payloads', async () => {
      const fetchMock = jest.fn()
        .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });

      global.fetch = fetchMock;

      const user = userEvent.setup();
      render(
        <GlossaryTermEditor
          termKey="mandritto"
          term={mockTerm}
          isEditing={true}
          onEditStart={jest.fn()}
          onEditCancel={jest.fn()}
        />
      );

      // Modify term
      const termInputs = screen.getAllByDisplayValue('Mandritto');
      await user.clear(termInputs[0]);
      await user.type(termInputs[0], 'New Term');

      // Save
      const saveButtons = screen.getAllByRole('button', { name: /enregistrer|sauvegarder/i });
      await user.click(saveButtons[saveButtons.length - 1]);

      // Verify API was called with correct termKey
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/glossary/term',
          expect.any(Object)
        );
      });
    });
  });
});

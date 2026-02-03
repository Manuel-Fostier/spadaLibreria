import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock TextEditor component
jest.mock('@/components/TextEditor', () => {
  return jest.fn(({ onSave, onCancel }: any) => (
    <div data-testid="text-editor">
      <textarea data-testid="editor-textarea" />
      <button onClick={() => onCancel()} data-testid="editor-cancel">Cancel</button>
      <button onClick={() => onSave('test')} data-testid="editor-save">Save</button>
    </div>
  ));
});

import NewSectionForm from '@/components/NewSectionForm';

describe('T193/T194/T195: New Section Creation Workflow', () => {
  const mockMasters = ['Achille Marozzo', 'Antonio Manciolino', 'Filippo Vadi'];
  const mockWorks = ['Opera Nova', 'Libro dei Duelli', 'Arti Maestrevoli'];
  const mockBooks = ['Livre 1', 'Livre 2', 'Livre 3', 'Livre 4'];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    window.location.reload = jest.fn();
  });

  describe('T193: Add new section workflow', () => {
    it('creates a new section with all required metadata', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, id: 'section_123' }),
      });

      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      render(
        <NewSectionForm
          onClose={mockOnClose}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      // Fill form with complete metadata
      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 2');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '3');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'La Guardia');
      await user.type(screen.getByPlaceholderText(/contenu|content/i) || screen.getByText(/content/i), 'Italian text content');

      // Submit
      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      // Verify API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/content/section',
          expect.any(Object)
        );
      });
    });

    it('closes dialog and reloads on successful creation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      render(
        <NewSectionForm
          onClose={mockOnClose}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 1');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'Test');
      await user.type(screen.getByPlaceholderText(/contenu|content/i) || screen.getByText(/content/i), 'Content');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      await waitFor(() => {
        expect(window.location.reload).toHaveBeenCalled();
      });
    });
  });

  describe('T194: Section metadata validation', () => {
    it('prevents submission with missing master', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 1');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'Test');
      await user.type(screen.getByPlaceholderText(/contenu|content/i) || screen.getByText(/content/i), 'Text');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      // API should not be called if validation fails
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('prevents submission with missing work', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 1');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'Test');
      await user.type(screen.getByPlaceholderText(/contenu|content/i) || screen.getByText(/content/i), 'Text');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('prevents submission with missing year', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 1');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/titre|title/i), 'Test');
      await user.type(screen.getByPlaceholderText(/contenu|content/i) || screen.getByText(/content/i), 'Text');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('prevents submission with missing title', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 1');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByPlaceholderText(/contenu|content/i) || screen.getByText(/content/i), 'Text');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('prevents submission with missing content', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 1');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'Test');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates year is a valid number', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      const yearInput = screen.getByLabelText(/année|year/i) as HTMLInputElement;
      await user.type(yearInput, 'invalid');

      // Year field should reject non-numeric input or show validation error
      expect(yearInput.type).toBe('number');
    });
  });

  describe('T195: File selection and organization', () => {
    it('correctly maps master, work, and book to file path', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Filippo Vadi');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Libro dei Duelli');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 3');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '2');
      await user.type(screen.getByLabelText(/année|year/i), '1482');
      await user.type(screen.getByLabelText(/titre|title/i), 'Test');
      await user.type(screen.getByPlaceholderText(/contenu|content/i) || screen.getByText(/content/i), 'Content');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      await waitFor(() => {
        const [, options] = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(options.body);

        expect(body.master).toBe('Filippo Vadi');
        expect(body.work).toBe('Libro dei Duelli');
        expect(body.book).toBe('Livre 3');
      });
    });

    it('handles section data with Italian content preserved', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = userEvent.setup();
      const italianText = '{guardia} {stringere} {fendente}';

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 2');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'Title');
      await user.type(screen.getByPlaceholderText(/contenu|content/i) || screen.getByText(/content/i), italianText);

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      await waitFor(() => {
        const [, options] = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(options.body);
        expect(body.content.it).toContain(italianText);
      });
    });

    it('allows selecting different book numbers for same work', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      // First book selection
      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 1');

      const firstBookSelect = screen.getByLabelText(/livre|book/i) as HTMLSelectElement;
      expect(firstBookSelect.value).toBe('Livre 1');

      // Change to different book
      await user.selectOptions(firstBookSelect, 'Livre 4');
      expect(firstBookSelect.value).toBe('Livre 4');
    });
  });
});

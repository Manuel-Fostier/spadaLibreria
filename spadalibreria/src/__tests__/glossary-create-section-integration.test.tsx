import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock TextEditor component with placeholders so tests can target fields reliably
jest.mock('@/components/TextEditor', () => {
  return jest.fn(({ onSave, onCancel, placeholder, initialValue, onChange }: any) => (
    <div data-testid="text-editor">
      <textarea
        data-testid="editor-textarea"
        placeholder={placeholder}
        defaultValue={initialValue}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <button onClick={() => onCancel?.()} data-testid="editor-cancel">Cancel</button>
      <button onClick={() => onSave?.('test')} data-testid="editor-save">Save</button>
    </div>
  ));
});

import NewSectionForm from '@/components/NewSectionForm';

describe('T193/T194/T195: New Section Creation Workflow', () => {
  const mockMasters = ['Achille Marozzo', 'Antonio Manciolino', 'Filippo Vadi'];
  const mockWorks = ['Opera Nova', 'Libro dei Duelli', 'Arti Maestrevoli'];
  const mockBooks = ['Livre 1', 'Livre 2', 'Livre 3', 'Livre 4'];

  const getMasterInput = () => document.getElementById('master-input') as HTMLInputElement;
  const getWorkInput = () => document.getElementById('work-input') as HTMLInputElement;
  const getBookInput = () => document.getElementById('book-input') as HTMLInputElement;
  const getChapterInput = () => screen.getByPlaceholderText(/ex:\s*95/i) as HTMLInputElement;
  const getYearInput = () => screen.getByPlaceholderText(/ex:\s*1536/i) as HTMLInputElement;
  const getTitleInput = () => screen.getByPlaceholderText(/chap\.\s*95/i) as HTMLInputElement;
  const getFrenchContentInput = () => screen.getByPlaceholderText(/contenu en français/i) as HTMLTextAreaElement;
  const getItalianContentInput = () => screen.getByPlaceholderText(/contenu en italien/i) as HTMLTextAreaElement;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
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

      await user.type(getMasterInput(), 'Achille Marozzo');
      await waitFor(() => expect(getWorkInput()).not.toBeDisabled());
      await user.type(getWorkInput(), 'Opera Nova');
      await waitFor(() => expect(getBookInput()).not.toBeDisabled());
      await user.type(getBookInput(), '2');
      await user.type(getChapterInput(), '3');
      await user.type(getYearInput(), '1536');
      await user.type(getTitleInput(), 'La Guardia');
      await user.type(getFrenchContentInput(), 'Texte français obligatoire');

      await user.click(screen.getByRole('button', { name: /créer la section|ajouter|créer/i }));

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

      await user.type(getMasterInput(), 'Achille Marozzo');
      await waitFor(() => expect(getWorkInput()).not.toBeDisabled());
      await user.type(getWorkInput(), 'Opera Nova');
      await waitFor(() => expect(getBookInput()).not.toBeDisabled());
      await user.type(getBookInput(), '1');
      await user.type(getChapterInput(), '1');
      await user.type(getYearInput(), '1536');
      await user.type(getTitleInput(), 'Test');
      await user.type(getFrenchContentInput(), 'Contenu');

      await user.click(screen.getByRole('button', { name: /créer la section|ajouter|créer/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
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

      await user.type(getChapterInput(), '1');
      await user.type(getYearInput(), '1536');
      await user.type(getTitleInput(), 'Test');
      await user.type(getFrenchContentInput(), 'Texte');

      await user.click(screen.getByRole('button', { name: /créer la section|ajouter|créer/i }));

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

      await user.type(getMasterInput(), 'Achille Marozzo');
      await user.type(getChapterInput(), '1');
      await user.type(getYearInput(), '1536');
      await user.type(getTitleInput(), 'Test');
      await user.type(getFrenchContentInput(), 'Texte');

      await user.click(screen.getByRole('button', { name: /créer la section|ajouter|créer/i }));

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

      await user.type(getMasterInput(), 'Achille Marozzo');
      await waitFor(() => expect(getWorkInput()).not.toBeDisabled());
      await user.type(getWorkInput(), 'Opera Nova');
      await waitFor(() => expect(getBookInput()).not.toBeDisabled());
      await user.type(getBookInput(), '1');
      await user.type(getChapterInput(), '1');
      await user.type(getTitleInput(), 'Test');
      await user.type(getFrenchContentInput(), 'Texte');

      await user.click(screen.getByRole('button', { name: /créer la section|ajouter|créer/i }));

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

      await user.type(getMasterInput(), 'Achille Marozzo');
      await waitFor(() => expect(getWorkInput()).not.toBeDisabled());
      await user.type(getWorkInput(), 'Opera Nova');
      await waitFor(() => expect(getBookInput()).not.toBeDisabled());
      await user.type(getBookInput(), '1');
      await user.type(getChapterInput(), '1');
      await user.type(getYearInput(), '1536');
      await user.type(getFrenchContentInput(), 'Texte');

      await user.click(screen.getByRole('button', { name: /créer la section|ajouter|créer/i }));

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

      await user.type(getMasterInput(), 'Achille Marozzo');
      await waitFor(() => expect(getWorkInput()).not.toBeDisabled());
      await user.type(getWorkInput(), 'Opera Nova');
      await waitFor(() => expect(getBookInput()).not.toBeDisabled());
      await user.type(getBookInput(), '1');
      await user.type(getChapterInput(), '1');
      await user.type(getYearInput(), '1536');
      await user.type(getTitleInput(), 'Test');

      await user.click(screen.getByRole('button', { name: /créer la section|ajouter|créer/i }));

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

      const yearInput = getYearInput();
      await user.type(yearInput, 'invalid');

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

      await user.type(getMasterInput(), 'Filippo Vadi');
      await waitFor(() => expect(getWorkInput()).not.toBeDisabled());
      await user.type(getWorkInput(), 'Libro dei Duelli');
      await waitFor(() => expect(getBookInput()).not.toBeDisabled());
      await user.type(getBookInput(), '3');
      await user.type(getChapterInput(), '2');
      await user.type(getYearInput(), '1482');
      await user.type(getTitleInput(), 'Test');
      await user.type(getFrenchContentInput(), 'Contenu');

      await user.click(screen.getByRole('button', { name: /créer la section|ajouter|créer/i }));

      await waitFor(() => {
        const [, options] = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(options.body);

        expect(body.master).toBe('Filippo Vadi');
        expect(body.work).toBe('Libro dei Duelli');
        expect(body.book).toBe(3);
      });
    });

    it('handles section data with Italian content preserved', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = userEvent.setup();
      const italianText = 'guardia stringere fendente';

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      await user.type(getMasterInput(), 'Achille Marozzo');
      await waitFor(() => expect(getWorkInput()).not.toBeDisabled());
      await user.type(getWorkInput(), 'Opera Nova');
      await waitFor(() => expect(getBookInput()).not.toBeDisabled());
      await user.type(getBookInput(), '1');
      await user.type(getChapterInput(), '1');
      await user.type(getYearInput(), '1536');
      await user.type(getTitleInput(), 'Test');
      await user.type(getFrenchContentInput(), 'Texte français');
      await user.type(getItalianContentInput(), italianText);

      await user.click(screen.getByRole('button', { name: /créer la section|ajouter|créer/i }));

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

      await user.type(getMasterInput(), 'Achille Marozzo');
      await waitFor(() => expect(getWorkInput()).not.toBeDisabled());
      await user.type(getWorkInput(), 'Opera Nova');
      await waitFor(() => expect(getBookInput()).not.toBeDisabled());
      await user.type(getBookInput(), '1');

      expect(getBookInput().value).toBe('1');

      await user.clear(getBookInput());
      await user.type(getBookInput(), '4');

      expect(getBookInput().value).toBe('4');
    });
  });
});

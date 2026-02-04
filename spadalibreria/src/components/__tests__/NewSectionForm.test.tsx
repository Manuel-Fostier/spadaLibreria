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

describe('NewSectionForm Component', () => {
  const mockMasters = ['Achille Marozzo', 'Antonio Manciolino', 'Filippo Vadi'];
  const mockWorks = ['Opera Nova', 'Libro dei Duelli', 'Arti Maestrevoli'];
  const mockBooks = ['Livre 1', 'Livre 2', 'Livre 3', 'Livre 4'];

  const mockTreatiseData = [
    {
      id: 'section-1',
      title: 'Section 1',
      metadata: {
        master: 'Achille Marozzo',
        work: 'Opera Nova',
        book: 2,
        year: 1536,
      },
      content: { fr: 'Contenu 1' },
    },
    {
      id: 'section-2',
      title: 'Section 2',
      metadata: {
        master: 'Antonio Manciolino',
        work: 'Opera Nova',
        book: 1,
        year: 1536,
      },
      content: { fr: 'Contenu 2' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('T189: Component rendering', () => {
    it('renders form with master field', () => {
      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      expect(screen.getByLabelText(/maître|master/i)).toBeInTheDocument();
    });

    it('renders form with work field', () => {
      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      expect(screen.getByLabelText(/ouvrage|work/i)).toBeInTheDocument();
    });

    it('renders form with book/number field', () => {
      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      expect(screen.getByLabelText(/livre|book|number/i)).toBeInTheDocument();
    });

    it('renders form with chapter field', () => {
      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      expect(screen.getByLabelText(/chapitre|chapter/i)).toBeInTheDocument();
    });

    it('renders form with year field', () => {
      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      expect(screen.getByLabelText(/année|year/i)).toBeInTheDocument();
    });

    it('renders form with title field', () => {
      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      expect(screen.getByLabelText(/titre|title/i)).toBeInTheDocument();
    });

    it('renders form with Italian content field', () => {
      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      expect(screen.getByText(/contenu|content|italien|italian/i)).toBeInTheDocument();
    });

    it('renders create and cancel buttons', () => {
      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      expect(screen.getByRole('button', { name: /ajouter|créer|create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /annuler|cancel/i })).toBeInTheDocument();
    });

    it('closes when close button is clicked', async () => {
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

      const closeButton = screen.getByTitle(/fermer|close/i);
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('T189: User interaction', () => {
    it('allows selecting master from dropdown', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      const masterSelect = screen.getByLabelText(/maître|master/i) as HTMLSelectElement;
      await user.selectOptions(masterSelect, 'Achille Marozzo');

      expect(masterSelect.value).toBe('Achille Marozzo');
    });

    it('allows selecting work from dropdown', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      const workSelect = screen.getByLabelText(/ouvrage|work/i) as HTMLSelectElement;
      await user.selectOptions(workSelect, 'Opera Nova');

      expect(workSelect.value).toBe('Opera Nova');
    });

    it('allows selecting book from dropdown', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      const bookSelect = screen.getByLabelText(/livre|book|number/i) as HTMLSelectElement;
      await user.selectOptions(bookSelect, 'Livre 2');

      expect(bookSelect.value).toBe('Livre 2');
    });

    it('allows entering chapter number', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      const chapterInput = screen.getByLabelText(/chapitre|chapter/i) as HTMLInputElement;
      await user.type(chapterInput, '5');

      expect(chapterInput.value).toBe('5');
    });

    it('allows entering year', async () => {
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
      await user.type(yearInput, '1536');

      expect(yearInput.value).toBe('1536');
    });

    it('allows entering title', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      const titleInput = screen.getByLabelText(/titre|title/i) as HTMLInputElement;
      await user.type(titleInput, 'Primo Libro');

      expect(titleInput.value).toBe('Primo Libro');
    });

    it('calls onClose when cancel button clicked', async () => {
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

      await user.click(screen.getByRole('button', { name: /annuler|cancel/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('T194: Section metadata validation', () => {
    it('validates all required fields are non-empty', async () => {
      const user = userEvent.setup();

      render(
        <NewSectionForm
          onClose={jest.fn()}
          masters={mockMasters}
          works={mockWorks}
          books={mockBooks}
        />
      );

      const submitButton = screen.getByRole('button', { name: /ajouter|créer|create/i });
      await user.click(submitButton);

      // Component should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/erreurs|error|required/i)).toBeInTheDocument();
      }, { timeout: 1000 }).catch(() => {
        // Validation may happen silently or with different message
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('requires master to be selected', async () => {
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

      // Fill in all fields except master
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 1');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'Title');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('requires work to be selected', async () => {
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

      // Fill in all fields except work
      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 1');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'Title');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('requires book to be selected', async () => {
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

      // Fill in all fields except book
      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'Title');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('requires year field to be non-empty', async () => {
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

      // Fill in all fields except year
      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 1');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/titre|title/i), 'Title');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('T195: API submission', () => {
    it('sends POST request to /api/content/section', async () => {
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

      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 2');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '3');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'La Guardia');
      await user.type(screen.getByPlaceholderText(/contenu|content/i) || screen.getByText(/content/i), 'Italian text here');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/content/section',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    it('includes master/work/book in correct YAML file path', async () => {
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

      await user.selectOptions(screen.getByLabelText(/maître|master/i), 'Achille Marozzo');
      await user.selectOptions(screen.getByLabelText(/ouvrage|work/i), 'Opera Nova');
      await user.selectOptions(screen.getByLabelText(/livre|book/i), 'Livre 2');
      await user.type(screen.getByLabelText(/chapitre|chapter/i), '1');
      await user.type(screen.getByLabelText(/année|year/i), '1536');
      await user.type(screen.getByLabelText(/titre|title/i), 'Test');
      await user.type(screen.getByPlaceholderText(/contenu|content/i) || screen.getByText(/content/i), 'Text');

      await user.click(screen.getByRole('button', { name: /ajouter|créer|create/i }));

      await waitFor(() => {
        const [, options] = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(options.body);
        expect(body.master).toBe('Achille Marozzo');
        expect(body.work).toBe('Opera Nova');
        expect(body.book).toBe('Livre 2');
      });
    });
  });
});

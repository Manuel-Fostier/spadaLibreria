import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock TextEditor component
jest.mock('@/components/TextEditor', () => {
  const React = require('react');

  return jest.fn(({ initialValue, onSave, onCancel, placeholder }: any) => {
    const [value, setValue] = React.useState(initialValue ?? '');

    return (
      <div data-testid="text-editor">
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          data-testid="editor-textarea"
        />
        <button onClick={() => onCancel?.()} data-testid="editor-cancel">Cancel</button>
        <button onClick={() => onSave?.(value)} data-testid="editor-save">Save</button>
      </div>
    );
  });
});

import NewTermForm from '@/components/NewTermForm';

describe('NewTermForm Component', () => {
  const mockCategories = ['Coups et Techniques', 'Garde', 'Armes'];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('T173: Component rendering', () => {
    it('renders form with all required fields', () => {
      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/terme/i)).toBeInTheDocument();
      expect(screen.getByText(/définition \(français\)/i)).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      expect(screen.getByTitle('Fermer')).toBeInTheDocument();
    });

    it('renders create and cancel buttons', () => {
      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      expect(screen.getByRole('button', { name: /créer le terme/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
    });

    it('has category datalist when categories provided', () => {
      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      const datalist = document.querySelector('[id="categories"]');
      expect(datalist).toBeInTheDocument();
      expect(datalist?.querySelectorAll('option').length).toBe(3);
    });
  });

  describe('T173: User interaction and form data', () => {
    it('allows entering form data in all fields', async () => {
      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.type(screen.getByLabelText(/catégorie/i), 'Coups et Techniques');
      await user.type(screen.getByLabelText(/type/i), 'Frappe');
      await user.type(screen.getByLabelText(/terme/i), 'Punta');
      await user.click(screen.getByPlaceholderText(/cliquez pour éditer/i));
      await user.type(screen.getByPlaceholderText(/entrez la définition en français/i), 'Une frappe');
      await user.click(screen.getByTestId('editor-save'));

      expect((screen.getByLabelText(/catégorie/i) as HTMLInputElement).value).toBe('Coups et Techniques');
      expect((screen.getByLabelText(/type/i) as HTMLInputElement).value).toBe('Frappe');
      expect((screen.getByLabelText(/terme/i) as HTMLInputElement).value).toBe('Punta');
      expect((screen.getByPlaceholderText(/cliquez pour éditer/i) as HTMLTextAreaElement).value).toBe('Une frappe');
    });

    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      render(
        <NewTermForm
          onClose={mockOnClose}
          categories={mockCategories}
        />
      );

      await user.click(screen.getByTitle('Fermer'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when cancel button clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      render(
        <NewTermForm
          onClose={mockOnClose}
          categories={mockCategories}
        />
      );

      await user.click(screen.getByRole('button', { name: /annuler/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('T177: API Integration', () => {
    it('sends POST request to /api/glossary/terms on submit', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.type(screen.getByLabelText(/catégorie/i), 'Coups et Techniques');
      await user.type(screen.getByLabelText(/type/i), 'Frappe');
      await user.type(screen.getByLabelText(/terme/i), 'Punta');
      await user.click(screen.getByPlaceholderText(/cliquez pour éditer/i));
      await user.type(screen.getByPlaceholderText(/entrez la définition en français/i), 'Definition');
      await user.click(screen.getByTestId('editor-save'));

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/glossary/terms',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    it('sends correct form data in API request body', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.type(screen.getByLabelText(/catégorie/i), 'Coups et Techniques');
      await user.type(screen.getByLabelText(/type/i), 'Frappe de taille');
      await user.type(screen.getByLabelText(/terme/i), 'Mandritto');
      await user.click(screen.getByPlaceholderText(/cliquez pour éditer/i));
      await user.type(screen.getByPlaceholderText(/entrez la définition en français/i), 'A sword strike from high to low');
      await user.click(screen.getByTestId('editor-save'));

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        const [, options] = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(options.body);
        expect(body).toEqual({
          category: 'Coups et Techniques',
          type: 'Frappe de taille',
          term: 'Mandritto',
          definition: {
            fr: 'A sword strike from high to low',
          },
        });
      });
    });

    it('shows error message on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Duplicate term key' }),
      });

      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.type(screen.getByLabelText(/catégorie/i), 'Coups et Techniques');
      await user.type(screen.getByLabelText(/type/i), 'Frappe');
      await user.type(screen.getByLabelText(/terme/i), 'Mandritto');
      await user.click(screen.getByPlaceholderText(/cliquez pour éditer/i));
      await user.type(screen.getByPlaceholderText(/entrez la définition en français/i), 'Definition');
      await user.click(screen.getByTestId('editor-save'));

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        expect(screen.getByText(/duplicate term key/i)).toBeInTheDocument();
      });
    });
  });

  describe('T178: Duplicate prevention', () => {
    it('displays error when term already exists', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Term key already exists' }),
      });

      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.type(screen.getByLabelText(/catégorie/i), 'Coups et Techniques');
      await user.type(screen.getByLabelText(/type/i), 'Frappe');
      await user.type(screen.getByLabelText(/terme/i), 'Mandritto');
      await user.click(screen.getByPlaceholderText(/cliquez pour éditer/i));
      await user.type(screen.getByPlaceholderText(/entrez la définition en français/i), 'Definition');
      await user.click(screen.getByTestId('editor-save'));

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        expect(screen.getByText(/term key already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('T179: Form validation', () => {
    it('validates all required fields are non-empty', async () => {
      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        expect(screen.getByText(/la catégorie est requise/i)).toBeInTheDocument();
        expect(screen.getByText(/le type est requis/i)).toBeInTheDocument();
        expect(screen.getByText(/le terme est requis/i)).toBeInTheDocument();
        expect(screen.getByText(/la définition française est requise/i)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('shows validation error for missing category', async () => {
      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.type(screen.getByLabelText(/type/i), 'Frappe');
      await user.type(screen.getByLabelText(/terme/i), 'Punta');
      await user.type(screen.getByPlaceholderText(/cliquez pour éditer/i), 'Definition');

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        expect(screen.getByText(/la catégorie est requise/i)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('prevents API call when form is invalid', async () => {
      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.type(screen.getByLabelText(/catégorie/i), 'Coups et Techniques');
      // Missing type and term

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('displays error list container on validation failure', async () => {
      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        expect(screen.getByText(/erreurs de validation/i)).toBeInTheDocument();
      });
    });
  });
});

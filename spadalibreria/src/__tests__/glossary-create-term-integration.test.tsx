import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock TextEditor
jest.mock('@/components/TextEditor', () => {
  return jest.fn(({ onSave, onCancel }: any) => (
    <div data-testid="text-editor">
      <textarea data-testid="editor-textarea" />
      <button onClick={() => onCancel()} data-testid="editor-cancel">Cancel</button>
      <button onClick={() => onSave('test')} data-testid="editor-save">Save</button>
    </div>
  ));
});

import NewTermForm from '@/components/NewTermForm';

describe('Glossary Create Term Integration Tests', () => {
  const mockCategories = ['Coups et Techniques', 'Garde', 'Armes'];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('T177: Create new term workflow', () => {
    it('successfully creates term and reloads page', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, termKey: 'punta' }),
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
      await user.type(screen.getByPlaceholderText(/cliquez pour éditer/i), 'Une frappe');

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/glossary/terms',
          expect.any(Object)
        );
      });
    });

    it('categorizes new term correctly in database', async () => {
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
      await user.type(screen.getByPlaceholderText(/cliquez pour éditer/i), 'A high-to-low strike');

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        const [, options] = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(options.body);
        expect(body.category).toBe('Coups et Techniques');
        expect(body.type).toBe('Frappe de taille');
      });
    });
  });

  describe('T178: Duplicate prevention', () => {
    it('shows error when duplicate term key detected', async () => {
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
      await user.type(screen.getByPlaceholderText(/cliquez pour éditer/i), 'Definition');

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        expect(screen.getByText(/term key already exists/i)).toBeInTheDocument();
      });
    });

    it('prevents duplicate within same category', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Duplicate term key in category' }),
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
      await user.type(screen.getByPlaceholderText(/cliquez pour éditer/i), 'Definition');

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('T179: Form validation in context', () => {
    it('validates all fields before sending request', async () => {
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

    it('validates category field in context', async () => {
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

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates type field in context', async () => {
      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.type(screen.getByLabelText(/catégorie/i), 'Coups et Techniques');
      await user.type(screen.getByLabelText(/terme/i), 'Punta');
      await user.type(screen.getByPlaceholderText(/cliquez pour éditer/i), 'Definition');

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates term name field in context', async () => {
      const user = userEvent.setup();

      render(
        <NewTermForm
          onClose={jest.fn()}
          categories={mockCategories}
        />
      );

      await user.type(screen.getByLabelText(/catégorie/i), 'Coups et Techniques');
      await user.type(screen.getByLabelText(/type/i), 'Frappe');
      await user.type(screen.getByPlaceholderText(/cliquez pour éditer/i), 'Definition');

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('validates definition field in context', async () => {
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

      await user.click(screen.getByRole('button', { name: /créer le terme/i }));

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('displays validation errors in error container', async () => {
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

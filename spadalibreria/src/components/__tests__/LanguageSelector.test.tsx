import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LanguageSelector from '../LanguageSelector';

describe('LanguageSelector Component', () => {
  const mockOnLanguageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders radio buttons for IT, FR, EN', () => {
    render(
      <LanguageSelector
        selectedLanguage="en"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    expect(screen.getByRole('radio', { name: /Italiano|IT|Italian/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Français|FR|French/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /English|EN/i })).toBeInTheDocument();
  });

  it('marks selected language as checked', () => {
    render(
      <LanguageSelector
        selectedLanguage="en"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    const enRadio = screen.getByRole('radio', { name: /English|EN/i });
    expect(enRadio).toBeChecked();
  });

  it('calls onLanguageChange when language is selected', async () => {
    const user = userEvent.setup();
    render(
      <LanguageSelector
        selectedLanguage="en"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    const frRadio = screen.getByRole('radio', { name: /Français|FR|French/i });
    await user.click(frRadio);

    expect(mockOnLanguageChange).toHaveBeenCalledWith('fr');
  });

  it('supports keyboard navigation with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <LanguageSelector
        selectedLanguage="en"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    const enRadio = screen.getByRole('radio', { name: /English|EN/i });
    enRadio.focus();

    await user.keyboard('{ArrowLeft}');
    expect(mockOnLanguageChange).toHaveBeenCalled();
  });

  it('updates when selectedLanguage prop changes', () => {
    const { rerender } = render(
      <LanguageSelector
        selectedLanguage="en"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    let enRadio = screen.getByRole('radio', { name: /English|EN/i });
    expect(enRadio).toBeChecked();

    rerender(
      <LanguageSelector
        selectedLanguage="fr"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    const frRadio = screen.getByRole('radio', { name: /Français|FR|French/i });
    expect(frRadio).toBeChecked();
  });

  it('uses radio group semantics for accessibility', () => {
    const { container } = render(
      <LanguageSelector
        selectedLanguage="en"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    const radioGroup = container.querySelector('[role="group"]');
    expect(radioGroup).toBeInTheDocument();
  });

  it('displays visual indicator for selected language', () => {
    const { container } = render(
      <LanguageSelector
        selectedLanguage="en"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    const enRadio = screen.getByRole('radio', { name: /English|EN/i });
    expect(enRadio).toBeChecked();
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <LanguageSelector
        selectedLanguage="en"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    expect(container.firstChild).toHaveClass('language-selector');
  });

  it('allows selecting all three languages', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <LanguageSelector
        selectedLanguage="it"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    const itRadio = screen.getByRole('radio', { name: /Italiano|IT|Italian/i });
    expect(itRadio).toBeChecked();

    // Switch to FR
    const frRadio = screen.getByRole('radio', { name: /Français|FR|French/i });
    await user.click(frRadio);
    expect(mockOnLanguageChange).toHaveBeenCalledWith('fr');

    // Switch to EN
    const enRadio = screen.getByRole('radio', { name: /English|EN/i });
    await user.click(enRadio);
    expect(mockOnLanguageChange).toHaveBeenCalledWith('en');
  });

  it('does not allow multiple selections (single-select radio behavior)', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <LanguageSelector
        selectedLanguage="en"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    const enRadio = screen.getByRole('radio', { name: /English|EN/i }) as HTMLInputElement;
    const frRadio = screen.getByRole('radio', { name: /Français|FR|French/i }) as HTMLInputElement;

    // EN should be initially checked
    expect(enRadio.checked).toBe(true);

    // Click FR
    await user.click(frRadio);
    expect(mockOnLanguageChange).toHaveBeenCalledWith('fr');

    // Simulate the parent component updating the selectedLanguage prop
    rerender(
      <LanguageSelector
        selectedLanguage="fr"
        onLanguageChange={mockOnLanguageChange}
      />
    );

    // Now FR should be checked and EN should not be
    const frRadioAfter = screen.getByRole('radio', { name: /Français|FR|French/i }) as HTMLInputElement;
    const enRadioAfter = screen.getByRole('radio', { name: /English|EN/i }) as HTMLInputElement;
    expect(frRadioAfter.checked).toBe(true);
    expect(enRadioAfter.checked).toBe(false);
  });
});

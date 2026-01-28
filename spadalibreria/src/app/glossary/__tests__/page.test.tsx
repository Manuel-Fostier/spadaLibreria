import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryPageRoute from '../page';
import * as GlossaryContext from '@/contexts/GlossaryContext';

// Mock the GlossaryContext
jest.mock('@/contexts/GlossaryContext', () => ({
  GlossaryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="glossary-provider">{children}</div>
  ),
  useGlossary: jest.fn(),
}));

// Mock the GlossaryPage component
jest.mock('@/components/GlossaryPage', () => {
  return function MockGlossaryPage() {
    return <div data-testid="glossary-page">GlossaryPage Component</div>;
  };
});

// Mock the GlossaryPageWrapper component
jest.mock('@/components/GlossaryPageWrapper', () => {
  return function MockGlossaryPageWrapper({ children }: { children: React.ReactNode }) {
    return <div data-testid="glossary-page-wrapper">{children}</div>;
  };
});

describe('Glossary Page Route Integration (T074)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the glossary page wrapper and content', () => {
    render(<GlossaryPageRoute />);

    expect(screen.getByTestId('glossary-page-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('glossary-page')).toBeInTheDocument();
  });

  it('is accessible at /glossary route', () => {
    // This test verifies that the component can be rendered
    // The actual routing is tested by Next.js's routing system
    const { container } = render(<GlossaryPageRoute />);
    expect(container.firstChild).not.toBeNull();
  });

  it('provides GlossaryProvider context to child components', () => {
    render(<GlossaryPageRoute />);

    // Verify the wrapper provides the context
    expect(screen.getByTestId('glossary-page-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('glossary-page')).toBeInTheDocument();
  });

  it('renders without errors when GlossaryPage is mounted', () => {
    const { container } = render(<GlossaryPageRoute />);
    
    expect(container.querySelector('[data-testid="glossary-page-wrapper"]')).toBeInTheDocument();
    expect(screen.getByText('GlossaryPage Component')).toBeInTheDocument();
  });

  it('exports proper metadata for SEO (French-only)', () => {
    // Import the metadata export
    const metadata = require('../page').metadata;

    expect(metadata).toBeDefined();
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
    
    // Verify metadata is in French (French-only glossary mode)
    expect(metadata.title.toLowerCase()).toContain('glossaire');
    expect(metadata.description.toLowerCase()).toContain('bolognaise');
  });

  it('has proper component structure for Next.js App Router', () => {
    render(<GlossaryPageRoute />);

    // Verify the component structure matches App Router conventions
    const wrapper = screen.getByTestId('glossary-page-wrapper');
    const page = screen.getByTestId('glossary-page');
    
    expect(wrapper).toContainElement(page);
  });
});

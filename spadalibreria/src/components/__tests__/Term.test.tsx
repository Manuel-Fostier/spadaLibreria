import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AnnotationDisplayContext } from '@/contexts/AnnotationDisplayContext';
import type { AnnotationDisplay } from '@/types/annotationDisplay';
import Term from '../Term';

const createDisplayConfig = (colors: Record<string, string>): AnnotationDisplay => ({
  weapons: true,
  weapon_type: true,
  guards: true,
  techniques: true,
  measures: false,
  strategy: false,
  strikes: false,
  targets: false,
  colors: colors as AnnotationDisplay['colors'],
});

const defaultColors = {
  guards: '#ff0000',
  techniques: '#00ff00',
};

let mockDisplayConfig: AnnotationDisplay = createDisplayConfig(defaultColors);

jest.mock('@/contexts/AnnotationDisplayContext', () => {
  const actual = jest.requireActual('@/contexts/AnnotationDisplayContext');
  return {
    ...actual,
    useAnnotationDisplay: () => ({
      getAnnotation: (type: string) => ({
        getTextStyle: () => ({
          color:
            mockDisplayConfig.colors?.[type as keyof AnnotationDisplay['colors']] || '#6366f1',
        }),
      }),
    }),
  };
});

describe('Term component', () => {
  beforeEach(() => {
    mockDisplayConfig = createDisplayConfig(defaultColors);
  });

  it('renders with correct color from display settings', () => {
    const glossaryData = {
      test: {
        term: 'TestTerm',
        type: 'Guards',
        definition: { fr: 'Définition', en: 'Definition' },
        translation: { fr: 'Terme', en: 'Term' },
      },
    };

    const providerValue: React.ContextType<typeof AnnotationDisplayContext> = {
      displayConfig: mockDisplayConfig,
      updateDisplayConfig: jest.fn(),
      resetDisplayConfig: jest.fn(),
      isHydrated: true,
      getAnnotation: jest.fn(),
    };

    render(
      <AnnotationDisplayContext.Provider value={providerValue}>
        <Term termKey="test" glossaryData={glossaryData}>
          TestTerm
        </Term>
      </AnnotationDisplayContext.Provider>
    );

    expect(screen.getByText('TestTerm')).toHaveStyle({ color: '#ff0000' });
  });

  it('updates color when display settings change', async () => {
    const glossaryData = {
      test: {
        term: 'TestTerm',
        type: 'Techniques',
        definition: { fr: 'Définition', en: 'Definition' },
        translation: { fr: 'Terme', en: 'Term' },
      },
    };

    const providerValue = (): React.ContextType<typeof AnnotationDisplayContext> => ({
      displayConfig: mockDisplayConfig,
      updateDisplayConfig: jest.fn(),
      resetDisplayConfig: jest.fn(),
      isHydrated: true,
      getAnnotation: jest.fn(),
    });

    const { rerender } = render(
      <AnnotationDisplayContext.Provider value={providerValue()}>
        <Term termKey="test" glossaryData={glossaryData}>
          TestTerm
        </Term>
      </AnnotationDisplayContext.Provider>
    );

    expect(screen.getByText('TestTerm')).toHaveStyle({ color: '#00ff00' });

    mockDisplayConfig = createDisplayConfig({ ...defaultColors, techniques: '#0000ff' });

    rerender(
      <AnnotationDisplayContext.Provider value={providerValue()}>
        <Term termKey="test" glossaryData={glossaryData}>
          TestTerm
        </Term>
      </AnnotationDisplayContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('TestTerm')).toHaveStyle({ color: '#0000ff' });
    });
  });
});

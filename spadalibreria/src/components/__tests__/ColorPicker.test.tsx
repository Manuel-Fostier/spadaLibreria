import React, { useCallback, useMemo, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPicker from '../ColorPicker';
import { AnnotationDisplayContext } from '@/contexts/AnnotationDisplayContext';
import type { AnnotationDisplay } from '@/types/annotationDisplay';
import { Annotation } from '@/lib/annotation/Annotation';
import type { AnnotationKey } from '@/lib/annotation/AnnotationRegistry';

class TestAnnotation extends Annotation {
  constructor(initialColor: string) {
    super(
      {
        color: initialColor,
        backgroundColor: initialColor,
        borderColor: initialColor,
        borderBottomColor: initialColor,
      },
      { color: initialColor },
      'Test annotation',
      true
    );
  }
}

const createDisplayConfig = (key: AnnotationKey, color: string): AnnotationDisplay => {
  const baseColors = {
    weapons: '#111111',
    weapon_type: '#222222',
    guards: '#333333',
    techniques: '#444444',
    measures: '#555555',
    strategy: '#666666',
    strikes: '#777777',
    targets: '#888888',
  } as AnnotationDisplay['colors'];

  return {
    weapons: true,
    weapon_type: true,
    guards: true,
    techniques: true,
    measures: true,
    strategy: true,
    strikes: true,
    targets: true,
    colors: {
      ...baseColors,
      [key]: color,
    },
  };
};

function ContextWrapper({
  annotationKey,
  initialColor,
  children,
}: {
  annotationKey: AnnotationKey;
  initialColor: string;
  children: (annotation: Annotation, setDisplayConfig: React.Dispatch<React.SetStateAction<AnnotationDisplay>>) => React.ReactNode;
}) {
  const annotationInstance = useMemo(() => new TestAnnotation(initialColor), [initialColor]);
  const [displayConfig, setDisplayConfig] = useState<AnnotationDisplay>(createDisplayConfig(annotationKey, initialColor));

  const updateDisplayConfig = useCallback((updates: Partial<AnnotationDisplay>) => {
    setDisplayConfig(prev => ({
      ...prev,
      ...updates,
      colors: updates.colors ? { ...prev.colors, ...updates.colors } : prev.colors,
    }));
  }, []);

  const providerValue = useMemo(
    () => ({
      displayConfig,
      updateDisplayConfig,
      resetDisplayConfig: jest.fn(),
      isHydrated: true,
      getAnnotation: jest.fn(),
    }),
    [displayConfig, updateDisplayConfig]
  );

  return (
    <AnnotationDisplayContext.Provider value={providerValue}>
      {children(annotationInstance, setDisplayConfig)}
    </AnnotationDisplayContext.Provider>
  );
}

describe('ColorPicker', () => {
  it('updates preview color immediately when selecting a preset color', async () => {
    const user = userEvent.setup();

    render(
      <ContextWrapper annotationKey="guards" initialColor="#ff0000">
        {(annotation) => (
          <ColorPicker annotation={annotation} annotationKey="guards" label="" />
        )}
      </ContextWrapper>
    );

    const previewButton = screen.getByRole('button', { name: 'Choisir une couleur' });
    expect(previewButton).toHaveStyle({ backgroundColor: '#ff0000' });

    await user.click(previewButton);
    await user.click(screen.getByRole('button', { name: 'Emerald' }));

    expect(previewButton).toHaveStyle({ backgroundColor: '#059669' });
  });

  it('reflects external display configuration color changes', async () => {
    const user = userEvent.setup();

    render(
      <ContextWrapper annotationKey="guards" initialColor="#ff0000">
        {(annotation, setDisplayConfig) => (
          <>
            <ColorPicker annotation={annotation} annotationKey="guards" label="" />
            <button
              onClick={() => {
                const nextColor = '#123456';
                annotation.setStyle(nextColor);
                setDisplayConfig(prev => ({
                  ...prev,
                  colors: { ...prev.colors, guards: nextColor },
                }));
              }}
            >
              Forcer la mise à jour
            </button>
          </>
        )}
      </ContextWrapper>
    );

    const previewButton = screen.getByRole('button', { name: 'Choisir une couleur' });
    expect(previewButton).toHaveStyle({ backgroundColor: '#ff0000' });

    await user.click(screen.getByRole('button', { name: 'Forcer la mise à jour' }));

    await waitFor(() => {
      expect(previewButton).toHaveStyle({ backgroundColor: '#123456' });
    });
  });
});

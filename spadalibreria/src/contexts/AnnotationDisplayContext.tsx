'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { AnnotationDisplay, AnnotationColors } from '@/types/annotationDisplay';
import { AnnotationRegistry, type AnnotationKey } from '../lib/annotationClasses/AnnotationRegistry';
import { LocalStorage } from '@/lib/localStorage';

const STORAGE_KEY = 'annotationDisplay';

const getDefaultColors = (): AnnotationColors => {
  return AnnotationRegistry.getColors() as AnnotationColors;
};

const createDefaultDisplayConfig = (): AnnotationDisplay => {
  return {
    weapons: true,
    weapon_type: true,
    guards: false,
    techniques: false,
    measures: false,
    strategy: false,
    strikes: false,
    targets: false,
    colors: getDefaultColors(),
  };
};

interface AnnotationDisplayContextValue {
  displayConfig: AnnotationDisplay;
  updateDisplayConfig: (updates: Partial<AnnotationDisplay>) => void;
  resetDisplayConfig: () => void;
  isHydrated: boolean;
  getAnnotation: (key: AnnotationKey) => ReturnType<typeof AnnotationRegistry.getAnnotation>;
}

export const AnnotationDisplayContext = createContext<AnnotationDisplayContextValue | undefined>(undefined);

const syncConfigToAnnotations = (config: AnnotationDisplay) => {
  const keys: AnnotationKey[] = [
    'weapons',
    'weapon_type',
    'guards',
    'techniques',
    'measures',
    'strategy',
    'strikes',
    'targets',
  ];

  keys.forEach(key => {
    AnnotationRegistry.updateAnnotationVisibility(key, config[key as keyof AnnotationDisplay] as boolean);
    
    if (config.colors && config.colors[key as keyof AnnotationColors]) {
      const colorValue = config.colors[key as keyof AnnotationColors];
      AnnotationRegistry.updateAnnotationColor(key, colorValue);
    }
  });
};

export function AnnotationDisplayProvider({ children }: { children: ReactNode }) {
  const [displayConfig, setDisplayConfig] = useState<AnnotationDisplay>(() => {
    const defaults = createDefaultDisplayConfig();
    if (typeof window === 'undefined') return defaults;

    const stored = LocalStorage.getItem<AnnotationDisplay>(STORAGE_KEY);
    return stored ?? defaults;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    LocalStorage.setItem(STORAGE_KEY, displayConfig);
    syncConfigToAnnotations(displayConfig);
  }, [displayConfig]);

  const updateDisplayConfig = useCallback((updates: Partial<AnnotationDisplay>) => {
    setDisplayConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetDisplayConfig = useCallback(() => {
    const freshDefaults = createDefaultDisplayConfig();
    setDisplayConfig(freshDefaults);
  }, []);

  const getAnnotation = useCallback((key: AnnotationKey) => {
    return AnnotationRegistry.getAnnotation(key);
  }, []);

  const isHydrated = typeof window !== 'undefined';

  return (
    <AnnotationDisplayContext.Provider
      value={{
        displayConfig,
        updateDisplayConfig,
        resetDisplayConfig,
        isHydrated,
        getAnnotation,
      }}
    >
      {children}
    </AnnotationDisplayContext.Provider>
  );
}

export function useAnnotationDisplay() {
  const context = useContext(AnnotationDisplayContext);
  if (!context) {
    throw new Error('useAnnotationDisplay must be used within AnnotationDisplayProvider');
  }
  return context;
}

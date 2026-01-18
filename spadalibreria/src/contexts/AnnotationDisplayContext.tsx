'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { AnnotationDisplay, AnnotationColors } from '@/types/annotationDisplay';
import { AnnotationRegistry, type AnnotationKey } from '../lib/annotation/AnnotationRegistry';

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
  const defaultConfig = createDefaultDisplayConfig();
  const [displayConfig, setDisplayConfig] = useState<AnnotationDisplay>(defaultConfig);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const config: AnnotationDisplay = JSON.parse(stored);
        setDisplayConfig(config);
        syncConfigToAnnotations(config);
      } catch (error) {
        console.error('Failed to parse annotation display config from localStorage', error);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(displayConfig));
    syncConfigToAnnotations(displayConfig);
  }, [displayConfig, isHydrated]);

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

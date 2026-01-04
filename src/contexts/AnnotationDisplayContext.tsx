'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { AnnotationDisplay, AnnotationColors } from '@/types/annotationDisplay';
import { AnnotationRegistry, type AnnotationKey } from '../lib/annotation/AnnotationRegistry';

const STORAGE_KEY = 'annotationDisplay';
const STORAGE_VERSION = '1.0';

// Create default colors from annotation instances (called at runtime to get current state)
const getDefaultColors = (): AnnotationColors => {
  return AnnotationRegistry.getColors() as AnnotationColors;
};

const createDefaultDisplayConfig = (): AnnotationDisplay => {
  return {
    note: false,
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

const AnnotationDisplayContext = createContext<AnnotationDisplayContextValue | undefined>(undefined);

type StoragePayload = {
  version: string;
  config: AnnotationDisplay;
  savedAt: string;
};

const sanitizeConfig = (config?: Partial<AnnotationDisplay>): AnnotationDisplay => {
  const defaultConfig = createDefaultDisplayConfig();
  return {
    note: Boolean(config?.note ?? defaultConfig.note),
    weapons: Boolean(config?.weapons ?? defaultConfig.weapons),
    weapon_type: Boolean(config?.weapon_type ?? defaultConfig.weapon_type),
    guards: Boolean(config?.guards ?? defaultConfig.guards),
    techniques: Boolean(config?.techniques ?? defaultConfig.techniques),
    measures: Boolean(config?.measures ?? defaultConfig.measures),
    strategy: Boolean(config?.strategy ?? defaultConfig.strategy),
    strikes: Boolean(config?.strikes ?? defaultConfig.strikes),
    targets: Boolean(config?.targets ?? defaultConfig.targets),
    colors: {
      note: config?.colors?.note ?? defaultConfig.colors.note,
      weapons: config?.colors?.weapons ?? defaultConfig.colors.weapons,
      weapon_type: config?.colors?.weapon_type ?? defaultConfig.colors.weapon_type,
      guards: config?.colors?.guards ?? defaultConfig.colors.guards,
      techniques: config?.colors?.techniques ?? defaultConfig.colors.techniques,
      measures: config?.colors?.measures ?? defaultConfig.colors.measures,
      strategy: config?.colors?.strategy ?? defaultConfig.colors.strategy,
      strikes: config?.colors?.strikes ?? defaultConfig.colors.strikes,
      targets: config?.colors?.targets ?? defaultConfig.colors.targets,
    },
  };
};

/**
 * Synchronizes AnnotationDisplay config with annotation class instances
 * Updates annotation visibility and colors when config changes
 */
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
    'note',
  ];

  keys.forEach(key => {
    // Update visibility
    AnnotationRegistry.updateAnnotationVisibility(key, config[key as keyof AnnotationDisplay] as boolean);
    
    // Update color
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
        const parsed = JSON.parse(stored);
        const parsedConfig = (parsed && 'config' in parsed) ? parsed.config : parsed;
        const sanitized = sanitizeConfig(parsedConfig);
        setDisplayConfig(sanitized);
        // Sync to annotations
        syncConfigToAnnotations(sanitized);
      } catch (error) {
        console.error('Failed to parse annotation display config from localStorage', error);
        const fallback = createDefaultDisplayConfig();
        setDisplayConfig(fallback);
        syncConfigToAnnotations(fallback);
      }
    } else {
      const fallback = createDefaultDisplayConfig();
      syncConfigToAnnotations(fallback);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;


    // Persist to localStorage
    const payload: StoragePayload = {
      version: STORAGE_VERSION,
      config: displayConfig,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    // Sync to annotations
    syncConfigToAnnotations(displayConfig);
  }, [displayConfig, isHydrated]);

  const updateDisplayConfig = useCallback((updates: Partial<AnnotationDisplay>) => {
    setDisplayConfig(prev => {
      const next = sanitizeConfig({ ...prev, ...updates });
      return next;
    });
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

'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { AnnotationDisplay } from '@/types/annotationDisplay';

const STORAGE_KEY = 'annotationDisplay';
const STORAGE_VERSION = '1.0';

const DEFAULT_DISPLAY_CONFIG: AnnotationDisplay = {
  note: false,
  weapons: true,
  weapon_type: true,
  guards: false,
  techniques: false,
  measures: false,
  strategy: false,
};

interface AnnotationDisplayContextValue {
  displayConfig: AnnotationDisplay;
  updateDisplayConfig: (updates: Partial<AnnotationDisplay>) => void;
  resetDisplayConfig: () => void;
  isHydrated: boolean;
}

const AnnotationDisplayContext = createContext<AnnotationDisplayContextValue | undefined>(undefined);

type StoragePayload = {
  version: string;
  config: AnnotationDisplay;
  savedAt: string;
};

const sanitizeConfig = (config?: Partial<AnnotationDisplay>): AnnotationDisplay => {
  return {
    note: Boolean(config?.note ?? DEFAULT_DISPLAY_CONFIG.note),
    weapons: Boolean(config?.weapons ?? DEFAULT_DISPLAY_CONFIG.weapons),
    weapon_type: Boolean(config?.weapon_type ?? DEFAULT_DISPLAY_CONFIG.weapon_type),
    guards: Boolean(config?.guards ?? DEFAULT_DISPLAY_CONFIG.guards),
    techniques: Boolean(config?.techniques ?? DEFAULT_DISPLAY_CONFIG.techniques),
    measures: Boolean(config?.measures ?? DEFAULT_DISPLAY_CONFIG.measures),
    strategy: Boolean(config?.strategy ?? DEFAULT_DISPLAY_CONFIG.strategy),
  };
};

export function AnnotationDisplayProvider({ children }: { children: ReactNode }) {
  const [displayConfig, setDisplayConfig] = useState<AnnotationDisplay>(DEFAULT_DISPLAY_CONFIG);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const parsedConfig = (parsed && 'config' in parsed) ? parsed.config : parsed;
        setDisplayConfig(sanitizeConfig(parsedConfig));
      } catch (error) {
        console.error('Failed to parse annotation display config from localStorage', error);
        setDisplayConfig(DEFAULT_DISPLAY_CONFIG);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    const payload: StoragePayload = {
      version: STORAGE_VERSION,
      config: displayConfig,
      savedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [displayConfig, isHydrated]);

  const updateDisplayConfig = useCallback((updates: Partial<AnnotationDisplay>) => {
    setDisplayConfig(prev => sanitizeConfig({ ...prev, ...updates }));
  }, []);

  const resetDisplayConfig = useCallback(() => {
    setDisplayConfig(DEFAULT_DISPLAY_CONFIG);
  }, []);

  return (
    <AnnotationDisplayContext.Provider
      value={{
        displayConfig,
        updateDisplayConfig,
        resetDisplayConfig,
        isHydrated,
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

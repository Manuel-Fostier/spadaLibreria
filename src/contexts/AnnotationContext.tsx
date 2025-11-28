'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Annotation, MEASURES, STRATEGIES, WEAPONS, GUARDS, Measure, Strategy, Weapon, Guard } from '@/lib/annotation';

interface AnnotationContextType {
  annotations: Map<string, Annotation>;
  setAnnotation: (sectionId: string, annotation: Omit<Annotation, 'id'>) => Promise<void>;
  updateAnnotation: (sectionId: string, updates: Partial<Annotation>) => Promise<void>;
  getAnnotation: (sectionId: string) => Annotation | undefined;
  saveToServer: () => Promise<void>;
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

export function AnnotationProvider({ children, initialAnnotations }: { children: ReactNode, initialAnnotations: Map<string, Annotation> }) {
  const normalizeAnnotation = (ann: Annotation): Annotation => {
    const validMeasure = ann.measure === null || MEASURES.includes(ann.measure as Measure)
      ? ann.measure
      : null;
    const validStrategies = Array.isArray(ann.strategy)
      ? Array.from(new Set(
          ann.strategy.filter((s): s is Strategy => STRATEGIES.includes(s as Strategy))
        ))
      : [];
    const validWeapons = Array.isArray(ann.weapons)
      ? Array.from(new Set(
          ann.weapons.filter((w): w is Weapon => WEAPONS.includes(w as Weapon))
        ))
      : [];
    const validGuards = Array.isArray(ann.guards_mentioned)
      ? Array.from(new Set(
          ann.guards_mentioned.filter((g): g is Guard => GUARDS.includes(g as Guard))
        ))
      : [];
    const validTechniques = Array.isArray(ann.techniques)
      ? Array.from(new Set(ann.techniques.filter((t): t is string => typeof t === 'string')))
      : [];
    return { 
      ...ann, 
      measure: validMeasure, 
      strategy: validStrategies,
      weapons: validWeapons,
      guards_mentioned: validGuards,
      techniques: validTechniques
    };
  };

  const normalizeMap = (map: Map<string, Annotation>): Map<string, Annotation> => {
    const newMap = new Map<string, Annotation>();
    map.forEach((ann, key) => {
      const normalized = normalizeAnnotation({
        // provide defaults for legacy annotations
        ...ann,
        measure: ann.measure ?? null,
        strategy: ann.strategy ?? [],
        weapons: ann.weapons ?? [],
        guards_mentioned: ann.guards_mentioned ?? [],
        techniques: ann.techniques ?? [],
      } as Annotation);
      newMap.set(key, normalized);
    });
    return newMap;
  };

  const [annotations, setAnnotations] = useState<Map<string, Annotation>>(normalizeMap(initialAnnotations));

  // Charger depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem('treatise_annotations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const map = new Map<string, Annotation>(Object.entries(parsed));
        setAnnotations(normalizeMap(map));
      } catch (e) {
        console.error('Failed to load annotations from localStorage:', e);
      }
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    const obj = Object.fromEntries(annotations);
    localStorage.setItem('treatise_annotations', JSON.stringify(obj));
  }, [annotations]);

  const setAnnotation = async (sectionId: string, annotation: Omit<Annotation, 'id'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      // validate measure against allowed values and provide default
      measure: annotation.measure && MEASURES.includes(annotation.measure as Measure) ? annotation.measure : null,
      // normalize strategy to allowed set and unique
      strategy: Array.isArray(annotation.strategy) ? Array.from(new Set(
        annotation.strategy.filter((s): s is Strategy => STRATEGIES.includes(s as Strategy))
      )) : [],
      // normalize weapons
      weapons: Array.isArray(annotation.weapons) ? Array.from(new Set(
        annotation.weapons.filter((w): w is Weapon => WEAPONS.includes(w as Weapon))
      )) : [],
      // normalize guards
      guards_mentioned: Array.isArray(annotation.guards_mentioned) ? Array.from(new Set(
        annotation.guards_mentioned.filter((g): g is Guard => GUARDS.includes(g as Guard))
      )) : [],
      // normalize techniques
      techniques: Array.isArray(annotation.techniques) ? Array.from(new Set(
        annotation.techniques.filter((t): t is string => typeof t === 'string')
      )) : [],
      id: `anno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setAnnotations(prev => {
      const newMap = new Map(prev);
      newMap.set(sectionId, newAnnotation);
      return newMap;
    });
  };

  const updateAnnotation = async (sectionId: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(sectionId);
      if (!existing) return prev;
      
      const merged = { ...existing, ...updates } as Annotation;
      // normalize new fields
      const measure = merged.measure && MEASURES.includes(merged.measure as Measure) ? merged.measure : null;
      const strategy = Array.isArray(merged.strategy) ? Array.from(new Set(
        merged.strategy.filter((s): s is Strategy => STRATEGIES.includes(s as Strategy))
      )) : [];
      const weapons = Array.isArray(merged.weapons) ? Array.from(new Set(
        merged.weapons.filter((w): w is Weapon => WEAPONS.includes(w as Weapon))
      )) : [];
      const guards_mentioned = Array.isArray(merged.guards_mentioned) ? Array.from(new Set(
        merged.guards_mentioned.filter((g): g is Guard => GUARDS.includes(g as Guard))
      )) : [];
      const techniques = Array.isArray(merged.techniques) ? Array.from(new Set(
        merged.techniques.filter((t): t is string => typeof t === 'string')
      )) : [];
      
      newMap.set(sectionId, { ...merged, measure, strategy, weapons, guards_mentioned, techniques });
      return newMap;
    });
  };

  const getAnnotation = (sectionId: string): Annotation | undefined => {
    return annotations.get(sectionId);
  };

  const saveToServer = async () => {
    try {
      const obj = Object.fromEntries(annotations);
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj),
      });
      if (!response.ok) {
        throw new Error('Failed to save annotations to server');
      }
    } catch (error) {
      console.error('Error saving to server:', error);
      throw error;
    }
  };

  return (
    <AnnotationContext.Provider value={{
      annotations,
      setAnnotation,
      updateAnnotation,
      getAnnotation,
      saveToServer,
    }}>
      {children}
    </AnnotationContext.Provider>
  );
}

export function useAnnotations() {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotations must be used within AnnotationProvider');
  }
  return context;
}

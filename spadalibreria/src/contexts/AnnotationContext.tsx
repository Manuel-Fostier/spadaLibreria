'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Annotation, 
  MEASURES, 
  STRATEGIES, 
  WEAPONS, 
  WEAPON_TYPES, 
  Measure, 
  Strategy, 
  Weapon, 
  WeaponType
} from '@/lib/annotationTypes';

interface AnnotationContextType {
  annotations: Map<string, Annotation>;
  setAnnotation: (sectionId: string, annotation: Omit<Annotation, 'id'>) => Promise<void>;
  updateAnnotation: (sectionId: string, updates: Partial<Annotation>) => Promise<void>;
  getAnnotation: (sectionId: string) => Annotation | undefined;
  getUniqueValues: (field: keyof Annotation) => string[];
  getMatchingSectionIds: (filters: {
    weapons?: string | string[];
    guards?: string | string[];
    techniques?: string | string[];
    weapon_type?: string | string[];
    strikes?: string | string[];
    targets?: string | string[];
  }) => Set<string>;
  saveToServer: (options?: { force?: boolean }) => Promise<void>;
  isDirty: boolean;
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

export function AnnotationProvider({ children, initialAnnotations }: { children: ReactNode, initialAnnotations: Map<string, Annotation> }) {
  const normalizeAnnotation = (ann: Annotation): Annotation => {
    // Validate measures
    const validMeasures = Array.isArray(ann.measures)
      ? Array.from(new Set(
          ann.measures.filter((m): m is Measure => MEASURES.includes(m as Measure))
        ))
      : [];
    
    // Validate strategies
    const validStrategies = Array.isArray(ann.strategy)
      ? Array.from(new Set(
          ann.strategy.filter((s): s is Strategy => STRATEGIES.includes(s as Strategy))
        ))
      : [];
    
    // Validate weapons
    const validWeapons = Array.isArray(ann.weapons)
      ? Array.from(new Set(
          ann.weapons.filter((w): w is Weapon => WEAPONS.includes(w as Weapon))
        ))
      : [];
    
    // Validate weapon_type
    const validWeaponTypes = ann.weapon_type && WEAPON_TYPES.includes(ann.weapon_type as WeaponType)
      ? ann.weapon_type as WeaponType
      : null;
    
    return { 
      ...ann, 
      measures: validMeasures,
      strategy: validStrategies,
      weapons: validWeapons,
      weapon_type: validWeaponTypes,
      guards_mentioned: ann.guards_mentioned || null,
      techniques: ann.techniques || null,
      strikes: ann.strikes || null,
      targets: ann.targets || null
    };
  };

  const normalizeMap = (map: Map<string, Annotation>): Map<string, Annotation> => {
    const newMap = new Map<string, Annotation>();
    map.forEach((ann, key) => {
      newMap.set(key, normalizeAnnotation(ann));
    });
    return newMap;
  };

  const [annotations, setAnnotations] = useState<Map<string, Annotation>>(normalizeMap(initialAnnotations));
  const [isDirty, setIsDirty] = useState(false);

  // Merge localStorage with initialAnnotations (YAML takes precedence for existing sections)
  useEffect(() => {
    const stored = localStorage.getItem('treatise_annotations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const localMap = new Map<string, Annotation>(Object.entries(parsed));
        
        // Merge: start with localStorage, then override with YAML annotations
        const merged = new Map<string, Annotation>(localMap);
        initialAnnotations.forEach((ann, key) => {
          merged.set(key, ann);
        });
        
        setAnnotations(normalizeMap(merged));
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
      // validate measures against allowed values
      measures: Array.isArray(annotation.measures) ? Array.from(new Set(
        annotation.measures.filter((m): m is Measure => MEASURES.includes(m as Measure))
      )) : [],
      // normalize strategy to allowed set and unique
      strategy: Array.isArray(annotation.strategy) ? Array.from(new Set(
        annotation.strategy.filter((s): s is Strategy => STRATEGIES.includes(s as Strategy))
      )) : [],
      // normalize weapons
      weapons: Array.isArray(annotation.weapons) ? Array.from(new Set(
        annotation.weapons.filter((w): w is Weapon => WEAPONS.includes(w as Weapon))
      )) : [],
      // normalize weapon_type
      weapon_type: annotation.weapon_type && WEAPON_TYPES.includes(annotation.weapon_type as WeaponType)
        ? annotation.weapon_type as WeaponType
        : null,
      // guards_mentioned, techniques, strikes, targets are now Record<string, number>
      guards_mentioned: annotation.guards_mentioned || null,
      techniques: annotation.techniques || null,
      strikes: annotation.strikes || null,
      targets: annotation.targets || null,
      id: `anno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setAnnotations(prev => {
      const newMap = new Map(prev);
      newMap.set(sectionId, newAnnotation);
      return newMap;
    });
    setIsDirty(true);
  };

  const updateAnnotation = async (sectionId: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(sectionId);
      if (!existing) return prev;
      
      const merged = { ...existing, ...updates } as Annotation;
      // normalize new fields
      const measures = Array.isArray(merged.measures) ? Array.from(new Set(
        merged.measures.filter((m): m is Measure => MEASURES.includes(m as Measure))
      )) : [];
      const strategy = Array.isArray(merged.strategy) ? Array.from(new Set(
        merged.strategy.filter((s): s is Strategy => STRATEGIES.includes(s as Strategy))
      )) : [];
      const weapons = Array.isArray(merged.weapons) ? Array.from(new Set(
        merged.weapons.filter((w): w is Weapon => WEAPONS.includes(w as Weapon))
      )) : [];
      const weapon_type = merged.weapon_type && WEAPON_TYPES.includes(merged.weapon_type as WeaponType)
        ? merged.weapon_type as WeaponType
        : null;
      // guards_mentioned, techniques, strikes, targets are now Record<string, number>
      const guards_mentioned = merged.guards_mentioned || null;
      const techniques = merged.techniques || null;
      const strikes = merged.strikes || null;
      const targets = merged.targets || null;
      
      newMap.set(sectionId, { 
        ...merged, 
        measures, 
        strategy, 
        weapons, 
        weapon_type, 
        guards_mentioned, 
        techniques,
        strikes,
        targets
      });
      return newMap;
    });
    setIsDirty(true);
  };

  const getAnnotation = (sectionId: string): Annotation | undefined => {
    return annotations.get(sectionId);
  };

  const getUniqueValues = (field: keyof Annotation): string[] => {
    const values = new Set<string>();
    annotations.forEach((ann) => {
      const val = ann[field];
      if (Array.isArray(val)) {
        val.forEach((v) => {
          if (typeof v === 'string') values.add(v);
        });
      } else if (typeof val === 'string') {
        values.add(val);
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        // Handle Record<string, number> for guards_mentioned, techniques, strikes, targets
        Object.keys(val).forEach((key) => values.add(key));
      }
    });
    return Array.from(values).sort();
  };

  const getMatchingSectionIds = (filters: {
    weapons?: string | string[];
    guards?: string | string[];
    techniques?: string | string[];
    weapon_type?: string | string[];
    strikes?: string | string[];
    targets?: string | string[];
  }): Set<string> => {
    const matchingIds = new Set<string>();
    
    annotations.forEach((ann, id) => {
      let matches = true;

      if (filters.weapons) {
        const vals = Array.isArray(filters.weapons) ? filters.weapons : [filters.weapons];
        if (vals.length > 0 && (!ann.weapons || !vals.some(v => ann.weapons!.includes(v as Weapon)))) {
          matches = false;
        }
      }
      if (filters.guards) {
        const vals = Array.isArray(filters.guards) ? filters.guards : [filters.guards];
        if (vals.length > 0 && (!ann.guards_mentioned || !vals.some(v => v in ann.guards_mentioned!))) {
          matches = false;
        }
      }
      if (filters.techniques) {
        const vals = Array.isArray(filters.techniques) ? filters.techniques : [filters.techniques];
        if (vals.length > 0 && (!ann.techniques || !vals.some(v => v in ann.techniques!))) {
          matches = false;
        }
      }
      if (filters.weapon_type) {
        const vals = Array.isArray(filters.weapon_type) ? filters.weapon_type : [filters.weapon_type];
        if (vals.length > 0 && (!ann.weapon_type || !vals.includes(ann.weapon_type))) {
          matches = false;
        }
      }
      if (filters.strikes) {
        const vals = Array.isArray(filters.strikes) ? filters.strikes : [filters.strikes];
        if (vals.length > 0 && (!ann.strikes || !vals.some(v => v in ann.strikes!))) {
          matches = false;
        }
      }
      if (filters.targets) {
        const vals = Array.isArray(filters.targets) ? filters.targets : [filters.targets];
        if (vals.length > 0 && (!ann.targets || !vals.some(v => v in ann.targets!))) {
          matches = false;
        }
      }

      if (matches) {
        matchingIds.add(id);
      }
    });

    return matchingIds;
  };

  const saveToServer = async (options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    if (!force && !isDirty) return;
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
      setIsDirty(false);
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
      getUniqueValues,
      getMatchingSectionIds,
      saveToServer,
      isDirty,
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

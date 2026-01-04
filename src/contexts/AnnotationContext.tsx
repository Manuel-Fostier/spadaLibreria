'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Annotation, 
  MEASURES, 
  STRATEGIES, 
  WEAPONS, 
  WEAPON_TYPES, 
  GUARDS, 
  STRIKES,
  TARGETS,
  Measure, 
  Strategy, 
  Weapon, 
  WeaponType, 
  Guard,
  Strike,
  Target
} from '@/lib/annotation';

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

// Extended type to handle legacy 'measure' field during migration
interface LegacyAnnotation extends Omit<Annotation, 'measures'> {
  measure?: Measure | null;
  measures?: Measure[] | null;
}

export function AnnotationProvider({ children, initialAnnotations }: { children: ReactNode, initialAnnotations: Map<string, Annotation> }) {
  const normalizeAnnotation = (ann: LegacyAnnotation): Annotation => {
    // Handle migration from single 'measure' to 'measures' array
    let validMeasures: Measure[] = [];
    if (Array.isArray(ann.measures)) {
      validMeasures = Array.from(new Set(
        ann.measures.filter((m): m is Measure => MEASURES.includes(m as Measure))
      ));
    } else if (ann.measure && MEASURES.includes(ann.measure as Measure)) {
      // Migrate single measure to array
      validMeasures = [ann.measure as Measure];
    }
    
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
    const validWeaponTypes = ann.weapon_type && WEAPON_TYPES.includes(ann.weapon_type as WeaponType)
      ? ann.weapon_type as WeaponType
      : null;
    
    // Handle guards_mentioned: can be array (legacy) or Record<string, number> (new)
    let validGuards: Record<string, number> | null = null;
    if (ann.guards_mentioned) {
      if (Array.isArray(ann.guards_mentioned)) {
        // Legacy format: convert array to dictionary with count=1
        validGuards = {};
        ann.guards_mentioned
          .filter((g): g is Guard => GUARDS.includes(g as Guard))
          .forEach(g => { validGuards![g] = 1; });
      } else if (typeof ann.guards_mentioned === 'object') {
        // New format: already a dictionary
        validGuards = ann.guards_mentioned as Record<string, number>;
      }
    }
    
    // Handle techniques: can be array (legacy) or Record<string, number> (new)
    let validTechniques: Record<string, number> | null = null;
    if (ann.techniques) {
      if (Array.isArray(ann.techniques)) {
        // Legacy format: convert array to dictionary with count=1
        validTechniques = {};
        ann.techniques
          .filter((t): t is string => typeof t === 'string')
          .forEach(t => { validTechniques![t] = 1; });
      } else if (typeof ann.techniques === 'object') {
        // New format: already a dictionary
        validTechniques = ann.techniques as Record<string, number>;
      }
    }
    
    // Handle strikes: can be array (legacy) or Record<string, number> (new)
    let validStrikes: Record<string, number> | null = null;
    if (ann.strikes) {
      if (Array.isArray(ann.strikes)) {
        // Legacy format: convert array to dictionary with count=1
        validStrikes = {};
        ann.strikes
          .filter((s): s is Strike => STRIKES.includes(s as Strike))
          .forEach(s => { validStrikes![s] = 1; });
      } else if (typeof ann.strikes === 'object') {
        // New format: already a dictionary
        validStrikes = ann.strikes as Record<string, number>;
      }
    }
    
    // Handle targets: can be array (legacy) or Record<string, number> (new)
    let validTargets: Record<string, number> | null = null;
    if (ann.targets) {
      if (Array.isArray(ann.targets)) {
        // Legacy format: convert array to dictionary with count=1
        validTargets = {};
        ann.targets
          .filter((t): t is Target => TARGETS.includes(t as Target))
          .forEach(t => { validTargets![t] = 1; });
      } else if (typeof ann.targets === 'object') {
        // New format: already a dictionary
        validTargets = ann.targets as Record<string, number>;
      }
    }
    
    // Create new annotation without the legacy 'measure' field
    const { measure: _measure, ...rest } = ann as LegacyAnnotation & { measure?: Measure | null };
    
    return { 
      ...rest, 
      measures: validMeasures,
      strategy: validStrategies,
      weapons: validWeapons,
      weapon_type: validWeaponTypes,
      guards_mentioned: validGuards,
      techniques: validTechniques,
      strikes: validStrikes,
      targets: validTargets
    } as Annotation;
  };

  const normalizeMap = (map: Map<string, Annotation>): Map<string, Annotation> => {
    const newMap = new Map<string, Annotation>();
    map.forEach((ann, key) => {
      const normalized = normalizeAnnotation({
        // provide defaults for legacy annotations
        ...ann,
        measures: (ann as LegacyAnnotation).measures ?? null,
        strategy: ann.strategy ?? [],
        weapons: ann.weapons ?? [],
        weapon_type: ann.weapon_type ?? null,
        guards_mentioned: ann.guards_mentioned ?? null,
        techniques: ann.techniques ?? null,
        strikes: ann.strikes ?? null,
        targets: ann.targets ?? null,
      } as LegacyAnnotation);
      newMap.set(key, normalized);
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

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Annotation } from '@/lib/dataLoader';

interface AnnotationContextType {
  annotations: Map<string, Annotation[]>;
  addAnnotation: (sectionId: string, annotation: Omit<Annotation, 'id' | 'created_at'>) => Promise<void>;
  updateAnnotation: (sectionId: string, annotationId: string, updates: Partial<Annotation>) => Promise<void>;
  deleteAnnotation: (sectionId: string, annotationId: string) => Promise<void>;
  getAnnotationsForSection: (sectionId: string) => Annotation[];
  saveToServer: () => Promise<void>;
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

export function AnnotationProvider({ children, initialAnnotations }: { children: ReactNode, initialAnnotations: Map<string, Annotation[]> }) {
  const [annotations, setAnnotations] = useState<Map<string, Annotation[]>>(initialAnnotations);

  // Charger depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem('treatise_annotations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const map = new Map<string, Annotation[]>(Object.entries(parsed));
        setAnnotations(map);
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

  const addAnnotation = async (sectionId: string, annotation: Omit<Annotation, 'id' | 'created_at'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `anno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: null,
    };

    setAnnotations(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(sectionId) || [];
      newMap.set(sectionId, [...existing, newAnnotation]);
      return newMap;
    });
  };

  const updateAnnotation = async (sectionId: string, annotationId: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(sectionId) || [];
      const updated = existing.map(ann => 
        ann.id === annotationId 
          ? { ...ann, ...updates, updated_at: new Date().toISOString() }
          : ann
      );
      newMap.set(sectionId, updated);
      return newMap;
    });
  };

  const deleteAnnotation = async (sectionId: string, annotationId: string) => {
    setAnnotations(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(sectionId) || [];
      const filtered = existing.filter(ann => ann.id !== annotationId);
      if (filtered.length === 0) {
        newMap.delete(sectionId);
      } else {
        newMap.set(sectionId, filtered);
      }
      return newMap;
    });
  };

  const getAnnotationsForSection = (sectionId: string): Annotation[] => {
    return annotations.get(sectionId) || [];
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
      addAnnotation,
      updateAnnotation,
      deleteAnnotation,
      getAnnotationsForSection,
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

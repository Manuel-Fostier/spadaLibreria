'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAnnotationDisplay } from '@/contexts/AnnotationDisplayContext';
import { AnnotationDisplay } from '@/types/annotationDisplay';
import ColorPicker from './ColorPicker';
import { type AnnotationKey } from '@/lib/annotation/AnnotationRegistry';

interface AnnotationDisplaySettingsProps {
  onClose?: () => void;
}

type ConfigKey = keyof Omit<AnnotationDisplay, 'colors'>;

const OPTION_META: Array<{ key: ConfigKey; label: string }> = [
  { key: 'weapons', label: 'Armes' },
  { key: 'weapon_type', label: 'État de l\'arme' },
  { key: 'guards', label: 'Gardes mentionnées' },
  { key: 'techniques', label: 'Techniques' },
  { key: 'measures', label: 'Mesures / Distance' },
  { key: 'strategy', label: 'Stratégie / Contexte' },
  { key: 'strikes', label: 'Coups' },
  { key: 'targets', label: 'Cibles' },
  { key: 'note', label: 'Aperçu de note' },
];

export default function AnnotationDisplaySettings({ onClose }: AnnotationDisplaySettingsProps) {
  const { displayConfig, updateDisplayConfig, resetDisplayConfig, isHydrated, getAnnotation } = useAnnotationDisplay();
  const [draft, setDraft] = useState<AnnotationDisplay>(displayConfig);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDraft(displayConfig);
  }, [displayConfig]);

  const toggle = (key: ConfigKey) => {
    setDraft(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    resetDisplayConfig();
  };

  const handleApply = useCallback(() => {
    updateDisplayConfig(draft);
    if (onClose) onClose();
  }, [draft, onClose, updateDisplayConfig]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      handleApply();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleApply]);

  return (
    <div ref={containerRef} className="bg-white border border-gray-200 shadow-lg rounded-lg p-4 space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Configuration des annotations</h3>
          <p className="text-xs text-gray-500">Choisissez les champs visibles et leurs couleurs.</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Réinitialiser
        </button>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {OPTION_META.map(option => {
          const annotation = getAnnotation(option.key as AnnotationKey);
          return (
            <div
              key={option.key}
              className="flex items-center gap-3 rounded-md border border-gray-100 px-3 py-2 hover:bg-gray-50"
            >
              <div className="flex-1 text-sm font-medium text-gray-900">
                {annotation?.getLabel() || option.label}
              </div>
              
              <div className="flex items-center gap-3">
                {annotation && (
                  <ColorPicker
                    annotation={annotation}
                    label=""
                  />
                )}
                
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={draft[option.key]}
                  onChange={() => toggle(option.key)}
                  disabled={!isHydrated}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}

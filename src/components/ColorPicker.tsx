'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Annotation } from '@/lib/annotation/Annotation';
import { useAnnotationDisplay } from '@/contexts/AnnotationDisplayContext';
import { AnnotationRegistry } from '@/lib/annotation/AnnotationRegistry';

interface ColorPickerProps {
  annotation: Annotation;
  label: string;
}

const PRESET_COLORS = [
  { name: 'Sky', value: '#0284c7' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Lime', value: '#84cc16' },
];

export default function ColorPicker({ annotation, label }: ColorPickerProps) {
  const { displayConfig, updateDisplayConfig } = useAnnotationDisplay();
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const currentColor = annotation.getChipStyle().color as string;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleColorChange = (color: string) => {
    annotation.setStyle(color);
    
    // Find which annotation key this is by checking the instance
    const annotationKey = Array.from(AnnotationRegistry.getAllAnnotations().entries()).find(
      ([, inst]) => inst === annotation
    )?.[0];
    
    // Update context state to keep it in sync with the instance
    if (annotationKey) {
      updateDisplayConfig({
        ...displayConfig,
        colors: {
          ...displayConfig.colors,
          [annotationKey]: color,
        },
      });
    }
    
    setShowPicker(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      
      {/* Color preview button */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
        style={{ backgroundColor: currentColor }}
        title="Choisir une couleur"
      />
      
      {/* Dropdown picker */}
      {showPicker && (
        <div className="absolute top-10 right-0 z-50 bg-white border border-gray-200 shadow-lg rounded-lg p-3 space-y-3">
          {/* Preset color grid */}
          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleColorChange(preset.value)}
                className={`w-7 h-7 rounded border-2 transition-all hover:scale-110 ${
                  currentColor === preset.value ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              />
            ))}
          </div>
          
          {/* Native color picker for custom colors */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
              title="Couleur personnalisée"
            />
            <span className="text-xs text-gray-500">Personnalisée</span>
          </div>
        </div>
      )}
    </div>
  );
}

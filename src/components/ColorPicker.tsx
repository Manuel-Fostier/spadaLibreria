'use client';

import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

const PRESET_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Fuchsia', value: '#d946ef' },
];

export default function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        {/* Current color preview */}
        <div 
          className="w-10 h-10 rounded-md border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: color }}
        />
        
        {/* Preset color grid */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                color === preset.value ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-400' : 'border-gray-200'
              }`}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            />
          ))}
        </div>
        
        {/* Native color picker for custom colors */}
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-md border-2 border-gray-300 cursor-pointer"
          title="Choisir une couleur personnalisée"
        />
      </div>
    </div>
  );
}

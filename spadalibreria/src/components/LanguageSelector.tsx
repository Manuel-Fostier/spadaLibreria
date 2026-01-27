'use client';

import React, { useState } from 'react';

interface LanguageSelectorProps {
  selectedLanguage: 'it' | 'fr' | 'en';
  onLanguageChange: (language: 'it' | 'fr' | 'en') => void;
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const languages = [
    { code: 'it', label: 'Italiano', fullName: 'Italian' },
    { code: 'fr', label: 'Français', fullName: 'French' },
    { code: 'en', label: 'English', fullName: 'English' },
  ] as const;

  const handleChange = (code: 'it' | 'fr' | 'en') => {
    onLanguageChange(code);
  };

  return (
    <div className="language-selector mb-6 p-4 bg-white border border-gray-200 rounded-lg">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700 mb-3">
          Select Language / Sélectionner la langue / Seleziona la lingua
        </legend>

        <div role="group" className="flex gap-4 flex-wrap">
          {languages.map(({ code, label, fullName }) => (
            <label
              key={code}
              className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <input
                type="radio"
                name="language"
                value={code}
                checked={selectedLanguage === code}
                onChange={(e) => handleChange(e.target.value as 'it' | 'fr' | 'en')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {label}
              </span>
              <span className="ml-1 text-xs text-gray-500">({code.toUpperCase()})</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

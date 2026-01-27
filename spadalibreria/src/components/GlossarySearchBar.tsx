'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useGlossary } from '@/contexts/GlossaryContext';

const DEBOUNCE_MS = 300;

export default function GlossarySearchBar() {
  const { searchQuery, setSearchQuery, filteredTerms, isLoading } = useGlossary();
  const [inputValue, setInputValue] = useState(searchQuery);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setSearchQuery('');
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      setSearchQuery(value.trim());
    }, DEBOUNCE_MS);
  };

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
  };

  const hasQuery = inputValue.trim().length > 0;
  const showNoResults = hasQuery && !isLoading && filteredTerms.length === 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={inputValue}
          onChange={handleChange}
          placeholder="Rechercher un terme"
          aria-label="Rechercher un terme"
          className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showNoResults && (
        <p className="mt-2 text-sm text-gray-500">Aucun résultat.</p>
      )}
    </div>
  );
}

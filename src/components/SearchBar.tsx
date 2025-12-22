'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';

export default function SearchBar() {
  const { performSearch, clearSearch, isSearching } = useSearch();
  const [searchText, setSearchText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const handleSearch = () => {
    if (searchText.trim()) {
      performSearch(searchText, {
        matchCase,
        matchWholeWord: wholeWord,
        useRegex
      });
    }
  };

  const handleClear = () => {
    setSearchText('');
    clearSearch();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchText(newValue);
    if (newValue === '') {
      clearSearch();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3 text-gray-400 pointer-events-none">
          <Search size={16} />
        </div>
        
        <input
          type="text"
          value={searchText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher (ex: mandritto)..."
          className="w-full pl-10 pr-36 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {searchText && (
            <button 
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 mr-1"
              title="Effacer"
            >
              <X size={14} />
            </button>
          )}

          <button
            onClick={() => setMatchCase(!matchCase)}
            className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-colors ${
              matchCase 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'
            }`}
            title="Respecter la casse"
          >
            Aa
          </button>
          <button
            onClick={() => setWholeWord(!wholeWord)}
            className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-colors ${
              wholeWord 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'
            }`}
            title="Mot entier"
          >
            <span className="underline">ab</span>
          </button>
          <button
            onClick={() => setUseRegex(!useRegex)}
            className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-colors ${
              useRegex 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'
            }`}
            title="Expression régulière"
          >
            .*
          </button>
        </div>
      </div>
    </div>
  );
}

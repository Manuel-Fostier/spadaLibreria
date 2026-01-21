'use client';

import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';

export default function SearchBar() {
  const { performSearch, clearSearch } = useSearch();
  const [searchText, setSearchText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setSearchText(newValue);
    
    // Trigger search automatically on each change
    if (newValue.trim()) {
      performSearch(newValue, {
        matchCase,
        matchWholeWord: wholeWord,
        useRegex
      });
    } else {
      clearSearch();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline on Enter
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClear();
    }
    // Allow Shift+Enter to add newline (default behavior)
  };

  const toggleMatchCase = () => {
    const newValue = !matchCase;
    setMatchCase(newValue);
    if (searchText.trim()) {
      performSearch(searchText, {
        matchCase: newValue,
        matchWholeWord: wholeWord,
        useRegex
      });
    }
  };

  const toggleWholeWord = () => {
    const newValue = !wholeWord;
    setWholeWord(newValue);
    if (searchText.trim()) {
      performSearch(searchText, {
        matchCase,
        matchWholeWord: newValue,
        useRegex
      });
    }
  };

  const toggleRegex = () => {
    const newValue = !useRegex;
    setUseRegex(newValue);
    if (searchText.trim()) {
      performSearch(searchText, {
        matchCase,
        matchWholeWord: wholeWord,
        useRegex: newValue
      });
    }
  };

  // Auto-grow textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to recalculate
      textareaRef.current.style.height = 'auto';
      // Set height based on scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [searchText]);

  return (
    <div className="w-full">
      <div className="relative flex items-start">
        {!isFocused && (
          <div className="absolute left-3 top-2 text-gray-400 pointer-events-none">
            <Search size={16} />
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={searchText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Rechercher (ex: mandritto)..."
          className={`w-full ${isFocused ? 'pl-3' : 'pl-10'} pr-36 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono resize-none overflow-y-auto min-h-[2.5rem] max-h-[10.5rem]`}
          rows={1}
        />

        <div className="absolute right-2 top-2 flex items-center gap-1">
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
            onClick={toggleMatchCase}
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
            onClick={toggleWholeWord}
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
            onClick={toggleRegex}
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

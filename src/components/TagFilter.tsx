'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp, Tag, Book, Check } from 'lucide-react';

// Define types for the filter state
export interface FilterState {
  // Annotation filters
  weapons: string[];
  guards: string[];
  techniques: string[];
  weapon_type: string[];
  strikes: string[];
  targets: string[];
  
  // Treatise filters
  master: string[];
  work: string[];
  book: string[]; // string to handle "all" easily, convert to number when filtering
  year: string[]; // string to handle "all" easily
}

export const initialFilterState: FilterState = {
  weapons: [],
  guards: [],
  techniques: [],
  weapon_type: [],
  strikes: [],
  targets: [],
  master: [],
  work: [],
  book: [],
  year: []
};

interface TagFilterProps {
  // Available options
  options: {
    weapons: string[];
    guards: string[];
    techniques: string[];
    weapon_type: string[];
    strikes: string[];
    targets: string[];
    master: string[];
    work: string[];
    book: number[];
    year: number[];
  };
  
  // Current state
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  
  // UI state
  className?: string;
}

interface MultiSelectProps {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

function MultiSelect({ label, value, options, onChange, placeholder = "Tous" }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: string, event: React.MouseEvent) => {
    if (event.shiftKey) {
      // Add/Remove from selection
      if (value.includes(option)) {
        onChange(value.filter(v => v !== option));
      } else {
        onChange([...value, option]);
      }
    } else {
      // Select only this option (or toggle if it's the only one selected?)
      if (value.length === 1 && value[0] === option) {
        // If clicking the only selected item, deselect it (go back to "All")
        onChange([]);
      } else {
        onChange([option]);
      }
      setIsOpen(false);
    }
  };

  const displayValue = value.length === 0 
    ? placeholder 
    : value.length === 1 
      ? value[0] 
      : `${value.length} sélectionnés`;

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left text-sm border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex justify-between items-center"
      >
        <span className="block truncate">{displayValue}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div 
            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${value.length === 0 ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}
            onClick={() => {
              onChange([]);
              setIsOpen(false);
            }}
          >
            <span className="block truncate">{placeholder}</span>
            {value.length === 0 && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                <Check size={16} />
              </span>
            )}
          </div>
          {options.map((option) => {
            const isSelected = value.includes(option);
            return (
              <div
                key={option}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}
                onClick={(e) => handleOptionClick(option, e)}
              >
                <span className="block truncate">{option}</span>
                {isSelected && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <Check size={16} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TagFilter({ options, filters, onFilterChange, className = '' }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isTreatiseOpen, setIsTreatiseOpen] = useState(true);
  const [isAnnotationOpen, setIsAnnotationOpen] = useState(true);

  const handleChange = (category: keyof FilterState, value: string[]) => {
    onFilterChange({
      ...filters,
      [category]: value
    });
  };

  const clearFilters = () => {
    onFilterChange(initialFilterState);
  };

  const activeFilterCount = Object.values(filters).filter(v => v.length > 0).length;

  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-600" />
          <span className="font-medium text-slate-700">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="text-xs text-red-600 hover:text-red-800 mr-2"
            >
              Effacer tout
            </button>
          )}
          {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t bg-slate-50">
          <div className="flex flex-col gap-6">
            {/* Treatise Filters */}
            <div className="space-y-3">
              <div 
                className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2 cursor-pointer hover:text-slate-900"
                onClick={() => setIsTreatiseOpen(!isTreatiseOpen)}
              >
                <div className="flex items-center gap-2">
                  <Book size={16} />
                  <h3>Traités</h3>
                </div>
                {isTreatiseOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              
              {isTreatiseOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MultiSelect
                    label="Maître"
                    value={filters.master}
                    options={options.master}
                    onChange={(val) => handleChange('master', val)}
                  />

                  <MultiSelect
                    label="Œuvre"
                    value={filters.work}
                    options={options.work}
                    onChange={(val) => handleChange('work', val)}
                    placeholder="Toutes"
                  />

                  <MultiSelect
                    label="Livre"
                    value={filters.book}
                    options={options.book.map(b => b.toString())}
                    onChange={(val) => handleChange('book', val)}
                  />
                </div>
              )}
            </div>

            {/* Annotation Filters */}
            <div className="space-y-3">
              <div 
                className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2 cursor-pointer hover:text-slate-900"
                onClick={() => setIsAnnotationOpen(!isAnnotationOpen)}
              >
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <h3>Annotations</h3>
                </div>
                {isAnnotationOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              
              {isAnnotationOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MultiSelect
                    label="Armes"
                    value={filters.weapons}
                    options={options.weapons}
                    onChange={(val) => handleChange('weapons', val)}
                    placeholder="Toutes"
                  />

                  <MultiSelect
                    label="État de l'arme"
                    value={filters.weapon_type}
                    options={options.weapon_type}
                    onChange={(val) => handleChange('weapon_type', val)}
                  />

                  <MultiSelect
                    label="Gardes"
                    value={filters.guards}
                    options={options.guards}
                    onChange={(val) => handleChange('guards', val)}
                    placeholder="Toutes"
                  />

                  <MultiSelect
                    label="Techniques"
                    value={filters.techniques}
                    options={options.techniques}
                    onChange={(val) => handleChange('techniques', val)}
                    placeholder="Toutes"
                  />

                  <MultiSelect
                    label="Coups"
                    value={filters.strikes}
                    options={options.strikes}
                    onChange={(val) => handleChange('strikes', val)}
                  />

                  <MultiSelect
                    label="Cibles"
                    value={filters.targets}
                    options={options.targets}
                    onChange={(val) => handleChange('targets', val)}
                    placeholder="Toutes"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
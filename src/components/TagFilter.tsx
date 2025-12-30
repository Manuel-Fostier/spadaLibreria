'use client';

import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X, Tag, Book } from 'lucide-react';

// Define types for the filter state
export interface FilterState {
  // Annotation filters
  weapons: string;
  guards: string;
  techniques: string;
  weapon_type: string;
  strikes: string;
  targets: string;
  
  // Treatise filters
  master: string;
  work: string;
  book: string; // string to handle "all" easily, convert to number when filtering
  year: string; // string to handle "all" easily
}

export const initialFilterState: FilterState = {
  weapons: '',
  guards: '',
  techniques: '',
  weapon_type: '',
  strikes: '',
  targets: '',
  master: '',
  work: '',
  book: '',
  year: ''
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

export default function TagFilter({ options, filters, onFilterChange, className = '' }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isTreatiseOpen, setIsTreatiseOpen] = useState(true);
  const [isAnnotationOpen, setIsAnnotationOpen] = useState(true);

  const handleChange = (category: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [category]: value
    });
  };

  const clearFilters = () => {
    onFilterChange(initialFilterState);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

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
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Maître</label>
                    <select
                      value={filters.master}
                      onChange={(e) => handleChange('master', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Tous</option>
                      {options.master.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Œuvre</label>
                    <select
                      value={filters.work}
                      onChange={(e) => handleChange('work', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Toutes</option>
                      {options.work.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Livre</label>
                    <select
                      value={filters.book}
                      onChange={(e) => handleChange('book', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Tous</option>
                      {options.book.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* 
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Année</label>
                    <select
                      value={filters.year}
                      onChange={(e) => handleChange('year', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Toutes</option>
                      {options.year.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  */}
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
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Armes</label>
                    <select
                      value={filters.weapons}
                      onChange={(e) => handleChange('weapons', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Toutes</option>
                      {options.weapons.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">État de l'arme</label>
                    <select
                      value={filters.weapon_type}
                      onChange={(e) => handleChange('weapon_type', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Tous</option>
                      {options.weapon_type.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Gardes</label>
                    <select
                      value={filters.guards}
                      onChange={(e) => handleChange('guards', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Toutes</option>
                      {options.guards.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Techniques</label>
                    <select
                      value={filters.techniques}
                      onChange={(e) => handleChange('techniques', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Toutes</option>
                      {options.techniques.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Coups</label>
                    <select
                      value={filters.strikes}
                      onChange={(e) => handleChange('strikes', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Tous</option>
                      {options.strikes.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Cibles</label>
                    <select
                      value={filters.targets}
                      onChange={(e) => handleChange('targets', e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Toutes</option>
                      {options.targets.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

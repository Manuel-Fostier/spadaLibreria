'use client';

import React, { useState, useMemo } from 'react';
import { GlossaryData, GlossaryEntry } from '@/types/data';
import { categorizeGlossary, filterGlossaryTerms } from '@/lib/glossaryUtils';
import { ChevronDown, ChevronUp, Book } from 'lucide-react';

interface GlossaryPageClientProps {
  glossaryData: GlossaryData;
}

export default function GlossaryPageClient({ glossaryData }: GlossaryPageClientProps) {
  const [searchText, setSearchText] = useState('');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  // Filter and categorize glossary based on search
  const filteredGlossary = useMemo(() => {
    const filtered = filterGlossaryTerms(glossaryData, searchText, language);
    return categorizeGlossary(filtered);
  }, [glossaryData, searchText, language]);

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Toggle term expansion
  const toggleTerm = (termKey: string) => {
    const newExpanded = new Set(expandedTerms);
    if (newExpanded.has(termKey)) {
      newExpanded.delete(termKey);
    } else {
      newExpanded.add(termKey);
    }
    setExpandedTerms(newExpanded);
  };

  // Expand all categories
  const expandAll = () => {
    setExpandedCategories(new Set(filteredGlossary.categories.map(c => c.name)));
  };

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories(new Set());
    setExpandedTerms(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Glossaire</h1>
          </div>
          
          {/* Search and controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search input */}
            <div className="flex-1">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Rechercher dans le glossaire..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {/* Language selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  language === 'fr'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                English
              </button>
            </div>
            
            {/* Expand/collapse controls */}
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tout ouvrir
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tout fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredGlossary.categories.length === 0 && filteredGlossary.uncategorized.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun terme trouvé pour "{searchText}"</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Categories */}
            {filteredGlossary.categories.map((category) => (
              <div key={category.name} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {category.terms.length} {category.terms.length === 1 ? 'terme' : 'termes'}
                    </span>
                    {expandedCategories.has(category.name) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Terms list */}
                {expandedCategories.has(category.name) && (
                  <div className="border-t border-gray-200">
                    {category.terms.map(({ key, entry }) => (
                      <TermEntry
                        key={key}
                        termKey={key}
                        entry={entry}
                        language={language}
                        isExpanded={expandedTerms.has(key)}
                        onToggle={() => toggleTerm(key)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Uncategorized terms */}
            {filteredGlossary.uncategorized.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => toggleCategory('__uncategorized__')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-xl font-semibold text-gray-900">Autres termes</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {filteredGlossary.uncategorized.length}{' '}
                      {filteredGlossary.uncategorized.length === 1 ? 'terme' : 'termes'}
                    </span>
                    {expandedCategories.has('__uncategorized__') ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {expandedCategories.has('__uncategorized__') && (
                  <div className="border-t border-gray-200">
                    {filteredGlossary.uncategorized.map(({ key, entry }) => (
                      <TermEntry
                        key={key}
                        termKey={key}
                        entry={entry}
                        language={language}
                        isExpanded={expandedTerms.has(key)}
                        onToggle={() => toggleTerm(key)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Term entry component
interface TermEntryProps {
  termKey: string;
  entry: GlossaryEntry;
  language: 'fr' | 'en';
  isExpanded: boolean;
  onToggle: () => void;
}

function TermEntry({ entry, language, isExpanded, onToggle }: TermEntryProps) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{entry.term}</h3>
          <p className="text-sm text-gray-500 mt-1">{entry.type}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-4 space-y-4">
          {/* Translation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              {language === 'fr' ? 'Traduction' : 'Translation'}
            </h4>
            <p className="text-gray-900">{entry.translation[language] || entry.translation.fr}</p>
          </div>

          {/* Definition */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              {language === 'fr' ? 'Définition' : 'Definition'}
            </h4>
            <div className="text-gray-900 whitespace-pre-wrap">{entry.definition[language] || entry.definition.fr}</div>
          </div>
        </div>
      )}
    </div>
  );
}

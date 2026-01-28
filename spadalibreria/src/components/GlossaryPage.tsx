'use client';

import React from 'react';
import { useGlossary } from '@/contexts/GlossaryContext';
import GlossarySearchBar from './GlossarySearchBar';
import LanguageSelector from './LanguageSelector';
import GlossaryContent from './GlossaryContent';

/**
 * GlossaryPage - Main glossary page component
 * 
 * Assembles all glossary sub-components:
 * - GlossarySearchBar: Search input with debouncing and clear button
 * - LanguageSelector: Radio buttons for IT/FR/EN selection
 * - GlossaryContent: Hierarchical display of all terms (Category → Type → Term)
 * 
 * This component must be wrapped with GlossaryPageWrapper to provide GlossaryContext.
 */
export default function GlossaryPage() {
  const { groupedTerms, selectedLanguage, setSelectedLanguage, searchQuery, isLoading, error } = useGlossary();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Glossary</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Loading glossary...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Glossary / Glossaire / Glossario
          </h1>
          <p className="text-gray-600">
            Comprehensive glossary of Bolognese fencing terminology
          </p>
        </header>

        {/* Language Selector */}
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />

        {/* Search Bar */}
        <GlossarySearchBar />

        {/* Glossary Content */}
        <GlossaryContent
          groupedTerms={groupedTerms}
          language={selectedLanguage}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}

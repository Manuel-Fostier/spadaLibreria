'use client';

import React from 'react';
import { GlossaryTerm } from '@/types/glossary';
import TermDisplay from './TermDisplay';

interface CategorySectionProps {
  categoryName: string;
  groupedTerms: { [type: string]: GlossaryTerm[] };
  language: 'it' | 'fr' | 'en';
  searchQuery: string;
}

export default function CategorySection({
  categoryName,
  groupedTerms,
  language,
  searchQuery,
}: CategorySectionProps) {
  return (
    <section className="category-section mb-8">
      {/* Category Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">
        {categoryName}
      </h2>

      {/* Type Subsections */}
      {Object.entries(groupedTerms).map(([type, terms]) => (
        <div key={type} className="type-subsection mb-6">
          {/* Type Header */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4 ml-2 text-blue-700">
            {type}
          </h3>

          {/* Terms */}
          <div className="terms-container space-y-2 ml-4">
            {terms.map((term) => (
              <TermDisplay
                key={term.id}
                term={term}
                language={language}
                searchQuery={searchQuery}
                highlightMatches={searchQuery.length > 0}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

'use client';

import React from 'react';
import CategorySection from './CategorySection';

interface GroupedTerms {
  [category: string]: {
    [type: string]: Array<{
      id: string;
      term: string;
      category: string;
      type: string;
      definition: { it: string; fr: string; en: string };
      translation: { it: string; fr: string; en: string };
    }>;
  };
}

interface GlossaryContentProps {
  groupedTerms: GroupedTerms;
  searchQuery: string;
}

export default function GlossaryContent({
  groupedTerms,
  searchQuery,
}: GlossaryContentProps) {
  return (
    <div className="glossary-content space-y-8 prose prose-neutral max-w-none">
      {Object.keys(groupedTerms).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No glossary content available.
          </p>
        </div>
      ) : (
        Object.entries(groupedTerms).map(([category, typeTerms]) => (
          <CategorySection
            key={category}
            categoryName={category}
            groupedTerms={typeTerms}
            searchQuery={searchQuery}
          />
        ))
      )}
    </div>
  );
}

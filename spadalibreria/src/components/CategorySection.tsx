'use client';

import React from 'react';
import { GlossaryTerm } from '@/types/glossary';
import TermDisplay from './TermDisplay';

interface CategorySectionProps {
  categoryName: string;
  groupedTerms: { [type: string]: GlossaryTerm[] };
  searchQuery: string;
}

export default function CategorySection({
  categoryName,
  groupedTerms,
  searchQuery,
}: CategorySectionProps) {
  return (
    <section className="category-section space-y-8">
      {Object.entries(groupedTerms).map(([type, terms]) => (
        <div
          key={type}
          className="type-subsection space-y-6"
          data-glossary-category={categoryName}
          data-glossary-type={type}
        >
          {terms.map((term, index) => (
            <div 
              key={term.id}
              id={term.id}
              className="space-y-4 scroll-mt-[84px]"
            >
              <TermDisplay
                term={term}
                searchQuery={searchQuery}
                highlightMatches={searchQuery.length > 0}
              />
              {index < terms.length - 1 && (
                <div className="border-t border-gray-200 w-4/5 mx-auto" />
              )}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

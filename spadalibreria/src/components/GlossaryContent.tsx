'use client';

import React from 'react';
import TermDisplay from './TermDisplay';
import { GroupedGlossary } from '@/types/glossary';

// Style and layout constants for glossary (exported for reuse)
export const GLOSSARY_CATEGORY_STYLE = 'text-2xl font-bold text-gray-900';
export const GLOSSARY_TYPE_STYLE = 'text-xl font-semibold text-gray-800';
export const GLOSSARY_LEFT_PADDING = 'px-8 lg:px-12';

interface GlossaryContentProps {
  groupedTerms: GroupedGlossary;
  searchQuery: string;
  isEditable?: boolean;
}

export default function GlossaryContent({
  groupedTerms,
  searchQuery,
  isEditable = false,
}: GlossaryContentProps) {
  if (Object.keys(groupedTerms).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No glossary content available.
        </p>
      </div>
    );
  }

  return (
    <div className={`glossary-content`}>
      {Object.entries(groupedTerms).map(([category, typeTerms], catIdx) => (
        <div key={category} className="mb-12">
          <h2 className={`${GLOSSARY_CATEGORY_STYLE} mb-4`}>{category}</h2>
          {Object.entries(typeTerms).map(([type, terms], typeIdx) => (
            <div key={type} className="mb-8">
              <h3 className={`${GLOSSARY_TYPE_STYLE} mb-2`}>{type}</h3>
              {terms.map((term) => (
                <div
                  key={term.id}
                  className="mb-6"
                  data-section-id={term.id}
                  data-glossary-category={term.category}
                  data-glossary-type={term.type ?? ''}
                >
                  {/* <h4 className="text-lg font-semibold text-gray-700 mb-1">{term.term}</h4> */}
                  <TermDisplay
                    term={term}
                    termKey={term.id}
                    searchQuery={searchQuery}
                    highlightMatches={searchQuery.length > 0}
                    isEditable={isEditable}
                  />
                </div>
              ))}
            </div>
          ))}
          {catIdx < Object.keys(groupedTerms).length - 1 && (
            <hr className="my-8 border-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}

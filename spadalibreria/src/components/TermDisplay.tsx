'use client';

import React from 'react';
import { GlossaryTerm } from '@/types/glossary';
import { findMatches } from '@/lib/highlighter';
import { SearchOptions } from '@/types/search';

interface TermDisplayProps {
  term: GlossaryTerm;
  searchQuery: string;
  highlightMatches: boolean;
}

const highlightOptions: SearchOptions = {
  matchCase: false,
  matchWholeWord: false,
  useRegex: false,
  includeVariants: false,
};

function renderHighlightedText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const matches = findMatches(text, query, highlightOptions);
  if (matches.length === 0) return text;

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    if (match.start > lastIndex) {
      result.push(text.slice(lastIndex, match.start));
    }
    result.push(
      <mark
        key={`${match.start}-${match.end}-${index}`}
        className="bg-yellow-200 text-gray-900 font-semibold rounded-sm px-0.5"
      >
        {text.slice(match.start, match.end)}
      </mark>
    );
    lastIndex = match.end;
  });

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return <>{result}</>;
}

/**
 * TermDisplay - Display a glossary term in French (French-only mode)
 * 
 * Displays French definition and translation only.
 * All information is visible in a unified view (no expand/collapse).
 * No language switching is available.
 * 
 * Search highlighting is supported for finding matches across all text.
 * 
 * Performance: Memoized to prevent unnecessary re-renders when parent updates
 * but term, searchQuery, and highlightMatches props remain unchanged.
 */
const TermDisplay = React.memo(function TermDisplay({
  term,
  searchQuery,
  highlightMatches: shouldHighlight,
}: TermDisplayProps) {
  // Always use French definitions and translations (French-only mode)
  const language = 'fr';
  const definition = term.definition[language] || '';
  const translation = term.translation[language] || '';

  // Apply highlighting if search is active
  const highlightedTerm = shouldHighlight
    ? renderHighlightedText(term.term, searchQuery)
    : term.term;
  const highlightedDefinition = shouldHighlight
    ? renderHighlightedText(definition, searchQuery)
    : definition;
  const highlightedTranslation = shouldHighlight
    ? renderHighlightedText(translation, searchQuery)
    : translation;
  const highlightedCategory = shouldHighlight
    ? renderHighlightedText(term.category, searchQuery)
    : term.category;
  const highlightedType = shouldHighlight
    ? renderHighlightedText(term.type, searchQuery)
    : term.type;

  return (
    <div className="term-display border-l-4 border-blue-300 bg-blue-50 p-3 sm:p-4 mb-2 sm:mb-3 rounded hover:bg-blue-100 transition-colors">
      {/* Term Header - Always Visible */}
      <div className="mb-2 sm:mb-3">
        <h4 className="text-base sm:text-lg font-bold text-gray-900">
          {highlightedTerm}
        </h4>
        <p className="text-xs sm:text-sm text-gray-600">
          <span className="font-semibold">{highlightedCategory}</span>
          {' › '}
          <span>{highlightedType}</span>
        </p>
      </div>

      {/* French Definition - Always Visible */}
      <div className="mb-2 sm:mb-3">
        {definition ? (
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            {highlightedDefinition}
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-gray-400 italic">
            No definition available
          </p>
        )}
      </div>

      {/* French Translation - Always Visible */}
      {translation && (
        <div className="bg-white bg-opacity-50 p-2 rounded text-xs sm:text-sm text-gray-600 italic">
          {highlightedTranslation}
        </div>
      )}
    </div>
  );
});

export default TermDisplay;

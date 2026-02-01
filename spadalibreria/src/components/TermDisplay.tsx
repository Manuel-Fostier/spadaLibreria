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

  // Apply highlighting if search is active
  const highlightedTerm = shouldHighlight
    ? renderHighlightedText(term.term, searchQuery)
    : term.term;
  const highlightedDefinition = shouldHighlight
    ? renderHighlightedText(definition, searchQuery)
    : definition;

  return (
    <div className="term-display prose prose-neutral space-y-3">
      <h4 className="text-base sm:text-lg font-semibold italic text-gray-900">
        {highlightedTerm}
      </h4>

      {definition ? (
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line text-justify">
          {highlightedDefinition}
        </p>
      ) : (
        <p className="text-xs sm:text-sm text-gray-400 italic">
          No definition available
        </p>
      )}
    </div>
  );
});

export default TermDisplay;

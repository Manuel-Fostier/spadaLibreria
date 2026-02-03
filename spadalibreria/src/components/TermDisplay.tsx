'use client';

import React, { useState } from 'react';
import { GlossaryTerm } from '@/types/glossary';
import { findMatches } from '@/lib/highlighter';
import { SearchOptions } from '@/types/search';
import GlossaryTermEditor from './GlossaryTermEditor';
import MarkdownRenderer from './MarkdownRenderer';

interface TermDisplayProps {
  term: GlossaryTerm;
  termKey: string;
  searchQuery: string;
  highlightMatches: boolean;
  isEditable?: boolean;
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
  termKey,
  searchQuery,
  highlightMatches: shouldHighlight,
  isEditable = false,
}: TermDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);

  // If editable and editing, show the editor
  if (isEditable && isEditing) {
    return (
      <GlossaryTermEditor
        termKey={termKey}
        term={term}
        isEditing={isEditing}
        onEditStart={() => setIsEditing(true)}
        onEditCancel={() => setIsEditing(false)}
      />
    );
  }

  // Always use French definitions and translations (French-only mode)
  const language = 'fr';
  const definition = term.definition[language] || '';

  // Apply highlighting if search is active (only for term name, not definition)
  // Markdown renderer will handle its own highlighting
  const highlightedTerm = shouldHighlight
    ? renderHighlightedText(term.term, searchQuery)
    : term.term;

  // Create search query object for MarkdownRenderer
  const searchQueryObj = shouldHighlight && searchQuery
    ? {
        queryText: searchQuery,
        timestamp: new Date(),
        options: highlightOptions,
        variants: [],
        languageMappings: { it: [], fr: [], en: [] }
      }
    : null;

  return (
    <div>
      {/* Term name with edit button on same line */}
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-base sm:text-lg font-semibold italic text-gray-900 flex-1">
          {highlightedTerm}
        </h4>
        {isEditable && !isEditing && (
          <GlossaryTermEditor
            termKey={termKey}
            term={term}
            isEditing={false}
            onEditStart={() => setIsEditing(true)}
            onEditCancel={() => setIsEditing(false)}
          />
        )}
      </div>

      {definition ? (
        <MarkdownRenderer
          text={definition}
          glossaryData={{}} // Empty glossary as definitions don't need term links
          highlightQuery={searchQueryObj}
        />
      ) : (
        <p className="text-xs sm:text-sm text-gray-400 italic">
          No definition available
        </p>
      )}
    </div>
  );
});

export default TermDisplay;

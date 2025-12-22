'use client';

import React from 'react';
import Term from './Term';
import { GlossaryEntry } from '@/lib/dataLoader';
import { SearchQuery } from '@/types/search';
import { findMatches } from '@/lib/highlighter';

interface TextParserProps {
  text: string;
  glossaryData: { [key: string]: GlossaryEntry };
  highlightQuery?: SearchQuery | null;
}

export default function TextParser({ text, glossaryData, highlightQuery }: TextParserProps) {
  if (!text) return null;
  
  const parts = text.split(/(\{.*?\})/g);

  const renderHighlightedText = (content: string) => {
    if (!highlightQuery || !content) return content;

    const matches = findMatches(
      content, 
      highlightQuery.queryText, 
      highlightQuery.options, 
      highlightQuery.variants
    );

    if (matches.length === 0) return content;

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // Add text before match
      if (match.start > lastIndex) {
        result.push(content.slice(lastIndex, match.start));
      }

      // Add highlighted match
      result.push(
        <span key={`${i}-match`} className="bg-yellow-200 text-gray-900 font-semibold rounded-sm px-0.5">
          {content.slice(match.start, match.end)}
        </span>
      );

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      result.push(content.slice(lastIndex));
    }

    return <>{result}</>;
  };
  
  return (
    <p className="leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('{') && part.endsWith('}')) {
          const key = part.slice(1, -1);
          const glossaryEntry = glossaryData[key];
          const displayLabel = glossaryEntry ? glossaryEntry.term : key;
          return (
            <Term key={index} termKey={key} glossaryData={glossaryData}>
              {renderHighlightedText(displayLabel)}
            </Term>
          );
        }
        return <span key={index}>{renderHighlightedText(part)}</span>;
      })}
    </p>
  );
}

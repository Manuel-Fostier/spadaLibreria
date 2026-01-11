'use client';

import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { GlossaryEntry } from '@/lib/dataLoader';
import { SearchQuery } from '@/types/search';

interface TextParserProps {
  text: string;
  glossaryData: { [key: string]: GlossaryEntry };
  highlightQuery?: SearchQuery | null;
}

/**
 * TextParser is a wrapper component that now uses MarkdownRenderer
 * to handle text with Markdown syntax, glossary terms, and search highlighting.
 */
export default function TextParser({ text, glossaryData, highlightQuery }: TextParserProps) {
  return (
    <MarkdownRenderer 
      text={text} 
      glossaryData={glossaryData} 
      highlightQuery={highlightQuery}
    />
  );
}

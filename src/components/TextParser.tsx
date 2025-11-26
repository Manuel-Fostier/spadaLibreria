'use client';

import React from 'react';
import Term from './Term';
import { GlossaryEntry } from '@/lib/dataLoader';

interface TextParserProps {
  text: string;
  glossaryData: { [key: string]: GlossaryEntry };
}

export default function TextParser({ text, glossaryData }: TextParserProps) {
  if (!text) return null;
  
  const parts = text.split(/(\{.*?\})/g);
  
  return (
    <p className="leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith('{') && part.endsWith('}')) {
          const key = part.slice(1, -1);
          const glossaryEntry = glossaryData[key];
          const displayLabel = glossaryEntry ? glossaryEntry.term : key;
          return (
            <Term key={index} termKey={key} glossaryData={glossaryData}>
              {displayLabel}
            </Term>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}

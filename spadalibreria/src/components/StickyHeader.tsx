'use client';

import React from 'react';

interface StickyHeaderLine {
  content: React.ReactNode;
  className?: string;
}

interface StickyHeaderProps {
  lines: StickyHeaderLine[];
  topOffsetClassName?: string;
  className?: string;
}

export default function StickyHeader({
  lines,
  topOffsetClassName = 'top-0',
  className = '',
}: StickyHeaderProps) {
  return (
    <div
      className={`sticky ${topOffsetClassName} z-10 bg-white border-b border-gray-200 px-8 py-3 ${className}`.trim()}
    >
      {lines.map((line, index) => (
        <div key={`${index}-${String(line.content)}`} className={line.className}>
          {line.content}
        </div>
      ))}
    </div>
  );
}

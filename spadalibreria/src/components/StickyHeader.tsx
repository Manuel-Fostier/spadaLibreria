'use client';

import React from 'react';
import { GLOSSARY_LEFT_PADDING } from './GlossaryContent';

/**
 * One line rendered inside the sticky header.
 *
 * Use `content` for the text or JSX, and `className` to style that specific line.
 */
interface StickyHeaderLine {
  content: React.ReactNode;
  className?: string;
}

/**
 * Props for the sticky header container.
 *
 * `lines` is an ordered list of rows. Each row can have its own style via
 * `StickyHeaderLine.className`, which makes multi-line headers easy to build.
 */
interface StickyHeaderProps {
  lines: StickyHeaderLine[];
  topOffsetClassName?: string;
  className?: string;
}

/**
 * Sticky header that stays pinned while scrolling.
 *
 * Example usage (multi-line with per-line styles):
 * - Line 1: title in bold
 * - Line 2: subtitle in smaller, muted text
 */
export default function StickyHeader({
  lines,
  topOffsetClassName = 'top-0',
  className = '',
}: StickyHeaderProps) {
  return (
    <div
      className={`sticky ${topOffsetClassName} z-10 bg-white border-b border-gray-200 ${GLOSSARY_LEFT_PADDING} py-3 ${className}`.trim()}
    >
      {lines.map((line, index) => (
        <div key={`${index}-${String(line.content)}`} className={line.className}>
          {line.content}
        </div>
      ))}
    </div>
  );
}

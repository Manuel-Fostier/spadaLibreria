'use client';

import Image from 'next/image';
import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GlossaryLink from './GlossaryLink';
import { GlossaryEntry } from '@/lib/dataLoader';
import { SearchQuery } from '@/types/search';
import { findMatches } from '@/lib/highlighter';

interface MarkdownRendererProps {
  text: string;
  glossaryData: { [key: string]: GlossaryEntry };
  highlightQuery?: SearchQuery | null;
}

/**
 * MarkdownRenderer handles Markdown text with:
 * - Glossary terms in {term} syntax
 * - Search highlighting
 * - Standard Markdown features (headings, bold, italic, lists, links, images)
 */
// --- Helpers and config outside the component ---
const remarkPlugins = [remarkGfm];

function renderHighlightedText(content: string, highlightQuery?: SearchQuery | null): React.ReactNode {
  if (!highlightQuery || !content) return content;
  const searchMatches = findMatches(
    content,
    highlightQuery.queryText,
    highlightQuery.options,
    highlightQuery.variants
  );
  if (searchMatches.length === 0) return content;
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  searchMatches.forEach((match, i) => {
    if (match.start > lastIndex) {
      result.push(content.slice(lastIndex, match.start));
    }
    result.push(
      <span key={`${i}-match`} className="bg-yellow-200 text-gray-900 font-semibold rounded-sm px-0.5">
        {content.slice(match.start, match.end)}
      </span>
    );
    lastIndex = match.end;
  });
  if (lastIndex < content.length) {
    result.push(content.slice(lastIndex));
  }
  return <>{result}</>;
}

function processTextWithGlossary(text: string, glossaryData: { [key: string]: GlossaryEntry }, highlightQuery?: SearchQuery | null): React.ReactNode {
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, index) => {
    if (part.startsWith('{') && part.endsWith('}')) {
      const key = part.slice(1, -1);
      const glossaryEntry = glossaryData[key];
      const displayLabel = glossaryEntry ? glossaryEntry.term : key;
      return (
        <GlossaryLink key={index} termKey={key} glossaryData={glossaryData}>
          {renderHighlightedText(displayLabel, highlightQuery)}
        </GlossaryLink>
      );
    }
    return <span key={index}>{renderHighlightedText(part, highlightQuery)}</span>;
  });
}

function processChildren(children: React.ReactNode, glossaryData: { [key: string]: GlossaryEntry }, highlightQuery?: SearchQuery | null): React.ReactNode {
  if (typeof children === 'string') {
    return processTextWithGlossary(children, glossaryData, highlightQuery);
  }
  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child === 'string') {
        return <React.Fragment key={index}>{processTextWithGlossary(child, glossaryData, highlightQuery)}</React.Fragment>;
      }
      return child;
    });
  }
  return children;
}

import { ImgHTMLAttributes } from 'react';
// ...existing code...

function getMarkdownComponents(glossaryData: { [key: string]: GlossaryEntry }, highlightQuery?: SearchQuery | null) {
  return {
    p: ({ children }: { children?: React.ReactNode }) => {
      if (!children || (typeof children === 'string' && !children.trim())) {
        return null;
      }
      return <p className="leading-relaxed mb-1 last:mb-0">{processChildren(children, glossaryData, highlightQuery)}</p>;
    },
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-2xl font-bold mb-1 mt-2 first:mt-0">{processChildren(children, glossaryData, highlightQuery)}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-xl font-bold mb-1 mt-2 first:mt-0">{processChildren(children, glossaryData, highlightQuery)}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-lg font-bold mb-1 mt-1 first:mt-0">{processChildren(children, glossaryData, highlightQuery)}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-base font-bold mb-1 mt-1 first:mt-0">{processChildren(children, glossaryData, highlightQuery)}</h4>
    ),
    h5: ({ children }: { children?: React.ReactNode }) => (
      <h5 className="text-sm font-bold mb-1 mt-1 first:mt-0">{processChildren(children, glossaryData, highlightQuery)}</h5>
    ),
    h6: ({ children }: { children?: React.ReactNode }) => (
      <h6 className="text-xs font-bold mb-1 mt-1 first:mt-0">{processChildren(children, glossaryData, highlightQuery)}</h6>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-bold">{processChildren(children, glossaryData, highlightQuery)}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{processChildren(children, glossaryData, highlightQuery)}</em>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-1 last:mb-0">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-1 last:mb-0">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="leading-relaxed mb-0">{processChildren(children, glossaryData, highlightQuery)}</li>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline"
        target="_blank" 
        rel="noopener noreferrer"
      >
        {processChildren(children, glossaryData, highlightQuery)}
      </a>
    ),
    img: ({ src, alt, width, height, className }: ImgHTMLAttributes<HTMLImageElement>) => {
      if (!src || typeof src !== 'string') return null;

      const resolvedWidth = typeof width === 'string' ? Number.parseInt(width, 10) : width;
      const resolvedHeight = typeof height === 'string' ? Number.parseInt(height, 10) : height;

      return (
        <Image
          src={src}
          alt={alt ?? ''}
          width={resolvedWidth || 800}
          height={resolvedHeight || 600}
          className={['max-w-full h-auto rounded-lg my-4', className].filter(Boolean).join(' ')}
        />
      );
    },
  };
}

// --- Main component ---
export default function MarkdownRenderer({ text, glossaryData, highlightQuery }: MarkdownRendererProps) {
  if (!text) return null;
  return (
    <div className="prose prose-markdown prose-p:text-justify">
      <Markdown
        remarkPlugins={remarkPlugins}
        components={getMarkdownComponents(glossaryData, highlightQuery)}
      >
        {text}
      </Markdown>
    </div>
  );
}
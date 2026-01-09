'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Term from './Term';
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
export default function MarkdownRenderer({ text, glossaryData, highlightQuery }: MarkdownRendererProps) {
  if (!text) return null;

  // Pre-process text to handle glossary terms
  // Replace {term} with a special marker that won't be affected by Markdown parsing
  const glossaryPattern = /\{([^}]+)\}/g;
  const matches: Array<{ key: string; index: number; length: number }> = [];
  let match;
  
  while ((match = glossaryPattern.exec(text)) !== null) {
    matches.push({
      key: match[1],
      index: match.index,
      length: match[0].length
    });
  }

  // Function to render highlighted text
  const renderHighlightedText = (content: string): React.ReactNode => {
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

  // Custom components for ReactMarkdown
  const components = {
    // Override text rendering to handle glossary terms and highlighting
    p: ({ children }: { children?: React.ReactNode }) => {
      return <p className="leading-relaxed mb-2 last:mb-0">{processChildren(children)}</p>;
    },
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-2xl font-bold mb-2 mt-3 first:mt-0">{processChildren(children)}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-xl font-bold mb-2 mt-3 first:mt-0">{processChildren(children)}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-lg font-bold mb-2 mt-2 first:mt-0">{processChildren(children)}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-base font-bold mb-1 mt-2 first:mt-0">{processChildren(children)}</h4>
    ),
    h5: ({ children }: { children?: React.ReactNode }) => (
      <h5 className="text-sm font-bold mb-1 mt-2 first:mt-0">{processChildren(children)}</h5>
    ),
    h6: ({ children }: { children?: React.ReactNode }) => (
      <h6 className="text-xs font-bold mb-1 mt-1 first:mt-0">{processChildren(children)}</h6>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-bold">{processChildren(children)}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{processChildren(children)}</em>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-2 last:mb-0">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-2 last:mb-0">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="leading-relaxed mb-0">{processChildren(children)}</li>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline"
        target="_blank" 
        rel="noopener noreferrer"
      >
        {processChildren(children)}
      </a>
    ),
    img: ({ src, alt }: { src?: string; alt?: string }) => {
      if (!src) return null;
      // For external images or local images in markdown
      // Using standard img for flexibility with markdown image sources
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img 
          src={src} 
          alt={alt || ''} 
          className="max-w-full h-auto rounded-lg my-4"
        />
      );
    },
  };

  // Process children to handle glossary terms and highlighting
  function processChildren(children: React.ReactNode): React.ReactNode {
    if (typeof children === 'string') {
      return processTextWithGlossary(children);
    }
    
    if (Array.isArray(children)) {
      return children.map((child, index) => {
        if (typeof child === 'string') {
          return <React.Fragment key={index}>{processTextWithGlossary(child)}</React.Fragment>;
        }
        return child;
      });
    }
    
    return children;
  }

  // Process text to extract glossary terms and apply highlighting
  function processTextWithGlossary(text: string): React.ReactNode {
    const parts = text.split(/(\{[^}]+\})/g);
    
    return parts.map((part, index) => {
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
    });
  }

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

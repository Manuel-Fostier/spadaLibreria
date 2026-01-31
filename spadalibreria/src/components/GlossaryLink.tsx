'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { GlossaryEntry } from '@/lib/dataLoader';
import { useAnnotationDisplay } from '@/contexts/AnnotationDisplayContext';
import { mapTermTypeToAnnotation } from '@/lib/termTypeMapping';

interface GlossaryLinkProps {
  termKey: string;
  glossaryData: { [key: string]: GlossaryEntry };
  children: React.ReactNode;
}

/**
 * GlossaryLink - Clickable glossary term link for treatise text
 * 
 * Simple link to glossary page with hash fragment for direct term navigation.
 * Phase 2: Basic navigation (T121)
 * Phase 3: Hash fragments for direct navigation (T143) - no tooltip behavior
 */
export default function GlossaryLink({ termKey, glossaryData, children }: GlossaryLinkProps) {
  const entry = glossaryData[termKey];
  const displayText = entry?.term || children;
  const { getAnnotation } = useAnnotationDisplay();

  const annotationType = entry ? mapTermTypeToAnnotation(entry.type) : 'techniques';
  const annotation = getAnnotation(annotationType);
  const termColor = useMemo(
    () => (annotation?.getTextStyle().color as string) || '#2563eb',
    [annotation]
  );

  return (
    <Link 
      href={`/glossary#${termKey}`} 
      className="underline decoration-dotted underline-offset-2 hover:opacity-80"
      style={{ color: termColor }}
    >
      {displayText}
    </Link>
  );
}

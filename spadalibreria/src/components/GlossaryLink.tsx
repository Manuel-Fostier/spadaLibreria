'use client';

import React from 'react';
import Link from 'next/link';
import Term from './Term';
import { GlossaryEntry } from '@/lib/dataLoader';

interface GlossaryLinkProps {
  termKey: string;
  glossaryData: { [key: string]: GlossaryEntry };
  children: React.ReactNode;
}

/**
 * GlossaryLink - Clickable glossary term link for treatise text
 * 
 * Wraps the existing Term tooltip behavior with a link to /glossary.
 * Phase 2: Basic navigation (T121)
 * Phase 3: Supports URL hash fragments (T143) for direct navigation to specific terms
 *          with auto-scroll on arrival. Uses termKey as URL hash identifier.
 */
export default function GlossaryLink({ termKey, glossaryData, children }: GlossaryLinkProps) {
  return (
    <Link href={`/glossary#${termKey}`} className="inline-flex">
      <Term termKey={termKey} glossaryData={glossaryData}>
        {children}
      </Term>
    </Link>
  );
}

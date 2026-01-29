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
 * Phase 2: Basic navigation only (no hash fragment / auto-scroll yet).
 */
export default function GlossaryLink({ termKey, glossaryData, children }: GlossaryLinkProps) {
  return (
    <Link href="/glossary" className="inline-flex">
      <Term termKey={termKey} glossaryData={glossaryData}>
        {children}
      </Term>
    </Link>
  );
}

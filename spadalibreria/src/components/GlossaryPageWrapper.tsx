'use client';

import React from 'react';
import { GlossaryProvider } from '@/contexts/GlossaryContext';

interface GlossaryPageWrapperProps {
  children: React.ReactNode;
}

/**
 * GlossaryPageWrapper - Provides GlossaryContext to its children
 * 
 * This wrapper component encapsulates the GlossaryProvider,
 * making it easy to wrap the glossary page with the necessary context.
 */
export default function GlossaryPageWrapper({ children }: GlossaryPageWrapperProps) {
  return (
    <GlossaryProvider>
      {children}
    </GlossaryProvider>
  );
}

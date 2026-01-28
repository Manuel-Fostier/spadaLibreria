import React from 'react';
import GlossaryPageWrapper from '@/components/GlossaryPageWrapper';
import GlossaryPage from '@/components/GlossaryPage';

/**
 * Glossary Page Route - /glossary
 * 
 * Server component that wraps the client-side GlossaryPage with GlossaryProvider context.
 * This ensures the glossary has access to all necessary state management.
 * 
 * Features (French-only):
 * - Browse all glossary terms organized by Category → Type → Term
 * - Search across term names, categories, and definitions (French content only)
 * - Real-time search highlighting
 * - All information visible in unified single view (no expand/collapse)
 */
export default function GlossaryRoute() {
  return (
    <GlossaryPageWrapper>
      <GlossaryPage />
    </GlossaryPageWrapper>
  );
}

export const metadata = {
  title: 'Glossaire | Spada Libreria',
  description: 'Glossaire complet de la terminologie d\'escrime bolognaise',
};

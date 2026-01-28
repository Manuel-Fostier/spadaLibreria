import React from 'react';
import GlossaryPageWrapper from '@/components/GlossaryPageWrapper';
import GlossaryPage from '@/components/GlossaryPage';

/**
 * Glossary Page Route - /glossary
 * 
 * Server component that wraps the client-side GlossaryPage with GlossaryProvider context.
 * This ensures the glossary has access to all necessary state management.
 * 
 * Features:
 * - Browse all glossary terms organized by Category → Type → Term
 * - Search across term names, categories, and definitions
 * - Switch between Italian, French, and English
 * - Real-time search highlighting
 */
export default function GlossaryRoute() {
  return (
    <GlossaryPageWrapper>
      <GlossaryPage />
    </GlossaryPageWrapper>
  );
}

export const metadata = {
  title: 'Glossary | Spada Libreria',
  description: 'Comprehensive glossary of Bolognese fencing terminology in Italian, French, and English',
};

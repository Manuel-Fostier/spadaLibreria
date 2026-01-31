'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlossary } from '@/contexts/GlossaryContext';
import GlossarySearchBar from './GlossarySearchBar';
import GlossaryContent from './GlossaryContent';
import LogoTitle from './LogoTitle';
import StickyHeader from './StickyHeader';
import { useStickyHeaderTracking } from '@/hooks/useStickyHeaderTracking';

/**
 * GlossaryPage - Main glossary page component (French-only mode)
 * 
 * Assembles all glossary sub-components:
 * - GlossarySearchBar: Search input with debouncing and clear button
 * - GlossaryContent: Hierarchical display of all terms (Category → Type → Term)
 * 
 * No LanguageSelector is included as this is a French-only glossary.
 * All content is displayed in a unified, always-visible view (no expand/collapse).
 * 
 * Phase 3: Supports URL hash fragments (e.g., `/glossary#mandritto`) for direct navigation
 * to specific terms. Uses native browser hash navigation for simplicity.
 * 
 * This component must be wrapped with GlossaryPageWrapper to provide GlossaryContext.
 */
const STICKY_HEADER_HEIGHT = 60; // Approximate sticky header height
const BASE_SCROLL_MARGIN = 24;
const TOTAL_SCROLL_OFFSET = STICKY_HEADER_HEIGHT + BASE_SCROLL_MARGIN;

export default function GlossaryPage() {
  const { groupedTerms, searchQuery, isLoading, error } = useGlossary();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentHeader, setCurrentHeader] = useState<{ category: string; type: string } | null>(null);

  const initialHeader = useMemo(() => {
    const categoryEntries = Object.entries(groupedTerms);
    if (categoryEntries.length === 0) return null;
    const [firstCategory, firstTypeGroup] = categoryEntries[0];
    const typeEntries = Object.entries(firstTypeGroup);
    if (typeEntries.length === 0) return null;
    const [firstType] = typeEntries[0];
    return { category: firstCategory, type: firstType };
  }, [groupedTerms]);

  useEffect(() => {
    if (!currentHeader && initialHeader) {
      setCurrentHeader(initialHeader);
    }
  }, [currentHeader, initialHeader]);

  // Handle hash navigation for scrolling to specific terms
  useEffect(() => {
    const scrollToHash = () => {
      if (typeof window === 'undefined') return;
      
      const hash = window.location.hash.slice(1); // Remove leading #
      if (hash && scrollContainerRef.current) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          const targetElement = document.getElementById(hash);
          if (targetElement && scrollContainerRef.current) {
            // Get the target element's position relative to the scroll container
            const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
            const elementTop = targetElement.getBoundingClientRect().top;
            const scrollOffset = elementTop - containerTop - TOTAL_SCROLL_OFFSET;
            
            scrollContainerRef.current.scrollBy({
              top: scrollOffset,
              behavior: 'instant'
            });
          }
        });
      }
    };

    // Scroll on initial load
    scrollToHash();

    // Listen for hash changes
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, [groupedTerms]); // Re-run when terms load

  // Track section at top of viewport for sticky header
  useStickyHeaderTracking(scrollContainerRef, {
    stickyOffset: STICKY_HEADER_HEIGHT,
    onSectionChange: (sectionId) => {
      if (sectionId) {
        // Parse data-glossary-category and data-glossary-type from the section element
        const element = scrollContainerRef.current?.querySelector(
          `[data-glossary-type="${sectionId}"]`
        ) as HTMLElement;
        if (element) {
          const category = element.getAttribute('data-glossary-category');
          const type = element.getAttribute('data-glossary-type');
          if (category && type) {
            setCurrentHeader({ category, type });
          }
        }
      }
    },
    contentDependency: groupedTerms
  });

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Glossary</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <p className="text-gray-600">Loading glossary...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Top Bar */}
      <header className="h-20 bg-white flex items-center px-8 justify-start gap-8 border-b border-gray-100">
        <LogoTitle />
        <div className="flex-1 text-center">
          <h2 className="text-lg font-semibold text-gray-900">GLOSSAIRE</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-8 py-3 bg-white border-b border-gray-100">
        <GlossarySearchBar />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-white" ref={scrollContainerRef}>
        {currentHeader && (
          <StickyHeader
            lines={[
              {
                content: currentHeader.category,
                className: 'text-base font-bold uppercase tracking-wider text-gray-900',
              },
              {
                content: currentHeader.type,
                className: 'text-sm text-gray-600',
              },
            ]}
          />
        )}

        <div className="max-w-full mx-auto p-8 lg:p-12 space-y-8">
          <GlossaryContent
            groupedTerms={groupedTerms}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  );
}

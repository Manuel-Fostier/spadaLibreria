
  'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlossary } from '@/contexts/GlossaryContext';
import GlossarySearchBar from './GlossarySearchBar';
import GlossaryContent from './GlossaryContent';
import LogoTitle from './LogoTitle';
import StickyHeader from './StickyHeader';
import { GLOSSARY_CATEGORY_STYLE, GLOSSARY_TYPE_STYLE, GLOSSARY_LEFT_PADDING } from './GlossaryContent';
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
const HEADER_HEIGHT = 80; // Approximate header height
const SEARCH_BAR_HEIGHT = 71; // Approximate search bar height
const STICKY_HEADER_HEIGHT = 85; // Approximate sticky header height
const TOTAL_SCROLL_OFFSET = HEADER_HEIGHT + SEARCH_BAR_HEIGHT + STICKY_HEADER_HEIGHT;

export default function GlossaryPage() {
  const { groupedTerms, searchQuery, isLoading, error } = useGlossary();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentHeader, setCurrentHeader] = useState<{ category: string; type: string } | null>(null);

  const initialHeader = {
    category: "Catégorie par défaut",
    type: "Type par défaut"
  };

  /**
   * Initialise ou réinitialise currentHeader
   * Est appelé lorsque currentHeader ou initialHeader change ou lors de l'initialisation.
   */
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
  useStickyHeaderTracking(
    scrollContainerRef,
    TOTAL_SCROLL_OFFSET,
    (sectionId) => {
      if (sectionId) {
        // Parse data-glossary-category and data-glossary-type from the section element
        const element = scrollContainerRef.current?.querySelector(
          `[data-section-id="${sectionId}"]`
        ) as HTMLElement;
        if (element) {
          const category = element.getAttribute('data-glossary-category');
          let type = element.getAttribute('data-glossary-type');
          // Si type est null ou vide, on met type à ''
          if (!type) type = '';
          if (category) {
            setCurrentHeader({ category, type });
          }
        }
      } else {
        setCurrentHeader(initialHeader);
      }
    },
    groupedTerms
  );
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
                className: GLOSSARY_CATEGORY_STYLE, // h2 style
              },
              ...(
                currentHeader.type && currentHeader.type.trim() !== ''
                  ? [{
                      content: currentHeader.type,
                      className: GLOSSARY_TYPE_STYLE, // h3 style
                    }]
                  : []
              )
            ]}
          />
        )}

        <div className={`max-w-full mx-auto pb-8 lg:pb-12 ${GLOSSARY_LEFT_PADDING} space-y-8`}>
          <GlossaryContent
            groupedTerms={groupedTerms}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  );
}

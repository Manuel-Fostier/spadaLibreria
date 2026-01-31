'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlossary } from '@/contexts/GlossaryContext';
import GlossarySearchBar from './GlossarySearchBar';
import GlossaryContent from './GlossaryContent';
import LogoTitle from './LogoTitle';
import StickyHeader from './StickyHeader';

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
 * to specific terms with auto-scroll on page load.
 * 
 * This component must be wrapped with GlossaryPageWrapper to provide GlossaryContext.
 */
export default function GlossaryPage() {
  const { groupedTerms, searchQuery, isLoading, error } = useGlossary();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentHeader, setCurrentHeader] = useState<{ category: string; type: string } | null>(null);
  const [targetTermId, setTargetTermId] = useState<string | null>(null);

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

  // T141: Parse URL hash on page load and when hash changes
  useEffect(() => {
    const parseAndScrollToHash = () => {
      if (typeof window === 'undefined') return;
      
      const hash = window.location.hash.slice(1); // Remove leading #
      if (hash) {
        setTargetTermId(hash);
      }
    };

    // Parse hash on initial load
    parseAndScrollToHash();

    // Listen for hash changes
    window.addEventListener('hashchange', parseAndScrollToHash);
    return () => {
      window.removeEventListener('hashchange', parseAndScrollToHash);
    };
  }, []);

  // T142: Auto-scroll to target term when hash changes or terms load
  useEffect(() => {
    if (!targetTermId || !scrollContainerRef.current) return;

    // Use setTimeout to ensure DOM is ready after render
    const scrollTimer = setTimeout(() => {
      const targetElement = scrollContainerRef.current?.querySelector(
        `[data-term-id="${targetTermId}"]`
      ) as HTMLElement;

      if (targetElement) {
        // Calculate scroll position with offset for sticky header
        const stickyHeaderHeight = 60; // Approximate sticky header height
        const elementTop = targetElement.offsetTop - stickyHeaderHeight;
        
        scrollContainerRef.current?.scrollTo({
          top: elementTop,
          behavior: 'smooth',
        });

        // Clear target after scrolling
        setTargetTermId(null);
      }
    }, 100); // Small delay to ensure DOM is fully rendered

    return () => clearTimeout(scrollTimer);
  }, [targetTermId, groupedTerms]);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    let ticking = false;

    const updateTopSectionFromScroll = () => {
      const elements = Array.from(
        root.querySelectorAll('[data-glossary-type]')
      ) as HTMLElement[];

      if (elements.length === 0) {
        ticking = false;
        return;
      }

      const rootTop = root.getBoundingClientRect().top;
      let closest: { element: HTMLElement; distance: number } | null = null;

      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < rootTop) return;

        const distance = Math.abs(rect.top - rootTop);
        if (!closest || distance < closest.distance) {
          closest = { element, distance };
        }
      });

      if (closest) {
        const nextCategory = closest.element.getAttribute('data-glossary-category');
        const nextType = closest.element.getAttribute('data-glossary-type');
        if (nextCategory && nextType) {
          setCurrentHeader((prev) =>
            prev?.category === nextCategory && prev?.type === nextType
              ? prev
              : { category: nextCategory, type: nextType }
          );
        }
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateTopSectionFromScroll);
      }
    };

    updateTopSectionFromScroll();
    root.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      root.removeEventListener('scroll', handleScroll);
    };
  }, [groupedTerms]);

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

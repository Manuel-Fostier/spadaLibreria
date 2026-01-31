import { useEffect, useRef } from 'react';

export interface StickyHeaderTrackingOptions {
  /**
   * Height of the sticky header offset (e.g., fixed header + sticky section header).
   * Default: 110px (80px fixed header + 30px sticky section header)
   */
  stickyOffset?: number;
  
  /**
   * Callback when the current visible section changes
   */
  onSectionChange?: (sectionId: string | null) => void;
  
  /**
   * Dependency that triggers re-initialization of the tracking
   * (e.g., when content changes)
   */
  contentDependency?: any;
}

/**
 * Custom hook for tracking which section is currently at the top of the viewport
 * below a sticky header. Uses scroll events with requestAnimationFrame for performance.
 * 
 * This hook is designed to be used with elements that have `data-section-id` attributes.
 * 
 * @param scrollContainerRef - Ref to the scrollable container element
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * const scrollContainerRef = useRef<HTMLDivElement>(null);
 * 
 * useStickyHeaderTracking(scrollContainerRef, {
 *   stickyOffset: 110,
 *   onSectionChange: (sectionId) => {
 *     setTopSectionId(sectionId);
 *     setAnnotationSection(sectionId);
 *   },
 *   contentDependency: filteredContent
 * });
 * ```
 */
export function useStickyHeaderTracking(
  scrollContainerRef: React.RefObject<HTMLElement | null>,
  options: StickyHeaderTrackingOptions = {}
) {
  const {
    stickyOffset = 110,
    onSectionChange,
    contentDependency
  } = options;

  const tickingRef = useRef(false);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const updateCurrentSectionFromScroll = () => {
      tickingRef.current = false;
      const sections = Array.from(root.querySelectorAll('[data-section-id]'));
      if (sections.length === 0) {
        return;
      }

      const rootTop = root.getBoundingClientRect().top;
      let selectedId: string | null = null;

      // Find the first section whose bottom edge is below the sticky offset
      // This is the section currently visible at the top of the content area
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const relativeTop = rect.top - rootTop;
        const relativeBottom = relativeTop + rect.height;
        const currentId = section.getAttribute('data-section-id');
        if (!currentId) continue;

        // If the section's top is at or below the sticky offset, or if its bottom is below,
        // it's the current visible section
        if (relativeTop <= stickyOffset && relativeBottom > stickyOffset) {
          selectedId = currentId;
          break;
        }
      }

      // If no section found (all scrolled past), use the last one
      if (!selectedId && sections.length > 0) {
        const lastSection = sections[sections.length - 1];
        selectedId = lastSection.getAttribute('data-section-id');
      }

      if (selectedId && onSectionChange) {
        onSectionChange(selectedId);
      }
    };

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(updateCurrentSectionFromScroll);
      }
    };

    updateCurrentSectionFromScroll();
    root.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      root.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainerRef, stickyOffset, onSectionChange, contentDependency]);
}

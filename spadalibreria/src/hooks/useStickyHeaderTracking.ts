import { useEffect, useRef } from 'react';



/**
 * Custom hook for tracking which section is currently at the top of the viewport
 * below a sticky header. Uses scroll events with requestAnimationFrame for performance.
 * 
 * This hook is designed to be used with elements that have `data-section-id` attributes.
 * 
 * @param scrollContainerRef - Ref to the scrollable container element
 * @param stickyOffset - Height of the sticky header offset (e.g., fixed header + sticky section header)
 * @param onSectionChange - Callback when the current visible section changes
 * @param contentDependency - Dependency that triggers re-initialization of the tracking (e.g., when content changes)
 *
 * @example
 * ```tsx
 * const scrollContainerRef = useRef<HTMLDivElement>(null);
 *
 * useStickyHeaderTracking(
 *   scrollContainerRef,
 *   110,
 *   (sectionId) => {
 *     setTopSectionId(sectionId);
 *     setAnnotationSection(sectionId);
 *   },
 *   filteredContent
 * );
 * ```
 */

export function useStickyHeaderTracking(
  scrollContainerRef: React.RefObject<HTMLElement | null>,
  stickyOffset: number,
  onSectionChange: (sectionId: string | null) => void,
  contentDependency: any
) {

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

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const relativeTop = rect.top - rootTop;
        const relativeBottom = relativeTop + rect.height;
        const currentId = section.getAttribute('data-section-id');
        if (!currentId) continue;
        if (relativeTop <= stickyOffset && relativeBottom > stickyOffset) {
          selectedId = currentId;
          break;
        }
      }

      if (selectedId) {
        // eslint-disable-next-line no-console
        console.log('[useStickyHeaderTracking DEBUG] onSectionChange called with:', selectedId);
        onSectionChange(selectedId);
      }
      // Si aucune section n'est visible, ne change rien (pas de fallback)
    };

    const handleScroll = () => {
      // DEBUG: log scrollContainer and scrollTop at each scroll
      if (root) {
        // eslint-disable-next-line no-console
        console.log('[useStickyHeaderTracking DEBUG] scrollContainer:', root.tagName, 'scrollTop:', root.scrollTop);
      }
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

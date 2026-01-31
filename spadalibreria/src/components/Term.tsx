'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GlossaryEntry } from '@/lib/dataLoader';
import { useAnnotationDisplay } from '@/contexts/AnnotationDisplayContext';
import { mapTermTypeToAnnotation } from '@/lib/termTypeMapping';

interface TermProps {
  termKey: string;
  children: React.ReactNode;
  glossaryData: { [key: string]: GlossaryEntry };
}

// --- Gestion globale d'une seule tooltip active ---
let globalActiveTerm: string | null = null;
const globalListeners = new Set<() => void>();
function setGlobalActiveTerm(next: string | null) {
  globalActiveTerm = next;
  globalListeners.forEach(l => l());
}

export default function Term({ termKey, children, glossaryData }: TermProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
  const [tooltipAlignment, setTooltipAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const { getAnnotation } = useAnnotationDisplay();
  
  const data = glossaryData[termKey];

  // Get the annotation instance for this term based on its type
  const annotationType = data ? mapTermTypeToAnnotation(data.type) : 'techniques';
  const annotation = getAnnotation(annotationType);

  const termColor = useMemo(
    () => (annotation?.getTextStyle().color as string) || '#6366f1',
    [annotation]
  );

  const updateTooltipPosition = () => {
    if (!spanRef.current) return;
    const rect = spanRef.current.getBoundingClientRect();
    setTooltipRect(rect);
    const spaceAbove = rect.top;

    const nextVertical = spaceAbove < 400 ? 'bottom' : 'top';
    setTooltipPosition(nextVertical);

    const tooltipWidth = 800; // largeur prévue
    const viewportWidth = window.innerWidth;
    const margin = 16; // marge latérale sécuritaire

    let containerRect: DOMRect | null = null;
    let el: HTMLElement | null = spanRef.current.parentElement;
    while (el) {
      const r = el.getBoundingClientRect();
      if (r.width < viewportWidth - 100 && r.width > 400) {
        containerRect = r;
        break;
      }
      el = el.parentElement;
    }
    if (!containerRect) {
      const main = document.querySelector('main');
      if (main) {
        const r = main.getBoundingClientRect();
        if (r.width < viewportWidth - 100 && r.width > 400) containerRect = r as DOMRect;
      }
    }

    let spaceLeft: number;
    let spaceRight: number;
    if (containerRect) {
      spaceLeft = rect.left - containerRect.left;
      spaceRight = containerRect.right - rect.right;
    } else {
      spaceLeft = rect.left;
      spaceRight = viewportWidth - rect.right;
    }

    const centerHalfLeft = containerRect ? (rect.left + rect.width / 2 - containerRect.left) : (rect.left + rect.width / 2);
    const centerHalfRight = containerRect ? (containerRect.right - (rect.left + rect.width / 2)) : (viewportWidth - (rect.left + rect.width / 2));
    const spaceCenter = Math.min(centerHalfLeft, centerHalfRight) * 2;

    const thresholdEdge = 180; // seuil : si proche bord gauche/droite du conteneur

    const canCenter = spaceCenter >= tooltipWidth + margin * 2;
    const canAlignLeft = spaceRight >= tooltipWidth + margin;
    const canAlignRight = spaceLeft >= tooltipWidth + margin;

    let nextHorizontal: 'left' | 'center' | 'right' = 'center';
    if (canCenter) {
      if (spaceLeft < thresholdEdge) nextHorizontal = 'left';
      else if (spaceRight < thresholdEdge) nextHorizontal = 'right';
      else nextHorizontal = 'center';
    } else if (canAlignLeft) {
      nextHorizontal = 'left';
    } else if (canAlignRight) {
      nextHorizontal = 'right';
    } else {
      nextHorizontal = 'left';
    }

    setTooltipAlignment(nextHorizontal);
  };

  // Fermer la tooltip en cliquant n'importe où hors du terme
  useEffect(() => {
    if (!showTooltip) return;
    const handleDocumentMouseDown = (e: MouseEvent) => {
      if (!spanRef.current) return;
      // Si le clic n'est pas à l'intérieur du wrapper du terme -> fermer
      if (!spanRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
        if (globalActiveTerm === termKey) setGlobalActiveTerm(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTooltip(false);
        if (globalActiveTerm === termKey) setGlobalActiveTerm(null);
      }
    };
    document.addEventListener('mousedown', handleDocumentMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTooltip, termKey]);

  // Synchroniser l'état local avec l'état global pour une seule tooltip visible
  useEffect(() => {
    const listener = () => {
      // Si un autre terme (différent) est devenu actif -> masquer cette tooltip
      if (globalActiveTerm !== termKey && showTooltip) {
        setShowTooltip(false);
      }
    };
    globalListeners.add(listener);
    return () => {
      globalListeners.delete(listener);
    };
  }, [termKey, showTooltip]);

  if (!data) {
    return (
      <span className="text-red-500 font-medium" title="Terme manquant">
        {children}
      </span>
    );
  }

  return (
    <span 
      ref={spanRef}
      className="relative inline-block cursor-help group"
      onMouseDown={() => {
        // Ne pas ouvrir si une autre tooltip est déjà active
        if (globalActiveTerm !== null && globalActiveTerm !== termKey) {
          console.log('⛔ Tooltip already open, ignoring hover');
          return;
        }
        // Activer globalement ce terme et afficher localement cette instance
        setGlobalActiveTerm(termKey);
        updateTooltipPosition();
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        // On ne masque plus immédiatement (persistance jusqu'au clic extérieur)
      }}
    >
      <span 
        className="font-medium border-b transition-colors"
        style={{ 
          color: termColor,
          borderBottomColor: `${termColor}33`, // 20% opacity for border
        }}
      >
        {children}
      </span>
      
      {showTooltip && tooltipRect && createPortal(
        <div 
          className={`fixed z-50 w-[800px] max-w-[calc(100vw-32px)] p-0 bg-white text-gray-800 text-sm border border-gray-200 shadow-xl rounded-lg overflow-hidden`}
          style={{
            top: tooltipPosition === 'top' 
              ? `${tooltipRect.top - 12}px` 
              : `${tooltipRect.bottom + 12}px`,
            left: tooltipAlignment === 'center'
              ? `${tooltipRect.left + tooltipRect.width / 2}px`
              : tooltipAlignment === 'left'
              ? `${tooltipRect.left + 40}px`
              : `${tooltipRect.right - 800 - 40}px`,
            transform: tooltipAlignment === 'center' 
              ? 'translateX(-50%)' 
              : 'translateX(0)',
          }}
        >
          <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-bold text-gray-900 text-base">{data.term}</span>
            <span className="text-xs uppercase tracking-wider text-indigo-600 font-bold px-2 py-1 bg-indigo-50 rounded">
              {data.type}
            </span>
          </div>
          
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase">FR</span>
                <span className="text-xs font-semibold text-gray-700 italic">&ldquo;{data.translation.fr}&rdquo;</span>
              </div>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line text-justify">{data.definition.fr}</div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GlossaryEntry } from '@/lib/dataLoader';

interface TermProps {
  termKey: string;
  children: React.ReactNode;
  glossaryData: { [key: string]: GlossaryEntry };
}

export default function Term({ termKey, children, glossaryData }: TermProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
  const [tooltipAlignment, setTooltipAlignment] = useState<'left' | 'center' | 'right'>('center');
  const spanRef = useRef<HTMLSpanElement>(null);
  
  const data = glossaryData[termKey];

  useEffect(() => {
    console.log('🔄 useEffect triggered - showTooltip:', showTooltip, 'termKey:', termKey);
    if (showTooltip && spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // Position verticale
      const nextVertical = spaceAbove < 400 ? 'bottom' : 'top';
      setTooltipPosition(nextVertical);
      console.log('🔍 Position Debug:', { termKey, spaceAbove, spaceBelow, nextVertical });

      const tooltipWidth = 800; // largeur prévue
      const viewportWidth = window.innerWidth;
      const margin = 16; // marge latérale sécuritaire

      // Recherche d'un conteneur de texte plus étroit que le viewport (ex: colonne centrale)
      let containerRect: DOMRect | null = null;
      let el: HTMLElement | null = spanRef.current.parentElement;
      while (el) {
        const r = el.getBoundingClientRect();
        // heuristique: largeur inférieure au viewport - 100 et supérieure à 400 (évite petits wrappers)
        if (r.width < viewportWidth - 100 && r.width > 400) {
          containerRect = r;
          break;
        }
        el = el.parentElement;
      }
      if (!containerRect) {
        // fallback: tenter main ou article
        const main = document.querySelector('main');
        if (main) {
          const r = main.getBoundingClientRect();
          if (r.width < viewportWidth - 100 && r.width > 400) containerRect = r as DOMRect;
        }
      }

      // Espace calculé relatif au conteneur ou au viewport si pas trouvé
      let spaceLeft: number;
      let spaceRight: number;
      if (containerRect) {
        spaceLeft = rect.left - containerRect.left;
        spaceRight = containerRect.right - rect.right;
      } else {
        spaceLeft = rect.left;
        spaceRight = viewportWidth - rect.right;
      }

      // Largeur utilisable pour centrer (doublée car on prend le min des demi-espaces)
      const centerHalfLeft = containerRect ? (rect.left + rect.width / 2 - containerRect.left) : (rect.left + rect.width / 2);
      const centerHalfRight = containerRect ? (containerRect.right - (rect.left + rect.width / 2)) : (viewportWidth - (rect.left + rect.width / 2));
      const spaceCenter = Math.min(centerHalfLeft, centerHalfRight) * 2;

      const thresholdEdge = 180; // seuil : si proche bord gauche/droite du conteneur

      const canCenter = spaceCenter >= tooltipWidth + margin * 2;
      const canAlignLeft = spaceRight >= tooltipWidth + margin;
      const canAlignRight = spaceLeft >= tooltipWidth + margin;

      console.log('📐 Alignment Debug (container mode):', {
        containerWidth: containerRect?.width ?? viewportWidth,
        containerLeft: containerRect?.left ?? 0,
        spaceLeft,
        spaceRight,
        spaceCenter,
        tooltipWidth,
        canCenter,
        canAlignLeft,
        canAlignRight,
        thresholdEdge
      });

      let nextHorizontal: 'left' | 'center' | 'right' = 'center';
      if (canCenter) {
        // Même si on peut centrer, si très proche du bord gauche, on préfère aligner à gauche
        if (spaceLeft < thresholdEdge) nextHorizontal = 'left';
        else if (spaceRight < thresholdEdge) nextHorizontal = 'right';
        else nextHorizontal = 'center';
      } else if (canAlignLeft) {
        nextHorizontal = 'left';
      } else if (canAlignRight) {
        nextHorizontal = 'right';
      } else {
        // Dernier recours: aligner à gauche et laisser le overflow-y gérer la lecture
        nextHorizontal = 'left';
      }

      console.log('✅ Chosen horizontal alignment:', nextHorizontal);
      setTooltipAlignment(nextHorizontal);
    }
  }, [showTooltip, termKey]);

  if (!data) {
    return (
      <span className="text-red-500 font-medium" title="Terme manquant">
        {children}
      </span>
    );
  }

  const verticalClasses = tooltipPosition === 'top'
    ? 'bottom-full mb-3'
    : 'top-full mt-3';

  // Classes d'alignement horizontal
  const horizontalClasses = 
    tooltipAlignment === 'left' 
      ? 'left-0' 
      : tooltipAlignment === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <span 
      ref={spanRef}
      className="relative inline-block cursor-help group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-indigo-600 font-medium border-b border-indigo-200 hover:border-indigo-600 transition-colors">
        {children}
      </span>
      
      {showTooltip && (
        <div 
          className={`absolute z-50 ${verticalClasses} ${horizontalClasses} w-[800px] max-w-[calc(100vw-32px)] p-0 bg-white text-gray-800 text-sm border border-gray-200 shadow-xl pointer-events-none rounded-lg overflow-hidden`}
          style={tooltipAlignment === 'left' ? { transform: 'translateX(40px)' } : undefined}
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
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-justify">{data.definition.fr}</p>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
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
    if (showTooltip && spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      
      setTooltipPosition(spaceAbove < 400 ? 'bottom' : 'top');
      
      const tooltipWidth = 800;
      const viewportWidth = window.innerWidth;
      const margin = 16;
      
      // Calculer l'espace disponible de chaque côté du terme
      const spaceLeft = rect.left;
      const spaceRight = viewportWidth - rect.right;
      const spaceCenter = Math.min(
        rect.left + rect.width / 2,
        viewportWidth - (rect.left + rect.width / 2)
      ) * 2;
      
      // Déterminer le meilleur alignement
      if (spaceCenter >= tooltipWidth + margin * 2) {
        // Assez d'espace pour centrer
        setTooltipAlignment('center');
      } else if (spaceRight >= tooltipWidth + margin) {
        // Assez d'espace à droite, aligner à gauche du terme
        setTooltipAlignment('left');
      } else if (spaceLeft >= tooltipWidth + margin) {
        // Assez d'espace à gauche, aligner à droite du terme
        setTooltipAlignment('right');
      } else {
        // Pas assez d'espace, centrer quand même (avec réduction de largeur)
        setTooltipAlignment('center');
      }
    }
  }, [showTooltip]);

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
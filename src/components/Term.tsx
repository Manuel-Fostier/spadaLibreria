'use client';

import React, { useState } from 'react';
import { GlossaryEntry } from '@/lib/dataLoader';

interface TermProps {
  termKey: string;
  children: React.ReactNode;
  glossaryData: { [key: string]: GlossaryEntry };
}

export default function Term({ termKey, children, glossaryData }: TermProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const data = glossaryData[termKey];

  if (!data) {
    return (
      <span className="text-red-500 font-medium" title="Terme manquant">
        {children}
      </span>
    );
  }

  return (
    <span 
      className="relative inline-block cursor-help group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-indigo-600 font-medium border-b border-indigo-200 hover:border-indigo-600 transition-colors">
        {children}
      </span>
      
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-80 p-0 bg-white text-gray-800 text-sm border border-gray-200 shadow-xl pointer-events-none rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-bold text-gray-900 text-base">{data.term}</span>
            <span className="text-xs uppercase tracking-wider text-indigo-600 font-bold px-2 py-1 bg-indigo-50 rounded">
              {data.type}
            </span>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-3">
            {/* French Definition */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase">FR</span>
                <span className="text-xs font-semibold text-gray-700 italic">&ldquo;{data.translation.fr}&rdquo;</span>
              </div>
              <p className="text-gray-600 leading-snug text-xs">{data.definition.fr}</p>
            </div>

            {/* English Definition */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase">EN</span>
                <span className="text-xs font-semibold text-gray-700 italic">&ldquo;{data.translation.en}&rdquo;</span>
              </div>
              <p className="text-gray-600 leading-snug text-xs">{data.definition.en}</p>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

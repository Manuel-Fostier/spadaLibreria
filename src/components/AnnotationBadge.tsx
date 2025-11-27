'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Annotation } from '@/lib/dataLoader';

interface AnnotationBadgeProps {
  count: number;
  annotations: Annotation[];
  onClick: () => void;
}

export default function AnnotationBadge({ count, annotations, onClick }: AnnotationBadgeProps) {
  if (count === 0) return null;

  // Aperçu de la première annotation
  const preview = annotations[0]?.note.substring(0, 100) + (annotations[0]?.note.length > 100 ? '...' : '');

  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md transition-all text-xs font-medium border border-amber-200"
      title={`${count} annotation(s)`}
    >
      <MessageSquare size={14} />
      <span>{count}</span>
      
      {/* Tooltip au survol */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 w-64">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{count} annotation{count > 1 ? 's' : ''}</p>
          <p className="text-gray-300 leading-relaxed">{preview}</p>
          <div className="mt-2 text-gray-400 text-[10px]">
            Cliquez pour voir toutes les annotations
          </div>
        </div>
      </div>
    </button>
  );
}

'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Annotation } from '@/lib/annotation';

interface AnnotationBadgeProps {
  annotation: Annotation;
  onClick: () => void;
}

export default function AnnotationBadge({ annotation, onClick }: AnnotationBadgeProps) {
  if (!annotation) return null;

  // Aperçu de l'annotation unique
  const note = annotation.note || '';
  const preview = note.substring(0, 100) + (note.length > 100 ? '...' : '');

  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md transition-all text-xs font-medium border border-amber-200"
      title={`1 annotation`}
    >
      <MessageSquare size={14} />
      <span>1</span>
      
      {/* Tooltip au survol */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 w-64">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">1 annotation</p>
          <p className="text-gray-300 leading-relaxed">{preview}</p>
          <div className="mt-2 text-gray-400 text-[10px]">
            Cliquez pour voir l&apos;annotation
          </div>
        </div>
      </div>
    </button>
  );
}

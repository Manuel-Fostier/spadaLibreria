'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Annotation } from '@/lib/annotationTypes';

interface AnnotationBadgeProps {
  annotation: Annotation | undefined;
  onClick: () => void;
  isActive?: boolean;
}

export default function AnnotationBadge({ annotation, onClick, isActive = false }: AnnotationBadgeProps) {
  
  const tagCount = annotation
    ? (
        (annotation.weapons?.length ?? 0) +
        (annotation.guards_mentioned ? Object.keys(annotation.guards_mentioned).length : 0) +
        (annotation.techniques ? Object.keys(annotation.techniques).length : 0) +
        (annotation.measures?.length ?? 0) +
        (annotation.strategy?.length ?? 0) +
        (annotation.strikes ? Object.keys(annotation.strikes).length : 0) +
        (annotation.targets ? Object.keys(annotation.targets).length : 0) +
        (annotation.weapon_type ? 1 : 0)
      )
    : 0;

  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all text-xs font-medium border ${
        isActive 
          ? 'bg-sky-600 text-white border-sky-700 hover:bg-sky-700' 
          : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
      }`}
      title={`${tagCount} tags`}
    >
      <MessageSquare size={14} />
      <span>{tagCount > 0 ? tagCount : ''}</span>
    </button>
  );
}

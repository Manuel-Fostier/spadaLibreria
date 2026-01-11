'use client';

import React from 'react';
import { MEASURES, Measure } from '@/lib/annotation';

interface MeasureProgressBarProps {
  measures: Measure[] | null;
  onToggle?: (measure: Measure) => void;
}

export default function MeasureProgressBar({ measures, onToggle }: MeasureProgressBarProps) {
  const activeMeasures = measures || [];
  const isInteractive = typeof onToggle === 'function';

  const handleToggle = (measure: Measure) => {
    if (!onToggle) return;
    onToggle(measure);
  };
  
  return (
    <div className="flex flex-col gap-0.5">
      {MEASURES.map((measure) => {
        const isActive = activeMeasures.includes(measure);
        return (
          <div
            key={measure}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-pressed={isInteractive ? isActive : undefined}
            onClick={isInteractive ? () => handleToggle(measure) : undefined}
            onKeyDown={isInteractive ? (event) => {
              if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                handleToggle(measure);
              }
            } : undefined}
            className={`
              px-2 py-1 text-xs font-medium rounded
              transition-colors duration-200
              ${isInteractive ? 'focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer' : ''}
              ${isActive 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-200 text-gray-400'
              }
            `}
          >
            {measure}
          </div>
        );
      })}
    </div>
  );
}

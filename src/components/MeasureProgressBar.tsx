'use client';

import React from 'react';
import { MEASURES, Measure } from '@/lib/annotation';

interface MeasureProgressBarProps {
  measures: Measure[] | null;
}

export default function MeasureProgressBar({ measures }: MeasureProgressBarProps) {
  const activeMeasures = measures || [];
  
  return (
    <div className="flex flex-col gap-0.5">
      {MEASURES.map((measure) => {
        const isActive = activeMeasures.includes(measure);
        return (
          <div
            key={measure}
            className={`
              px-2 py-1 text-xs font-medium rounded
              transition-colors duration-200
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

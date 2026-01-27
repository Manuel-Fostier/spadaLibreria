'use client';

import React, { useState, useMemo } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { useAnnotations } from '@/contexts/AnnotationContext';
import { HIGH_GUARDS, LOW_GUARDS } from '@/lib/annotationTypes';

type StatisticsCategory = 'guards' | 'distances' | 'strikes' | 'targets';

interface StatisticsModalProps {
  onClose: () => void;
}

interface BarData {
  label: string;
  count: number;
  color: string;
}

export default function StatisticsModal({ onClose }: StatisticsModalProps) {
  const { annotations } = useAnnotations();
  const [selectedCategory, setSelectedCategory] = useState<StatisticsCategory>('guards');

  // Calculate statistics
  const statistics = useMemo(() => {
    const guardsCount = new Map<string, number>();
    const measuresCount = new Map<string, number>();
    const strikesCount = new Map<string, number>();
    const targetsCount = new Map<string, number>();

    annotations.forEach((ann) => {
      // Count guards - directly use the dictionary
      if (ann.guards_mentioned) {
        Object.entries(ann.guards_mentioned).forEach(([guard, count]) => {
          guardsCount.set(guard, (guardsCount.get(guard) || 0) + count);
        });
      }

      // Count measures (engagement distances) - simple count from list
      if (ann.measures) {
        ann.measures.forEach((measure) => {
          measuresCount.set(measure, (measuresCount.get(measure) || 0) + 1);
        });
      }

      // Count strikes - directly use the dictionary
      if (ann.strikes) {
        Object.entries(ann.strikes).forEach(([strike, count]) => {
          strikesCount.set(strike, (strikesCount.get(strike) || 0) + count);
        });
      }

      // Count targets - directly use the dictionary
      if (ann.targets) {
        Object.entries(ann.targets).forEach(([target, count]) => {
          targetsCount.set(target, (targetsCount.get(target) || 0) + count);
        });
      }
    });

    return {
      guardsCount,
      measuresCount,
      strikesCount,
      targetsCount,
    };
  }, [annotations]);

  // Prepare data for the selected category
  const chartData = useMemo((): { highGuards: BarData[]; lowGuards: BarData[] } | { items: BarData[] } => {
    if (selectedCategory === 'guards') {
      // Separate high and low guards
      const highGuardsData: BarData[] = [];
      const lowGuardsData: BarData[] = [];

      HIGH_GUARDS.forEach((guard) => {
        const count = statistics.guardsCount.get(guard) || 0;
        if (count > 0) {
          highGuardsData.push({ label: guard, count, color: 'bg-emerald-500' });
        }
      });

      LOW_GUARDS.forEach((guard) => {
        const count = statistics.guardsCount.get(guard) || 0;
        if (count > 0) {
          lowGuardsData.push({ label: guard, count, color: 'bg-blue-500' });
        }
      });

      // Sort by count descending
      highGuardsData.sort((a, b) => b.count - a.count);
      lowGuardsData.sort((a, b) => b.count - a.count);

      return { highGuards: highGuardsData, lowGuards: lowGuardsData };
    } else if (selectedCategory === 'distances') {
      const items: BarData[] = Array.from(statistics.measuresCount.entries())
        .map(([label, count]) => ({ label, count, color: 'bg-purple-500' }))
        .sort((a, b) => b.count - a.count);
      return { items };
    } else if (selectedCategory === 'strikes') {
      const items: BarData[] = Array.from(statistics.strikesCount.entries())
        .map(([label, count]) => ({ label, count, color: 'bg-red-500' }))
        .sort((a, b) => b.count - a.count);
      return { items };
    } else {
      // targets
      const items: BarData[] = Array.from(statistics.targetsCount.entries())
        .map(([label, count]) => ({ label, count, color: 'bg-amber-500' }))
        .sort((a, b) => b.count - a.count);
      return { items };
    }
  }, [selectedCategory, statistics]);

  // Calculate max value for scaling bars
  const maxValue = useMemo(() => {
    if ('highGuards' in chartData) {
      const highMax = Math.max(...chartData.highGuards.map((d) => d.count), 0);
      const lowMax = Math.max(...chartData.lowGuards.map((d) => d.count), 0);
      return Math.max(highMax, lowMax, 1);
    } else {
      return Math.max(...chartData.items.map((d) => d.count), 1);
    }
  }, [chartData]);

  const renderBarChart = (data: BarData[], title?: string) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p>Aucune donnée disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {title && <h4 className="text-sm font-semibold text-gray-700">{title}</h4>}
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-40 text-xs text-gray-700 font-medium truncate" title={item.label}>
                {item.label}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className={`${item.color} h-full flex items-center justify-end px-2 transition-all duration-300`}
                    style={{ width: `${(item.count / maxValue) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-white">{item.count}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Statistiques</h2>
              <p className="text-xs text-gray-500">Analyses basées sur les annotations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Category Selector */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('guards')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'guards'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gardes
            </button>
            <button
              onClick={() => setSelectedCategory('distances')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'distances'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Distances d&apos;engagement
            </button>
            <button
              onClick={() => setSelectedCategory('strikes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'strikes'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Coups
            </button>
            <button
              onClick={() => setSelectedCategory('targets')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'targets'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cibles
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedCategory === 'guards' && 'highGuards' in chartData ? (
            <div className="space-y-8">
              {renderBarChart(chartData.highGuards, 'Gardes Hautes')}
              {renderBarChart(chartData.lowGuards, 'Gardes Basses')}
            </div>
          ) : (
            'items' in chartData && renderBarChart(chartData.items)
          )}
        </div>
      </div>
    </div>
  );
}

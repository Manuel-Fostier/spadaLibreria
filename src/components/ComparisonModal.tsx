'use client';

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { TreatiseSection } from '@/lib/dataLoader';
import TextParser from './TextParser';
import { GlossaryEntry } from '@/lib/dataLoader';

interface ComparisonModalProps {
  section: TreatiseSection;
  glossaryData: { [key: string]: GlossaryEntry };
  onClose: () => void;
}

// Fonction pour segmenter le texte en phrases
function segmentText(text: string): string[] {
  if (!text) return [];
  // Découper par points suivis d'espace ou de retour à la ligne
  const segments = text
    .split(/\.\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return segments;
}

export default function ComparisonModal({ section, glossaryData, onClose }: ComparisonModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const itSegments = segmentText(section.content.it || '');
  const frSegments = segmentText(section.content.fr);
  const enVersions = section.content.en_versions || [];

  // Prendre le maximum de segments pour l'alignement
  const maxSegments = Math.max(
    itSegments.length,
    frSegments.length,
    ...enVersions.map(v => segmentText(v.text).length)
  );

  const allEnSegments = enVersions.map(v => ({
    translator: v.translator,
    segments: segmentText(v.text)
  }));

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Attendre la fin de l'animation
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Panneau latéral */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[800px] lg:w-[1000px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
            <p className="text-xs text-gray-500 mt-1">
              {section.metadata.master} - {section.metadata.work} ({section.metadata.year})
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            
            {/* En-têtes des colonnes */}
            <div className={`grid gap-6 ${section.content.it ? 'grid-cols-1 lg:grid-cols-' + (2 + enVersions.length) : 'grid-cols-1 lg:grid-cols-' + (1 + enVersions.length)}`}>
              {section.content.it && (
                <div className="font-bold text-sm text-gray-700 border-b pb-2">
                  Italien (original)
                </div>
              )}
              <div className="font-bold text-sm text-gray-700 border-b pb-2">
                Français
              </div>
              {allEnSegments.map((en, idx) => (
                <div key={idx} className="font-bold text-sm text-gray-700 border-b pb-2">
                  Anglais - {en.translator}
                </div>
              ))}
            </div>

            {/* Segments alignés */}
            {Array.from({ length: maxSegments }).map((_, segIdx) => (
              <div 
                key={segIdx}
                className={`grid gap-6 ${section.content.it ? 'grid-cols-1 lg:grid-cols-' + (2 + enVersions.length) : 'grid-cols-1 lg:grid-cols-' + (1 + enVersions.length)} border-b border-gray-100 pb-6`}
              >
                {section.content.it && (
                  <div className="text-sm leading-relaxed text-gray-900 font-serif">
                    {itSegments[segIdx] ? (
                      <TextParser text={itSegments[segIdx] + '.'} glossaryData={glossaryData} />
                    ) : (
                      <span className="text-gray-300 italic">—</span>
                    )}
                  </div>
                )}
                <div className="text-sm leading-relaxed text-gray-800">
                  {frSegments[segIdx] ? (
                    <TextParser text={frSegments[segIdx] + '.'} glossaryData={glossaryData} />
                  ) : (
                    <span className="text-gray-300 italic">—</span>
                  )}
                </div>
                {allEnSegments.map((en, idx) => (
                  <div key={idx} className="text-sm leading-relaxed text-gray-600">
                    {en.segments[segIdx] ? (
                      <TextParser text={en.segments[segIdx] + '.'} glossaryData={glossaryData} />
                    ) : (
                      <span className="text-gray-300 italic">—</span>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {maxSegments === 0 && (
              <div className="text-center text-gray-400 py-12">
                Aucun contenu à comparer
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

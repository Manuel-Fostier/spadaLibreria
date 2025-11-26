'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, ChevronRight, ChevronDown } from 'lucide-react';
import TextParser from './TextParser';
import { GlossaryEntry, TreatiseSection } from '@/lib/dataLoader';

interface BolognesePlatformProps {
  glossaryData: { [key: string]: GlossaryEntry };
  treatiseData: TreatiseSection[];
}

const WEAPONS = [
  { id: 'all', label: 'Toutes les armes' },
  { id: 'spada_sola', label: 'Épée Seule' },
  { id: 'spada_brocchiero', label: 'Épée et Bocle' },
];

export default function BolognesePlatform({ glossaryData, treatiseData }: BolognesePlatformProps) {
  const [selectedWeapon, setSelectedWeapon] = useState('all');
  const [translatorPreferences, setTranslatorPreferences] = useState<{ [key: string]: string }>({});

  const handleTranslatorChange = (sectionId: string, translatorName: string) => {
    setTranslatorPreferences(prev => ({
      ...prev,
      [sectionId]: translatorName
    }));
  };

  const filteredContent = useMemo(() => {
    return treatiseData.filter(item => {
      const matchWeapon = selectedWeapon === 'all' || item.metadata.weapons.includes(selectedWeapon);
      return matchWeapon;
    });
  }, [selectedWeapon, treatiseData]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col md:flex-row antialiased">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col h-screen sticky top-0 z-20">
        <div className="p-8 pb-4">
          <h1 className="text-xl font-bold text-black tracking-tight flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-600"></div>
            ARS DIMICATORIA
          </h1>
          <p className="text-xs text-gray-400 mt-2 font-medium pl-4">Platform v2.0</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Filtres</h3>
            <div className="space-y-1">
              {WEAPONS.map(weapon => (
                <button 
                  key={weapon.id}
                  onClick={() => setSelectedWeapon(weapon.id)} 
                  className={`w-full text-left px-4 py-2.5 text-sm rounded transition-all ${
                    selectedWeapon === weapon.id 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {weapon.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        <header className="h-20 bg-white flex items-center px-8 justify-between border-b border-gray-100 z-10">
          <div className="flex items-center text-sm text-gray-400 font-medium">
            <BookOpen size={16} className="mr-2" />
            <span>Bibliothèque</span>
            <ChevronRight size={14} className="mx-2 text-gray-300"/>
            <span className="text-gray-900">Marozzo - Opera Nova</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-7xl mx-auto p-8 lg:p-12 space-y-12">
            
            {filteredContent.map((section) => {
              const englishVersions = section.content.en_versions;
              const selectedTransName = translatorPreferences[section.id] || englishVersions[0].translator;
              const activeTranslation = englishVersions.find(v => v.translator === selectedTransName) || englishVersions[0];

              return (
                <div key={section.id} className="group">
                  
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                        {section.metadata.master} - {section.metadata.work} ({section.metadata.year})
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{section.title}</h2>
                    </div>
                  </div>

                  {/* Three Columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 text-sm leading-relaxed">
                    
                    {/* 1. Italian (Original) */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                        Italien (Original)
                      </h4>
                      <div className="text-gray-800 font-medium font-serif text-base">
                        <TextParser text={section.content.it} glossaryData={glossaryData} />
                      </div>
                    </div>

                    {/* 2. French */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                        Français
                      </h4>
                      <div className="text-gray-600">
                        <TextParser text={section.content.fr} glossaryData={glossaryData} />
                      </div>
                    </div>

                    {/* 3. English (Multi-source) */}
                    <div>
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 flex items-center gap-2">
                          Anglais
                        </h4>
                        
                        {/* Translator Selector */}
                        {englishVersions.length > 1 && (
                          <div className="relative group/dropdown">
                            <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors">
                              {selectedTransName}
                              <ChevronDown size={12}/>
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden hidden group-hover/dropdown:block z-50">
                              {englishVersions.map(v => (
                                <button
                                  key={v.translator}
                                  onClick={() => handleTranslatorChange(section.id, v.translator)}
                                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                                    v.translator === selectedTransName 
                                      ? 'font-bold text-indigo-600' 
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {v.translator}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {englishVersions.length === 1 && (
                          <span className="text-xs text-gray-400 italic">{selectedTransName}</span>
                        )}
                      </div>
                      
                      <div className="text-gray-600">
                        <TextParser text={activeTranslation.text} glossaryData={glossaryData} />
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BookOpen, ChevronRight, ChevronDown, MessageSquare, Settings } from 'lucide-react';
import TextParser from './TextParser';
import AnnotationPanel from './AnnotationPanel';
import AnnotationBadge from './AnnotationBadge';
import { GlossaryEntry, TreatiseSection } from '@/lib/dataLoader';
import { useAnnotations } from '@/contexts/AnnotationContext';
import { Annotation } from '@/lib/annotation';
import { useAnnotationDisplay } from '@/contexts/AnnotationDisplayContext';
import { AnnotationDisplay } from '@/types/annotationDisplay';
import AnnotationDisplaySettings from './AnnotationDisplaySettings';
import SearchBar from './SearchBar';
import { useSearch } from '@/contexts/SearchContext';
import TagFilter, { FilterState, initialFilterState } from './TagFilter';

interface BolognesePlatformProps {
  glossaryData: { [key: string]: GlossaryEntry };
  treatiseData: TreatiseSection[];
}



const buildAnnotationSummary = (
  displayConfig: AnnotationDisplay,
  annotation: Annotation | undefined,
) => {
  if (!annotation) return [] as Array<{ label: string; value: string }>;

  const summary: Array<{ label: string; value: string }> = [];

  if (displayConfig.weapons && annotation.weapons && annotation.weapons.length) {
    summary.push({ label: 'Armes', value: annotation.weapons.join(', ') });
  }

  if (displayConfig.weapon_type && annotation.weapon_type) {
    summary.push({ label: 'État de l\'arme', value: annotation.weapon_type });
  }

  if (displayConfig.guards && annotation.guards_mentioned && annotation.guards_mentioned.length) {
    summary.push({ label: 'Gardes', value: annotation.guards_mentioned.join(', ') });
  }

  if (displayConfig.techniques && annotation.techniques && annotation.techniques.length) {
    summary.push({ label: 'Techniques', value: annotation.techniques.join(', ') });
  }

  if (displayConfig.measures && annotation.measures && annotation.measures.length) {
    summary.push({ label: 'Mesures', value: annotation.measures.join(', ') });
  }

  if (displayConfig.strategy && annotation.strategy && annotation.strategy.length) {
    summary.push({ label: 'Stratégie', value: annotation.strategy.join(', ') });
  }

  if (displayConfig.note && annotation.note) {
    const preview = annotation.note.length > 80 ? `${annotation.note.slice(0, 77)}...` : annotation.note;
    summary.push({ label: 'Note', value: preview });
  }

  return summary;
};

export default function BolognesePlatform({ glossaryData, treatiseData }: BolognesePlatformProps) {

  const [translatorPreferences, setTranslatorPreferences] = useState<{ [key: string]: string }>({});
  const [annotationSection, setAnnotationSection] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true); // FR-012: Default open
  const { getAnnotation, getUniqueValues, getMatchingSectionIds } = useAnnotations();
  const [showItalian, setShowItalian] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const { displayConfig } = useAnnotationDisplay();
  const { results, lastQuery } = useSearch();
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // --- VIRTUALIZATION / PAGINATION STATE ---
  // We only render a subset of chapters to keep the page fast (like lazy loading images)
  const [visibleCount, setVisibleCount] = useState(10); // Start with 10 chapters
  const observerTarget = useRef<HTMLDivElement>(null); // The invisible line at the bottom

  const handleTranslatorChange = (sectionId: string, translatorName: string) => {
    setTranslatorPreferences(prev => ({
      ...prev,
      [sectionId]: translatorName
    }));
  };

  const filterOptions = useMemo(() => {
    // Annotation options from context
    const weapons = getUniqueValues('weapons');
    const guards = getUniqueValues('guards_mentioned');
    const techniques = getUniqueValues('techniques');
    const weapon_type = getUniqueValues('weapon_type');

    // Treatise options from data
    const master = Array.from(new Set(treatiseData.map(t => t.metadata.master))).sort();
    const work = Array.from(new Set(treatiseData.map(t => t.metadata.work))).sort();
    const book = Array.from(new Set(treatiseData.map(t => t.metadata.book))).sort((a, b) => a - b);
    const year = Array.from(new Set(treatiseData.map(t => t.metadata.year))).sort((a, b) => a - b);

    return {
      weapons,
      guards,
      techniques,
      weapon_type,
      master,
      work,
      book,
      year
    };
  }, [treatiseData, getUniqueValues]);

  const filteredContent = useMemo(() => {
    let content = treatiseData;

    // 1. Apply Search Results
    if (results) {
      const matchingIds = new Set(results.results.map(r => r.chapterReference.chapterId));
      content = content.filter(item => matchingIds.has(item.id));
    }

    // 2. Apply Treatise Metadata Filters
    if (filters.master) content = content.filter(t => t.metadata.master === filters.master);
    if (filters.work) content = content.filter(t => t.metadata.work === filters.work);
    if (filters.book) content = content.filter(t => t.metadata.book.toString() === filters.book);
    if (filters.year) content = content.filter(t => t.metadata.year.toString() === filters.year);

    // 3. Apply Annotation Filters
    const hasAnnotationFilters = filters.weapons || filters.guards || filters.techniques || filters.weapon_type;
    
    if (hasAnnotationFilters) {
      const matchingAnnotationIds = getMatchingSectionIds({
        weapons: filters.weapons || undefined,
        guards: filters.guards || undefined,
        techniques: filters.techniques || undefined,
        weapon_type: filters.weapon_type || undefined
      });
      
      content = content.filter(item => matchingAnnotationIds.has(item.id));
    }

    return content;
  }, [results, treatiseData, filters, getMatchingSectionIds]);

  // Initialize annotation section (FR-012)
  useEffect(() => {
    if (!annotationSection && filteredContent.length > 0) {
      setAnnotationSection(filteredContent[0].id);
    }
  }, [filteredContent, annotationSection]);

  // FR-012b / SC-012: Smart scrolling
  useEffect(() => {
    if (!isPanelOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the center of the viewport
        const center = window.innerHeight / 2;
        let closestEntry: IntersectionObserverEntry | null = null;
        let minDistance = Infinity;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            const entryCenter = rect.top + rect.height / 2;
            const distance = Math.abs(center - entryCenter);
            
            if (distance < minDistance) {
              minDistance = distance;
              closestEntry = entry;
            }
          }
        });

        if (closestEntry) {
          const sectionId = (closestEntry as IntersectionObserverEntry).target.getAttribute('data-section-id');
          if (sectionId) {
            setAnnotationSection(sectionId);
          }
        }
      },
      { 
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-40% 0px -40% 0px' // Focus on the center band
      }
    );

    // Observe all section elements
    const sections = document.querySelectorAll('[data-section-id]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, [filteredContent, isPanelOpen]);




        
  // Reset to top when the content changes (new search or filter)
  useEffect(() => {
    setVisibleCount(10);
    // Optional: Scroll to top if needed, but usually browser handles this on content change
    // window.scrollTo(0, 0); 
  }, [filteredContent]);

  // "Infinite Scroll" logic: Watch for the bottom of the list
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // When the bottom is visible, load 10 more items
          setVisibleCount((prev) => Math.min(prev + 10, filteredContent.length));
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Load a bit before reaching the exact bottom
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredContent.length]);

  const visibleSections = filteredContent.slice(0, visibleCount);
  // -----------------------------------------

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col md:flex-row antialiased">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col h-screen sticky top-0 z-20">
        <div className="p-8 pb-4">
          <h1 className="text-xl font-bold text-black tracking-tight flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-600"></div>            
            SPADA LIBRERIA
          </h1>
          <p className="text-xs text-gray-400 mt-2 font-medium pl-4">Platform v1.0</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
          <div className="mb-6">
            <SearchBar />
          </div>

          <div className="mb-6">
            <TagFilter 
              options={filterOptions}
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden bg-white">
        <header className="relative h-20 bg-white flex items-center px-8 justify-between border-b border-gray-100 z-10">
          <div className="flex items-center text-sm text-gray-400 font-medium">
            <BookOpen size={16} className="mr-2" />
            <span>Bibliothèque</span>
            <ChevronRight size={14} className="mx-2 text-gray-300"/>
            <span className="text-gray-900">Marozzo - Opera Nova</span>
          </div>
          
          {/* Boutons pour afficher/masquer les colonnes */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowItalian(!showItalian)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showItalian 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Italien {showItalian ? '✓' : ''}
            </button>
            <button
              onClick={() => setShowEnglish(!showEnglish)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showEnglish 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Anglais {showEnglish ? '✓' : ''}
            </button>

            <button
              onClick={() => setShowDisplaySettings(prev => !prev)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                showDisplaySettings
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Configuration de l'affichage des annotations"
            >
              <Settings size={14} />
              Config
            </button>
          </div>

          {showDisplaySettings && (
            <div className="absolute right-4 top-16 z-30 w-96 max-w-[calc(100%-2rem)]">
              <AnnotationDisplaySettings onClose={() => setShowDisplaySettings(false)} />
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-7xl mx-auto p-8 lg:p-12 space-y-12">
            
            {filteredContent.length === 0 && results && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium">Aucun résultat trouvé</p>
                <p className="text-sm">Essayez d'autres termes de recherche.</p>
              </div>
            )}

            {visibleSections.map((section) => {
              const englishVersions = section.content.en_versions || [];
              const selectedTransName = englishVersions.length > 0 
                ? (translatorPreferences[section.id] || englishVersions[0].translator)
                : '';
              const activeTranslation = englishVersions.length > 0
                ? (englishVersions.find(v => v.translator === selectedTransName) || englishVersions[0])
                : null;
              
              const annotation = getAnnotation(section.id);

              return (
                <div key={section.id} className="group" data-section-id={section.id}>
                  
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                        {section.metadata.master} - {section.metadata.work} ({section.metadata.year})
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{section.title}</h2>
                    </div>
                    
                    {/* Bouton d'annotation */}
                    {annotation ? (
                      <AnnotationBadge 
                        annotation={annotation}
                        isActive={isPanelOpen && annotationSection === section.id}
                        onClick={() => {
                          setAnnotationSection(section.id);
                          setIsPanelOpen(true);
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setAnnotationSection(section.id);
                          setIsPanelOpen(true);
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 ${
                          isPanelOpen && annotationSection === section.id
                            ? 'bg-sky-600 text-white font-semibold'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        title="Gérer les annotations"
                      >
                        <MessageSquare size={14} />
                        Annotation
                      </button>
                    )}
                  </div>

                  {(() => {
                    const summary = buildAnnotationSummary(displayConfig, annotation);
                    if (!summary.length) return null;
                    return (
                      <div className="text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1 mb-6">
                        {summary.map(item => (
                          <div key={item.label} className="flex gap-2">
                            <span className="font-semibold text-gray-900">{item.label} :</span>
                            <span className="text-gray-700">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Columns dynamiques */}
                  <div className={`grid gap-8 lg:gap-12 text-sm leading-relaxed ${
                    showItalian && showEnglish ? 'grid-cols-1 lg:grid-cols-3' :
                    showItalian || showEnglish ? 'grid-cols-1 lg:grid-cols-2' :
                    'grid-cols-1'
                  }`}>
                    
                    {/* 1. Italian (Original) - Optionnel */}
                    {showItalian && section.content.it && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                          Italien (original)
                        </h4>
                        <div className="text-gray-800 font-medium font-serif text-base">
                          <TextParser 
                            text={section.content.it} 
                            glossaryData={glossaryData} 
                            highlightQuery={lastQuery}
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. French - Toujours affiché */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                        Français
                      </h4>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line text-justify">
                        <TextParser 
                          text={section.content.fr} 
                          glossaryData={glossaryData} 
                          highlightQuery={lastQuery}
                        />
                      </div>
                    </div>

                    {/* 3. English (Multi-source) - Optionnel */}
                    {showEnglish && (
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
                          {activeTranslation ? (
                            <TextParser 
                              text={activeTranslation.text} 
                              glossaryData={glossaryData} 
                              highlightQuery={lastQuery}
                            />
                          ) : (
                            <p className="text-gray-400 italic">Traduction non disponible</p>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* Sentinel for infinite scroll */}
            <div ref={observerTarget} className="h-10 w-full flex items-center justify-center text-gray-300 text-xs">
              {visibleCount < filteredContent.length && "Chargement..."}
            </div>
          </div>
        </div>
      </main>

      {/* Panneau d'annotations */}
      {isPanelOpen && annotationSection && (
        <AnnotationPanel
          sectionId={annotationSection}
          onClose={() => setIsPanelOpen(false)}
        />
      )}
    </div>
  );
}

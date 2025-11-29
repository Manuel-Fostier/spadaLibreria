'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, ChevronRight, ChevronDown, Save, MessageSquare, X, Search } from 'lucide-react';
import TextParser from './TextParser';
import AnnotationPanel from './AnnotationPanel';
import { GlossaryEntry, TreatiseSection } from '@/lib/dataLoader';
import { useAnnotations } from '@/contexts/AnnotationContext';
import { WEAPONS, Weapon } from '@/lib/annotation';
import { AUTHORS, AUTHOR_LABELS, Author } from '@/lib/metadata';

interface BolognesePlatformProps {
  glossaryData: { [key: string]: GlossaryEntry };
  treatiseData: TreatiseSection[];
}

// Labels for weapons display
const WEAPON_LABELS: Record<Weapon | 'all', string> = {
  'all': 'Toutes les armes',
  'spada_sola': 'Épée Seule',
  'spada_brocchiero': 'Épée et Bocle',
  'spada_targa': 'Épée et Targe',
  'spada_rotella': 'Épée et Rotella',
  'spada_due_mani': 'Épée à deux mains',
};

export default function BolognesePlatform({ glossaryData, treatiseData }: BolognesePlatformProps) {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | 'all'>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<Author | 'all'>('all');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [translatorPreferences, setTranslatorPreferences] = useState<{ [key: string]: string }>({});
  const [annotationSection, setAnnotationSection] = useState<string | null>(null);
  const { getAnnotation, saveToServer } = useAnnotations();
  const [isSaving, setIsSaving] = useState(false);
  const [showItalian, setShowItalian] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      const newTag = searchInput.trim().toLowerCase();
      if (!searchTags.includes(newTag)) {
        setSearchTags([...searchTags, newTag]);
      }
      setSearchInput('');
    }
  };

  const removeSearchTag = (tagToRemove: string) => {
    setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
  };

  const handleTranslatorChange = (sectionId: string, translatorName: string) => {
    setTranslatorPreferences(prev => ({
      ...prev,
      [sectionId]: translatorName
    }));
  };

  const filteredContent = useMemo(() => {
    return treatiseData.filter(item => {
      // Filter by weapon
      if (selectedWeapon !== 'all') {
        const annotation = getAnnotation(item.id);
        if (!annotation || !annotation.weapons || !annotation.weapons.includes(selectedWeapon)) {
          return false;
        }
      }
      
      // Filter by author
      if (selectedAuthor !== 'all') {
        if (item.metadata.master !== selectedAuthor) {
          return false;
        }
      }
      
      // Filter by text search tags (AND logic - all tags must match)
      if (searchTags.length > 0) {
        const textContent = [
          item.content.it || '',
          item.content.fr || '',
          ...(item.content.en_versions?.map(v => v.text) || []),
          item.title || ''
        ].join(' ').toLowerCase();
        
        for (const tag of searchTags) {
          if (!textContent.includes(tag)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [selectedWeapon, selectedAuthor, searchTags, treatiseData, getAnnotation]);

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

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Advanced Text Search */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Recherche avancée</h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Rechercher dans le texte..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            {/* Search tags */}
            {searchTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {searchTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeSearchTag(tag)}
                      className="hover:bg-indigo-200 rounded-full p-0.5"
                      title="Supprimer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Weapon Filter */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Armes</h3>
            <select
              value={selectedWeapon}
              onChange={(e) => setSelectedWeapon(e.target.value as Weapon | 'all')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">{WEAPON_LABELS['all']}</option>
              {WEAPONS.map(weapon => (
                <option key={weapon} value={weapon}>
                  {WEAPON_LABELS[weapon]}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Auteurs</h3>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value as Author | 'all')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Tous les auteurs</option>
              {AUTHORS.map(author => (
                <option key={author} value={author}>
                  {AUTHOR_LABELS[author]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bouton de sauvegarde des annotations */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={async () => {
              setIsSaving(true);
              try {
                await saveToServer();
                alert('Annotations sauvegardées !');
              } catch (error) {
                alert('Erreur lors de la sauvegarde');
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
            className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder les annotations'}
          </button>
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
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-7xl mx-auto p-8 lg:p-12 space-y-12">
            
            {filteredContent.map((section) => {
              const englishVersions = section.content.en_versions || [];
              const selectedTransName = englishVersions.length > 0 
                ? (translatorPreferences[section.id] || englishVersions[0].translator)
                : '';
              const activeTranslation = englishVersions.length > 0
                ? (englishVersions.find(v => v.translator === selectedTransName) || englishVersions[0])
                : null;

              const sectionAnnotation = getAnnotation(section.id);
              const availableLanguages = [
                { code: 'it' as const, label: 'Italien' },
                { code: 'fr' as const, label: 'Français' },
                ...englishVersions.map(v => ({
                  code: 'en' as const,
                  label: `Anglais - ${v.translator}`,
                  translator: v.translator
                }))
              ];

              return (
                <div key={section.id} className="group">
                  
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                        {section.metadata.master} - {section.metadata.work} ({section.metadata.year})
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{section.title}</h2>
                    </div>
                    
                    {/* Bouton d'annotation */}
                    <button
                      onClick={() => setAnnotationSection(annotationSection === section.id ? null : section.id)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5"
                      title="Gérer les annotations"
                    >
                      <MessageSquare size={14} />
                      Annotation
                    </button>
                  </div>

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
                          <TextParser text={section.content.it} glossaryData={glossaryData} />
                        </div>
                      </div>
                    )}

                    {/* 2. French - Toujours affiché */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                        Français
                      </h4>
                      <div className="text-gray-600">
                        <TextParser text={section.content.fr} glossaryData={glossaryData} />
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
                            <TextParser text={activeTranslation.text} glossaryData={glossaryData} />
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
          </div>
        </div>
      </main>

      {/* Panneau d'annotations */}
      {annotationSection && (
        <AnnotationPanel
          sectionId={annotationSection}
          onClose={() => setAnnotationSection(null)}
          availableLanguages={
            filteredContent.find(s => s.id === annotationSection)
              ? [
                  { code: 'it' as const, label: 'Italien' },
                  { code: 'fr' as const, label: 'Français' },
                  ...(filteredContent.find(s => s.id === annotationSection)?.content.en_versions || []).map(v => ({
                    code: 'en' as const,
                    label: `Anglais - ${v.translator}`,
                    translator: v.translator
                  }))
                ]
              : []
          }
        />
      )}
    </div>
  );
}

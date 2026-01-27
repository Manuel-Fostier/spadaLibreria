'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Edit2, Save, ChevronRight, Check, MessageSquare } from 'lucide-react';
import { 
  MEASURES, 
  STRATEGIES, 
  WEAPONS, 
  GUARDS, 
  WEAPON_TYPES, 
  STRIKES,
  TARGETS,
  Measure 
} from '@/lib/annotationTypes';
import { useAnnotations } from '@/contexts/AnnotationContext';
import { useAnnotationDisplay } from '@/contexts/AnnotationDisplayContext';
import { AnnotationRegistry, type AnnotationKey } from '@/lib/annotationClasses/AnnotationRegistry';
import MeasureProgressBar from './MeasureProgressBar';


type TabType = 'armes' | 'gardes' | 'techniques';
type ToggleVariant = 'armes' | 'gardes' | 'techniques' | 'strategies' | 'weaponTypes' | 'strikes' | 'targets';

interface AnnotationPanelProps {
  sectionId: string;
  onClose: () => void;
  availableLanguages?: Array<{ code: 'it' | 'fr' | 'en'; label: string; translator?: string }>;
  sectionMeta?: { weapons: string[]; guards_mentioned?: Record<string, number>; techniques?: Record<string, number> };
}

export default function AnnotationPanel({ sectionId, onClose, availableLanguages: _availableLanguages, sectionMeta: _sectionMeta }: AnnotationPanelProps) {
  const { getAnnotation, setAnnotation, updateAnnotation, saveToServer } = useAnnotations();
  const { displayConfig } = useAnnotationDisplay();
  const annotation = getAnnotation(sectionId);
  
  const [activeTab, setActiveTab] = useState<TabType>('armes');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(384); // 24rem = 384px (md:w-96)
  const [isResizing, setIsResizing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSectionChangeNotice, setShowSectionChangeNotice] = useState(false);
  const [formData, setFormData] = useState({
    weapons: null as (typeof WEAPONS[number])[] | null,
    weapon_type: null as (typeof WEAPON_TYPES[number]) | null,
    guards_mentioned: null as Record<string, number> | null,
    techniques: null as Record<string, number> | null,
    measures: null as (typeof MEASURES[number])[] | null,
    strategy: null as (typeof STRATEGIES[number])[] | null,
    strikes: null as Record<string, number> | null,
    targets: null as Record<string, number> | null,
  });
  const [techniqueInput, setTechniqueInput] = useState('');
  
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Reset editing state when section changes (Smart Scrolling safety)
  useEffect(() => {
    if (isEditing) {
      // Show notification if user was editing when section changed
      setShowSectionChangeNotice(true);
      // Auto-hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowSectionChangeNotice(false);
      }, 3000);
      
      // Cleanup timer on unmount or when section changes again
      return () => clearTimeout(timer);
    }
    setIsEditing(false);
    setSaveStatus('idle');
  }, [sectionId]); // Only depend on sectionId, not isEditing

  // Handle auto-save on close
  const handleClose = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await saveToServer();
      setSaveStatus('saved');
      // Brief delay to show "Sauvegardé" before closing
      setTimeout(() => {
        onClose();
      }, 500);
    } catch {
      setSaveStatus('idle');
      onClose();
    }
  }, [saveToServer, onClose]);

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      // Min width 280px, max width 600px
      setPanelWidth(Math.max(280, Math.min(600, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleStartEdit = () => {
    if (annotation) {
      setIsEditing(true);
      setFormData({
        weapons: annotation.weapons || null,
        weapon_type: annotation.weapon_type || null,
        guards_mentioned: annotation.guards_mentioned || null,
        techniques: annotation.techniques || null,
        measures: annotation.measures || null,
        strategy: annotation.strategy || null,
        strikes: annotation.strikes || null,
        targets: annotation.targets || null,
      });
    } else {
      setIsEditing(true);
      setFormData({
        weapons: null,
        weapon_type: null,
        guards_mentioned: null,
        techniques: null,
        measures: null,
        strategy: null,
        strikes: null,
        targets: null,
      });
    }
  };

  const handleSave = async () => {
    if (annotation) {
      await updateAnnotation(sectionId, formData);
    } else {
      await setAnnotation(sectionId, formData);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddTechnique = () => {
    if (techniqueInput.trim() && !formData.techniques?.[techniqueInput.trim()]) {
      setFormData(prev => ({
        ...prev,
        techniques: { ...(prev.techniques || {}), [techniqueInput.trim()]: 1 }
      }));
      setTechniqueInput('');
    }
  };

  const handleRemoveTechnique = (tech: string) => {
    setFormData(prev => {
      const newTechniques = { ...(prev.techniques || {}) };
      delete newTechniques[tech];
      return {
        ...prev,
        techniques: Object.keys(newTechniques).length > 0 ? newTechniques : null
      };
    });
  };

  const handleToggleMeasure = (measure: Measure) => {
    setFormData(prev => {
      const current = prev.measures || [];
      const hasMeasure = current.includes(measure);
      const next = hasMeasure ? current.filter(m => m !== measure) : [...current, measure];
      return {
        ...prev,
        measures: next.length > 0 ? next : null,
      };
    });
  };

  // Get tags for current tab
  const getCurrentTags = () => {
    const data = isEditing ? formData : annotation;
    if (!data) return [];
    
    switch (activeTab) {
      case 'armes':
        return (data.weapons || []).map(w => ({ key: w, label: w, type: 'weapon' as const }));
      case 'gardes':
        return Object.keys(data.guards_mentioned || {}).map(g => ({ key: g, label: g, type: 'guard' as const }));
      case 'techniques':
        return Object.keys(data.techniques || {}).map(t => ({ key: t, label: t, type: 'technique' as const }));
      default:
        return [];
    }
  };

  // Handle collapse with auto-save
  const handleCollapse = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await saveToServer();
      setSaveStatus('saved');
      setIsCollapsed(true);
    } catch {
      setSaveStatus('idle');
      setIsCollapsed(true);
    }
  }, [saveToServer]);

  const handleSaveToFile = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      await saveToServer({ force: true });
      setSaveStatus('saved');
      alert('Annotations sauvegardées dans le fichier YAML avec succès!');
    } catch (error) {
      setSaveStatus('idle');
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur lors de la sauvegarde: ${message}`);
    } finally {
      setIsSaving(false);
    }
  }, [saveToServer]);
  // If collapsed, show only the expand button
  if (isCollapsed) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex items-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-white shadow-lg border border-gray-200 rounded-l-lg p-2 hover:bg-gray-50 transition-colors"
          aria-label="Ouvrir le panneau"
        >
          <ChevronRight size={20} className="text-gray-600 rotate-180" />
        </button>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'armes', label: 'Armes' },
    { id: 'gardes', label: 'Gardes' },
    { id: 'techniques', label: 'Techniques' },
  ];

  const currentTags = getCurrentTags();

  return (
    <div 
      ref={panelRef}
      className="bg-white shadow-2xl flex-shrink-0 h-screen sticky top-0 overflow-visible"      
       
      style={{ width: panelWidth }}
    >
      {/* Resize handle */}
      <div
        ref={resizeRef}
        onMouseDown={() => setIsResizing(true)}
        className="w-1 bg-gray-200 hover:bg-indigo-400 cursor-ew-resize transition-colors flex-shrink-0"
      />
      
            {/* Collapse button */}
            <button
        onClick={handleCollapse}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-white shadow-lg border border-gray-200 border-r-0 rounded-l-lg p-2 hover:bg-gray-50 transition-colors z-10"
        aria-label="Replier le panneau"
      >
        <ChevronRight size={16} className="text-gray-600" />
      </button>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Section change notification */}
        {showSectionChangeNotice && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-sm text-amber-800 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <div className="flex-1">
              <p className="font-medium">Section changée</p>
              <p className="text-xs mt-0.5">Les modifications non enregistrées ont été annulées.</p>
            </div>
            <button 
              onClick={() => setShowSectionChangeNotice(false)}
              className="text-amber-600 hover:text-amber-800 p-1"
              aria-label="Fermer la notification"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Header with edit button and save status */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">
            Annotations
          </h3>
          <div className="flex items-center gap-3">
            {saveStatus === 'saving' && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <span className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></span>
                Sauvegarde...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check size={14} />
                Sauvegardé
              </span>
            )}
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                title="Éditer"
              >
                <Edit2 size={16} className="text-gray-600" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Fermer le panneau"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* All metadata sections (read mode only) */}
          {annotation && !isEditing && (
            <div className="space-y-4">
              {/* Armes */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Armes utilisées</h4>
                {annotation.weapons && annotation.weapons.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {annotation.weapons.map(w => (
                      <span key={w} className="text-xs px-3 py-1.5 rounded-full border" style={AnnotationRegistry.getChipStyle('weapons')}>
                        {w}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Arme non définie</p>
                )}
              </div>
              {/* Type d'arme */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Type d'arme</h4>
                {annotation.weapon_type ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1.5 rounded-full border" style={AnnotationRegistry.getChipStyle('weapon_type')}>
                      {annotation.weapon_type}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Type d'arme non défini</p>
                )}
              </div>

              {/* Mesures */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mesures</h4>
                {annotation.measures && annotation.measures.length > 0 ? (
                  <MeasureProgressBar measures={annotation.measures} />
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucune mesure indiquée</p>
                )}
              </div>

              {/* Stratégie */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stratégie</h4>
                {annotation.strategy && annotation.strategy.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {annotation.strategy.map(s => (
                      <span key={s} className="text-xs px-3 py-1.5 rounded-full border" style={AnnotationRegistry.getChipStyle('strategy')}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucune stratégie indiquée</p>
                )}
              </div>

              {/* Gardes */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gardes mentionnées</h4>
                {annotation.guards_mentioned && Object.keys(annotation.guards_mentioned).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(annotation.guards_mentioned).map(g => (
                      <span key={g} className="text-xs px-3 py-1.5 rounded-full border" style={AnnotationRegistry.getChipStyle('guards')}>
                        {g}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucune garde indiquée</p>
                )}
              </div>

              {/* Techniques */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Techniques</h4>
                {annotation.techniques && Object.keys(annotation.techniques).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(annotation.techniques).map(t => (
                      <span key={t} className="text-xs px-3 py-1.5 rounded-full border" style={AnnotationRegistry.getChipStyle('techniques')}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucune technique indiquée</p>
                )}
              </div>

              {/* Coups */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Coups</h4>
                {annotation.strikes && Object.keys(annotation.strikes).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(annotation.strikes).map(s => (
                      <span key={s} className="text-xs px-3 py-1.5 rounded-full border" style={AnnotationRegistry.getChipStyle('strikes')}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucun coup indiqué</p>
                )}
              </div>

              {/* Cibles */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cibles</h4>
                {annotation.targets && Object.keys(annotation.targets).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(annotation.targets).map(t => (
                      <span key={t} className="text-xs px-3 py-1.5 rounded-full border" style={AnnotationRegistry.getChipStyle('targets')}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucune cible indiquée</p>
                )}
              </div>
            </div>
          )}

          {!annotation && !isEditing && (
            <div className="text-center text-gray-400 py-12">
              <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune annotation pour cette section</p>
            </div>
          )}

          {/* Edit form */}
          {isEditing && (
            <div className="space-y-4">
              
              {/* Armes */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Armes utilisées
                </h4>
                  <div className="flex flex-wrap gap-2">
                    {WEAPONS.map(w => {
                      const active = formData.weapons?.includes(w);
                      return (
                        <button
                          type="button"
                          key={w}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            weapons: active
                              ? prev.weapons?.filter(x => x !== w) || null
                              : [...(prev.weapons || []), w]
                          }))}
                          className="text-xs px-3 py-1.5 rounded-full border transition-colors font-semibold"
                          style={active ? AnnotationRegistry.getActiveToggleStyle('weapons') : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
              </div>
              {/* Type d'arme */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Type d'arme
                </h4>
                <div className="flex flex-wrap gap-2">
                  {WEAPON_TYPES.map(wt => {
                    const active = formData.weapon_type === wt;
                    return (
                      <button
                        type="button"
                        key={wt}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          weapon_type: active ? null : wt,
                        }))}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors font-semibold"
                        style={active ? AnnotationRegistry.getActiveToggleStyle('weapon_type') : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }}
                      >
                        {wt}
                      </button>
                    );
                  })}
                </div>
              </div>
                
              {/* Mesures */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Mesures
                </h4>
                <MeasureProgressBar
                  measures={formData.measures}
                  onToggle={handleToggleMeasure}
                />
                {!formData.measures || formData.measures.length === 0 ? (
                  <p className="mt-3 text-xs text-gray-400 italic">Aucune mesure sélectionnée</p>
                ) : null}
              </div>

              {/* Stratégie */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Stratégie
                </h4>
                <div className="flex flex-wrap gap-2">
                  {STRATEGIES.map(s => {
                    const active = formData.strategy?.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          strategy: active
                            ? prev.strategy?.filter(x => x !== s) || null
                            : [...(prev.strategy || []), s]
                        }))}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors font-semibold"
                        style={active ? AnnotationRegistry.getActiveToggleStyle('strategy') : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gardes */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Gardes mentionnées
                </h4>
                <div className="flex flex-wrap gap-2">
                  {GUARDS.map(g => {
                    const active = formData.guards_mentioned?.[g] !== undefined;
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setFormData(prev => {
                          if (active) {
                            const newGuards = { ...(prev.guards_mentioned || {}) };
                            delete newGuards[g];
                            return {
                              ...prev,
                              guards_mentioned: Object.keys(newGuards).length > 0 ? newGuards : null
                            };
                          } else {
                            return {
                              ...prev,
                              guards_mentioned: { ...(prev.guards_mentioned || {}), [g]: 1 }
                            };
                          }
                        })}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors font-semibold"
                        style={active ? AnnotationRegistry.getActiveToggleStyle('guards') : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Techniques */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Techniques
                </h4>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={techniqueInput}
                    onChange={(e) => setTechniqueInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnique())}
                    placeholder="Nom de la technique"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ outlineColor: AnnotationRegistry.getChipStyle('techniques').color }}
                  />
                  <button
                    onClick={handleAddTechnique}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors text-sm"
                    style={{ backgroundColor: AnnotationRegistry.getChipStyle('techniques').color }}
                  >
                    +
                  </button>
                </div>
                {formData.techniques && Object.keys(formData.techniques).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(formData.techniques).map(tech => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-1 text-white rounded-full flex items-center gap-1"
                        style={{ backgroundColor: AnnotationRegistry.getChipStyle('techniques').color }}
                      >
                        {tech}
                        <button
                          onClick={() => handleRemoveTechnique(tech)}
                          className="hover:opacity-70 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Coups */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Coups
                </h4>
                <div className="flex flex-wrap gap-2">
                  {STRIKES.map(s => {
                    const active = formData.strikes?.[s] !== undefined;
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setFormData(prev => {
                          if (active) {
                            const newStrikes = { ...(prev.strikes || {}) };
                            delete newStrikes[s];
                            return {
                              ...prev,
                              strikes: Object.keys(newStrikes).length > 0 ? newStrikes : null
                            };
                          } else {
                            return {
                              ...prev,
                              strikes: { ...(prev.strikes || {}), [s]: 1 }
                            };
                          }
                        })}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors font-semibold"
                        style={active ? AnnotationRegistry.getActiveToggleStyle('strikes') : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cibles */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Cibles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {TARGETS.map(t => {
                    const active = formData.targets?.[t] !== undefined;
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setFormData(prev => {
                          if (active) {
                            const newTargets = { ...(prev.targets || {}) };
                            delete newTargets[t];
                            return {
                              ...prev,
                              targets: Object.keys(newTargets).length > 0 ? newTargets : null
                            };
                          } else {
                            return {
                              ...prev,
                              targets: { ...(prev.targets || {}), [t]: 1 }
                            };
                          }
                        })}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors font-semibold"
                        style={active ? AnnotationRegistry.getActiveToggleStyle('targets') : { backgroundColor: 'white', color: '#374151', borderColor: '#d1d5db' }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {annotation ? 'Mettre à jour' : 'Enregistrer'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
          {!annotation && !isEditing && (
            <button
              onClick={handleStartEdit}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Ajouter une annotation
            </button>
          )}

          <button
            onClick={handleSaveToFile}
            disabled={isSaving}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder l\'annotation'}
          </button>
        </div>
      </div>
    </div>
  );
}

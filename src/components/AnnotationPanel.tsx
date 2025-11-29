'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Edit2, Save, ChevronRight, Check } from 'lucide-react';
import { MEASURES, STRATEGIES, WEAPONS, GUARDS } from '@/lib/annotation';
import { useAnnotations } from '@/contexts/AnnotationContext';

type TabType = 'armes' | 'gardes' | 'techniques';

interface AnnotationPanelProps {
  sectionId: string;
  onClose: () => void;
}

export default function AnnotationPanel({ sectionId, onClose }: AnnotationPanelProps) {
  const { getAnnotation, setAnnotation, updateAnnotation, saveToServer } = useAnnotations();
  const annotation = getAnnotation(sectionId);
  
  const [activeTab, setActiveTab] = useState<TabType>('armes');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(384); // 24rem = 384px (md:w-96)
  const [isResizing, setIsResizing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    note: '',
    weapons: null as (typeof WEAPONS[number])[] | null,
    guards_mentioned: null as (typeof GUARDS[number])[] | null,
    techniques: null as string[] | null,
    measure: null as (typeof MEASURES[number]) | null,
    strategy: null as (typeof STRATEGIES[number])[] | null,
  });
  const [techniqueInput, setTechniqueInput] = useState('');
  
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

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
        note: annotation.note || '',
        weapons: annotation.weapons || null,
        guards_mentioned: annotation.guards_mentioned || null,
        techniques: annotation.techniques || null,
        measure: annotation.measure,
        strategy: annotation.strategy || null,
      });
    } else {
      setIsEditing(true);
      setFormData({
        note: '',
        weapons: null,
        guards_mentioned: null,
        techniques: null,
        measure: null,
        strategy: null,
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
    if (techniqueInput.trim() && !formData.techniques?.includes(techniqueInput.trim())) {
      setFormData(prev => ({
        ...prev,
        techniques: [...(prev.techniques || []), techniqueInput.trim()]
      }));
      setTechniqueInput('');
    }
  };

  const handleRemoveTechnique = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techniques: prev.techniques?.filter(t => t !== tech) || null
    }));
  };

  // Get tags for current tab
  const getCurrentTags = () => {
    const data = isEditing ? formData : annotation;
    if (!data) return [];
    
    switch (activeTab) {
      case 'armes':
        return (data.weapons || []).map(w => ({ key: w, label: w, type: 'weapon' as const }));
      case 'gardes':
        return (data.guards_mentioned || []).map(g => ({ key: g, label: g, type: 'guard' as const }));
      case 'techniques':
        return (data.techniques || []).map(t => ({ key: t, label: t, type: 'technique' as const }));
      default:
        return [];
    }
  };

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
      className="fixed inset-y-0 right-0 bg-white shadow-2xl z-50 flex"
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
        onClick={() => setIsCollapsed(true)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-white shadow-lg border border-gray-200 border-r-0 rounded-l-lg p-2 hover:bg-gray-50 transition-colors z-10"
        aria-label="Replier le panneau"
      >
        <ChevronRight size={16} className="text-gray-600" />
      </button>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with close button and save status */}
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
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 bg-white">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Tags display for current tab */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {activeTab === 'armes' && 'Armes sélectionnées'}
                {activeTab === 'gardes' && 'Gardes mentionnées'}
                {activeTab === 'techniques' && 'Techniques'}
              </h4>
              {!isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Éditer"
                >
                  <Edit2 size={14} className="text-gray-500" />
                </button>
              )}
            </div>
            
            {currentTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentTags.map(tag => (
                  <span
                    key={tag.key}
                    className={`text-xs px-3 py-1.5 rounded-full ${
                      tag.type === 'weapon' ? 'bg-blue-100 text-blue-700' :
                      tag.type === 'guard' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {tag.type === 'weapon' && '⚔️ '}
                    {tag.type === 'guard' && '🛡️ '}
                    {tag.type === 'technique' && '⚡ '}
                    {tag.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                {activeTab === 'armes' && 'Aucune arme sélectionnée'}
                {activeTab === 'gardes' && 'Aucune garde mentionnée'}
                {activeTab === 'techniques' && 'Aucune technique ajoutée'}
              </p>
            )}
          </div>

          {/* Additional metadata (always visible) */}
          {(annotation || isEditing) && (
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {/* Note */}
              {annotation?.note && !isEditing && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Note</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{annotation.note}</p>
                </div>
              )}
              
              {/* Measure & Strategy badges */}
              {!isEditing && annotation && (
                <div className="flex flex-wrap gap-1.5">
                  {annotation.measure && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">📏 {annotation.measure}</span>
                  )}
                  {(annotation.strategy || []).map(s => (
                    <span key={`s-${s}`} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">🎯 {s}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit form */}
          {isEditing && (
            <div className="pt-4 border-t border-gray-100 space-y-4">
              
              {/* Tab-specific editing */}
              {activeTab === 'armes' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Sélectionner les armes
                  </label>
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
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            active 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'gardes' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Sélectionner les gardes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GUARDS.map(g => {
                      const active = formData.guards_mentioned?.includes(g);
                      return (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            guards_mentioned: active
                              ? prev.guards_mentioned?.filter(x => x !== g) || null
                              : [...(prev.guards_mentioned || []), g]
                          }))}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            active 
                              ? 'bg-green-600 text-white border-green-600' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'techniques' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Ajouter une technique
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techniqueInput}
                      onChange={(e) => setTechniqueInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnique())}
                      placeholder="Nom de la technique"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <button
                      onClick={handleAddTechnique}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                  {formData.techniques && formData.techniques.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.techniques.map(tech => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-1 bg-purple-600 text-white rounded-full flex items-center gap-1"
                        >
                          {tech}
                          <button
                            onClick={() => handleRemoveTechnique(tech)}
                            className="hover:bg-purple-700 rounded-full p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Common fields (always shown in edit mode) */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mesure
                  </label>
                  <select
                    value={formData.measure ?? ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      measure: e.target.value ? (e.target.value as typeof MEASURES[number]) : null 
                    }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Sélectionner une mesure (optionnel)</option>
                    {MEASURES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Stratégie
                  </label>
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
                          className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                            active 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Note
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Écrivez votre annotation..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex gap-2">
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
            </div>
          )}
        </div>

        {/* Footer - Add annotation button only when no annotation and not editing */}
        {!annotation && !isEditing && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleStartEdit}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Ajouter une annotation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

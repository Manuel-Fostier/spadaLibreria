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
} from '@/lib/annotation';
import { useAnnotations } from '@/contexts/AnnotationContext';
import MeasureProgressBar from './MeasureProgressBar';

type TabType = 'armes' | 'gardes' | 'techniques';
type ToggleVariant = 'armes' | 'gardes' | 'techniques' | 'strategies' | 'weaponTypes';

const CHIP_PALETTE: Record<string, string> = {
  weapon: 'bg-sky-50 text-sky-600 border-sky-100',
  weaponType: 'bg-amber-50 text-amber-700 border-amber-200',
  strategy: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  guard: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  technique: 'bg-purple-50 text-purple-700 border-purple-200',
  default: 'bg-gray-100 text-gray-500 border-gray-200',
};

const INTERACTIVE_STYLES: Record<ToggleVariant, { active: string; inactive: string }> = {
  armes: {
    active: 'bg-sky-600 text-white border-sky-600 shadow',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50',
  },
  gardes: {
    active: 'bg-emerald-600 text-white border-emerald-600 shadow',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50',
  },
  techniques: {
    active: 'bg-purple-600 text-white border-purple-600 shadow',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50',
  },
  strategies: {
    active: 'bg-indigo-600 text-white border-indigo-600 shadow',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50',
  },
  weaponTypes: {
    active: 'bg-amber-600 text-white border-amber-600 shadow',
    inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50',
  },
};

const chipClass = (variant: keyof typeof CHIP_PALETTE) =>
  `text-xs px-3 py-1.5 rounded-full border ${CHIP_PALETTE[variant] ?? CHIP_PALETTE.default}`;

const getToggleClasses = (variant: ToggleVariant, active: boolean) => {
  const pattern = INTERACTIVE_STYLES[variant];
  return `text-xs px-3 py-1.5 rounded-full border transition-colors font-semibold ${active ? pattern.active : pattern.inactive}`;
};

interface AnnotationPanelProps {
  sectionId: string;
  onClose: () => void;
  availableLanguages?: Array<{ code: 'it' | 'fr' | 'en'; label: string; translator?: string }>;
  sectionMeta?: { weapons: string[]; guards_mentioned?: string[]; techniques?: string[] };
}

export default function AnnotationPanel({ sectionId, onClose, availableLanguages: _availableLanguages, sectionMeta: _sectionMeta }: AnnotationPanelProps) {
  const { getAnnotation, setAnnotation, updateAnnotation, saveToServer } = useAnnotations();
  const annotation = getAnnotation(sectionId);
  
  const [activeTab, setActiveTab] = useState<TabType>('armes');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(384); // 24rem = 384px (md:w-96)
  const [isResizing, setIsResizing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    note: '',
    weapons: null as (typeof WEAPONS[number])[] | null,
    weapon_type: null as (typeof WEAPON_TYPES[number]) | null,
    guards_mentioned: null as (typeof GUARDS[number])[] | null,
    techniques: null as string[] | null,
    measures: null as (typeof MEASURES[number])[] | null,
    strategy: null as (typeof STRATEGIES[number])[] | null,
    strikes: null as (typeof STRIKES[number])[] | null,
    targets: null as (typeof TARGETS[number])[] | null,
  });
  const [techniqueInput, setTechniqueInput] = useState('');
  
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Reset editing state when section changes (Smart Scrolling safety)
  useEffect(() => {
    setIsEditing(false);
    setSaveStatus('idle');
  }, [sectionId]);

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
        note: '',
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
        return (data.guards_mentioned || []).map(g => ({ key: g, label: g, type: 'guard' as const }));
      case 'techniques':
        return (data.techniques || []).map(t => ({ key: t, label: t, type: 'technique' as const }));
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
                      <span key={w} className={chipClass('weapon')}>
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
                    <span className={chipClass('weaponType')}>
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
                      <span key={s} className={chipClass('strategy')}>
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
                {annotation.guards_mentioned && annotation.guards_mentioned.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {annotation.guards_mentioned.map(g => (
                      <span key={g} className={chipClass('guard')}>
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
                {annotation.techniques && annotation.techniques.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {annotation.techniques.map(t => (
                      <span key={t} className={chipClass('technique')}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucune technique indiquée</p>
                )}
              </div>

              {/* Note */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Note</h4>
                {annotation.note ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{annotation.note}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucune note</p>
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
                          className={getToggleClasses('armes', Boolean(active))}
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
                        className={getToggleClasses('weaponTypes', Boolean(active))}
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
                        className={getToggleClasses('strategies', Boolean(active))}
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
                        className={getToggleClasses('gardes', Boolean(active))}
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

              {/* Coups */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Coups
                </h4>
                <div className="flex flex-wrap gap-2">
                  {STRIKES.map(s => {
                    const active = formData.strikes?.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          strikes: active
                            ? prev.strikes?.filter(x => x !== s) || null
                            : [...(prev.strikes || []), s]
                        }))}
                        className={getToggleClasses('techniques', Boolean(active))}
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
                    const active = formData.targets?.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          targets: active
                            ? prev.targets?.filter(x => x !== t) || null
                            : [...(prev.targets || []), t]
                        }))}
                        className={getToggleClasses('techniques', Boolean(active))}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Note
                </h4>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Écrivez votre annotation..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
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

'use client';

import React, { useState } from 'react';
import { X, Plus, Edit2, Save, MessageSquare } from 'lucide-react';
import { Annotation, MEASURES, STRATEGIES, WEAPONS, GUARDS } from '@/lib/annotation';
import { useAnnotations } from '@/contexts/AnnotationContext';

interface AnnotationPanelProps {
  sectionId: string;
  onClose: () => void;
  availableLanguages: Array<{ code: 'it' | 'fr' | 'en', label: string, translator?: string }>;
  sectionMeta?: { weapons: string[]; guards_mentioned?: string[]; techniques?: string[] };
}

export default function AnnotationPanel({ sectionId, onClose, availableLanguages, sectionMeta }: AnnotationPanelProps) {
  const { getAnnotation, setAnnotation, updateAnnotation } = useAnnotations();
  const annotation = getAnnotation(sectionId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    language: 'fr' as 'it' | 'fr' | 'en',
    translator: null as string | null,
    note: '',
    weapons: [] as (typeof WEAPONS[number])[],
    guards_mentioned: [] as (typeof GUARDS[number])[],
    techniques: [] as string[],
    measure: null as (typeof MEASURES[number]) | null,
    strategy: [] as (typeof STRATEGIES[number])[],
  });
  const [techniqueInput, setTechniqueInput] = useState('');

  const handleStartEdit = () => {
    if (annotation) {
      setIsEditing(true);
      setFormData({
        language: annotation.language,
        translator: annotation.translator,
        note: annotation.note,
        weapons: annotation.weapons || [],
        guards_mentioned: annotation.guards_mentioned || [],
        techniques: annotation.techniques || [],
        measure: annotation.measure,
        strategy: annotation.strategy || [],
      });
    } else {
      setIsEditing(true);
      setFormData({
        language: 'fr',
        translator: null,
        note: '',
        weapons: [],
        guards_mentioned: [],
        techniques: [],
        measure: null,
        strategy: [],
      });
    }
  };

  const handleSave = async () => {
    if (!formData.note.trim()) return;

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
    if (techniqueInput.trim() && !formData.techniques.includes(techniqueInput.trim())) {
      setFormData(prev => ({
        ...prev,
        techniques: [...prev.techniques, techniqueInput.trim()]
      }));
      setTechniqueInput('');
    }
  };

  const handleRemoveTechnique = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techniques: prev.techniques.filter(t => t !== tech)
    }));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
      
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-600" />
          Annotation
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Fermer"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Display annotation if exists and not editing */}
        {annotation && !isEditing && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-indigo-600 uppercase">
                    {annotation.language === 'it' && 'Italien'}
                    {annotation.language === 'fr' && 'Français'}
                    {annotation.language === 'en' && `Anglais ${annotation.translator ? `- ${annotation.translator}` : ''}`}
                  </span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {annotation.note}
                </p>
                {/* Metadata chips from annotation */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(annotation.weapons || []).map(w => (
                    <span key={`w-${w}`} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">⚔️ {w}</span>
                  ))}
                  {(annotation.guards_mentioned || []).map(g => (
                    <span key={`g-${g}`} className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">🛡️ {g}</span>
                  ))}
                  {(annotation.techniques || []).map(t => (
                    <span key={`t-${t}`} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">⚡ {t}</span>
                  ))}
                  {annotation.measure && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">📏 {annotation.measure}</span>
                  )}
                  {(annotation.strategy || []).map(s => (
                    <span key={`s-${s}`} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">🎯 {s}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleStartEdit}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  title="Éditer"
                >
                  <Edit2 size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!annotation && !isEditing && (
          <div className="text-center text-gray-400 py-12">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune annotation pour cette section</p>
          </div>
        )}

        {/* Formulaire d'ajout/édition */}
        {isEditing && (
          <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Version linguistique
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as 'it' | 'fr' | 'en', translator: null }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {availableLanguages.map(lang => (
                  <option key={lang.code + (lang.translator || '')} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mesure
              </label>
              <select
                value={formData.measure ?? ''}
                onChange={(e) => setFormData(prev => ({ ...prev, measure: e.target.value ? (e.target.value as typeof MEASURES[number]) : null }))}
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
                  const active = formData.strategy.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        strategy: active
                          ? prev.strategy.filter(x => x !== s)
                          : [...prev.strategy, s]
                      }))}
                      className={`text-xs px-2 py-1 rounded-full border ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Armes
              </label>
              <div className="flex flex-wrap gap-2">
                {WEAPONS.map(w => {
                  const active = formData.weapons.includes(w);
                  return (
                    <button
                      type="button"
                      key={w}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        weapons: active
                          ? prev.weapons.filter(x => x !== w)
                          : [...prev.weapons, w]
                      }))}
                      className={`text-xs px-2 py-1 rounded-full border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Gardes mentionnées
              </label>
              <div className="flex flex-wrap gap-2">
                {GUARDS.map(g => {
                  const active = formData.guards_mentioned.includes(g);
                  return (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        guards_mentioned: active
                          ? prev.guards_mentioned.filter(x => x !== g)
                          : [...prev.guards_mentioned, g]
                      }))}
                      className={`text-xs px-2 py-1 rounded-full border ${active ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Techniques
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={techniqueInput}
                  onChange={(e) => setTechniqueInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnique())}
                  placeholder="Ajouter une technique"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={handleAddTechnique}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  +
                </button>
              </div>
              {formData.techniques.length > 0 && (
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
                disabled={!formData.note.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
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

      {/* Pied - Bouton d'ajout/édition */}
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
  );
}

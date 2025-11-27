'use client';

import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Tag, Save, MessageSquare } from 'lucide-react';
import { Annotation } from '@/lib/dataLoader';
import { useAnnotations } from '@/contexts/AnnotationContext';

interface AnnotationPanelProps {
  sectionId: string;
  onClose: () => void;
  availableLanguages: Array<{ code: 'it' | 'fr' | 'en', label: string, translator?: string }>;
}

export default function AnnotationPanel({ sectionId, onClose, availableLanguages }: AnnotationPanelProps) {
  const { getAnnotationsForSection, addAnnotation, updateAnnotation, deleteAnnotation } = useAnnotations();
  const annotations = getAnnotationsForSection(sectionId);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    language: 'fr' as 'it' | 'fr' | 'en',
    translator: null as string | null,
    note: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      language: 'fr',
      translator: null,
      note: '',
      tags: [],
    });
  };

  const handleEdit = (annotation: Annotation) => {
    setEditingId(annotation.id);
    setIsAdding(false);
    setFormData({
      language: annotation.language,
      translator: annotation.translator,
      note: annotation.note,
      tags: annotation.tags,
    });
  };

  const handleSave = async () => {
    if (!formData.note.trim()) return;

    if (editingId) {
      await updateAnnotation(sectionId, editingId, formData);
      setEditingId(null);
    } else {
      await addAnnotation(sectionId, {
        ...formData,
        updated_at: null
      });
      setIsAdding(false);
    }

    setFormData({ language: 'fr', translator: null, note: '', tags: [] });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ language: 'fr', translator: null, note: '', tags: [] });
  };

  const handleDelete = async (annotationId: string) => {
    if (confirm('Supprimer cette annotation ?')) {
      await deleteAnnotation(sectionId, annotationId);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
      
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-600" />
          Annotations ({annotations.length})
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
        
        {/* Liste des annotations */}
        {annotations.map(annotation => (
          <div
            key={annotation.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3"
          >
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
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(annotation)}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  title="Éditer"
                >
                  <Edit2 size={14} className="text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(annotation.id)}
                  className="p-1.5 hover:bg-red-100 rounded transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={14} className="text-red-600" />
                </button>
              </div>
            </div>

            {annotation.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {annotation.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-400">
              {new Date(annotation.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ))}

        {annotations.length === 0 && !isAdding && (
          <div className="text-center text-gray-400 py-12">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune annotation pour cette section</p>
          </div>
        )}

        {/* Formulaire d'ajout/édition */}
        {(isAdding || editingId) && (
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

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Ajouter un tag"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <Tag size={16} />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-full flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-indigo-700 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!formData.note.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingId ? 'Mettre à jour' : 'Enregistrer'}
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

      {/* Pied - Bouton d'ajout */}
      {!isAdding && !editingId && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleStartAdd}
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

'use client';

import React, { useState } from 'react';
import { Edit2, X } from 'lucide-react';
import TextEditor from './TextEditor';
import type { GlossaryTerm } from '@/types/glossary';

interface GlossaryTermEditorProps {
  termKey: string;
  term: GlossaryTerm;
  isEditing: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
}

export default function GlossaryTermEditor({
  termKey,
  term,
  isEditing,
  onEditStart,
  onEditCancel,
}: GlossaryTermEditorProps) {
  const [formData, setFormData] = useState({
    category: term.category || '',
    type: term.type || '',
    term: term.term || '',
    definition_fr: term.definition?.fr || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (dataOverride?: typeof formData) => {
    setIsSaving(true);
    setError(null);

    const dataToSave = dataOverride ?? formData;
    const fields: Array<{ field: 'category' | 'type' | 'term' | 'definition_fr'; value: string }> = [
      { field: 'category', value: dataToSave.category },
      { field: 'type', value: dataToSave.type },
      { field: 'term', value: dataToSave.term },
      { field: 'definition_fr', value: dataToSave.definition_fr },
    ];

    try {
      for (const item of fields) {
        const response = await fetch('/api/glossary/term', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ termKey, field: item.field, value: item.value }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Save failed');
        }
      }

      // Reload page to show updated content
      window.location.reload();
    } catch (err) {
      console.error('Error saving term:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      setIsSaving(false);
    }
  };

  const handleDefinitionSave = async (value: string) => {
    const updatedData = { ...formData, definition_fr: value };
    setFormData(updatedData);
    await handleSave(updatedData);
  };

  if (!isEditing) {
    return (
      <button
        onClick={onEditStart}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Éditer le terme"
        aria-label="Éditer le terme"
      >
        <Edit2 size={16} />
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Éditer le terme</h3>
        <button
          onClick={onEditCancel}
          className="text-gray-400 hover:text-gray-600"
          title="Annuler"
          disabled={isSaving}
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Category Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie
        </label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Catégorie du terme"
          disabled={isSaving}
        />
      </div>

      {/* Type Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <input
          type="text"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type du terme"
          disabled={isSaving}
        />
      </div>

      {/* Term Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Terme (Italien)
        </label>
        <input
          type="text"
          value={formData.term}
          onChange={(e) => setFormData({ ...formData, term: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nom du terme en italien"
          disabled={isSaving}
        />
      </div>

      {/* Definition Field (using TextEditor for Markdown support) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Définition (Français)
        </label>
        <TextEditor
          initialValue={formData.definition_fr}
          onSave={handleDefinitionSave}
          onCancel={onEditCancel}
          placeholder="Définition en français (Markdown supporté)"
          className="min-h-[150px]"
        />
      </div>
    </div>
  );
}

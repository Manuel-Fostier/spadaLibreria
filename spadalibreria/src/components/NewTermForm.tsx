'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import TextEditor from './TextEditor';

interface NewTermFormProps {
  onClose: () => void;
  categories?: string[];
}

interface FormData {
  category: string;
  type: string;
  term: string;
  definition_fr: string;
}

export default function NewTermForm({ onClose, categories = [] }: NewTermFormProps) {
  const [formData, setFormData] = useState<FormData>({
    category: '',
    type: '',
    term: '',
    definition_fr: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState(false);

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.category.trim()) errors.push('La catégorie est requise');
    if (!formData.type.trim()) errors.push('Le type est requis');
    if (!formData.term.trim()) errors.push('Le terme est requis');
    if (!formData.definition_fr.trim()) errors.push('La définition française est requise');
    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await fetch('/api/glossary/terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          type: formData.type,
          term: formData.term,
          definition: {
            fr: formData.definition_fr
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([data.error || 'Erreur lors de la création du terme']);
        setIsSubmitting(false);
        return;
      }

      // Success - reload page to show new term
      window.location.reload();
    } catch (error) {
      setErrors(['Erreur réseau. Veuillez réessayer.']);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Ajouter un nouveau terme</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800 mb-2">Erreurs de validation :</p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Category Field */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            {categories.length > 0 ? (
              <>
                <input
                  type="text"
                  id="category"
                  list="categories"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Coups et Techniques"
                  disabled={isSubmitting}
                />
                <datalist id="categories">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </>
            ) : (
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Coups et Techniques"
                disabled={isSubmitting}
              />
            )}
          </div>

          {/* Type Field */}
          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Attaque / Frappe de taille"
              disabled={isSubmitting}
            />
          </div>

          {/* Term Field */}
          <div>
            <label htmlFor="term" className="block text-sm font-semibold text-gray-700 mb-2">
              Terme (Italien) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="term"
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Mandritto"
              disabled={isSubmitting}
            />
          </div>

          {/* Definition Field (French) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Définition (Français) <span className="text-red-500">*</span>
            </label>
            {editingDefinition ? (
              <TextEditor
                initialValue={formData.definition_fr}
                onSave={async (value) => {
                  setFormData({ ...formData, definition_fr: value });
                  setEditingDefinition(false);
                }}
                onCancel={() => setEditingDefinition(false)}
                placeholder="Entrez la définition en français (supporte Markdown)..."
              />
            ) : (
              <div>
                <textarea
                  value={formData.definition_fr}
                  onChange={(e) => setFormData({ ...formData, definition_fr: e.target.value })}
                  onClick={() => setEditingDefinition(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] cursor-text"
                  placeholder="Cliquez pour éditer (supporte Markdown)..."
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supporte Markdown : **gras**, *italique*, listes, liens, etc.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? 'Création en cours...' : 'Créer le terme'}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

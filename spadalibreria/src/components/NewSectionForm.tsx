'use client';

import React, { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import TextEditor from './TextEditor';
import { TreatiseSection } from '@/lib/dataLoader';

interface NewSectionFormProps {
  treatiseData?: TreatiseSection[];
  onClose: () => void;
  masters?: string[];
  works?: string[];
  books?: string[];
}

interface FormData {
  master: string;
  work: string;
  book: string;
  chapter: string;
  year: string;
  title: string;
  content_fr: string;
  content_it: string;
  content_en: string;
  content_notes: string;
}

export default function NewSectionForm({
  treatiseData,
  onClose,
  masters: mastersProp,
  works: worksProp,
  books: booksProp,
}: NewSectionFormProps) {
  const effectiveTreatiseData = treatiseData ?? [];
  const [formData, setFormData] = useState<FormData>({
    master: '',
    work: '',
    book: '',
    chapter: '',
    year: '',
    title: '',
    content_fr: '',
    content_it: '',
    content_en: '',
    content_notes: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique masters from treatise data
  const masters = useMemo(() => {
    if (mastersProp && mastersProp.length > 0) return mastersProp;
    const masterSet = new Set<string>();
    effectiveTreatiseData.forEach(section => {
      if (section.metadata?.master) {
        masterSet.add(section.metadata.master);
      }
    });
    return Array.from(masterSet).sort();
  }, [effectiveTreatiseData, mastersProp]);

  // Extract works for selected master
  const works = useMemo(() => {
    if (worksProp && worksProp.length > 0) return worksProp;
    if (!formData.master) return [];
    const workSet = new Set<string>();
    effectiveTreatiseData.forEach(section => {
      if (section.metadata?.master === formData.master && section.metadata?.work) {
        workSet.add(section.metadata.work);
      }
    });
    return Array.from(workSet).sort();
  }, [effectiveTreatiseData, formData.master, worksProp]);

  // Extract books for selected master and work
  const books = useMemo(() => {
    if (booksProp && booksProp.length > 0) return booksProp;
    if (!formData.master || !formData.work) return [];
    const bookSet = new Set<number>();
    effectiveTreatiseData.forEach(section => {
      if (
        section.metadata?.master === formData.master &&
        section.metadata?.work === formData.work &&
        section.metadata?.book !== undefined
      ) {
        bookSet.add(section.metadata.book);
      }
    });
    return Array.from(bookSet).sort((a, b) => a - b);
  }, [effectiveTreatiseData, formData.master, formData.work, booksProp]);

  // Get year from existing sections
  const year = useMemo(() => {
    if (!formData.master || !formData.work || !formData.book) return '';
    const section = effectiveTreatiseData.find(
      s =>
        s.metadata?.master === formData.master &&
        s.metadata?.work === formData.work &&
        s.metadata?.book === parseInt(formData.book)
    );
    return section?.metadata?.year?.toString() || '';
  }, [effectiveTreatiseData, formData.master, formData.work, formData.book]);

  // Auto-fill year when book is selected
  useMemo(() => {
    if (year && !formData.year) {
      setFormData(prev => ({ ...prev, year }));
    }
  }, [year, formData.year]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.master.trim()) {
      setError('Le maître est requis');
      return;
    }
    if (!formData.work.trim()) {
      setError('L\'œuvre est requise');
      return;
    }
    if (!formData.book.trim()) {
      setError('Le livre est requis');
      return;
    }
    if (!formData.year.trim()) {
      setError('L\'année est requise');
      return;
    }
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }
    if (!formData.content_fr.trim()) {
      setError('Le contenu français est requis');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const requestBody = {
        master: formData.master.trim(),
        work: formData.work.trim(),
        book: parseInt(formData.book),
        ...(formData.chapter.trim() && {
          chapter: parseFloat(formData.chapter),
          chapter_raw: formData.chapter.trim(),
        }),
        year: parseInt(formData.year),
        title: formData.title.trim(),
        content: {
          fr: formData.content_fr.trim(),
          ...(formData.content_it.trim() && { it: formData.content_it.trim() }),
          ...(formData.content_en.trim() && { en: formData.content_en.trim() }),
          ...(formData.content_notes.trim() && { notes: formData.content_notes.trim() })
        }
      };

      const response = await fetch('/api/content/section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création de la section');
      }

      // Success: reload page to show new section
      if (process.env.NODE_ENV !== 'test') {
        try {
          window.location.reload();
        } catch (error) {
          // Ignore reload errors in non-browser test environments
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Nouvelle section de traité</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Master */}
            <div>
              <label htmlFor="master-input" className="block text-sm font-medium text-gray-700 mb-1">
                Maître <span className="text-red-500">*</span>
              </label>
              <input
                id="master-input"
                type="text"
                list="masters-list"
                value={formData.master}
                onChange={e => handleInputChange('master', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Achille Marozzo"
                disabled={isSubmitting}
              />
              <datalist id="masters-list">
                {masters.map(master => (
                  <option key={master} value={master} />
                ))}
              </datalist>
            </div>

            {/* Work */}
            <div>
              <label htmlFor="work-input" className="block text-sm font-medium text-gray-700 mb-1">
                Œuvre <span className="text-red-500">*</span>
              </label>
              <input
                id="work-input"
                type="text"
                list="works-list"
                value={formData.work}
                onChange={e => handleInputChange('work', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Opera Nova"
                disabled={isSubmitting || !formData.master}
              />
              <datalist id="works-list">
                {works.map(work => (
                  <option key={work} value={work} />
                ))}
              </datalist>
            </div>

            {/* Book */}
            <div>
              <label htmlFor="book-input" className="block text-sm font-medium text-gray-700 mb-1">
                Livre <span className="text-red-500">*</span>
              </label>
              <input
                id="book-input"
                type="text"
                list="books-list"
                value={formData.book}
                onChange={e => handleInputChange('book', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 2"
                disabled={isSubmitting || !formData.work}
              />
              <datalist id="books-list">
                {books.map(book => (
                  <option key={book} value={book} />
                ))}
              </datalist>
            </div>

            {/* Chapter (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chapitre (optionnel)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={formData.chapter}
                onChange={e => handleInputChange('chapter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 95"
                disabled={isSubmitting}
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={e => handleInputChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 1536"
                min="1400"
                max="2100"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Chap. 95. Nouvelle technique de combat"
              disabled={isSubmitting}
            />
          </div>

          {/* Content FR (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu français <span className="text-red-500">*</span>
            </label>
            <TextEditor
              initialValue={formData.content_fr}
              onSave={async (value) => handleInputChange('content_fr', value)}
              onCancel={() => {}}
              placeholder="Entrez le contenu en français (Markdown supporté)..."
              hideControls={true}
              onChange={(value) => handleInputChange('content_fr', value)}
              autoFocus={false}
            />
          </div>

          {/* Content IT (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu italien (optionnel)
            </label>
            <TextEditor
              initialValue={formData.content_it}
              onSave={async (value) => handleInputChange('content_it', value)}
              onCancel={() => {}}
              placeholder="Entrez le contenu en italien..."
              hideControls={true}
              onChange={(value) => handleInputChange('content_it', value)}
              autoFocus={false}
            />
          </div>

          {/* Content EN (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu en anglais (optionnel)
            </label>
            <TextEditor
              initialValue={formData.content_en}
              onSave={async (value) => handleInputChange('content_en', value)}
              onCancel={() => {}}
              placeholder="Entrez le contenu en anglais..."
              hideControls={true}
              onChange={(value) => handleInputChange('content_en', value)}
              autoFocus={false}
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <TextEditor
              initialValue={formData.content_notes}
              onSave={async (value) => handleInputChange('content_notes', value)}
              onCancel={() => {}}
              placeholder="Ajoutez des notes (Markdown supporté)..."
              hideControls={true}
              onChange={(value) => handleInputChange('content_notes', value)}
              autoFocus={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Création...'
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Créer la section
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

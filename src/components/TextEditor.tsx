'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Save, X } from 'lucide-react';

interface TextEditorProps {
  initialValue: string;
  onSave: (value: string, translator?: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  translator?: string; // Optional: translator name for English editing
  showTranslatorField?: boolean; // Whether to show translator input field
}

interface HistoryState {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export default function TextEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  placeholder,
  className = '',
  translator: initialTranslator = '',
  showTranslatorField = false
}: TextEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [translator, setTranslator] = useState(initialTranslator);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([{ 
    value: initialValue, 
    selectionStart: 0, 
    selectionEnd: 0 
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Add to history (for undo/redo)
  const addToHistory = (newValue: string, start: number, end: number) => {
    // Remove any future history after current index
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ value: newValue, selectionStart: start, selectionEnd: end });
    
    // Limit history size to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
      setHistoryIndex(newHistory.length - 1);
    } else {
      setHistoryIndex(newHistory.length - 1);
    }
    
    setHistory(newHistory);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Add to history after a short delay to avoid too many history entries
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    addToHistory(newValue, start, end);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Ctrl+Z (undo)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        const state = history[newIndex];
        setValue(state.value);
        setHistoryIndex(newIndex);
        
        // Restore cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(state.selectionStart, state.selectionEnd);
          }
        }, 0);
      }
    }
    
    // Handle Ctrl+Y or Ctrl+Shift+Z (redo)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        const state = history[newIndex];
        setValue(state.value);
        setHistoryIndex(newIndex);
        
        // Restore cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(state.selectionStart, state.selectionEnd);
          }
        }, 0);
      }
    }

    // Handle Ctrl+S (save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }

    // Handle Escape (cancel)
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSave = async () => {
    // Validate translator if needed
    if (showTranslatorField && !translator.trim()) {
      alert('Veuillez entrer le nom du traducteur');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(value, translator.trim() || undefined);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showTranslatorField && (
        <div className="mb-2">
          <label htmlFor="translator" className="block text-xs font-medium text-gray-700 mb-1">
            Traducteur / Translator
          </label>
          <input
            id="translator"
            type="text"
            value={translator}
            onChange={(e) => setTranslator(e.target.value)}
            placeholder="Nom du traducteur..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full min-h-[200px] p-3 text-sm border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y font-sans leading-relaxed"
        style={{ whiteSpace: 'pre-wrap' }}
      />
      
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <X size={16} />
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save size={16} />
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 italic">
        Raccourcis: Ctrl+Z (annuler), Ctrl+Y (refaire), Ctrl+S (sauvegarder), Échap (annuler)
      </div>
    </div>
  );
}

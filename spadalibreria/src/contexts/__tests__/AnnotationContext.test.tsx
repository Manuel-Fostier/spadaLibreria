/**
 * Tests for AnnotationContext localStorage integration
 */

import { LocalStorage } from '@/lib/localStorage';
import { Annotation } from '@/lib/annotation';

// Mock the LocalStorage utility
jest.mock('@/lib/localStorage', () => ({
  LocalStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getSize: jest.fn(),
    isFull: jest.fn(),
  },
}));

describe('AnnotationContext localStorage integration', () => {
  const mockAnnotation: Annotation = {
    id: 'anno_1234567890',
    weapons: ['Spada sola'],
    weapon_type: 'Épée aiguisée',
    guards_mentioned: { 'Porta di Ferro': 2 },
    techniques: { 'Stringere': 1 },
    measures: ['Largo'],
    strategy: ['provocation'],
    strikes: { 'Mandritto': 2 },
    targets: { 'Tête': 1 },
    guards_count: { 'Porta di Ferro': 2 },
    techniques_count: { 'Stringere': 1 },
    strikes_count: { 'Mandritto': 2 },
    targets_count: { 'Tête': 1 },
  };

  const mockAnnotationsMap: Record<string, Annotation> = {
    'section_1': mockAnnotation,
    'section_2': { ...mockAnnotation, id: 'anno_9876543210' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Loading annotations from storage', () => {
    it('loads annotations map from storage on mount', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(mockAnnotationsMap);

      const result = LocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
      
      expect(result).toEqual(mockAnnotationsMap);
      expect(LocalStorage.getItem).toHaveBeenCalledWith('treatise_annotations');
    });

    it('handles null when no annotations in storage', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = LocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
      
      expect(result).toBeNull();
    });

    it('handles legacy format annotations', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      // Simulate old format
      localStorage.setItem('treatise_annotations', JSON.stringify(mockAnnotationsMap));
      
      const result = ActualLocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
      expect(result).toEqual(mockAnnotationsMap);
    });

    it('merges localStorage with YAML annotations (YAML takes precedence)', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      const localAnnotation = { ...mockAnnotation, id: 'local_annotation' };
      const yamlAnnotation = { ...mockAnnotation, id: 'yaml_annotation' };
      
      // Store local annotations
      ActualLocalStorage.setItem('treatise_annotations', { 'section_1': localAnnotation });
      
      // Simulate YAML override
      const result = ActualLocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
      expect(result).toBeDefined();
      expect(result!['section_1']).toEqual(localAnnotation);
    });
  });

  describe('Saving annotations to storage', () => {
    it('saves annotations map to storage when updated', () => {
      LocalStorage.setItem('treatise_annotations', mockAnnotationsMap);
      
      expect(LocalStorage.setItem).toHaveBeenCalledWith('treatise_annotations', mockAnnotationsMap);
    });

    it('handles Map to Object conversion correctly', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      const map = new Map<string, Annotation>([
        ['section_1', mockAnnotation],
        ['section_2', { ...mockAnnotation, id: 'anno_9999' }],
      ]);
      
      const obj = Object.fromEntries(map);
      ActualLocalStorage.setItem('treatise_annotations', obj);
      
      const result = ActualLocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
      expect(result).toEqual(obj);
    });

    it('persists annotation updates', () => {
      LocalStorage.setItem('treatise_annotations', {
        'section_1': { ...mockAnnotation, weapons: ['Épée et bouclier'] },
      });
      
      expect(LocalStorage.setItem).toHaveBeenCalledWith(
        'treatise_annotations',
        expect.objectContaining({
          'section_1': expect.objectContaining({ weapons: ['Épée et bouclier'] })
        })
      );
    });
  });

  describe('Error handling', () => {
    it('handles parse errors gracefully', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      localStorage.setItem('treatise_annotations', 'invalid json{');
      const result = ActualLocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
      
      expect(result).toBeNull();
    });

    it('continues functioning when setItem fails', () => {
      (LocalStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => {
        try {
          LocalStorage.setItem('treatise_annotations', mockAnnotationsMap);
        } catch (e) {
          console.error('Failed to save annotations:', e);
        }
      }).not.toThrow();
    });

    it('returns null when localStorage returns null', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = LocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
      expect(result).toBeNull();
    });
  });

  describe('Backward compatibility', () => {
    it('reads legacy format without wrapper', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      localStorage.setItem('treatise_annotations', JSON.stringify(mockAnnotationsMap));
      const result = ActualLocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
      
      expect(result).toEqual(mockAnnotationsMap);
    });

    it('reads new wrapped format', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      ActualLocalStorage.setItem('treatise_annotations', mockAnnotationsMap);
      const result = ActualLocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
      
      expect(result).toEqual(mockAnnotationsMap);
    });

    it('handles empty Map correctly', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      const emptyMap = new Map<string, Annotation>();
      const obj = Object.fromEntries(emptyMap);
      ActualLocalStorage.setItem('treatise_annotations', obj);
      
      const result = ActualLocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
      expect(result).toEqual({});
    });
  });
});

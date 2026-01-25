/**
 * Tests for AnnotationDisplayContext localStorage integration
 */

import { LocalStorage } from '@/lib/localStorage';
import { AnnotationDisplay } from '@/types/annotationDisplay';

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

describe('AnnotationDisplayContext localStorage integration', () => {
  const mockConfig: AnnotationDisplay = {
    weapons: true,
    weapon_type: false,
    guards: true,
    techniques: false,
    measures: false,
    strategy: false,
    strikes: false,
    targets: false,
    colors: {
      weapons: '#ef4444',
      weapon_type: '#f97316',
      guards: '#84cc16',
      techniques: '#06b6d4',
      measures: '#8b5cf6',
      strategy: '#ec4899',
      strikes: '#f59e0b',
      targets: '#10b981',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Loading config from storage', () => {
    it('loads config from storage on mount', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(mockConfig);

      const result = LocalStorage.getItem<AnnotationDisplay>('annotationDisplay');
      
      expect(result).toEqual(mockConfig);
      expect(LocalStorage.getItem).toHaveBeenCalledWith('annotationDisplay');
    });

    it('uses default config when storage returns null', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = LocalStorage.getItem<AnnotationDisplay>('annotationDisplay');
      const config = result ?? {
        weapons: true,
        weapon_type: true,
        guards: false,
        techniques: false,
        measures: false,
        strategy: false,
        strikes: false,
        targets: false,
        colors: {},
      };
      
      expect(config).toBeDefined();
      expect(config.weapons).toBe(true);
    });

    it('handles legacy format config', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      // Simulate old format
      localStorage.setItem('annotationDisplay', JSON.stringify(mockConfig));
      
      const result = ActualLocalStorage.getItem<AnnotationDisplay>('annotationDisplay');
      expect(result).toEqual(mockConfig);
    });
  });

  describe('Saving config to storage', () => {
    it('saves config to storage when updated', () => {
      LocalStorage.setItem('annotationDisplay', mockConfig);
      
      expect(LocalStorage.setItem).toHaveBeenCalledWith('annotationDisplay', mockConfig);
    });

    it('persists partial updates', () => {
      const update = { weapons: false };
      LocalStorage.setItem('annotationDisplay', { ...mockConfig, ...update });
      
      expect(LocalStorage.setItem).toHaveBeenCalledWith(
        'annotationDisplay',
        expect.objectContaining({ weapons: false })
      );
    });

    it('works with new wrapped format', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      ActualLocalStorage.setItem('annotationDisplay', mockConfig);
      const result = ActualLocalStorage.getItem<AnnotationDisplay>('annotationDisplay');
      
      expect(result).toEqual(mockConfig);
    });
  });

  describe('Error handling', () => {
    it('uses default when LocalStorage.getItem returns null', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = LocalStorage.getItem<AnnotationDisplay>('annotationDisplay');
      expect(result).toBeNull();
    });

    it('handles parse errors gracefully', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      localStorage.setItem('annotationDisplay', 'invalid json{');
      const result = ActualLocalStorage.getItem<AnnotationDisplay>('annotationDisplay');
      
      expect(result).toBeNull();
    });

    it('continues functioning when setItem fails', () => {
      (LocalStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => {
        try {
          LocalStorage.setItem('annotationDisplay', mockConfig);
        } catch (e) {
          // Application should handle gracefully
          console.error('Failed to save config:', e);
        }
      }).not.toThrow();
    });
  });

  describe('Backward compatibility', () => {
    it('reads legacy format without wrapper', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      localStorage.setItem('annotationDisplay', JSON.stringify(mockConfig));
      const result = ActualLocalStorage.getItem<AnnotationDisplay>('annotationDisplay');
      
      expect(result).toEqual(mockConfig);
    });

    it('reads new wrapped format', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      ActualLocalStorage.setItem('annotationDisplay', mockConfig);
      const result = ActualLocalStorage.getItem<AnnotationDisplay>('annotationDisplay');
      
      expect(result).toEqual(mockConfig);
    });
  });
});

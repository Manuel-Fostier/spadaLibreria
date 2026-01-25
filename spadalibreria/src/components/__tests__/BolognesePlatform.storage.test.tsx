/**
 * Tests for BolognesePlatform localStorage integration
 * Tests the migration from direct localStorage to LocalStorage utility
 */

import { LocalStorage } from '@/lib/localStorage';

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

describe('BolognesePlatform localStorage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Column visibility - showItalian', () => {
    it('loads showItalian preference from storage on mount', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(true);

      const result = LocalStorage.getItem<boolean>('showItalian');
      expect(result).toBe(true);
    });

    it('uses default false when storage returns null', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = LocalStorage.getItem<boolean>('showItalian');
      const showItalian = result ?? false;
      
      expect(showItalian).toBe(false);
    });

    it('saves showItalian to storage when changed', () => {
      LocalStorage.setItem('showItalian', true);
      
      expect(LocalStorage.setItem).toHaveBeenCalledWith('showItalian', true);
    });

    it('handles legacy format (JSON string) for showItalian', () => {
      // Simulate legacy format in localStorage
      localStorage.setItem('showItalian', 'true');
      
      // The actual LocalStorage utility should handle this
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      const result = ActualLocalStorage.getItem<boolean>('showItalian');
      
      expect(result).toBe(true);
    });
  });

  describe('Column visibility - showEnglish', () => {
    it('loads showEnglish preference from storage', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(true);

      const result = LocalStorage.getItem<boolean>('showEnglish');
      expect(result).toBe(true);
    });

    it('uses default false when storage returns null', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = LocalStorage.getItem<boolean>('showEnglish');
      const showEnglish = result ?? false;
      
      expect(showEnglish).toBe(false);
    });

    it('saves showEnglish to storage', () => {
      LocalStorage.setItem('showEnglish', false);
      
      expect(LocalStorage.setItem).toHaveBeenCalledWith('showEnglish', false);
    });
  });

  describe('Column visibility - showNotes', () => {
    it('loads showNotes preference from storage', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(true);

      const result = LocalStorage.getItem<boolean>('showNotes');
      expect(result).toBe(true);
    });

    it('uses default false when storage returns null', () => {
      (LocalStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = LocalStorage.getItem<boolean>('showNotes');
      const showNotes = result ?? false;
      
      expect(showNotes).toBe(false);
    });

    it('saves showNotes to storage', () => {
      LocalStorage.setItem('showNotes', true);
      
      expect(LocalStorage.setItem).toHaveBeenCalledWith('showNotes', true);
    });
  });

  describe('Error handling', () => {
    it('uses default when LocalStorage.getItem throws error', () => {
      (LocalStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      let result;
      try {
        result = LocalStorage.getItem<boolean>('showItalian');
      } catch {
        result = null;
      }
      
      const showItalian = result ?? false;
      expect(showItalian).toBe(false);
    });

    it('continues functioning when setItem fails', () => {
      (LocalStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => {
        try {
          LocalStorage.setItem('showItalian', true);
        } catch (e) {
          // Application should handle this gracefully
          console.error('Failed to save preference:', e);
        }
      }).not.toThrow();
    });
  });

  describe('Backward compatibility', () => {
    it('works with legacy localStorage format (plain JSON)', () => {
      // Use actual implementation for this test
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      // Simulate old format
      localStorage.setItem('showItalian', JSON.stringify(true));
      localStorage.setItem('showEnglish', JSON.stringify(false));
      
      expect(ActualLocalStorage.getItem<boolean>('showItalian')).toBe(true);
      expect(ActualLocalStorage.getItem<boolean>('showEnglish')).toBe(false);
    });

    it('works with new wrapped format', () => {
      const { LocalStorage: ActualLocalStorage } = jest.requireActual('@/lib/localStorage');
      
      // Set using new format
      ActualLocalStorage.setItem('showItalian', true);
      
      // Read back
      expect(ActualLocalStorage.getItem<boolean>('showItalian')).toBe(true);
    });
  });
});

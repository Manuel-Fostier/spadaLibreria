import { LocalStorage } from '../localStorage';

describe('LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setItem and getItem', () => {
    it('stores and retrieves a value', () => {
      LocalStorage.setItem('test', { foo: 'bar' });
      const result = LocalStorage.getItem<{ foo: string }>('test');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('wraps value with timestamp', () => {
      LocalStorage.setItem('test', 'value');
      const raw = localStorage.getItem('test');
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveProperty('value', 'value');
      expect(parsed).toHaveProperty('timestamp');
      expect(typeof parsed.timestamp).toBe('number');
    });

    it('stores boolean values correctly', () => {
      LocalStorage.setItem('bool', true);
      const result = LocalStorage.getItem<boolean>('bool');
      expect(result).toBe(true);
    });

    it('stores null values correctly', () => {
      LocalStorage.setItem('null', null);
      const result = LocalStorage.getItem<null>('null');
      expect(result).toBeNull();
    });

    it('stores arrays correctly', () => {
      const arr = [1, 2, 3];
      LocalStorage.setItem('array', arr);
      const result = LocalStorage.getItem<number[]>('array');
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('backward compatibility', () => {
    it('reads legacy format (raw JSON object)', () => {
      localStorage.setItem('legacy', JSON.stringify({ old: true }));
      const result = LocalStorage.getItem<{ old: boolean }>('legacy');
      expect(result).toEqual({ old: true });
    });

    it('reads legacy format (boolean string)', () => {
      localStorage.setItem('legacy', 'true');
      const result = LocalStorage.getItem<boolean>('legacy');
      expect(result).toBe(true);
    });

    it('reads legacy format (number string)', () => {
      localStorage.setItem('legacy', '42');
      const result = LocalStorage.getItem<number>('legacy');
      expect(result).toBe(42);
    });

    it('reads legacy format (string)', () => {
      localStorage.setItem('legacy', '"hello"');
      const result = LocalStorage.getItem<string>('legacy');
      expect(result).toBe('hello');
    });
  });

  describe('error handling', () => {
    it('returns null on missing key', () => {
      const result = LocalStorage.getItem('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null on parse error', () => {
      localStorage.setItem('corrupt', 'invalid json{');
      const result = LocalStorage.getItem('corrupt');
      expect(result).toBeNull();
    });

    it('logs error on parse error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      localStorage.setItem('corrupt', 'invalid json{');
      LocalStorage.getItem('corrupt');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('throws QuotaExceededError when storage full', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error: any = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      expect(() => LocalStorage.setItem('test', 'data')).toThrow();
      
      jest.restoreAllMocks();
    });

    it('logs error when quota exceeded', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error: any = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      try {
        LocalStorage.setItem('test', 'data');
      } catch (e) {
        // Expected
      }

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('quota'));
      
      jest.restoreAllMocks();
    });
  });

  describe('removeItem', () => {
    it('removes a key', () => {
      LocalStorage.setItem('test', 'value');
      LocalStorage.removeItem('test');
      expect(LocalStorage.getItem('test')).toBeNull();
    });

    it('does not throw on nonexistent key', () => {
      expect(() => LocalStorage.removeItem('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('removes all keys', () => {
      LocalStorage.setItem('key1', 'value1');
      LocalStorage.setItem('key2', 'value2');
      LocalStorage.clear();
      expect(LocalStorage.getItem('key1')).toBeNull();
      expect(LocalStorage.getItem('key2')).toBeNull();
    });
  });

  describe('getSize', () => {
    it('returns 0 for empty storage', () => {
      expect(LocalStorage.getSize()).toBe(0);
    });

    it('calculates size in bytes', () => {
      LocalStorage.setItem('test', 'a');
      const size = LocalStorage.getSize();
      expect(size).toBeGreaterThan(0);
    });

    it('accounts for multiple keys', () => {
      LocalStorage.setItem('key1', 'value1');
      const size1 = LocalStorage.getSize();
      LocalStorage.setItem('key2', 'value2');
      const size2 = LocalStorage.getSize();
      expect(size2).toBeGreaterThan(size1);
    });
  });

  describe('isFull', () => {
    it('returns false for empty storage', () => {
      expect(LocalStorage.isFull()).toBe(false);
    });

    it('returns false for small storage', () => {
      LocalStorage.setItem('test', 'small value');
      expect(LocalStorage.isFull()).toBe(false);
    });
  });
});

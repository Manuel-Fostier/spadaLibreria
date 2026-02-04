import { LocalStorage } from '../localStorage';

// Manual mock localStorage for size calculation tests
const createMockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem(key: string): string | null {
      return store[key] ?? null;
    },
    setItem(key: string, value: string): void {
      store[key] = value;
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      for (const key in store) {
        delete store[key];
      }
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    }
  };
};

describe('LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setItem and getItem', () => {
    it('stores and retrieves a value', () => {
      const status = LocalStorage.setItem('test', { foo: 'bar' });
      const result = LocalStorage.getItem<{ foo: string }>('test');
      expect(status).toEqual({ success: true });
      expect(result).toEqual({ foo: 'bar' });
    });

    it('wraps value with timestamp', () => {
      const status = LocalStorage.setItem('test', 'value');
      const raw = localStorage.getItem('test');
      const parsed = JSON.parse(raw!);
      expect(status).toEqual({ success: true });
      expect(parsed).toHaveProperty('value', 'value');
      expect(parsed).toHaveProperty('timestamp');
      expect(typeof parsed.timestamp).toBe('number');
    });

    it('stores boolean values correctly', () => {
      const status = LocalStorage.setItem('bool', true);
      const result = LocalStorage.getItem<boolean>('bool');
      expect(status).toEqual({ success: true });
      expect(result).toBe(true);
    });

    it('stores null values correctly', () => {
      const status = LocalStorage.setItem('null', null);
      const result = LocalStorage.getItem<null>('null');
      expect(status).toEqual({ success: true });
      expect(result).toBeNull();
    });

    it('stores arrays correctly', () => {
      const arr = [1, 2, 3];
      const status = LocalStorage.setItem('array', arr);
      const result = LocalStorage.getItem<number[]>('array');
      expect(status).toEqual({ success: true });
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
      const setItemSpy = jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      expect(() => LocalStorage.setItem('test', 'data')).toThrow();

      setItemSpy.mockRestore();
    });

    it('logs error when quota exceeded', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const setItemSpy = jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      try {
        LocalStorage.setItem('test', 'data');
      } catch {
        // Expected
      }

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('quota'));
      
      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
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
      // Use manual mock localStorage for size calculation tests
      // to avoid jest-localstorage-mock issues
      const mockLS = createMockLocalStorage();
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', { 
        value: mockLS, 
        writable: true, 
        configurable: true 
      });
      
      try {
        LocalStorage.setItem('test', 'a');
        const size = LocalStorage.getSize();
        expect(size).toBeGreaterThan(0);
      } finally {
        Object.defineProperty(global, 'localStorage', { 
          value: originalLocalStorage, 
          writable: true, 
          configurable: true 
        });
      }
    });

    it('accounts for multiple keys', () => {
      const mockLS = createMockLocalStorage();
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', { 
        value: mockLS, 
        writable: true, 
        configurable: true 
      });
      
      try {
        LocalStorage.setItem('key1', 'value1');
        const size1 = LocalStorage.getSize();
        LocalStorage.setItem('key2', 'value2');
        const size2 = LocalStorage.getSize();
        expect(size2).toBeGreaterThan(size1);
      } finally {
        Object.defineProperty(global, 'localStorage', { 
          value: originalLocalStorage, 
          writable: true, 
          configurable: true 
        });
      }
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

    it('returns true when above warning threshold', () => {
      const spy = jest.spyOn(LocalStorage, 'getSize').mockReturnValue(4 * 1024 * 1024 * 0.81);
      expect(LocalStorage.isFull()).toBe(true);
      spy.mockRestore();
    });
  });

  describe('size accuracy and warnings', () => {
    it('calculates deterministic size based on serialized value', () => {
      const mockLS = createMockLocalStorage();
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', { 
        value: mockLS, 
        writable: true, 
        configurable: true 
      });
      
      try {
        const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1234567890);
        LocalStorage.setItem('sizeKey', 'abc');
        const expectedSerialized = JSON.stringify({ value: 'abc', timestamp: 1234567890 });
        const expectedSize = (expectedSerialized.length + 'sizeKey'.length) * 2;
        expect(LocalStorage.getSize()).toBe(expectedSize);
        nowSpy.mockRestore();
      } finally {
        Object.defineProperty(global, 'localStorage', { 
          value: originalLocalStorage, 
          writable: true, 
          configurable: true 
        });
      }
    });

    it('returns warning when projected size exceeds threshold but below cap', () => {
      const sizeSpy = jest.spyOn(LocalStorage, 'getSize').mockReturnValue(4 * 1024 * 1024 * 0.8);
      const status = LocalStorage.setItem('warnKey', 'value');
      expect(status.success).toBe(true);
      expect(status.warning).toBeDefined();
      sizeSpy.mockRestore();
    });
  });
});

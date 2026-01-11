/**
 * LocalStorage wrapper with size monitoring and error handling
 */

export interface StorageItem<T> {
  value: T;
  timestamp: number;
  version?: number;
}

const MAX_STORAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB warning threshold

export const LocalStorage = {
  /**
   * Save item to localStorage
   * @throws Error if quota exceeded
   */
  setItem: <T>(key: string, value: T): void => {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now()
      };
      const serialized = JSON.stringify(item);
      
      // Check size before saving?
      // It's hard to predict exact size impact without trying.
      // But we can check current usage.
      
      localStorage.setItem(key, serialized);
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded');
        // Trigger event or callback?
      }
      throw e;
    }
  },

  /**
   * Retrieve item from localStorage
   */
  getItem: <T>(key: string): T | null => {
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) return null;
      
      const item = JSON.parse(serialized) as StorageItem<T>;
      return item.value;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return null;
    }
  },

  /**
   * Remove item
   */
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
   * Clear all items
   */
  clear: (): void => {
    localStorage.clear();
  },

  /**
   * Calculate approximate size of used storage in bytes
   */
  getSize: (): number => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length + key.length) * 2; // UTF-16 chars are 2 bytes
      }
    }
    return total;
  },

  /**
   * Check if storage is approaching limit
   */
  isFull: (): boolean => {
    return LocalStorage.getSize() > MAX_STORAGE_SIZE_BYTES;
  }
};

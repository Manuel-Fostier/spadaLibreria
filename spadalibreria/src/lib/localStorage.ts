/**
 * LocalStorage wrapper with size monitoring and error handling
 */

export interface StorageItem<T> {
  value: T;
  timestamp: number;
  version?: number;
}

const MAX_STORAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB hard cap
const WARNING_THRESHOLD_RATIO = 0.8; // 80% warning threshold
const WARNING_THRESHOLD_BYTES = MAX_STORAGE_SIZE_BYTES * WARNING_THRESHOLD_RATIO;

export const LocalStorage = {
  /**
   * Save item to localStorage
   * @throws Error if quota exceeded
   */
  setItem: <T>(key: string, value: T): { success: boolean; warning?: string } => {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now()
      };
      const serialized = JSON.stringify(item);
      const existing = localStorage.getItem(key);
      const existingSize = existing ? (existing.length + key.length) * 2 : 0;

      const currentSize = LocalStorage.getSize();
      const newEntrySize = (serialized.length + key.length) * 2;
      const projectedSize = currentSize - existingSize + newEntrySize;

      if (projectedSize > MAX_STORAGE_SIZE_BYTES) {
        const error: Error = new Error('Storage quota would be exceeded');
        error.name = 'QuotaExceededError';
        console.error('LocalStorage quota exceeded');
        throw error;
      }

      localStorage.setItem(key, serialized);

      if (projectedSize >= WARNING_THRESHOLD_BYTES) {
        const percent = ((projectedSize / MAX_STORAGE_SIZE_BYTES) * 100).toFixed(0);
        return { success: true, warning: `Storage ${percent}% full` };
      }

      return { success: true };
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
      
      const parsed = JSON.parse(serialized);
      
      // Check if it's wrapped format (has 'value' and 'timestamp')
      if (parsed && typeof parsed === 'object' && 'value' in parsed && 'timestamp' in parsed) {
        return parsed.value as T;
      }
      
      // Legacy format - return as-is
      return parsed as T;
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

    // Check if jest-localstorage-mock is in use (has __STORE__ property)
    const store = (localStorage as { __STORE__?: Record<string, string> }).__STORE__;
    if (store && typeof store === 'object') {
      // Use __STORE__ directly in test environment
      for (const [key, value] of Object.entries(store)) {
        total += (value.length + key.length) * 2; // UTF-16 chars are 2 bytes
      }
    } else {
      // Use standard localStorage API in production
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key) continue;
        const value = localStorage.getItem(key) ?? '';
        total += (value.length + key.length) * 2; // UTF-16 chars are 2 bytes
      }
    }

    return total;
  },

  /**
   * Check if storage is approaching limit
   */
  isFull: (): boolean => {
    return LocalStorage.getSize() >= WARNING_THRESHOLD_BYTES;
  }
};

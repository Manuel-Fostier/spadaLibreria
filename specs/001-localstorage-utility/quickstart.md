# Quick Start Guide: LocalStorage Utility Refactoring

**Feature**: 001-localstorage-utility  
**Audience**: Developers implementing this refactoring  
**Time to Complete**: ~2-3 hours with TDD approach

---

## Prerequisites

- Node.js 18+ and npm installed
- TypeScript understanding
- React hooks familiarity
- Jest + React Testing Library experience
- TDD workflow knowledge

---

## Development Environment Setup

### 1. Install Dependencies

```bash
cd spadalibreria

# Install jest-localstorage-mock for testing (if not already installed)
npm install --save-dev jest-localstorage-mock

# Verify installation
npm list jest-localstorage-mock
```

### 2. Configure Jest for localStorage Testing

Add to `setupTests.js` (if not already present):

```javascript
// setupTests.js
import 'jest-localstorage-mock';

// Clear before each test
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
```

### 3. Verify Test Environment

```bash
# Run existing tests to ensure environment works
npm test -- --testPathPattern=localStorage
```

---

## Implementation Workflow (TDD)

### Phase 1: Enhance LocalStorage Utility (1 hour)

#### Step 1: Write Tests First

Create `src/lib/__tests__/localStorage.test.ts`:

```typescript
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
  });

  describe('backward compatibility', () => {
    it('reads legacy format (raw JSON)', () => {
      localStorage.setItem('legacy', JSON.stringify({ old: true }));
      const result = LocalStorage.getItem<{ old: boolean }>('legacy');
      expect(result).toEqual({ old: true });
    });

    it('reads legacy format (boolean)', () => {
      localStorage.setItem('legacy', 'true');
      const result = LocalStorage.getItem<boolean>('legacy');
      expect(result).toBe(true);
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

    it('throws QuotaExceededError when storage full', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
        throw error;
      });

      expect(() => LocalStorage.setItem('test', 'data')).toThrow();
    });
  });

  describe('removeItem', () => {
    it('removes a key', () => {
      LocalStorage.setItem('test', 'value');
      LocalStorage.removeItem('test');
      expect(LocalStorage.getItem('test')).toBeNull();
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
  });
});
```

#### Step 2: Run Tests (Should Fail)

```bash
npm test -- --testPathPattern=localStorage
# Tests should fail - this is expected with TDD
```

#### Step 3: Update `localStorage.ts` Implementation

Enhance existing `src/lib/localStorage.ts` with backward compatibility:

```typescript
export interface StorageItem<T> {
  value: T;
  timestamp: number;
  version?: number;
}

const MAX_STORAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

export const LocalStorage = {
  setItem: <T>(key: string, value: T): void => {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now()
      };
      const serialized = JSON.stringify(item);
      localStorage.setItem(key, serialized);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded');
      }
      throw e;
    }
  },

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

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },

  getSize: (): number => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key];
        total += (key.length + value.length) * 2; // UTF-16
      }
    }
    return total;
  },

  isFull: (): boolean => {
    return LocalStorage.getSize() > MAX_STORAGE_SIZE_BYTES;
  }
};
```

#### Step 4: Verify Tests Pass

```bash
npm test -- --testPathPattern=localStorage
# All tests should pass now
```

---

### Phase 2: Migrate BolognesePlatform (30 minutes)

#### Step 1: Write Component Tests

Create `src/components/__tests__/BolognesePlatform.storage.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { LocalStorage } from '@/lib/localStorage';
import BolognesePlatform from '../BolognesePlatform';

describe('BolognesePlatform storage integration', () => {
  const mockProps = {
    treatises: [],
    glossary: new Map(),
    // ... other required props
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('loads showItalian from storage', () => {
    LocalStorage.setItem('showItalian', true);
    render(<BolognesePlatform {...mockProps} />);
    // Verify Italian column is shown
  });

  it('uses default when storage returns null', () => {
    jest.spyOn(LocalStorage, 'getItem').mockReturnValue(null);
    render(<BolognesePlatform {...mockProps} />);
    // Verify default behavior
  });

  it('handles legacy storage format', () => {
    localStorage.setItem('showItalian', 'true');
    render(<BolognesePlatform {...mockProps} />);
    // Verify works with old format
  });
});
```

#### Step 2: Refactor Component

Update `src/components/BolognesePlatform.tsx`:

```typescript
import { LocalStorage } from '@/lib/localStorage';

// Replace initialization
const [showItalian, setShowItalian] = useState(() => {
  if (typeof window !== 'undefined') {
    return LocalStorage.getItem<boolean>('showItalian') ?? false;
  }
  return false;
});

// Replace effect
useEffect(() => {
  LocalStorage.setItem('showItalian', showItalian);
}, [showItalian]);
```

Repeat for `showEnglish` and `showNotes`.

#### Step 3: Test

```bash
npm test -- --testPathPattern=BolognesePlatform
```

---

### Phase 3: Migrate AnnotationDisplayContext (30 minutes)

#### Step 1: Write Tests

```typescript
// src/contexts/__tests__/AnnotationDisplayContext.test.tsx
import { renderHook, act } from '@testing-library/react';
import { AnnotationDisplayProvider, useAnnotationDisplay } from '../AnnotationDisplayContext';
import { LocalStorage } from '@/lib/localStorage';

describe('AnnotationDisplayContext storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads config from storage', () => {
    const config = { showWeapons: true, showGuards: false };
    LocalStorage.setItem('annotationDisplayConfig', config);
    
    const { result } = renderHook(() => useAnnotationDisplay(), {
      wrapper: AnnotationDisplayProvider
    });
    
    expect(result.current.displayConfig.showWeapons).toBe(true);
  });

  it('saves config to storage on update', () => {
    const { result } = renderHook(() => useAnnotationDisplay(), {
      wrapper: AnnotationDisplayProvider
    });
    
    act(() => {
      result.current.setDisplayConfig({ ...result.current.displayConfig, showWeapons: true });
    });
    
    const saved = LocalStorage.getItem('annotationDisplayConfig');
    expect(saved).toHaveProperty('showWeapons', true);
  });
});
```

#### Step 2: Refactor Context

Update `src/contexts/AnnotationDisplayContext.tsx`:

```typescript
import { LocalStorage } from '@/lib/localStorage';

// Replace initialization
const stored = LocalStorage.getItem<AnnotationDisplayConfig>(STORAGE_KEY);

// Replace save effect
useEffect(() => {
  LocalStorage.setItem(STORAGE_KEY, displayConfig);
}, [displayConfig]);
```

---

### Phase 4: Migrate AnnotationContext (30 minutes)

Similar pattern to Phase 3, but handle Map serialization:

```typescript
// Save
const obj = Object.fromEntries(annotations);
LocalStorage.setItem('treatise_annotations', obj);

// Load
const stored = LocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
const localMap = stored ? new Map(Object.entries(stored)) : new Map();
```

---

## Verification Checklist

After completing all phases:

```bash
# Run all tests
npm test

# Run lint
npm run lint

# Build to verify no TypeScript errors
npm run build

# Start dev server and manually test
npm run dev
# Navigate to http://localhost:3000
# Toggle columns, create annotations, refresh page
# Verify data persists correctly
```

### Manual Testing Scenarios

1. **Column Visibility**:
   - Toggle Italian/English/Notes columns
   - Refresh page
   - Verify toggles persist

2. **Annotation Creation**:
   - Create new annotation
   - Refresh page
   - Verify annotation persists

3. **Error Handling** (Chrome DevTools):
   - Open DevTools → Application → Storage
   - Right-click localStorage → Clear
   - Create annotation
   - Verify app doesn't crash

4. **Backward Compatibility**:
   - Before migration: save some data
   - After migration: verify data still loads

---

## Troubleshooting

### Tests Fail with "localStorage is not defined"

**Solution**: Ensure `jest-localstorage-mock` is in `setupTests.js`:
```javascript
import 'jest-localstorage-mock';
```

### "Cannot read property 'value' of null"

**Solution**: Add null checks when reading from storage:
```typescript
const value = LocalStorage.getItem<T>('key') ?? defaultValue;
```

### Build Errors: "Cannot use localStorage on server"

**Solution**: Wrap in `typeof window !== 'undefined'` check:
```typescript
if (typeof window !== 'undefined') {
  LocalStorage.setItem('key', value);
}
```

---

## Next Steps

After successful implementation:

1. ✅ Commit changes with clear message
2. ✅ Push branch: `git push origin 001-localstorage-utility`
3. ✅ Create pull request
4. ✅ Request code review
5. ✅ Update documentation if API changes

---

## Reference Documentation

- [Feature Spec](./spec.md)
- [Data Model](./data-model.md)
- [API Contract](./contracts/localStorage-api.md)
- [Research Findings](./research.md)

---

## Estimated Timeline

| Phase | Time | Tasks |
|-------|------|-------|
| Setup | 15 min | Install deps, configure Jest |
| Phase 1: Utility | 1 hour | Write tests, enhance localStorage.ts |
| Phase 2: BolognesePlatform | 30 min | Write tests, refactor component |
| Phase 3: AnnotationDisplayContext | 30 min | Write tests, refactor context |
| Phase 4: AnnotationContext | 30 min | Write tests, refactor context |
| Verification | 15 min | Run tests, manual testing |
| **Total** | **3 hours** | |

**Note**: Times are estimates for experienced developers following TDD workflow.

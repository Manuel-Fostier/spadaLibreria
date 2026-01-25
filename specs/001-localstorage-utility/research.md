# Research: LocalStorage Utility Refactoring

**Feature**: 001-localstorage-utility  
**Date**: 2026-01-25  
**Purpose**: Resolve technical unknowns and establish best practices for migrating to centralized localStorage utility

---

## Research Questions

### 1. Backward Compatibility Strategy

**Question**: How to migrate existing localStorage data to wrapped format without breaking existing user data?

**Decision**: Implement transparent backward compatibility layer in LocalStorage.getItem()

**Rationale**:
- Existing data is stored as raw values or simple JSON
- New format wraps values in `StorageItem<T>` with timestamp/version
- getItem() must handle both formats transparently
- Migration happens lazily on first read, then write back in new format

**Alternatives Considered**:
- **One-time migration script**: Rejected - requires user action, risky if migration fails
- **Dual-read with fallback**: Rejected - too complex, maintains two code paths indefinitely
- **Version flag in localStorage**: Rejected - adds complexity without benefit

**Implementation Approach**:
```typescript
getItem: <T>(key: string): T | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  
  try {
    const parsed = JSON.parse(raw);
    
    // Check if already in new format (has 'value' and 'timestamp')
    if (parsed && typeof parsed === 'object' && 'value' in parsed && 'timestamp' in parsed) {
      return parsed.value as T;
    }
    
    // Legacy format - return as-is
    return parsed as T;
  } catch {
    return null;
  }
}
```

---

### 2. Error Handling Best Practices for React Hooks

**Question**: How to handle localStorage errors in React components using TDD approach?

**Decision**: Return null on errors, log to console, notify via callback/event if needed

**Rationale**:
- React components should receive null and use default values
- Errors should not crash the application (graceful degradation)
- Console logging aids debugging in development
- Optional error callback for user notifications (toast, banner)

**Best Practices**:
- Wrap all localStorage operations in try-catch
- Use early returns to simplify error paths
- Test error scenarios: QuotaExceededError, SecurityError (private browsing), parse errors
- Components should provide sensible defaults when storage fails

**TDD Test Cases**:
```typescript
describe('LocalStorage error handling', () => {
  it('returns null when storage unavailable', () => {
    // Mock localStorage.getItem to throw
    expect(LocalStorage.getItem('key')).toBeNull();
  });
  
  it('returns null when JSON parse fails', () => {
    localStorage.setItem('key', 'invalid json{');
    expect(LocalStorage.getItem('key')).toBeNull();
  });
  
  it('logs error when quota exceeded', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    // Mock setItem to throw QuotaExceededError
    expect(() => LocalStorage.setItem('key', largeValue)).toThrow();
    expect(consoleSpy).toHaveBeenCalled();
  });
});
```

---

### 3. Testing localStorage in Jest/React Testing Library

**Question**: What's the best approach to test localStorage interactions with TDD workflow?

**Decision**: Use jest-localstorage-mock and setup/teardown patterns

**Rationale**:
- jest-localstorage-mock provides realistic localStorage implementation
- Automatically clears between tests
- Supports all localStorage methods
- Well-maintained, widely used in React community

**Setup**:
```typescript
// jest.config.js already has setupFiles: ['./setupTests.js']
// Add to setupTests.js:
import 'jest-localstorage-mock';
```

**Test Patterns**:
```typescript
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

it('reads and writes to localStorage', () => {
  LocalStorage.setItem('test', { foo: 'bar' });
  expect(localStorage.setItem).toHaveBeenCalledWith(
    'test',
    expect.stringContaining('"value":{"foo":"bar"}')
  );
  
  const result = LocalStorage.getItem<{ foo: string }>('test');
  expect(result).toEqual({ foo: 'bar' });
});
```

**Best Practices**:
- Clear localStorage before each test
- Test both success and failure paths
- Mock specific errors (QuotaExceededError) when needed
- Verify console.error calls in error scenarios

---

### 4. Storage Size Monitoring Implementation

**Question**: How to accurately monitor localStorage usage and warn users proactively?

**Decision**: Calculate size on-demand using existing getSize() method, add warning threshold check

**Rationale**:
- Existing getSize() calculates bytes correctly (UTF-16 encoding)
- Warning at 80% of MAX_STORAGE_SIZE_BYTES (4MB threshold = 3.2MB warning)
- Check before writes, not continuously
- Return warning state to caller for UI notification

**Implementation Enhancement**:
```typescript
const WARNING_THRESHOLD = 0.8; // 80% of max

export const LocalStorage = {
  setItem: <T>(key: string, value: T): { success: boolean; warning?: string } => {
    try {
      const item: StorageItem<T> = { value, timestamp: Date.now() };
      const serialized = JSON.stringify(item);
      
      // Check size before saving
      const currentSize = LocalStorage.getSize();
      const newSize = currentSize + (serialized.length + key.length) * 2;
      
      if (newSize > MAX_STORAGE_SIZE_BYTES) {
        throw new Error('Storage quota would be exceeded');
      }
      
      localStorage.setItem(key, serialized);
      
      // Return warning if approaching limit
      if (newSize > MAX_STORAGE_SIZE_BYTES * WARNING_THRESHOLD) {
        return { 
          success: true, 
          warning: `Storage ${((newSize/MAX_STORAGE_SIZE_BYTES)*100).toFixed(0)}% full` 
        };
      }
      
      return { success: true };
    } catch (e) {
      console.error(`Error saving to localStorage: ${e}`);
      throw e;
    }
  },
  // ... other methods
};
```

---

### 5. Migration Strategy for React Components

**Question**: What's the safest way to migrate components using TDD?

**Decision**: Migrate one component at a time, write tests first, verify backward compatibility

**Rationale**:
- TDD ensures no regressions
- Smaller changes are easier to review and test
- Can deploy incrementally if needed
- Each component has different usage patterns

**Migration Order** (by risk/complexity):
1. **BolognesePlatform** (simplest - 3 boolean flags)
2. **AnnotationDisplayContext** (medium - config object)
3. **AnnotationContext** (complex - Map serialization, merge logic)

**TDD Workflow for Each Component**:
```typescript
// 1. Write test for current behavior
it('loads showItalian preference from storage', () => {
  localStorage.setItem('showItalian', 'true');
  render(<BolognesePlatform {...props} />);
  expect(screen.getByText('Italian column')).toBeVisible();
});

// 2. Refactor to use LocalStorage utility
// Replace: localStorage.getItem('showItalian')
// With: LocalStorage.getItem<boolean>('showItalian')

// 3. Verify test still passes

// 4. Add test for error handling
it('uses default when storage fails', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Storage unavailable');
  });
  render(<BolognesePlatform {...props} />);
  // Verify default behavior
});
```

---

## Dependencies Review

### Existing Dependencies (No Changes Needed)
- **React 18**: Already supports hooks pattern used in components
- **Next.js 15**: App Router, no impact on client-side storage
- **Jest + RTL**: Already configured, supports localStorage mocking
- **TypeScript**: Strict mode helps catch type errors

### New Dependencies (Optional)
- **jest-localstorage-mock**: Recommended for easier testing
  - Install: `npm install --save-dev jest-localstorage-mock`
  - Already included in many React projects
  - Reduces boilerplate in tests

---

## Risk Assessment

### High Risk
- **Data loss during migration**: Mitigated by backward-compatible read layer
- **Quota exceeded during normal operation**: Mitigated by proactive warnings

### Medium Risk
- **Component behavior changes**: Mitigated by comprehensive testing
- **Performance impact**: Mitigated by keeping operations fast (<10ms)

### Low Risk
- **Browser compatibility**: localStorage is universally supported
- **TypeScript typing**: Generic types ensure type safety

---

## Summary

All technical unknowns resolved:

1. ✅ **Backward compatibility**: Transparent detection and lazy migration
2. ✅ **Error handling**: Null returns, console logging, optional callbacks
3. ✅ **Testing strategy**: jest-localstorage-mock with setup/teardown
4. ✅ **Size monitoring**: On-demand calculation with 80% warning threshold
5. ✅ **Migration approach**: TDD workflow, component-by-component

**Next Phase**: Design data model and API contracts

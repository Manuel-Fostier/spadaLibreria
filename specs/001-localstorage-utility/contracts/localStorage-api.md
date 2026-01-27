# API Contract: LocalStorage Utility

**Version**: 1.0.0  
**Date**: 2026-01-25  
**Module**: `@/lib/localStorage`

---

## Overview

This contract defines the public API for the LocalStorage utility wrapper. All storage operations in the application MUST use this API instead of direct browser localStorage access.

---

## Type Definitions

### StorageItem<T>

Wrapper structure for stored values with metadata.

```typescript
interface StorageItem<T> {
  value: T;              // The actual stored data
  timestamp: number;     // Unix timestamp in milliseconds
  version?: number;      // Optional schema version
}
```

**Properties**:
- `value`: Any JSON-serializable type
- `timestamp`: Must be positive integer (milliseconds since epoch)
- `version`: Optional, must be positive integer if present

---

## LocalStorage API

### setItem<T>(key: string, value: T): void

Stores a value in localStorage with metadata wrapper.

**Parameters**:
- `key` (string, required): Storage key identifier
  - Must be non-empty string
  - Should use consistent naming convention
- `value` (T, required): Data to store
  - Must be JSON-serializable
  - Can be primitive, object, or array

**Returns**: `void`

**Throws**:
- `QuotaExceededError`: When storage quota exceeded
- `Error`: When serialization fails or storage unavailable

**Side Effects**:
- Writes to browser localStorage
- Logs errors to console
- Creates StorageItem wrapper with current timestamp

**Example**:
```typescript
import { LocalStorage } from '@/lib/localStorage';

// Store boolean
LocalStorage.setItem('showItalian', true);

// Store object
LocalStorage.setItem('config', { theme: 'dark', lang: 'fr' });

// Store array
LocalStorage.setItem('favorites', ['section1', 'section2']);
```

**Error Handling**:
```typescript
try {
  LocalStorage.setItem('largeData', hugeObject);
} catch (e) {
  if (e instanceof DOMException && e.name === 'QuotaExceededError') {
    // Handle quota exceeded
    console.error('Storage full');
  }
}
```

---

### getItem<T>(key: string): T | null

Retrieves a value from localStorage with backward compatibility.

**Parameters**:
- `key` (string, required): Storage key to retrieve

**Returns**: 
- `T`: The stored value if found and valid
- `null`: If key not found, parse error, or storage unavailable

**Type Parameter**:
- `T`: Expected type of the stored value (for type safety)

**Throws**: Never (errors are caught and logged)

**Side Effects**:
- Reads from browser localStorage
- Logs errors to console

**Behavior**:
- Detects format automatically (wrapped vs legacy)
- Unwraps StorageItem if present
- Returns legacy format as-is for backward compatibility
- Returns `null` on any error

**Example**:
```typescript
import { LocalStorage } from '@/lib/localStorage';

// Retrieve with type safety
const showItalian = LocalStorage.getItem<boolean>('showItalian');
if (showItalian === null) {
  // Use default value
  setShowItalian(false);
} else {
  setShowItalian(showItalian);
}

// Retrieve object
const config = LocalStorage.getItem<AppConfig>('config');
const theme = config?.theme ?? 'light';
```

**Backward Compatibility**:
```typescript
// Works with legacy format (raw JSON)
localStorage.setItem('old', JSON.stringify({ foo: 'bar' }));
const value = LocalStorage.getItem<{foo: string}>('old'); 
// Returns: { foo: 'bar' }

// Works with new format (StorageItem wrapper)
LocalStorage.setItem('new', { foo: 'baz' });
const value2 = LocalStorage.getItem<{foo: string}>('new');
// Returns: { foo: 'baz' }
```

---

### removeItem(key: string): void

Removes a key from localStorage.

**Parameters**:
- `key` (string, required): Storage key to remove

**Returns**: `void`

**Throws**: Never

**Side Effects**:
- Removes key from browser localStorage
- No-op if key doesn't exist

**Example**:
```typescript
import { LocalStorage } from '@/lib/localStorage';

LocalStorage.removeItem('showItalian');
```

---

### clear(): void

Removes all items from localStorage.

**Parameters**: None

**Returns**: `void`

**Throws**: Never

**Side Effects**:
- Clears entire localStorage
- Affects all stored data (use with caution)

**Example**:
```typescript
import { LocalStorage } from '@/lib/localStorage';

// Clear all storage (e.g., on logout or reset)
LocalStorage.clear();
```

**Warning**: This removes ALL localStorage data, including data from other features.

---

### getSize(): number

Calculates approximate size of all stored data.

**Parameters**: None

**Returns**: `number` - Size in bytes (approximate)

**Throws**: Never

**Side Effects**: None (read-only operation)

**Behavior**:
- Iterates all localStorage keys
- Calculates total size of keys + values
- Assumes UTF-16 encoding (2 bytes per character)

**Example**:
```typescript
import { LocalStorage } from '@/lib/localStorage';

const sizeBytes = LocalStorage.getSize();
const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
console.log(`Storage usage: ${sizeMB} MB`);
```

---

### isFull(): boolean

Checks if storage is approaching capacity limit.

**Parameters**: None

**Returns**: `boolean`
- `true`: Storage exceeds warning threshold (4MB)
- `false`: Storage within safe limits

**Throws**: Never

**Side Effects**: Calls `getSize()` internally

**Example**:
```typescript
import { LocalStorage } from '@/lib/localStorage';

if (LocalStorage.isFull()) {
  showWarning('Storage is running low. Consider deleting old annotations.');
}
```

---

## Usage Guidelines

### DO

✅ Import from `@/lib/localStorage`
```typescript
import { LocalStorage } from '@/lib/localStorage';
```

✅ Use type parameters for type safety
```typescript
const config = LocalStorage.getItem<AppConfig>('config');
```

✅ Provide default values for null results
```typescript
const showItalian = LocalStorage.getItem<boolean>('showItalian') ?? false;
```

✅ Handle QuotaExceededError on writes
```typescript
try {
  LocalStorage.setItem('data', largeObject);
} catch (e) {
  // Handle error
}
```

### DON'T

❌ Don't use browser localStorage directly
```typescript
// BAD: Direct access
localStorage.getItem('key');
localStorage.setItem('key', value);

// GOOD: Use utility
LocalStorage.getItem<T>('key');
LocalStorage.setItem('key', value);
```

❌ Don't assume getItem returns non-null
```typescript
// BAD: May crash on null
const config = LocalStorage.getItem<AppConfig>('config');
config.theme; // Error if null

// GOOD: Check for null
const config = LocalStorage.getItem<AppConfig>('config');
const theme = config?.theme ?? 'light';
```

❌ Don't manually JSON.parse/stringify
```typescript
// BAD: Manual serialization
LocalStorage.setItem('data', JSON.stringify(obj));
JSON.parse(LocalStorage.getItem<string>('data')!);

// GOOD: Utility handles it
LocalStorage.setItem('data', obj);
LocalStorage.getItem<MyType>('data');
```

---

## Migration Checklist

When migrating code to use this API:

- [ ] Replace `localStorage.getItem()` with `LocalStorage.getItem<T>()`
- [ ] Replace `localStorage.setItem()` with `LocalStorage.setItem()`
- [ ] Remove manual `JSON.parse()` / `JSON.stringify()`
- [ ] Add null checks and default values
- [ ] Add try-catch for `setItem()` calls
- [ ] Update TypeScript types to match
- [ ] Add/update tests for error scenarios
- [ ] Verify backward compatibility with existing data

---

## Backward Compatibility

**Format Detection**: The utility automatically detects and handles both formats:

| Format | Example | Detection | Behavior |
|--------|---------|-----------|----------|
| New (wrapped) | `{"value": {...}, "timestamp": 123}` | Has `value` + `timestamp` fields | Unwrap and return `value` |
| Legacy (raw) | `{...}` or `"..."` or `true` | Missing wrapper fields | Return as-is |

**Migration Strategy**: Lazy migration on first read
- Existing data remains in legacy format until read
- First `getItem()` returns legacy value
- Next `setItem()` stores in new format
- No user action required

---

## Testing Contract

All implementations MUST pass these test scenarios:

### Basic Operations
```typescript
it('stores and retrieves values', () => {
  LocalStorage.setItem('test', { foo: 'bar' });
  const result = LocalStorage.getItem<{foo: string}>('test');
  expect(result).toEqual({ foo: 'bar' });
});
```

### Backward Compatibility
```typescript
it('reads legacy format', () => {
  localStorage.setItem('legacy', JSON.stringify({ old: true }));
  const result = LocalStorage.getItem<{old: boolean}>('legacy');
  expect(result).toEqual({ old: true });
});
```

### Error Handling
```typescript
it('returns null on parse error', () => {
  localStorage.setItem('corrupt', 'invalid json{');
  const result = LocalStorage.getItem('corrupt');
  expect(result).toBeNull();
});

it('throws on quota exceeded', () => {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('QuotaExceededError');
  });
  expect(() => LocalStorage.setItem('test', 'data')).toThrow();
});
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-25 | Initial contract definition |

---

## Contact

For questions or clarifications about this API contract, refer to:
- Feature spec: `specs/001-localstorage-utility/spec.md`
- Data model: `specs/001-localstorage-utility/data-model.md`
- Implementation: `spadalibreria/src/lib/localStorage.ts`

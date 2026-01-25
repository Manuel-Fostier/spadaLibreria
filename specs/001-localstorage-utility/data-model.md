# Data Model: LocalStorage Utility Refactoring

**Feature**: 001-localstorage-utility  
**Date**: 2026-01-25  
**Purpose**: Define data structures and storage patterns for localStorage operations

---

## Core Entities

### 1. StorageItem<T>

**Description**: Wrapper object that encapsulates stored values with metadata for versioning and debugging.

**Fields**:
- `value: T` - The actual data being stored (generic type)
- `timestamp: number` - Unix timestamp (milliseconds) when data was saved
- `version?: number` - Optional version number for schema migrations

**Relationships**: None (self-contained value object)

**Validation Rules**:
- `timestamp` must be positive integer
- `value` can be any JSON-serializable type
- `version` if present must be positive integer

**State Transitions**: N/A (immutable value object)

**Example**:
```json
{
  "value": { "showItalian": true, "showEnglish": false },
  "timestamp": 1706198400000,
  "version": 1
}
```

---

### 2. Storage Keys

**Description**: Constants defining all localStorage keys used by the application.

**Keys**:

| Key | Type | Description | Component |
|-----|------|-------------|-----------|
| `showItalian` | `boolean` | Italian column visibility | BolognesePlatform |
| `showEnglish` | `boolean` | English column visibility | BolognesePlatform |
| `showNotes` | `boolean` | Notes column visibility | BolognesePlatform |
| `annotationDisplayConfig` | `AnnotationDisplayConfig` | Annotation display settings | AnnotationDisplayContext |
| `treatise_annotations` | `Map<string, Annotation>` | User annotations (serialized as object) | AnnotationContext |

**Validation Rules**:
- Keys must be valid strings (no special characters)
- Values must be JSON-serializable
- Boolean values: `true` or `false`
- Objects: Must match their respective TypeScript interfaces

---

### 3. LocalStorage Utility API

**Description**: Centralized wrapper providing consistent interface for all storage operations.

**Methods**:

#### setItem<T>(key: string, value: T): void

**Input**:
- `key`: Storage key (non-empty string)
- `value`: Data to store (JSON-serializable)

**Output**: `void` (throws on error)

**Behavior**:
- Wraps value in `StorageItem<T>` with current timestamp
- Serializes to JSON
- Stores in localStorage
- Throws `QuotaExceededError` if storage full
- Logs errors to console

**Validation**:
- `key` must be non-empty string
- `value` must be JSON-serializable
- Storage must be available

---

#### getItem<T>(key: string): T | null

**Input**:
- `key`: Storage key to retrieve

**Output**: 
- Stored value of type `T` if found
- `null` if not found or error occurs

**Behavior**:
- Reads raw value from localStorage
- Detects format (wrapped vs legacy)
- Unwraps `StorageItem` if present
- Returns raw value for backward compatibility
- Returns `null` on errors (parse failure, storage unavailable)
- Logs errors to console

**Validation**:
- Returns `null` for invalid/corrupted data
- Handles both new and legacy formats

---

#### removeItem(key: string): void

**Input**:
- `key`: Storage key to remove

**Output**: `void`

**Behavior**:
- Removes key from localStorage
- No-op if key doesn't exist

---

#### clear(): void

**Input**: None

**Output**: `void`

**Behavior**:
- Removes all items from localStorage
- Use with caution (affects all stored data)

---

#### getSize(): number

**Input**: None

**Output**: Size in bytes (number)

**Behavior**:
- Iterates all localStorage keys
- Calculates total size including keys and values
- Accounts for UTF-16 encoding (2 bytes per character)
- Returns approximate size in bytes

**Formula**: 
```typescript
size = Σ(keyLength + valueLength) × 2 bytes
```

---

#### isFull(): boolean

**Input**: None

**Output**: `true` if storage exceeds threshold, `false` otherwise

**Behavior**:
- Calls `getSize()`
- Compares to `MAX_STORAGE_SIZE_BYTES` (4MB)
- Returns boolean indicating if limit approached

---

## Data Flow Diagrams

### Write Operation Flow

```
Component
  ↓
  Calls LocalStorage.setItem(key, value)
  ↓
  Wrap value in StorageItem { value, timestamp }
  ↓
  JSON.stringify()
  ↓
  Try: localStorage.setItem(key, json)
  ↓
  Success → Return
  Error → Log error → Throw
```

### Read Operation Flow (with Backward Compatibility)

```
Component
  ↓
  Calls LocalStorage.getItem<T>(key)
  ↓
  Try: localStorage.getItem(key)
  ↓
  JSON.parse()
  ↓
  Is it StorageItem? (has 'value' + 'timestamp')
    Yes → Extract item.value → Return value
    No → Legacy format → Return parsed directly
  ↓
  Error → Log error → Return null
  ↓
  Component uses default value if null
```

---

## Migration Data Patterns

### Pattern 1: Simple Boolean (BolognesePlatform)

**Before**:
```typescript
localStorage.getItem('showItalian')  // Returns: "true" or "false" (string)
JSON.parse(stored)  // Returns: true or false (boolean)
```

**After**:
```typescript
LocalStorage.getItem<boolean>('showItalian')  // Returns: true, false, or null
// Backward compatible: handles both legacy string and new wrapped format
```

---

### Pattern 2: Configuration Object (AnnotationDisplayContext)

**Before**:
```typescript
localStorage.getItem('annotationDisplayConfig')
JSON.parse(stored)  // Returns: { showWeapons: true, ... }
```

**After**:
```typescript
LocalStorage.getItem<AnnotationDisplayConfig>('annotationDisplayConfig')
// Returns: { showWeapons: true, ... } or null
// Wrapped format: { value: {...}, timestamp: 123 }
```

---

### Pattern 3: Map Serialization (AnnotationContext)

**Before**:
```typescript
const obj = Object.fromEntries(annotations);  // Map → Object
localStorage.setItem('treatise_annotations', JSON.stringify(obj));

const stored = localStorage.getItem('treatise_annotations');
const parsed = JSON.parse(stored);
const map = new Map(Object.entries(parsed));  // Object → Map
```

**After**:
```typescript
const obj = Object.fromEntries(annotations);  // Map → Object
LocalStorage.setItem('treatise_annotations', obj);  // Utility handles JSON

const obj = LocalStorage.getItem<Record<string, Annotation>>('treatise_annotations');
const map = obj ? new Map(Object.entries(obj)) : new Map();
```

---

## Error Handling Patterns

### Pattern 1: Graceful Degradation (Read)

```typescript
const value = LocalStorage.getItem<boolean>('showItalian');
const showItalian = value ?? false;  // Use default if null
```

### Pattern 2: Try-Catch with Notification (Write)

```typescript
try {
  LocalStorage.setItem('annotations', data);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Show user notification: "Storage full, please delete old data"
  }
  // Continue without saving (app still functional)
}
```

### Pattern 3: Availability Check (Private Browsing)

```typescript
const isStorageAvailable = () => {
  try {
    const test = '__test__';
    LocalStorage.setItem(test, test);
    LocalStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
```

---

## Constraints & Validation

### Storage Size Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Browser quota | ~5-10 MB | Varies by browser |
| Warning threshold | 4 MB | 80% of conservative estimate |
| Per-key size | No specific limit | Part of total quota |

### Data Type Constraints

- **Supported**: string, number, boolean, object, array, null
- **Not supported**: undefined, Function, Symbol, BigInt, circular references
- **Special handling**: Date objects → ISO strings, Maps → Objects

### Performance Constraints

- Read operation: <5ms (synchronous)
- Write operation: <10ms (synchronous)
- Size calculation: <20ms (iterates all keys)

---

## Summary

**Entities Defined**: 3 (StorageItem, Storage Keys, LocalStorage Utility)  
**Methods**: 6 (setItem, getItem, removeItem, clear, getSize, isFull)  
**Migration Patterns**: 3 (Boolean, Object, Map)  
**Error Patterns**: 3 (Graceful degradation, Try-catch, Availability check)

**Key Insights**:
- Backward compatibility achieved through format detection in `getItem()`
- All components receive `null` on errors, use defaults
- Storage metadata (timestamp) enables future debugging/migration
- Generic types ensure type safety throughout the system

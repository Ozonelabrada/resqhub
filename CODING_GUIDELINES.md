# ResqHub Frontend - Coding Guidelines

## 1. Component Size & Structure

### Rule: Max 200 Lines Per Component
- **Hard limit**: 200 lines for a single component file
- **Soft limit**: 100 lines for optimal readability
- **When to split**: Extract into sub-components, custom hooks, or utility functions

**Example Structure:**
```
ComponentName/
  ├── index.tsx (main component, <150 lines)
  ├── hooks/
  │   ├── useComponentState.ts
  │   └── useComponentData.ts
  ├── components/
  │   ├── Header.tsx
  │   ├── Modal.tsx
  │   └── List.tsx
  ├── types.ts
  ├── constants.ts
  └── utils.ts
```

## 2. Naming Conventions

### Components
- **PascalCase** for component names: `StoreDetailModal`, `CommunityMembers`, `ActionMenu`
- **File names** match component name: `StoreDetailModal.tsx`

### Variables & Functions
- **camelCase** for variables and functions: `fetchStoreDetail`, `selectedStore`, `storeActionLoading`
- **Booleans** prefix with `is`, `has`, or `should`: `isLoading`, `hasError`, `shouldRefresh`

### Constants
- **UPPER_SNAKE_CASE** for constants: `MAX_FILE_SIZE`, `API_TIMEOUT`, `DEFAULT_PAGE_SIZE`

### API/Types
- **Interfaces** use `I` prefix or descriptive name: `IStore`, `StoreDetail`, `StoreActionPayload`
- **Enums** use PascalCase: `StoreStatus`, `ActionType`

## 3. State Management

### Rule: Separate Concerns
```typescript
// ❌ Don't mix unrelated state
const [data, setData] = useState(null);

// ✅ Do separate logical concerns
const [stores, setStores] = useState<Store[]>([]);
const [storesLoading, setStoresLoading] = useState(false);
const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(null);
const [storeDetailLoading, setStoreDetailLoading] = useState(false);
```

### Rule: Group Related State
```typescript
// ✅ Group modal state together
const [modal, setModal] = useState<{
  type: 'approve' | 'reject' | 'suspend' | null;
  open: boolean;
}>({ type: null, open: false });

const [modalInput, setModalInput] = useState('');
```

### Rule: Extract State to Custom Hooks
- If a component has **5+ state variables**, extract into a custom hook
- Store logic in hooks, rendering in components

## 4. API Integration

### Rule: Use Authenticated Axios Client
```typescript
import api from '@/api/client'; // Always use authenticated client

// ✅ Correct
const response = await api.get(`/communities/${id}/stores`);

// ❌ Avoid raw fetch
const response = await fetch(`/api/communities/${id}/stores`);
```

### Rule: Consistent Error Handling
```typescript
try {
  const response = await api.get(endpoint, config);
  if (response.data?.succeeded) {
    // Handle success
  }
} catch (error) {
  console.error('Error fetching data:', error);
  toast.error('Failed to load data');
}
```

### Rule: Minimal API Payloads
- Only fetch required data
- Use pagination: `page: 1, pageSize: 100` (or adjust based on need)
- For counts-only: use minimal response: `pageSize: 1`

```typescript
// ✅ Efficient - fetch just counts
const response = await api.get(`/communities/${id}/members`, {
  params: { page: 1, pageSize: 1 }
});

// ✅ Fetch full list with limit
const response = await api.get(`/communities/${id}/stores`, {
  params: { status, page: 1, pageSize: 100 }
});
```

## 5. React Hooks Best Practices

### Rule: Organize useEffect Hooks
```typescript
// Order: Data fetching → Side effects → Cleanup
// Group related effects together

// 1. Fetch data when dependencies change
useEffect(() => {
  fetchStores();
}, [activeTab, communityId]);

// 2. Separate data fetches to prevent cascading
useEffect(() => {
  fetchCounts();
}, [communityId]); // Different trigger

// 3. Setup/teardown (event listeners, timers)
useEffect(() => {
  const handleResize = () => { /* ... */ };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### Rule: Dependency Array Completeness
- Always include all dependencies
- Use exhaustive-deps ESLint rule
- If missing deps, consider extracting function to outer scope

```typescript
// ❌ Missing dependency
useEffect(() => {
  fetchData(filterId);
}, []); // filterId not in deps!

// ✅ Correct
useEffect(() => {
  fetchData(filterId);
}, [filterId]);
```

## 6. Error Handling

### Rule: Explicit Error States
```typescript
// ✅ Distinguish between loading and error
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Show appropriate UI
{isLoading && <Spinner />}
{error && <ErrorAlert message={error} />}
{data && <Content data={data} />}
```

### Rule: User-Friendly Error Messages
```typescript
// ❌ Don't expose raw errors
catch (error) {
  console.error(error.response?.data?.message || error.message);
}

// ✅ Show helpful, user-friendly messages
catch (error) {
  const message = 'Failed to update store status. Please try again.';
  toast.error(message);
  console.error('Store action error:', error);
}
```

## 7. Component Props & Types

### Rule: Use TypeScript Interfaces
```typescript
// ✅ Explicit types
interface StoreDetailModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: ActionType, reason?: string) => Promise<void>;
  isLoading: boolean;
}

const StoreDetailModal: React.FC<StoreDetailModalProps> = ({
  store,
  isOpen,
  onClose,
  onAction,
  isLoading
}) => { /* ... */ };
```

### Rule: Max Props Per Component
- More than 5 props → Consider restructuring
- Group related props into objects
- Use composition instead of prop drilling

## 8. Code Documentation

### Rule: JSDoc for Complex Functions
```typescript
/**
 * Updates store status and refreshes list
 * @param action - The action to perform (approve, reject, suspend, reopen)
 * @param reason - Optional reason for rejection/suspension
 * @returns Promise<void>
 */
const handleStoreAction = async (
  action: 'approve' | 'reject' | 'suspend' | 'reopen',
  reason?: string
): Promise<void> => { /* ... */ };
```

### Rule: Comment "Why", Not "What"
```typescript
// ❌ Obvious - don't comment
const count = stores.length; // Get the length

// ✅ Explain intent
// Fetch minimal data (pageSize=1) to get counts without loading full list
const response = await api.get(endpoint, { params: { page: 1, pageSize: 1 } });
```

## 9. Performance

### Rule: Memoize Expensive Operations
```typescript
// ✅ Memoize computed values
const storeCount = useMemo(() => 
  stores.filter(s => s.status === 'Approved').length,
  [stores]
);

// ✅ Memoize callbacks passed to children
const handleAction = useCallback(() => {
  // logic
}, [dependencies]);
```

### Rule: Lazy Load Components
```typescript
// ✅ Code split large modals/pages
const StoreDetailModal = lazy(() => import('./StoreDetailModal'));

<Suspense fallback={<Spinner />}>
  <StoreDetailModal {...props} />
</Suspense>
```

## 10. Testing

### Rule: Test Behavior, Not Implementation
```typescript
// ✅ Test what user sees
test('displays approve button for pending stores', () => {
  render(<StoreCard store={pendingStore} />);
  expect(screen.getByText('Approve')).toBeInTheDocument();
});

// ❌ Don't test internal state
test('setState is called', () => {
  // avoid testing implementation details
});
```

### Rule: Test File Location
```
components/
  ├── StoreCard.tsx
  └── __tests__/
      └── StoreCard.test.tsx
```

## 11. File Organization

### Rule: Co-locate Related Code
```
Feature/
  ├── Feature.tsx (main component)
  ├── Feature.module.css (styles)
  ├── types.ts (interfaces/types)
  ├── constants.ts (constants)
  ├── utils.ts (utilities)
  ├── hooks.ts (custom hooks)
  ├── __tests__/ (tests)
  └── subcomponents/ (if needed)
```

## 12. Git Commits & PRs

### Rule: Atomic Commits
- One feature/fix per commit
- Commit message format: `type: description`
  - `feat: add store management UI`
  - `fix: resolve authentication error on store endpoints`
  - `refactor: extract StoreDetailModal into separate component`
  - `test: add tests for store actions`

### Rule: Keep PRs Focused
- Max 400 lines changed per PR (when possible)
- Link to related issues
- Include before/after screenshots for UI changes

## 13. Accessibility (A11y)

### Rule: Semantic HTML
```typescript
// ✅ Use semantic elements
<button onClick={handleClick}>Delete</button>
<nav>Navigation</nav>

// ❌ Avoid generic divs for interactive elements
<div onClick={handleClick} role="button">Delete</div>
```

### Rule: ARIA Labels
```typescript
// ✅ Add labels for screen readers
<button aria-label="Open action menu">
  <MoreVertical size={20} />
</button>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

## 14. Security

### Rule: Never Store Sensitive Data in Client State
```typescript
// ❌ Don't store tokens/passwords
const [authToken, setAuthToken] = useState('');

// ✅ Use secure storage (httpOnly cookies via server)
// Token is handled by API interceptor automatically
```

### Rule: Validate & Sanitize Input
```typescript
// ✅ Validate user input
const handleSubmit = (input: string) => {
  if (!input.trim() || input.length > 500) {
    toast.error('Invalid input');
    return;
  }
  // Process
};
```

### Rule: Use Environment Variables
```typescript
// ✅ Correct
const API_URL = import.meta.env.VITE_API_URL;

// ❌ Avoid hardcoding
const API_URL = 'https://api.example.com';
```

## 15. Common Patterns

### Modal Management Pattern
```typescript
const [modal, setModal] = useState<{
  type: 'approve' | 'reject' | 'suspend' | null;
  open: boolean;
}>({ type: null, open: false });

// Open modal
setModal({ type: 'reject', open: true });

// Close modal
setModal({ type: null, open: false });

// Use in JSX
{modal.open && modal.type === 'reject' && <RejectModal />}
```

### Dropdown Menu Pattern
```typescript
const [menuOpen, setMenuOpen] = useState(false);

<div className="relative">
  <button onClick={() => setMenuOpen(!menuOpen)}>
    <MoreVertical />
  </button>
  {menuOpen && (
    <div className="absolute...">
      {/* Menu items with conditional rendering */}
    </div>
  )}
</div>
```

## 16. Code Review Checklist

Before committing, verify:
- [ ] Component < 200 lines
- [ ] Naming conventions followed
- [ ] No console.log() in production code
- [ ] Error handling present
- [ ] API calls authenticated
- [ ] Loading states handled
- [ ] TypeScript types complete
- [ ] No prop drilling (>5 levels)
- [ ] Dependencies in useEffect arrays
- [ ] Responsive design checked
- [ ] Accessibility considered
- [ ] Tests pass (if applicable)

---

## Summary

**Key Takeaways:**
1. **Keep components small** (< 200 lines)
2. **Use TypeScript** for all components and functions
3. **Separate concerns** (state, logic, rendering)
4. **Handle errors explicitly** with user-friendly messages
5. **Use authenticated API client** for all requests
6. **Document why, not what**
7. **Test behavior, not implementation**
8. **Follow naming conventions** consistently
9. **Organize files by feature**, not by type
10. **Review before committing** using the checklist

---

*Last Updated: February 7, 2026*

# GearTrack — Testing Guide

This guide explains how to run the automated test suite for GearTrack.

## Overview

The test suite verifies CRUD operations and RLS policies for the `computers` entity using Vitest. Tests are written as integration tests that connect to the real Supabase instance.

## Installation

All test dependencies are already installed. Verify by running:

```bash
npm list vitest @vitest/ui jsdom
```

## Running Tests

### Option 1: Run Tests in Watch Mode (Recommended for Development)

```bash
npm test
```

This starts Vitest in watch mode. Tests will re-run whenever you modify the test file.

### Option 2: Run Tests with UI Dashboard

```bash
npm run test:ui
```

This opens an interactive browser-based dashboard at `http://localhost:51204/__vitest__/` (or similar) where you can:
- View all tests and their status
- See detailed output and logs
- Filter tests
- Re-run specific tests

### Option 3: Run Tests Once (CI Mode)

```bash
npm test -- --run
```

This runs the test suite once and exits (useful for CI/CD pipelines).

## Important: Authentication Required

**Tests require an authenticated user.** Before running tests:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open your app** at `http://localhost:5173`

3. **Sign in** with your Supabase credentials

4. **Then run tests** in another terminal:
   ```bash
   npm test
   ```

The test suite will use the authenticated user's store_id to run tests within their store. This ensures RLS policies are properly tested.

## Test Coverage

The test suite (`src/__tests__/computers.test.js`) includes:

### CREATE Operations
- ✅ Create a computer successfully
- ✅ Create a computer with image_url
- ✅ Handle missing required fields

### READ Operations
- ✅ Read all computers for the current store
- ✅ Read a specific computer by ID
- ✅ Filter computers by status
- ✅ Verify RLS policies (only user's store computers returned)

### UPDATE Operations
- ✅ Update a computer's status
- ✅ Update multiple fields at once
- ✅ Update image_url

### DELETE Operations
- ✅ Delete a computer
- ✅ Handle deleting non-existent records

### RLS Policy Verification
- ✅ Verify store isolation — users only see their store's computers
- ✅ Verify authenticated user's store_id is applied

## Test Output Example

```
 ✓ src/__tests__/computers.test.js (13)
   ✓ Computers CRUD Operations & RLS Policies (13)
     ✓ CREATE Operations (3)
       ✓ should create a computer successfully
       ✓ should create a computer with image_url
       ✓ should fail to create a computer without required fields
     ✓ READ Operations (4)
       ✓ should read all computers for the current store
       ✓ should read a specific computer by ID
       ✓ should filter computers by status
       ✓ should verify RLS policy - only return user's store computers
     ✓ UPDATE Operations (3)
       ✓ should update a computer status
       ✓ should update multiple computer fields
       ✓ should update computer with image_url
     ✓ DELETE Operations (2)
       ✓ should delete a computer
       ✓ should handle deleting non-existent computer gracefully
     ✓ RLS Policy Verification (1)
       ✓ should verify computers are isolated by store_id

Test Files  1 passed (1)
     Tests  13 passed (13)
```

## Troubleshooting

### Error: "No authenticated user found"

**Solution:** You must sign in before running tests. Follow the "Authentication Required" section above.

### Error: "Failed to get user store"

**Solution:** Your user account doesn't have a store_id. This might happen if:
- The database trigger didn't execute when you signed up
- Your user record wasn't created properly

**Fix:** Create a manual user record in Supabase:
```sql
-- Run in Supabase SQL Editor
INSERT INTO stores (name)
VALUES ('My Test Store')
RETURNING id;

-- Then use the returned store_id in this:
INSERT INTO users (id, store_id, email, role)
VALUES ('YOUR_AUTH_ID', 'STORE_ID', 'your@email.com', 'staff');
```

### Tests Timeout

**Solution:** If tests timeout, increase the timeout in `vitest.config.js`:
```js
test: {
  testTimeout: 30000, // 30 seconds
}
```

## Writing Additional Tests

To add more tests:

1. Create a new file in `src/__tests__/` (e.g., `users.test.js`)
2. Import Vitest utilities:
   ```js
   import { describe, it, expect, beforeAll, afterAll } from 'vitest'
   import { supabase } from '../src/lib/supabase'
   ```
3. Write test cases using `describe()` and `it()` blocks
4. Tests will automatically run with `npm test`

## Test Best Practices

- Always clean up test data in `afterAll()` blocks
- Use meaningful test names that describe what they verify
- Keep tests focused on a single behavior
- Use `beforeAll()` and `afterAll()` for setup and cleanup
- Test both happy paths and error cases

## CI/CD Integration

For automated testing in CI pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm test -- --run
```

This runs tests once and exits with code 0 (success) or 1 (failure).

---

Happy testing! 🧪

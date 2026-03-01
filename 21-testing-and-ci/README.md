# Step 21 — Testing and CI

## Goal

Add automated tests to the DevLog app using **Vitest** and **React Testing Library** for the frontend, **supertest** for the API, and a **GitHub Actions** workflow that runs every test on every push.

## What You'll Practice

| Concept | Where |
|---|---|
| Vitest test runner (globals, environments) | `vite.config.ts` (`test` block) |
| React Testing Library (render, screen, userEvent) | `src/components/__tests__/*.test.tsx` |
| Custom jest-dom matchers (`toBeInTheDocument`) | `src/test/setup.ts` |
| Supertest for Express routes | `server/__tests__/health.test.ts` |
| Extracting the Express app for testability | `server/app.ts` (new) |
| GitHub Actions CI pipeline | `.github/workflows/ci.yml` |

## Prerequisites

- Step 20 completed (deployed frontend)
- Node ≥ 20

## What Changed from Step 20

| File | What Changed |
|---|---|
| `package.json` | Added vitest, RTL, jest-dom, user-event, jsdom, supertest as devDependencies; added `test` and `test:watch` scripts |
| `vite.config.ts` | Added `/// <reference types="vitest/config" />` and `test` block (globals, jsdom environment, setupFiles) |
| `src/vite-env.d.ts` | Added `/// <reference types="vitest/globals" />` for IDE type support |
| `server/app.ts` | **New** — extracted Express app creation (middleware, routes, health checks) from `server/index.ts` so it can be imported by tests |
| `server/index.ts` | Simplified — imports `app` from `./app.js`, keeps only startup guard, static files, listen, and graceful shutdown |
| `tsconfig.server.json` | Added `server/__tests__` to `exclude` so `tsc` doesn't compile test files |
| `src/test/setup.ts` | **New** — imports `@testing-library/jest-dom/vitest` for custom matchers |
| `src/components/__tests__/*.test.tsx` | **New** — 4 component test files |
| `server/__tests__/health.test.ts` | **New** — API health endpoint test |
| `.github/workflows/ci.yml` | **New** — GitHub Actions pipeline |

Everything else is unchanged from Step 20.

## Setup

```bash
cd 21-testing-and-ci
npm install
```

Copy your `.env` from Step 20:

```bash
cp ../20-deploy-frontend-gh-pages/.env .env
npx prisma generate
```

Run the test suite:

```bash
npm test
```

## Steps

### 1. Install test dependencies

Vitest is the test runner — it uses the same Vite config your app already has, so there's no separate bundler config for tests.

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom supertest @types/supertest
```

| Package | Purpose |
|---|---|
| `vitest` | Test runner (fast, uses Vite transforms) |
| `@testing-library/react` | `render()` and `screen` queries for React components |
| `@testing-library/jest-dom` | Custom matchers like `toBeInTheDocument()` |
| `@testing-library/user-event` | Simulates real user interactions (type, click) |
| `jsdom` | In-memory DOM environment for component tests |
| `supertest` | HTTP assertions for Express routes (no server.listen needed) |

### 2. Configure Vitest in `vite.config.ts`

Add the `test` block to your existing Vite config:

```ts
/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // ... existing config ...
    test: {
      globals: true,          // describe/it/expect available without imports
      environment: 'jsdom',   // DOM environment for React components
      setupFiles: './src/test/setup.ts',
    },
  }
})
```

The `/// <reference types="vitest/config" />` directive tells TypeScript that the config object includes `test`.

**`globals: true`** makes `describe`, `it`, `expect`, and `vi` available in every test file without importing them — just like Jest.

### 3. Create the setup file

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

This single import extends Vitest's `expect` with DOM-specific matchers:

- `toBeInTheDocument()` — element exists in the DOM
- `toHaveValue()` — form input has a specific value
- `toBeVisible()` — element is visible to the user
- `toHaveTextContent()` — element contains specific text

### 4. Extract `server/app.ts` for testability

To test Express routes with supertest, you need the `app` object **without** calling `app.listen()`. Split the server into two files:

**`server/app.ts`** — creates and exports the Express app:

```ts
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
// ... middleware, routes, health checks ...

export default app
```

**`server/index.ts`** — imports the app and starts it:

```ts
import app from './app.js'
// ... startup guard, static files, listen, graceful shutdown ...
```

This separation is a common pattern — it lets supertest make requests to the app without starting a real HTTP server.

> **Morgan in tests**: `app.ts` disables morgan logging when `NODE_ENV === 'test'` to keep test output clean.

### 5. Write component tests

Test files live next to the components they test, in a `__tests__` folder:

```
src/components/
  __tests__/
    Footer.test.tsx       ← simplest possible test
    AboutSection.test.tsx ← heading + text content
    EntryCard.test.tsx    ← props, user interaction, conditional rendering
    EntryForm.test.tsx    ← form validation, submission, pre-filled values
  Footer.tsx
  AboutSection.tsx
  EntryCard.tsx
  EntryForm.tsx
```

#### Start simple — `Footer.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders the copyright with current year', () => {
    render(<Footer />)
    expect(screen.getByText(/© \d{4} DevLog/)).toBeInTheDocument()
  })
})
```

Key concepts:
- **`render()`** mounts the component in jsdom
- **`screen`** provides queries to find elements (`getByText`, `getByRole`, etc.)
- **`toBeInTheDocument()`** is from jest-dom (our setup file)

#### Test props and events — `EntryCard.test.tsx`

Components that accept props and use React Router need some extra setup:

```tsx
import { MemoryRouter } from 'react-router-dom'

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <EntryCard entry={testEntry} {...props} />
    </MemoryRouter>
  )
}
```

- **`MemoryRouter`** wraps components that use `<Link>` — it provides router context without a real browser URL
- **`vi.fn()`** creates a mock function you can assert on
- **`vi.spyOn(window, 'confirm')`** intercepts the browser confirm dialog

#### Test forms — `EntryForm.test.tsx`

```tsx
import userEvent from '@testing-library/user-event'

await userEvent.type(screen.getByLabelText('Title'), 'My Entry')
await userEvent.click(screen.getByText('Save Entry'))
```

- **`userEvent`** is async and simulates real user behavior (keystrokes, focus, blur)
- **`getByLabelText()`** finds inputs by their `<label>` — this tests accessibility too:
  if this query fails, your form has a labeling issue

### 6. Write API tests

Server tests use `// @vitest-environment node` to override the default jsdom environment:

```ts
// @vitest-environment node
import request from 'supertest'
import app from '../app.js'

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
```

- **`// @vitest-environment node`** — this magic comment tells Vitest to use Node (not jsdom) for this file
- **`request(app)`** — supertest takes the Express app and makes in-memory requests — no `listen()` needed
- The health endpoint doesn't hit the database, so no DB connection is required

### 7. Add test scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- **`vitest run`** — runs all tests once and exits (for CI)
- **`vitest`** — runs in watch mode, re-running tests when files change (for development)

### 8. Set up GitHub Actions CI

`.github/workflows/ci.yml` runs on every push and pull request to `main`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        working-directory: 21-testing-and-ci
        run: npm ci

      - name: Generate Prisma client
        working-directory: 21-testing-and-ci
        env:
          DATABASE_URL: "sqlserver://localhost:1433;database=ci;user=sa;password=Passw0rd;encrypt=true;trustServerCertificate=true"
        run: npx prisma generate

      - name: Run tests
        working-directory: 21-testing-and-ci
        run: npm test

      - name: Build
        working-directory: 21-testing-and-ci
        run: npm run build
```

> **Dummy `DATABASE_URL`**: `prisma generate` needs `DATABASE_URL` in the environment (the schema references it), but it doesn't actually connect to a database. Any syntactically valid URL works.

## Helpful Hints

- **Test file naming**: Vitest discovers files matching `**/*.test.{ts,tsx}` by default — no configuration needed.
- **`getByRole` vs `getByText`**: Prefer `getByRole` when testing headings, buttons, or links — it queries by accessibility role, which means your tests also verify accessibility.
- **`queryBy*` returns `null`**: Use `queryByText` (not `getByText`) when asserting something is **not** present — `getByText` throws if the element isn't found.
- **`userEvent` is async**: Always `await` userEvent calls — they simulate real browser events that may trigger state updates.
- **Watch mode**: `npm run test:watch` re-runs affected tests on save — much faster than running the full suite manually.
- **Server test environment**: Use `// @vitest-environment node` at the top of server test files — without it, Vitest defaults to jsdom and Node built-ins may behave unexpectedly.

## ✅ Do

- Write at least one test per component before shipping
- Use `getByRole` and `getByLabelText` — they double as accessibility checks
- Keep tests focused — one behavior per `it()` block
- Run `npm test` before pushing (or let CI catch it)
- Mock external dependencies (APIs, databases) — don't hit real services in tests

## ❌ Don't

- Don't test implementation details (internal state, CSS class names) — test what the user sees
- Don't forget `MemoryRouter` when testing components that use `<Link>` or `useNavigate`
- Don't skip `await` on `userEvent` — it leads to flaky tests
- Don't import `describe`/`it`/`expect` when `globals: true` is set — they're already available
- Don't put your entire Express server in one file — extract `app.ts` so tests can import the app without starting a listener

## Check Your Work

1. `npm test` → all 12 tests pass (5 test files)
2. `npm run test:watch` → tests re-run on file changes
3. `npm run build` → no TypeScript errors
4. Push to GitHub → GitHub Actions runs the CI workflow
5. Check the **Actions** tab → green checkmark on the workflow

## Stretch

- Add a test for `LoginPage` that mocks the auth API and tests the login flow
- Add a test for `TagFilter` that verifies filtering changes the selected tag
- Add snapshot tests for layout components (`Header`, `Footer`)
- Add a coverage report: `vitest run --coverage` and set a minimum threshold in CI
- Test the `/api/entries` routes with supertest (mock Prisma to avoid needing a database)

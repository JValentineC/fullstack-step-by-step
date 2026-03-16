# Step 29 – Accordion Entries & Oldest-First Sort

> **Branch / PR context:** bonus step — UI polish for GitHub Pages demo

## What changed

Two related improvements to the entries list:

1. **Accordion cards** — each entry collapses into a compact one-liner (title
   - date + mood badge). Click to expand and see the full summary, tags, and
     edit/delete buttons.
2. **Oldest-first default sort** — changed from `desc` to `asc` so visitors
   read the dev log chronologically (Step 1 → Step 30).

### Key ideas

| Concept                | Detail                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| **daisyUI collapse**   | `collapse collapse-arrow join-item border-base-300 border` — built-in accordion with animated arrow |
| **join join-vertical** | Wrapper class on the entries list that visually merges adjacent collapse items                      |
| **Sort flip**          | Default `sortOrder` state changed from `'desc'` to `'asc'` in both `App.tsx` and `demo-data.ts`     |

### Changed files

| File                           | What changed                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `src/components/EntryCard.tsx` | Converted from static card → daisyUI collapse accordion                                      |
| `src/App.tsx`                  | Changed default sort `'desc'` → `'asc'`; wrapped entries list in `join join-vertical w-full` |
| `src/data/demo-data.ts`        | Default sort direction `'asc'` to match App.tsx                                              |

### Before → After

**Before:** Full card always expanded, newest first.

**After:** Compact accordion rows, oldest first — click any row to expand.

---

_Hey interns — step 29 tightens up the UI so 30 entries don't look like a
CVS receipt. Accordions keep things tidy and chronological order tells a
story. What's a dev log's favorite instrument? The accor-dion. 🪗
Keep coding, keep reading ~jv_

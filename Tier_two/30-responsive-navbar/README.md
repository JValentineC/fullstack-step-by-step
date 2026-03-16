# Step 30 – Responsive Navbar

> **Branch / PR context:** bonus step — mobile-friendly navigation

## What changed

Replaced the single-style navbar with a responsive design:

| Viewport                    | Layout                                          |
| --------------------------- | ----------------------------------------------- |
| **Desktop** (≥ md / 768 px) | Horizontal text links in a flex row             |
| **Mobile** (< md)           | Hamburger (☰) dropdown with icon + label links |

### Key ideas

| Concept                 | Detail                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Tailwind responsive** | `hidden md:flex` shows desktop links only on md+; `md:hidden` shows hamburger only below md                     |
| **daisyUI dropdown**    | `dropdown dropdown-end` positions the mobile menu below the hamburger button                                    |
| **SVG inline icons**    | Each mobile link has a 16 × 16 SVG icon (home, document, plus, info, arrow) for quick recognition               |
| **Auth-aware links**    | When logged in: shows New Entry + Log Out; when not: shows Log In. Same logic in both desktop and mobile menus. |

### Changed files

| File                        | What changed                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `src/components/Header.tsx` | Full rewrite: responsive desktop text links + mobile hamburger dropdown with icons |

### Desktop view

```
JVC Dev Log    Home  Entries  New Entry  About     Log Out
```

### Mobile view

```
JVC Dev Log                                          [☰]
                                            ┌────────────┐
                                            │ 🏠 Home    │
                                            │ 📄 Entries │
                                            │ ➕ New     │
                                            │ ℹ️ About   │
                                            │ 🚪 Log Out │
                                            └────────────┘
```

---

_Hey interns — step 30 makes the navbar actually usable on a phone. Desktop
gets clean text links, mobile gets a tidy hamburger with icons. Why did the
hamburger menu break up with the navbar? It needed more space. 🍔
Keep coding, keep reading ~jv_

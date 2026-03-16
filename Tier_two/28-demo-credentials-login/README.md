# Step 28 – Demo Credentials on Login Page

> **Branch / PR context:** bonus step — GitHub Pages demo polish

## What changed

When the app is running in **demo mode** (no `VITE_API_URL`), the login page
now displays a helpful info box with all four sample credentials so visitors
can log in immediately without guessing.

### Key ideas

| Concept                | Detail                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Feature flag**       | `const DEMO = !import.meta.env.VITE_API_URL` — same pattern used throughout the app |
| **Conditional render** | `{DEMO && (<div>…</div>)}` shows the credentials table only in demo builds          |
| **daisyUI alert**      | Wrapped in `alert alert-info` for visibility                                        |
| **table table-xs**     | Compact daisyUI table listing username / password / role                            |

### Changed files

| File                           | What changed                                                         |
| ------------------------------ | -------------------------------------------------------------------- |
| `src/components/LoginPage.tsx` | Added `DEMO` const + conditional credentials table at bottom of form |

### How it looks

In **demo mode**, the login page shows:

```
🎓 Demo Mode — Sample Credentials
┌──────────────┬───────────────────────────────┬────────┐
│ Username     │ Password                      │ Role   │
├──────────────┼───────────────────────────────┼────────┤
│ jvc          │ hashedpassword_demo_jvc2026    │ admin  │
│ intern_alex  │ hashedpassword_demo_alex2026   │ intern │
│ intern_maya  │ hashedpassword_demo_maya2026   │ intern │
│ intern_dev   │ hashedpassword_demo_dev2026    │ intern │
└──────────────┴───────────────────────────────┴────────┘
Or register a new account — it's saved in your browser.
```

In **production** with a real backend, this box is completely absent.

---

_Hey interns — step 28 adds a little hospitality to the demo. If the user
can't log in, the demo is useless, so we literally hand them the keys.
Why did the login form go to therapy? Because it had too many issues. 🔑
Keep coding, keep reading ~jv_

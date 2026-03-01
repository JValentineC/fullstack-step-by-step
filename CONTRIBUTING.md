# Contributing to DevLog

Thanks for your interest in improving this tutorial! Here's how to help.

## Ground Rules

- **One step = one PR.** Don't mix changes across multiple step folders.
- **Keep it beginner-friendly.** If an intern couldn't follow your change in 10 minutes, it's too big.
- **Follow the README outline.** Every step README must have: Goal, What You'll Practice, Prerequisites, Steps, Helpful Hints, Do/Don't, Check Your Work, Stretch.

## How to Propose a Change

1. Fork the repo and create a branch: `fix/step-03-alt-text` or `feat/step-12-seed-script`.
2. Make your changes in the relevant step folder.
3. Verify the app runs: `cd <step-folder> && npm install && npm run dev`.
4. Verify the build passes: `npm run build`.
5. Open a PR with a clear description of what you changed and why.

## What Makes a Good Contribution

- **Bug fixes** — broken code, typos, incorrect instructions
- **Clarity improvements** — better explanations, additional hints
- **Accessibility fixes** — missing alt text, heading hierarchy issues
- **New stretch exercises** — optional challenges that reinforce the step's lesson

## What to Avoid

- Adding `className` or CSS to steps that haven't introduced styling yet
- Introducing concepts before their designated step
- Large refactors that change multiple steps at once
- Adding dependencies not required by the step's lesson

## Commit Messages

Follow the convention used in the repo:

```
feat(step-02): strip template and add About section
fix(step-04): correct HashRouter import path
docs(step-07): add hint about controlled vs uncontrolled inputs
```

## Code Style

- Semantic HTML tags (`header`, `main`, `section`, `footer`) before `className`
- TypeScript (`.tsx` files)
- No unused imports or dead code
- Images in `public/` for early steps

## Questions?

Open an issue and tag it with `question`. We're happy to help!

# Step 01 - Getting Started (Vite + React + TypeScript)

## Goal

Scaffold a **React + TypeScript** app using **Vite** and confirm it runs locally. By the end of this step you'll have a working dev server and understand every file the template creates.

## What You'll Practice

- Creating a Vite project with the `react-ts` template from the command line
- Reading through the generated file tree and understanding each file's purpose
- Running the dev server and verifying Hot Module Replacement (HMR)

## Prerequisites

| Requirement | How to Check |
|---|---|
| Node.js ≥ 20 | `node -v` |
| npm (comes with Node) | `npm -v` |
| A terminal (PowerShell, bash, zsh, etc.) | - |
| A code editor (VS Code recommended) | - |

## Steps

### 1. Scaffold the project


npm create vite@latest devlog-01 -- --template react-ts


> **What just happened?** `npm create vite@latest` downloads the latest Vite scaffolding tool. The `-- --template react-ts` flag tells it to use React with TypeScript out of the box.

### 2. Install dependencies

cd devlog-01
npm install

### 3. Start the dev server

npm run dev

Open the URL printed in your terminal (usually **http://localhost:5173**). You should see the Vite + React logos and a counter button.

### 4. Explore the file tree

devlog-01/
├── index.html            ← Single-page shell; Vite injects your app here
├── package.json          ← Project metadata and scripts
├── tsconfig.json         ← Root TypeScript config (references the two below)
├── tsconfig.app.json     ← TS settings for your app source code
├── tsconfig.node.json    ← TS settings for Node-side files (vite.config.ts)
├── vite.config.ts        ← Vite configuration (plugins, build options)
├── eslint.config.js      ← Linting rules
├── public/
│   └── vite.svg          ← Static asset copied as-is to the build
└── src/
    ├── main.tsx          ← React entry point; mounts <App /> into #root
    ├── App.tsx           ← Starter component with a counter
    ├── App.css           ← Styles scoped to App
    ├── index.css         ← Global styles
    ├── vite-env.d.ts     ← Type declarations for Vite client features
    └── assets/
        └── react.svg     ← Imported as a module (gets hashed filename in build)

### 5. Try HMR

Open `src/App.tsx` in your editor. Change the text inside the `<h1>` tag to something like:


<h1>DevLog</h1>


Save the file. The browser updates **instantly** without a full page reload - that's Hot Module Replacement.

## Helpful Hints

- **Vite** is a next-generation build tool that replaces Create React App. It uses native ES modules for lightning-fast dev startup.
- **TypeScript** adds static types to JavaScript. You'll see `.tsx` files instead of `.jsx` - the `x` means the file can contain JSX (React markup).
- The `tsconfig.json` at the root doesn't hold compiler options itself; it references `tsconfig.app.json` (browser code) and `tsconfig.node.json` (config files). This is called **project references**.
- Files in `public/` are served as-is at the site root (`/vite.svg`). Files in `src/assets/` are processed by Vite and get hashed filenames in production builds.
- `vite-env.d.ts` lets TypeScript understand Vite-specific imports like `import logo from './logo.svg'`.

## Do ✅ / Don't ❌

| ✅ Do                                           |                                                                    |
|---                                                 |                                                                            ---|
| Run `npm run dev` and confirm the counter works.           |      
| Commit your work: `feat(step-01): scaffold vite react-ts app`. |              
| Read through every generated file to build familiarity. |   
| Keep the terminal open - Vite watches for changes automatically. |    

   ❌ Don't 

  Rename or delete files randomly - we'll clean up in Step 02. |
     Install CSS frameworks or extra libraries yet. |
  Worry about understanding every TypeScript compiler option right now. |
    Edit `tsconfig` files unless you know what you're changing. |



## Check Your Work

- [ ] `npm run dev` starts without errors.
- [ ] The browser shows the **Vite + React** logos and a spinning React logo.
- [ ] Clicking the **count** button increments the number.
- [ ] Editing `src/App.tsx` and saving triggers an instant browser update (HMR).

## Stretch

1. Open `src/main.tsx` - can you explain what `createRoot` does and why the app is wrapped in `<StrictMode>`?
2. Open `src/App.tsx` - the `useState` hook returns `[count, setCount]`. What happens if you change the initial value from `0` to `100`?
3. Run `npm run build` and look inside the generated `dist/` folder. How do the filenames in `dist/assets/` differ from the source files?
4. Check out the [Vite docs](https://vite.dev/guide/) and [React docs](https://react.dev/learn) to preview what's coming next.

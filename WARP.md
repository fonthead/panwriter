# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## About PanWriter

PanWriter is a distraction-free markdown editor built with Electron and React. It has tight integration with pandoc for import/export to multiple file formats, and features a preview pane with paginated layout support. The app uses CodeMirror for editing and pagedjs for rendering paginated previews.

## Development Commands

### Setup
```bash
npm ci  # Install dependencies (uses package-lock.json for reproducible installs)
```

After installation, the `postinstall` script automatically copies required assets:
- `pagedjs` polyfill to `public/`
- `katex` distribution to `public/katex/`
- `texmath.css` to `public/katex/`

### Running the App
```bash
npm run electron:dev  # Run in development mode with hot reload
```

This command:
1. Starts the React dev server (on http://127.0.0.1:3000)
2. Compiles TypeScript in the `electron/` directory
3. Launches Electron with `ELECTRON_IS_DEV=1`

### Building
```bash
npm run build          # Build React app only (to build/ directory)
npm run electron:tsc   # Compile Electron TypeScript only
npm run electron:build # Build both React app and Electron code
npm run dist           # Build distributable packages (to dist/ directory)
npm run dist-all       # Build for macOS, Linux, and Windows
```

### Testing and Code Quality
```bash
npm test          # Run React tests (react-scripts test)
npm run lint      # Lint source code with ESLint
npm run tsc       # Type-check React/src TypeScript
```

**Note:** This project does not appear to have extensive test coverage. When adding tests, use React Testing Library conventions (the project uses react-scripts).

### Development with Pandoc
PanWriter requires [pandoc](https://pandoc.org/installing.html) to be installed for export functionality. The app calls pandoc as a subprocess using Node's `spawn`.

## Architecture Overview

### Electron Process Architecture

**Main Process** (`electron/main.ts`):
- Window management and lifecycle
- File operations (open, save, recent files)
- Pandoc subprocess integration for import/export
- Auto-updates via electron-updater
- Settings persistence

**Renderer Process** (`src/`):
- React application with editor and preview components
- State management via React's `useReducer` hook

**Preload Script** (`electron/preload.ts`):
- IPC bridge between main and renderer processes
- Exposes `window.ipcApi` to renderer

**IPC Layer** (`electron/ipc.ts`):
- Two-way communication between processes
- Main process handles: close, minimize, maximize, openLink, saveSettings
- Renderer receives: dispatch actions, platform info, commands

### State Management

The app uses React's built-in `useReducer` for state management, not Redux or other libraries.

**Core State** (`src/appState/AppState.ts`):
- `doc`: Current document (markdown content, YAML metadata, HTML preview, file info)
- `metaEditorOpen`: Whether YAML metadata editor is visible
- `settings`: User settings (auto-update, title bar behavior)
- `split`: View mode ('onlyEditor', 'split', 'onlyPreview')
- `paginated`: Whether preview uses paged layout

**State Updates** (`src/appState/appStateReducer.ts`):
All state changes flow through typed actions defined in `src/appState/Action.ts`. Key actions:
- `setMdAndRender`: Update markdown and trigger preview
- `setSplitAndRender`: Change view mode
- `togglePaginated`: Toggle between continuous and paginated preview
- `initDoc`: Initialize document from file system
- `setMetaAndRender`: Update YAML metadata

### Preview Rendering Pipeline

1. **Markdown Conversion** (`src/renderPreview/convertMd.ts`):
   - Parses markdown with `markdown-it` and plugins
   - Handles YAML metadata extraction (`convertYaml.ts`)
   - Converts to HTML

2. **Rendering** (`src/renderPreview/renderPreview.ts`):
   - Throttles rapid updates (only one render at a time)
   - Delegates to either `renderPlain` or `renderPaged` based on `paginated` state

3. **Preview Implementations** (`src/renderPreview/renderPreviewImpl.ts`):
   - `renderPlain`: Continuous scroll preview in iframe
   - `renderPaged`: Uses pagedjs polyfill for paginated CSS media

4. **Scroll Synchronization** (`src/renderPreview/scrolling.ts`):
   - Syncs editor scrolling with preview when appropriate

### Component Structure

**App Component** (`src/components/App/App.tsx`):
Root component that manages global state and renders:
- `Toolbar`: File operations, view controls, export
- `Editor`: CodeMirror-based markdown editor
- `MetaEditor`: YAML metadata editor (conditional)
- `Preview`: Preview pane (iframe-based)
- `SettingsModal`: App settings (conditional)

**Editor** (`src/components/Editor/Editor.tsx`):
- Uses `react-codemirror2` wrapper around CodeMirror 5
- Handles markdown editing with syntax highlighting
- Dispatches `setMdAndRender` action on changes

**Preview** (`src/components/Preview/Preview.tsx`):
- Container for iframe preview
- Receives rendered HTML from state
- Displays paginated or continuous preview

### Pandoc Integration

**Export** (`electron/pandoc/export.ts`):
- Reads YAML metadata from document
- Merges with external YAML files from user data directory
- Builds pandoc command-line arguments
- Spawns pandoc subprocess with document content on stdin
- Supports export to file or clipboard

**Import** (`electron/pandoc/import.ts`):
- Converts non-markdown files to markdown via pandoc
- Preserves original format information

**YAML Configuration**:
Documents can include YAML metadata that controls pandoc export:
```yaml
---
title: My Document
output:
  html:
    katex: true
  latex:
    pdf-engine: xelatex
---
```

### User Data Directory

Location (created on first use):
- macOS: `~/Library/Application Support/PanWriterUserData`
- Linux: `~/.config/PanWriterUserData`
- Windows: `%APPDATA%\PanWriterUserData`

Files in this directory:
- `settings.yaml`: App settings (autoUpdateApp)
- `default.yaml`: Default pandoc metadata/options for all documents
- `{type}.yaml`: Theme-specific defaults (e.g., `letter.yaml` for documents with `type: letter`)

Access via `electron/dataDir.ts` helper functions.

### Build Configuration

**TypeScript**:
- Separate tsconfig files for React (`tsconfig.json`) and Electron (`electron/tsconfig.json`)
- React: Target ES2019, JSX transform, strict mode
- Electron: Compiles to CommonJS for Node.js

**Electron Builder** (in package.json):
- Builds universal binaries for macOS (arm64 + x64)
- DMG and ZIP for macOS, NSIS installer for Windows, AppImage for Linux
- File associations: .md, .markdown, .txt, .html, .docx, .odt, .tex

**React Scripts**:
- Uses `--openssl-legacy-provider` flag (for compatibility with newer Node.js)
- `INLINE_RUNTIME_CHUNK=false` prevents inline runtime in HTML

### Special Considerations

**Node.js Version**: Project uses Volta to pin Node.js 18.17.1. Make sure Volta is installed or use the correct Node version manually.

**OpenSSL Legacy Provider**: The build scripts include `--openssl-legacy-provider` due to webpack/OpenSSL compatibility issues. This may need adjustment if upgrading dependencies.

**Pandoc PATH**: The main process uses `fix-path` package to ensure pandoc is accessible on macOS (where GUI apps have limited PATH).

**Website Mode**: The React app can run standalone (without Electron) for the web version. Checks `window.ipcApi` existence to determine mode.

**CodeMirror Version**: Uses CodeMirror 5 (not the newer CodeMirror 6). Keep this in mind when looking for documentation or plugins.

## Common Patterns

### Adding a New Action
1. Define action type in `src/appState/Action.ts`
2. Handle action in `src/appState/appStateReducer.ts`
3. Dispatch from component: `dispatch({ type: 'actionName', ...payload })`

### IPC Communication
**Renderer to Main**:
```typescript
window.ipcApi?.send.someMethod(args)
```

**Main to Renderer**:
```typescript
ipc.sendMessage(win, { type: 'actionName', ...data })
```

### File Operations
- Opening/saving files: Use `electron/file.ts` helpers
- File paths stored in `doc.filePath` (absolute paths)
- `doc.fileDirty` tracks unsaved changes
- Close event handler prompts to save if dirty

### Preview Updates
The preview automatically re-renders when `state.doc` changes (via `useEffect` in App.tsx). Manual preview updates are not needed unless implementing new features.

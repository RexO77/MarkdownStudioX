# Markdown Studio X

_Write markdown, watch it typeset._

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Local first](https://img.shields.io/badge/data-stays%20in%20your%20browser-orange.svg)

**Markdown Studio X is a writing studio that lives entirely in your browser.** You type plain text; it typesets a real page next to your cursor, live, with the care of a print shop — and when you're done it hands you the document in whatever format the destination wants: Markdown, HTML, PDF, Word, LaTeX. There is no account, no server, and no sync. Your documents live in your browser and nowhere else.

The design is borrowed from the place markdown actually comes from: the Bell Labs `troff` pipeline, where plain text in a terminal became beautifully typeset technical papers. The manuscript on the left is the terminal; the galley on the right is the phototypeset page.

---

## What people actually use it for

This is not just a markdown previewer. Because everything is local, instant, and export-ready, it works as:

- **A daily journal.** Open the tab, write. The document index (⌘\) keeps every entry, searchable and starrable, persisted in your browser — or synced to a real folder of `.md` files you own. Focus mode (⌘⇧F) strips the chrome down to just you and the page.
- **A README / docs workbench.** GitHub-flavored markdown — tables, task lists, `> [!NOTE]` alerts, footnotes, syntax-highlighted code — renders exactly, so what you see is what the repo gets.
- **A math notebook.** `$e^{i\pi} + 1 = 0$` typesets with KaTeX as you type — in the editor, in the preview, and in every export. Currency stays currency: `$5 and $10` is never mistaken for a formula.
- **A LaTeX compiler.** Paste a full `\documentclass` document — a resume, a paper — and the built-in **LaTeX Lab** compiles it to a real PDF with a real TeX engine, entirely in your browser. No Overleaf account, no 4 GB TeX install.
- **A conversion utility.** Paste markdown in, export a typeset PDF, a Word file, or a `.tex` document out. The typography carries through.

## The two-sided page

The core of the studio is one document with two faces, and **both are editable**:

- **The manuscript** — a plain-text markdown editor with formatting shortcuts, list continuation, Tab indent/outdent, and find & replace with regex (⌘F).
- **The galley** — a Notion-style WYSIWYG page: type `/` for a block palette (headings, lists, tasks, tables, code listings, alert stamps, dividers), select text for a floating format bubble, click an alert's label to change its type, pick code-listing languages inline.

Edits on either side flow through the shared markdown source. Views: **MARKDOWN** (M), **SPLIT** (S) with synchronized scrolling, **RICH TEXT** (G).

Round-tripping is guarded, not assumed: constructs the rich-text side cannot re-serialize faithfully (raw HTML, footnote definitions, front matter, full LaTeX documents) open the galley read-only rather than silently corrupting your source.

### Typography

The galley sets STIX Two Text on a 24px baseline grid — the ruling of a phototypeset page. Code listings run in Courier Prime with syntax highlighting and copy buttons. Tables get print rules, GitHub alerts render as proof stamps, punctuation is smartened (`--` → –, quotes curl), and math is typeset by KaTeX. Both faces (and the HTML/PDF exports) carry the same page.

## Math, everywhere

Inline `$...$` and display `$$...$$` spans render with KaTeX across every surface — the live galley, the preview, and HTML/PDF/Word exports — driven by one shared delimiter grammar so a formula that renders in one place renders in all of them:

- Pandoc-style guards keep prose dollars as prose: `costs $5 and $10` never typesets.
- Math inside `` `inline code` `` and code fences is left alone.
- LaTeX backslashes survive round-trips through the rich-text editor untouched — `$\frac{a}{b}$` stays `$\frac{a}{b}$` in your source.
- The `.tex` export passes math through natively.

## LaTeX Lab

A full TeX Live 2026 distribution, compiled to WebAssembly, running in a web worker. Paste any complete LaTeX document and get a real PDF — `geometry`, `titlesec`, `enumitem`, `hyperref`, custom unicode mappings, all of it — with pixel-fidelity to a native `pdflatex` run.

**Three ways in:**

1. Paste a `\documentclass` document into the editor → a toast offers **"Open LaTeX Lab"** with your document carried along.
2. Command palette (⌘P) → **Open LaTeX Lab**.
3. Navigate to `/latex` directly.

**What it costs, honestly:** the engine and TeX core download on your first compile — about 122 MB (a one-time, cached cost; nothing downloads until you press Compile). Packages beyond the core stream in on demand. After that first run the engine boots from browser storage and a one-page document compiles in about a second, offline included. The markdown editor never loads any of this — the Lab is a separate, lazily-loaded route.

Compilation is 100% client-side: your document is never uploaded anywhere.

## Sync — your files, in your folder, on your cloud

Connect a **sync folder** in Settings and every document becomes a real `.md` file in a directory you choose. The sync is two-way and continuous:

- Edits, renames, and deletes in the app propagate to the files.
- Files edited by anything else — another editor, another machine — flow back in when their copy is newer.
- Drop a new `.md` file into the folder and it appears as a document.
- A file deleted outside the app is re-exported rather than treated as a delete: losing a file never silently destroys a document.

**The cloud part costs nothing:** point the sync folder at your Google Drive, OneDrive, iCloud, or Dropbox desktop folder and their sync client carries your documents to every device — the app never talks to a cloud API, needs no account, and holds no tokens. Built on the File System Access API, so it needs a Chromium browser (Chrome, Edge, Arc, Brave); elsewhere the app simply keeps using browser storage.

### Google Drive sync (no desktop client needed)

For true in-browser cloud sync, connect **Google Drive** in Settings. Documents mirror as `.md` files into a "Markdown Studio X" folder in your Drive — visible, editable, yours. Sign-in happens entirely in the browser via Google Identity Services with the `drive.file` scope, which means:

- The app can only see files it created — never the rest of your Drive.
- There is no backend, no client secret, and no token stored beyond the session.
- Renames, edits, deletes, and new files sync both ways (Drive's stable file IDs even make external renames track correctly).

Self-hosting? Drive sync activates when `VITE_GOOGLE_CLIENT_ID` is set. Run the interactive setup wizard — it walks you through the free, one-time Google Cloud console steps and writes the ID into `.env.local`:

```bash
./scripts/setup-google-drive.sh
```

## AI formatting (optional, bring your own key)

Paste messy text, pick a tone, content type, and length, and let a model restructure it into clean markdown. Powered by your own [Groq API key](https://console.groq.com/keys), stored only in your browser. This is the single feature that sends anything over the network, and only when you invoke it.

## Export

| Format | What you get |
|---|---|
| Markdown | The source, exactly |
| HTML | A standalone typeset page, galley CSS inlined (KaTeX styles included when math is present) |
| PDF | The typeset galley, rendered in-app with the real fonts |
| Word (.doc) | Word-compatible HTML with the document structure intact |
| Plain text | Markdown syntax stripped |
| LaTeX (.tex) | A compilable `article` document; math passes through natively |

## Privacy

- Documents persist in `localStorage` — and, if you connect a sync folder, as plain `.md` files on your own disk. No account, no server, no telemetry on your content.
- The optional AI feature calls Groq's API with the text you explicitly submit, using your key.
- The LaTeX Lab fetches engine assets and TeX packages (files, not your content) from static hosting; compilation happens locally.

## Keyboard

| | |
|---|---|
| ⌘P | Command palette |
| ⌘\ | Document index (search, star, rename) |
| ⌘F | Find & replace (regex-capable) |
| ⌘B / ⌘I / ⌘K / ⌘\` | Bold / italic / link / inline code |
| ⌘⇧H / L / Q / C | Heading / list / quote / code block |
| ⌘⇧F | Focus mode |
| M / S / G | Markdown / split / rich-text view |
| `/` in the galley | Block palette |

A tmux-style statusline keeps live word count, cursor position, and an honest save state in view.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:8080.

**LaTeX Lab (optional):** the WASM TeX engine assets are large and not committed. To enable the Lab locally:

```bash
npx texlyre-busytex download-assets ./public/core
```

This drops ~685 MB of engine + TeX Live bundles into `public/core/busytex/` (gitignored). Only a subset is ever served to a browser.

## Development

```bash
npm run dev        # dev server on :8080
npm run build      # production build (Vite 8 / Rolldown)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run analyze    # bundle visualizer
```

### Architecture notes

- **One markdown source, two editors.** The galley is Tiptap; `tiptap-markdown` serializes edits back to the source. [galley-safety.ts](src/lib/galley-safety.ts) lists the constructs that can't round-trip and flips the galley read-only when it sees them.
- **One math grammar.** [math.ts](src/lib/math.ts) defines the single `$...$` / `$$...$$` regex used by the galley decorations, the serializer's escape guard, and the export renderer — so math behavior can't drift between surfaces.
- **The Lab is quarantined.** [LatexLab.tsx](src/pages/LatexLab.tsx) is a lazy route; the TeX engine, its assets, and pdf.js never enter the main bundle. Handoff from the editor travels via `sessionStorage`.
- **Sync is a mirror, not a database.** [sync-folder.ts](src/lib/sync-folder.ts) reconciles the document list against the folder each pass — mtime vs. `updatedAt`, last-writer-wins — with the directory handle persisted in IndexedDB. The React side ([useSyncFolder.ts](src/hooks/useSyncFolder.ts)) debounces write-through on edit and re-reconciles on window focus.
- **Exports share the galley.** [markdownUtils.ts](src/utils/markdownUtils.ts) renders the same GFM + math pipeline the app shows, with the galley CSS embedded in every HTML-derived format.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS · Tiptap 2 + tiptap-markdown · marked · KaTeX · texlyre-busytex (TeX Live 2026 WASM) · pdf.js · framer-motion · self-hosted Courier Prime & STIX Two Text (both OFL)

## Security

Document content is treated as **untrusted** — it can be pasted, AI-generated, or imported from a synced folder that someone else can write to. Everything rendered passes through DOMPurify at a single choke point before it can reach an export or the DOM, the rich-text galley renders through Tiptap nodes with raw HTML disabled, KaTeX runs with `trust: false`, and the LaTeX engine runs with shell-escape off. Response headers, including a Content-Security-Policy, live in [vercel.json](vercel.json).

Found a vulnerability? Please report it privately — see [SECURITY.md](SECURITY.md).

## License

The application is [MIT](LICENSE). Two bundled dependencies carry their own terms worth knowing: **texlyre-busytex** (the LaTeX Lab engine) is AGPL-3.0, and the typefaces are SIL OFL. Full third-party attributions and the AGPL compliance statement are in [NOTICE.md](NOTICE.md).

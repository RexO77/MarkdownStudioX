# Markdown Studio X

_Write markdown, watch it typeset._

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

Markdown Studio X is a free, local-first markdown editor built around one idea — **the preview is the product**. The manuscript on the left is a plain-text terminal; the galley on the right is a phototypeset page, rendered live as you type. No account, no server: your documents live in your browser.

The design is borrowed from the place markdown actually comes from: the Bell Labs `troff` pipeline, where plain text in a terminal became beautifully typeset technical papers.

## Features

### The pipeline
- **Write on either side**: the manuscript is a plain-text markdown editor; the galley is a full WYSIWYG editor (Notion-style) — edits on either side flow through the shared markdown source
- **Galley editing**: type `/` for a block palette (headings, lists, tasks, tables, code, alert stamps, dividers), select text for a floating format bubble, click an alert's label to change its type, pick code-listing languages inline
- **Split manuscript/galley view** with synchronized scrolling — both panes move as one document
- **Typeset galley**: STIX Two Text on a 24px baseline grid, print-ruled tables, GitHub alerts as proof stamps, syntax-highlighted code listings with copy buttons, task lists, footnotes, smart punctuation
- **Resizable panes**, plus dedicated SOURCE and GALLEY modes
- **GitHub-flavored markdown**: tables, strikethrough, task lists, `> [!NOTE]`-style alerts — all round-trip safely between the two editors

### The editor
- Formatting shortcuts (⌘B, ⌘I, ⌘K …), list continuation on Enter, Tab indent/outdent
- Command palette (⌘P), find & replace with regex (⌘F), templates, selection toolbar
- Multi-document index with search, stars, and rename (⌘\\)
- Live word count, cursor position, and honest save state in a tmux-style statusline

### AI formatting (optional)
Bring your own [Groq API key](https://console.groq.com/keys) and reformat the manuscript by tone, content type, and length. The key is stored only in your browser.

### Export
Markdown, HTML, PDF, Word, plain text, and LaTeX — HTML and PDF carry the full galley typesetting.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:8080.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · framer-motion · marked + DOMPurify + Prism · self-hosted Courier Prime & STIX Two Text (both OFL)

## Development

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
```

## License

MIT

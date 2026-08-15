# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone writing markdown in a browser — developers drafting READMEs and docs, writers and students taking notes. Confirmed: positioned as a public, free web tool (no accounts, no backend). Typical session: paste or write markdown, watch the live preview, export or copy the result.

## Product Purpose

A free, fast, in-browser markdown editor with live preview. Everything is local: documents persist in localStorage, no signup. Success means the writing-and-previewing loop feels instant and the rendered preview looks better than what competitors (StackEdit, Dillinger, GitHub's own preview) produce.

## Positioning

The markdown editor where the *preview* is the product: GitHub-flavored rendering with alerts, task lists, tables, syntax-highlighted code — rendered with real typographic care — plus optional AI formatting (user-supplied Groq key) that cleans up messy text into well-structured markdown. No account, no server, nothing leaves the browser except opt-in AI calls.

## Operating Context

Used in a desktop browser during writing/documentation work, often side-by-side with a repo or CMS. Documents are ephemeral-to-medium-lived; users copy/export the result (MD, HTML, PDF, DOCX) into their real destination. Dark rooms and long sessions are common; the tool is also used on mobile for quick edits.

## Capabilities and Constraints

- React 18 + Vite + Tailwind + shadcn/radix; marked + DOMPurify + Prism for rendering; framer-motion available.
- Multi-document management in localStorage; command palette; find & replace; templates; keyboard shortcuts; export to MD/HTML/PDF/DOCX/LaTeX; AI formatting via user's own Groq API key.
- No backend; must remain fully client-side and free.
- Undecided: none — user granted full freedom on identity and features ("Full freedom", 2026-08-15).

## Brand Commitments

Name "Markdown Studio X" and the GitHub repo (RexO77/MarkdownStudioX) exist; user granted full freedom to replace visual identity, logo, colors, and layout chrome. [inferred: name retained as product identity unless a better in-world treatment emerges]

## Evidence on Hand

- Working implementation: split editor/preview, documents sidebar, AI panel, export menu (src/).
- README.md documents the feature set. No testimonials, metrics, or press — do not fabricate any.

## Product Principles

1. The preview is the hero — rendering quality is the differentiator, not chrome.
2. Instant feedback — every keystroke visibly renders; nothing blocks typing.
3. Local-first and free — no accounts, no lock-in; trust through transparency.
4. Power under the surface — shortcuts, palette, and AI stay one gesture away but never crowd the writing surface.

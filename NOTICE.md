# Third-party notices

Markdown Studio X is licensed under the [MIT License](LICENSE). It bundles and
serves the third-party components below, which carry their own terms.

## texlyre-busytex — AGPL-3.0-or-later

The LaTeX Lab compiles documents with [texlyre-busytex](https://github.com/TeXlyre/texlyre-busytex),
a WebAssembly build of [BusyTeX](https://github.com/busytex/busytex) (itself derived from TeX Live),
licensed under the **GNU Affero General Public License v3.0 or later**.

Because this application serves that engine to users over a network, the AGPL's
source-availability obligation applies to it. Accordingly:

- The complete corresponding source of the engine is published by its authors at
  <https://github.com/TeXlyre/texlyre-busytex> (build tooling at
  <https://github.com/TeXlyre/texlyre-busytex-build>), and the exact version used
  here is pinned in [`package.json`](package.json) / `package-lock.json`.
- The source of this application — including the code that loads and drives the
  engine — is published at <https://github.com/RexO77/MarkdownStudioX>.
- A copy of the AGPL-3.0 text ships with the package in
  `node_modules/texlyre-busytex/LICENSE` and is available at
  <https://www.gnu.org/licenses/agpl-3.0.txt>.

The engine's WebAssembly and TeX Live data files are **not** committed to this
repository (see `public/core/` in [`.gitignore`](.gitignore)); they are fetched
with `npx texlyre-busytex download-assets ./public/core`.

The MIT license of Markdown Studio X applies to this project's own source. It
does not, and cannot, relicense the AGPL-3.0 engine.

## Other bundled components

| Component | License | Use |
|---|---|---|
| [KaTeX](https://katex.org) | MIT | Math typesetting |
| [pdf.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`) | Apache-2.0 | Rendering compiled PDFs |
| [marked](https://marked.js.org) | MIT | Markdown → HTML |
| [DOMPurify](https://github.com/cure53/DOMPurify) | MPL-2.0 OR Apache-2.0 | HTML sanitization |
| [Tiptap](https://tiptap.dev) / ProseMirror | MIT | Rich-text galley |
| [Radix UI](https://www.radix-ui.com) / shadcn/ui | MIT | Interface primitives |
| [Lucide](https://lucide.dev) | ISC | Icons |
| Courier Prime, STIX Two Text | SIL Open Font License 1.1 | Typefaces (self-hosted in `public/fonts/`) |

Full dependency licenses are resolvable from `package-lock.json`.

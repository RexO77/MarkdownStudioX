/**
 * Full-LaTeX detection and editor → LaTeX Lab handoff. Deliberately tiny:
 * imported by the editor page, so it must not pull in the Lab (and its
 * WASM engine) — that stays behind the lazy /latex route.
 */

export const LATEX_HANDOFF_KEY = 'latex-lab-source';

/**
 * A complete LaTeX document (not markdown with math spans): starts with
 * \documentclass, allowing leading blank lines and % comment lines.
 */
export function isLatexDocument(text: string): boolean {
  return /^\s*(?:%[^\n]*\n\s*)*\\documentclass\b/.test(text);
}

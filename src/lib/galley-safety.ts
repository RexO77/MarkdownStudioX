import { isLatexDocument } from './latex';

/**
 * Markdown constructs the galley editor cannot round-trip without corrupting them.
 * Documents containing these are opened read-only in the galley.
 */
const HTML_TAG = /<\/?[a-zA-Z][\w-]*(?:\s[^<>]*)?\/?>/;
const HTML_COMMENT = /<!--[\s\S]*?-->/;
const FOOTNOTE = /\[\^[^\]\s]+\]/;
const FRONT_MATTER = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;

export function findLossyConstructs(markdown: string): string[] {
  // A full LaTeX document isn't markdown at all — one galley edit would
  // backslash-escape every command. Read-only; the LaTeX Lab compiles it.
  if (isLatexDocument(markdown)) return ['a LaTeX document'];

  // Code blocks and inline code legitimately contain angle brackets — ignore them.
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]*`/g, '');

  const found: string[] = [];
  if (FRONT_MATTER.test(markdown)) found.push('front matter');
  if (HTML_TAG.test(stripped) || HTML_COMMENT.test(stripped)) found.push('raw HTML');
  if (FOOTNOTE.test(stripped)) found.push('footnotes');
  return found;
}

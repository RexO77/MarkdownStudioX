/**
 * One count of the manuscript, used everywhere it is reported.
 *
 * The index and the statusline used to count words differently — raw
 * whitespace splitting in one, markdown-stripped in the other — so the same
 * document read 27 words in the sidebar and 26 in the footer.
 */

/** Words per minute used for the read-time estimate. */
const READING_SPEED = 200;

/** Strips the markdown that a reader never sees, so counts read like prose. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

export function countWords(markdown: string): number {
  const plain = toPlainText(markdown);
  return plain ? plain.split(/\s+/).filter(Boolean).length : 0;
}

export interface DocumentStats {
  words: number;
  characters: number;
  /** Whole minutes, floored at 1 for any non-empty document. */
  readingTime: number;
}

export function documentStats(markdown: string): DocumentStats {
  const words = countWords(markdown);
  return {
    words,
    characters: markdown.length,
    readingTime: words === 0 ? 0 : Math.max(1, Math.ceil(words / READING_SPEED)),
  };
}

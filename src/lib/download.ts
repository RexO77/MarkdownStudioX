/**
 * One place that turns bytes into a saved file.
 *
 * The subtle part is the revoke. Chrome has usually started reading the blob
 * by the time `click()` returns, but Firefox and Safari may not have — and
 * revoking the URL in that same tick cancels the download, so the user
 * silently gets nothing. Holding the URL briefly costs a little memory and
 * removes the race. That trade is worth making everywhere, and especially on
 * the recovery path, where this is the last copy of someone's work.
 */
const REVOKE_DELAY_MS = 10_000;

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  // Firefox only honours the click while the anchor is in the document.
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

export function downloadText(contents: string, filename: string, type: string): void {
  downloadBlob(new Blob([contents], { type }), filename);
}

/** `markdown-studio-recovery-2026-08-30.json` — the name both recovery paths use. */
export function recoveryBackupFilename(now: Date = new Date()): string {
  return `markdown-studio-recovery-${now.toISOString().slice(0, 10)}.json`;
}

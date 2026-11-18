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

/** The first actionable error from BusyTeX's single-file pdfLaTeX log. */
export function getLatexDiagnostic(log: string): { message: string; line?: number } | null {
  const lines = log.split(/\r?\n/);
  for (const [index, raw] of lines.entries()) {
    const fileLine = /^(?:.*\/)?main\.tex:(\d+):\s*(\S.*)$/.exec(raw.trim());
    if (fileLine) return { line: Number(fileLine[1]), message: fileLine[2] };
    const error = /^!\s*(\S.*)$/.exec(raw.trim());
    if (!error || error[1].startsWith('==>')) continue;
    const nearby = lines.slice(index + 1, index + 9);
    for (const context of nearby) {
      const line = /^l\.(\d+)\b/.exec(context.trim());
      if (line) return { message: error[1], line: Number(line[1]) };
      if (/^!/.test(context.trim())) break;
    }
    return { message: error[1] };
  }
  return null;
}

/** Retry only when the log points to a missing TeX support file. */
export function isMissingLatexPackage(log: string): boolean {
  return /(?:LaTeX Error:\s*)?File\s+[`'"][^\r\n]+\.(?:sty|cls|clo|def|fd)['"`]\s+not found\b/i.test(log)
    || /pdfTeX error:[^\r\n]*\(file [^)]+\.(?:enc|map|pfb|tfm)\):\s*cannot open/i.test(log)
    || /^(?:!\s*|[^\r\n]*?main\.tex:\d+:\s*)Font\s+[^\r\n]*?\s+not loadable:\s+Metric\s+\(TFM\)\s+file\s+not found\b/im.test(log);
}

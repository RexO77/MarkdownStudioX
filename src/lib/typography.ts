/**
 * User-selectable typography for the two content surfaces.
 *
 * The chrome keeps the app's own voice (Courier Prime), but what you write
 * in (the manuscript) and what you read (the galley) are personal: some
 * people don't want mono at all, some want a different mono, some want the
 * preview in a plain sans. Choices are applied as CSS variables on :root
 * and persisted in localStorage.
 */

export type ManuscriptFace = 'typewriter' | 'system-mono' | 'sans';
export type GalleyFace = 'serif' | 'sans' | 'typewriter';

const MANUSCRIPT_KEY = 'markdown-studio-manuscript-face';
const GALLEY_KEY = 'markdown-studio-galley-face';

const MANUSCRIPT_STACKS: Record<ManuscriptFace, string> = {
  typewriter:
    "'Courier Prime', 'Courier Prime Fallback', 'Courier New', ui-monospace, monospace",
  'system-mono':
    "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const GALLEY_STACKS: Record<GalleyFace, string> = {
  serif: "'STIX Two Text', 'STIX Two Text Fallback', 'Times New Roman', Georgia, serif",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  typewriter:
    "'Courier Prime', 'Courier Prime Fallback', 'Courier New', ui-monospace, monospace",
};

export const MANUSCRIPT_FACES: { value: ManuscriptFace; label: string; description: string }[] = [
  { value: 'typewriter', label: 'Typewriter', description: 'Courier Prime' },
  { value: 'system-mono', label: 'System mono', description: 'SF Mono / Consolas' },
  { value: 'sans', label: 'Sans serif', description: 'System sans' },
];

export const GALLEY_FACES: { value: GalleyFace; label: string; description: string }[] = [
  { value: 'serif', label: 'Typeset serif', description: 'STIX Two Text' },
  { value: 'sans', label: 'Sans serif', description: 'System sans' },
  { value: 'typewriter', label: 'Typewriter', description: 'Courier Prime' },
];

export function getManuscriptFace(): ManuscriptFace {
  try {
    const v = localStorage.getItem(MANUSCRIPT_KEY);
    if (v === 'typewriter' || v === 'system-mono' || v === 'sans') return v;
  } catch {
    // storage unavailable; use default
  }
  return 'typewriter';
}

export function getGalleyFace(): GalleyFace {
  try {
    const v = localStorage.getItem(GALLEY_KEY);
    if (v === 'serif' || v === 'sans' || v === 'typewriter') return v;
  } catch {
    // storage unavailable; use default
  }
  return 'serif';
}

export function applyTypography() {
  const root = document.documentElement;
  root.style.setProperty('--font-manuscript', MANUSCRIPT_STACKS[getManuscriptFace()]);
  root.style.setProperty('--font-galley', GALLEY_STACKS[getGalleyFace()]);
}

export function setManuscriptFace(face: ManuscriptFace) {
  try {
    localStorage.setItem(MANUSCRIPT_KEY, face);
  } catch {
    // still apply for the session
  }
  applyTypography();
}

export function setGalleyFace(face: GalleyFace) {
  try {
    localStorage.setItem(GALLEY_KEY, face);
  } catch {
    // still apply for the session
  }
  applyTypography();
}

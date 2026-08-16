/**
 * Chrome tokens — the terminal side of the pipeline.
 *
 * DESIGN.md is the authority; this file is that document expressed as the
 * class strings the chrome components actually apply, so a spacing or ink
 * decision is made once and read everywhere. Colors and radii are not
 * repeated here: they live as CSS custom properties in index.css and reach
 * this layer through the Tailwind aliases below.
 *
 * Nothing here belongs to the galley. STIX Two Text never enters chrome.
 */

/* ------------------------------------------------------------------ */
/* Vertical rhythm: the bar tracks, in the order they stack            */
/* ------------------------------------------------------------------ */

export const BAR = {
  /** man-page header — 40px */
  header: 'h-10',
  /** formatting toolbar and the index head — 36px */
  toolbar: 'h-9',
  /** a field row inside a column (grep) — 32px */
  field: 'h-8',
  /** tmux statusline — 26px */
  status: 'h-[26px]',
} as const;

export type BarTrack = keyof typeof BAR;

/* ------------------------------------------------------------------ */
/* Horizontal rhythm                                                    */
/* ------------------------------------------------------------------ */

/** 8px — the padding of every chrome bar, so stacked bars share an edge. */
export const GUTTER = 'px-2';

/** 12px — the padding of every text row (index rows, menu items, strips). */
export const ROW_GUTTER = 'px-3';

/**
 * 6px — inset for a trailing cluster of 24px icon buttons, so the 12px icon
 * inside lands on the same 12px optical gutter as the row's text.
 */
export const ROW_ACTION_INSET = 'right-1.5';

/* ------------------------------------------------------------------ */
/* Type                                                                 */
/* ------------------------------------------------------------------ */

/**
 * The 11px label floor. `cap-center` trims the line box to cap height so the
 * label centers optically against an icon rather than sitting ~0.7px high.
 */
export const LABEL = 'cap-center font-mono text-[11px] uppercase tracking-[0.04em]';

/** Bold section rules, stamps and switch cells sit a touch wider. */
export const LABEL_STRONG = 'cap-center font-mono text-[11px] font-bold uppercase tracking-[0.06em]';

/** 12px mono, normal case: document names, menu items, field text. */
export const BODY = 'font-mono text-[12px]';

/* ------------------------------------------------------------------ */
/* Ink                                                                  */
/* ------------------------------------------------------------------ */

export const INK = {
  /** Resting chrome: labels, icons, running heads. */
  rest: 'text-muted-foreground',
  /** Foreground text. */
  ink: 'text-foreground',
  /** The one accent. */
  accent: 'text-primary',
} as const;

/** Hover raises to the raised ground; color never transitions. */
export const HOVER = 'hover:bg-secondary hover:text-foreground';

/** Pressed flips to full inverse video. */
export const PRESS = 'active:bg-foreground active:text-background';

/** Selection and toggled-on state: inverse video, no transition. */
export const SELECTED = 'bg-foreground text-background';

/** A toggle that is on but not pressed holds the hover fill. */
export const TOGGLED = 'bg-secondary text-foreground';

/** Raised-ground strip used by section rules and the palette footer. */
export const STRIP = 'border-b border-border bg-secondary';

/* ------------------------------------------------------------------ */
/* Icons                                                                */
/* ------------------------------------------------------------------ */

export const ICON = {
  /** 12px — inline with an 11px label. */
  sm: 'size-3',
  /** 14px — the standing size inside chrome icon buttons. */
  md: 'size-3.5',
} as const;

/** Square icon button: 36px on touch, 28px on desktop. */
export const ICON_BUTTON_SIZE = 'h-9 w-9 md:h-7 md:w-7';

/** 24px — the smaller button used inside a list row. */
export const ROW_BUTTON_SIZE = 'h-6 w-6';

/* ------------------------------------------------------------------ */
/* Motion — one curve, exits shorter than entries                       */
/* ------------------------------------------------------------------ */

export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  /** CSS state transitions. */
  state: 0.14,
  /** Panel entry. */
  enter: 0.24,
  /** Panel exit. */
  exit: 0.18,
  /** Floating surfaces: in / out. */
  floatIn: 0.16,
  floatOut: 0.08,
} as const;

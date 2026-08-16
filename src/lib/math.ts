import katex from 'katex';

/**
 * The one math-span pattern, shared by every surface — galley decorations,
 * the markdown serializer's escape guard, and the export renderer — so a
 * span that renders in one place renders in all of them.
 *
 *   $$...$$  display math; anything but a dollar, may cross line breaks
 *            within a single paragraph.
 *   $...$    inline math, pandoc-style guards against prose dollars:
 *            content must hug its delimiters ("$ x $" is prose) and the
 *            closing $ must not be followed by a digit, so
 *            "$5 and $10" stays currency.
 *
 * An escaped \$ never opens or closes a span.
 */
export const MATH_SPAN_SOURCE =
  String.raw`(?<!\\)\$\$([^$]+?)\$\$|(?<![\\$])\$(?!\s)([^$\n]+?)(?<![\s\\])\$(?!\d)`;

/** Fresh instance per call site — the `g` flag makes exec() stateful. */
export const createMathSpanRegex = () => new RegExp(MATH_SPAN_SOURCE, 'g');

export interface MathSpan {
  /** TeX source without the dollar delimiters. */
  tex: string;
  /** True for $$...$$ (display) spans. */
  display: boolean;
}

/** Split a raw `$...$` / `$$...$$` span into TeX source and display mode. */
export function parseMathSpan(raw: string): MathSpan {
  const display = raw.startsWith('$$') && raw.endsWith('$$') && raw.length > 4;
  return {
    tex: display ? raw.slice(2, -2) : raw.slice(1, -1),
    display,
  };
}

/** Render a raw math span to KaTeX HTML; invalid TeX degrades to red source text. */
export function renderMathSpanToHtml(raw: string): string {
  const { tex, display } = parseMathSpan(raw);
  return katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
  });
}

/** True when the markdown contains at least one renderable math span. */
export function containsMath(markdown: string): boolean {
  return createMathSpanRegex().test(markdown);
}

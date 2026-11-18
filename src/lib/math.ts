import katex, { type KatexOptions } from 'katex';

/**
 * The one math-span pattern, shared by every surface — galley decorations,
 * the markdown serializer's escape guard, and the export renderer — so a
 * span that renders in one place renders in all of them.
 *
 *   $$...$$  display math; escaped dollars are allowed, may cross line breaks
 *            within a single paragraph.
 *   $...$    inline math, pandoc-style guards against prose dollars:
 *            content must hug its delimiters ("$ x $" is prose) and the
 *            closing $ must not be followed by a digit, so
 *            "$5 and $10" stays currency.
 *
 * \( ... \) and \[ ... \] also support conventional TeX delimiters.
 * An escaped \$ never opens or closes a span.
 */
export const MATH_SPAN_SOURCE =
  String.raw`(?<!\\)\$\$((?:\\[\s\S]|[^\\$])+?)\$\$|(?<![\\$])\$(?!\s)((?:\\[^\n]|[^\\$\n])+?)(?<!\s)\$(?!\d)|(?<!\\)\\\[((?:\\(?!\])[\s\S]|[^\\])+?)\\\]|(?<!\\)\\\(((?:\\(?!\))[^\n]|[^\\\n])+?)\\\)`;

/** Fresh instance per call site — the `g` flag makes exec() stateful. */
export const createMathSpanRegex = () => new RegExp(MATH_SPAN_SOURCE, 'g');

export interface MathSpan {
  /** TeX source without the dollar delimiters. */
  tex: string;
  /** True for $$...$$ or \[...\] display spans. */
  display: boolean;
}

/** Strip the matching dollar or conventional TeX delimiters from a span. */
export function parseMathSpan(raw: string): MathSpan {
  const display = raw.startsWith('$$') || raw.startsWith('\\[');
  const delimiterLength = display || raw.startsWith('\\(') ? 2 : 1;
  return {
    tex: raw.slice(delimiterLength, -delimiterLength),
    display,
  };
}

/**
 * KaTeX options for a span: `$$...$$` sets as display math (centered, limits
 * above and below), `$...$` sets inline. Invalid TeX degrades to red source
 * text instead of throwing.
 */
const katexOptions = (display: boolean): KatexOptions => ({
  displayMode: display,
  throwOnError: false,
});

/** Render a raw math span to KaTeX HTML; invalid TeX degrades to red source text. */
export function renderMathSpanToHtml(raw: string): string {
  const { tex, display } = parseMathSpan(raw);
  return katex.renderToString(tex, katexOptions(display));
}

/** Render a raw math span into a DOM element, with the same options as the HTML path. */
export function renderMathSpanInto(raw: string, element: HTMLElement): void {
  const { tex, display } = parseMathSpan(raw);
  try {
    katex.render(tex, element, katexOptions(display));
  } catch {
    element.textContent = raw;
  }
}

/** True when the markdown contains at least one renderable math span. */
export function containsMath(markdown: string): boolean {
  return createMathSpanRegex().test(markdown);
}

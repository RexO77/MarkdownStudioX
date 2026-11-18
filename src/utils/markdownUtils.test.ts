import { describe, expect, test } from 'vitest';
import { markdownFeatureFixture, unsafeMarkdownFixture } from '@/test/fixtures/documents';
import { convertMarkdownToHtml } from './markdownUtils';
import { renderMathSpanToHtml } from '@/lib/math';

describe('Markdown rendering seam', () => {
  test('renders the documented GFM alert, task list, code, and math fixture', () => {
    const html = convertMarkdownToHtml(markdownFeatureFixture);

    expect(html).toContain('class="alert alert-note"');
    expect(html).toContain('<input checked="" disabled="" type="checkbox">');
    expect(html).toContain('class="language-ts"');
    expect(html).toContain('class="katex"');
  });

  test('sets $$...$$ as display math and $...$ inline, leaving currency as prose', () => {
    const html = convertMarkdownToHtml(
      [
        'Inline, $e^{i\\pi} + 1 = 0$, then a display:',
        '',
        '$$\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}$$',
        '',
        'It costs $5 and $10.',
      ].join('\n')
    );
    const page = new DOMParser().parseFromString(html, 'text/html');
    const [inline, display, currency] = [...page.querySelectorAll('p')];

    expect(inline.querySelector('.katex')).not.toBeNull();
    expect(inline.querySelector('.katex-display')).toBeNull();
    expect(display.querySelector('.katex-display .katex')).not.toBeNull();
    expect(display.querySelector('math')?.getAttribute('display')).toBe('block');
    expect(inline.querySelector('math')?.getAttribute('display')).toBeNull();
    expect(currency.querySelector('.katex')).toBeNull();
    expect(currency.textContent).toBe('It costs $5 and $10.');
  });

  test('sanitizes scripts, event handlers, and executable links', () => {
    const html = convertMarkdownToHtml(unsafeMarkdownFixture);

    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('javascript:');
  });
});

describe('math delimiters in exports', () => {
  test.each([
    [String.raw`$\text{price \$5}$`, false],
    [String.raw`$$\text{price \$5}$$`, true],
    [String.raw`\(\frac{a_1}{b}\)`, false],
    [String.raw`\[\sum_{i=1}^{n}i\]`, true],
  ])('renders %s without consuming TeX escapes', (formula, display) => {
    const html = convertMarkdownToHtml(String(formula));
    const page = new DOMParser().parseFromString(html, 'text/html');
    expect(page.querySelectorAll('.katex')).toHaveLength(1);
    expect(page.querySelector('.katex-error')).toBeNull();
    expect(page.querySelectorAll('.katex-display')).toHaveLength(display ? 1 : 0);
  });

  test('does not typeset code or ordinary currency', () => {
    const html = convertMarkdownToHtml('It costs $5 and $10.\n\n`\\(x\\)`\n\n```tex\n\\[x\\]\n$x$\n```');
    expect(html).not.toContain('class="katex"');
  });
});

describe('standalone multiline display math', () => {
  test.each([
    '$$\n\\frac{a}{b}\n\n+x\n$$',
    '\\[\n\\begin{aligned}\na&=b\\\\\n\nc&=d\n\\end{aligned}\n\\]',
    '$$\nx % this comment ends at the newline\n+ y\n$$',
  ])('renders the complete block without Markdown paragraph splitting: %s', (formula) => {
    const html = convertMarkdownToHtml(`Before.\n\n${formula}\n\nAfter.`);
    const page = new DOMParser().parseFromString(html, 'text/html');
    expect(page.querySelectorAll('.katex-display')).toHaveLength(1);
    expect(page.querySelector('.katex-error')).toBeNull();
    const direct = new DOMParser().parseFromString(renderMathSpanToHtml(formula), 'text/html');
    expect(page.querySelector('.katex-html')?.textContent).toBe(direct.querySelector('.katex-html')?.textContent);
    expect(page.body.textContent).toContain('Before.');
    expect(page.body.textContent).toContain('After.');
  });

  test('a block does not consume the following Markdown', () => {
    const html = convertMarkdownToHtml('$$\nx+y\n$$\n\n# Heading\n\nText.');
    expect(html).toContain('katex-display');
    expect(html).toContain('<h1');
    expect(html).toContain('Heading</h1>');
  });

  test('fenced multiline equations remain code', () => {
    const html = convertMarkdownToHtml('```tex\n$$\nx+y\n\n+z\n$$\n```');
    expect(html).not.toContain('class="katex"');
  });
});

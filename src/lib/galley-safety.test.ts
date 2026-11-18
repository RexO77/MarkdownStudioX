import { describe, expect, test } from 'vitest';
import { findLossyConstructs } from './galley-safety';

describe('multiline math source preservation', () => {
  test.each([
    '$$\nx+y\n$$',
    '$$\n\\frac{a}{b}',
    '$$\nx % comment\n+y\n$$',
    '$$\nx\n\n+y\n$$',
    '\\[\nx+y\n\\]',
  ])('guards rich-text serialization of %s', (formula) => {
    expect(findLossyConstructs(formula)).toContain('multiline LaTeX');
  });

  test.each([
    '# Heading\n\nOrdinary **Markdown**.',
    '$x^2$',
    '$$x^2$$',
    String.raw`\[x^2\]`,
    '```tex\n$$\nx+y\n$$\n```',
    '~~~tex\n\\[\nx+y\n\\]\n~~~',
    '`$x$` and `\\(x\\)`',
  ])('does not make ordinary Markdown or code read-only: %s', (source) => {
    expect(findLossyConstructs(source)).toEqual([]);
  });
});

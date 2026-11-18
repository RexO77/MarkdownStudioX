import { describe, test, expect } from 'vitest';
import { createLatexDocument } from './latexExport';

describe('LaTeX file export', () => {
  test('preserves equations while escaping prose and titles', () => {
    const result = createLatexDocument(String.raw`Cost $5 and $10. $x_i + x_j$ and $\text{price \$5}$, **bold**.`, 'R&D_100%');
    expect(result).toContain(String.raw`Cost \$5 and \$10.`);
    expect(result).toContain(String.raw`$x_i + x_j$`);
    expect(result).toContain(String.raw`$\text{price \$5}$`);
    expect(result).toContain(String.raw`\textbf{bold}`);
    expect(result).toContain(String.raw`\title{R\&D\_100\%}`);
  });
  test('preserves conventional and multiline display math including comments', () => {
    const input = '\\(a_i\\)\n\n$$\nx_i % comment\n\n+ y_j\n$$\n\n\\[a^2\\]';
    const result = createLatexDocument(input, 'Math');
    expect(result).toContain('\\(a_i\\)');
    expect(result).toContain('$$\nx_i % comment\n\n+ y_j\n$$');
    expect(result).toContain('\\[a^2\\]');
  });
  test('keeps code literal and wraps list items in an environment', () => {
    const result = createLatexDocument('`$x_i$`\n\n```tex\n\\end{verbatim}\n$x_i$\n```\n\n- one\n- two', 'Code');
    expect(result).toContain('\\texttt{\\$x\\_i\\$}');
    expect(result).toContain('\\textbackslash{}end\\{verbatim\\}');
    expect(result).toContain('\\begin{itemize}');
    expect(result).toContain('\\end{itemize}');
  });
  test('returns complete LaTeX unchanged instead of wrapping it twice', () => {
    const document = '% original\n\\documentclass{article}\n\\begin{document}\n$x_i$\n\\end{document}';
    expect(createLatexDocument(document, 'Ignored')).toBe(document);
  });
  test('handles tables and markdown escaped currency without treating code as math', () => {
    const result = createLatexDocument('| cost | value |\n| --- | --- |\n| \\$5 | $x_i$ |', 'Table');
    expect(result).toContain('\\begin{tabular}{ll}');
    expect(result).toContain('\\$5 & $x_i$');
  });
});

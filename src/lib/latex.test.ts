import { describe, expect, test } from 'vitest';
import { getLatexDiagnostic, isMissingLatexPackage } from './latex';

describe('LaTeX Lab diagnostics', () => {
  test('finds the line number in standard TeX output', () => {
    expect(getLatexDiagnostic('! Undefined control sequence.\nnoise\nl.4 \\misspelled'))
      .toEqual({ message: 'Undefined control sequence.', line: 4 });
  });

  test('reads file/line mode and ignores the generic fatal summary', () => {
    expect(getLatexDiagnostic('./main.tex:4: Missing $ inserted.\r\n! ==> Fatal error'))
      .toEqual({ message: 'Missing $ inserted.', line: 4 });
    expect(getLatexDiagnostic('! ==> Fatal error')).toBeNull();
  });

  test('keeps a missing-package error even if there is no source line', () => {
    expect(getLatexDiagnostic("! LaTeX Error: File `foo.sty' not found."))
      .toEqual({ message: "LaTeX Error: File `foo.sty' not found." });
  });
});

describe('LaTeX Lab package fallback', () => {
  test('recognizes package and class misses but not source errors or missing figures', () => {
    expect(isMissingLatexPackage("! LaTeX Error: File `enumitem.sty' not found.")).toBe(true);
    expect(isMissingLatexPackage("! LaTeX Error: File `custom.cls' not found.")).toBe(true);
    expect(isMissingLatexPackage('!pdfTeX error: /bin/busytex (file cm-super-t1.enc): cannot open encoding file')).toBe(true);
    expect(isMissingLatexPackage('! Undefined control sequence.')).toBe(false);
    expect(isMissingLatexPackage("! LaTeX Error: File `figure.png' not found.")).toBe(false);
  });

  test('recognizes missing font metrics in standard and file/line pdfLaTeX logs', () => {
    const missing = String.raw`Font \testfont=cmbr10 not loadable: Metric (TFM) file not found.`;
    expect(isMissingLatexPackage(`! ${missing}\r\nl.3`)).toBe(true);
    expect(isMissingLatexPackage(`./main.tex:3: ${missing}`)).toBe(true);
    expect(isMissingLatexPackage('! Font foo not loadable: Bad metric (TFM) file.')).toBe(false);
    expect(isMissingLatexPackage('Package warning: Metric (TFM) file not found.')).toBe(false);
  });
});

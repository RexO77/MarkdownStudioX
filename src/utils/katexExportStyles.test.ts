import { describe, expect, test } from 'vitest';
import { katexExportNotice, katexExportStyles } from './katexExportStyles';

describe('standalone KaTeX export assets', () => {
  test('contains all equation fonts without relative requests', () => {
    const fontFaces = katexExportStyles.match(/@font-face\{/g) ?? [];
    const embedded = katexExportStyles.match(/url\("data:font\/woff2;base64,/g) ?? [];
    expect(fontFaces.length).toBeGreaterThan(0);
    expect(embedded).toHaveLength(fontFaces.length);
    expect(katexExportStyles).not.toContain('url(fonts/');
    expect(katexExportNotice).toContain('The MIT License');
  });
});

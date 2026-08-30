import { describe, expect, test } from 'vitest';
import { markdownFeatureFixture, unsafeMarkdownFixture } from '@/test/fixtures/documents';
import { convertMarkdownToHtml } from './markdownUtils';

describe('Markdown rendering seam', () => {
  test('renders the documented GFM alert, task list, code, and math fixture', () => {
    const html = convertMarkdownToHtml(markdownFeatureFixture);

    expect(html).toContain('class="alert alert-note"');
    expect(html).toContain('<input checked="" disabled="" type="checkbox">');
    expect(html).toContain('class="language-ts"');
    expect(html).toContain('class="katex"');
  });

  test('sanitizes scripts, event handlers, and executable links', () => {
    const html = convertMarkdownToHtml(unsafeMarkdownFixture);

    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('javascript:');
  });
});

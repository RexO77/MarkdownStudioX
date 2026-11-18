import { afterEach, describe, expect, test } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Markdown } from 'tiptap-markdown';
import { GalleyMathematics, MathAwareText } from './mathematics';

/** The galley's content schema, minus the React node views and UI-only plugins. */
const editors: Editor[] = [];
function galley(content: string, editable = true) {
  const element = document.createElement('div');
  document.body.appendChild(element);
  const editor = new Editor({
    element,
    editable,
    content,
    extensions: [
      StarterKit.configure({ text: false }),
      MathAwareText,
      GalleyMathematics,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Markdown.configure({ html: false, tightLists: true, linkify: true, breaks: true }),
    ],
  });
  editors.push(editor);
  return editor;
}

const markdownOf = (editor: Editor): string => editor.storage.markdown.getMarkdown();

afterEach(() => {
  editors.splice(0).forEach((editor) => {
    editor.view.dom.parentElement?.remove();
    editor.destroy();
  });
});

describe('galley display math', () => {
  const doc = [
    "Euler's identity sets inline, $e^{i\\pi} + 1 = 0$, while a display stands on its own line:",
    '',
    '$$\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}$$',
    '',
    'It costs $5 and $10, and prose dollars stay prose.',
  ].join('\n');

  test('$$...$$ typesets in display mode, $...$ stays inline', () => {
    const editor = galley(doc);
    const renders = [...editor.view.dom.querySelectorAll('.Tiptap-mathematics-render')];

    expect(renders).toHaveLength(2);
    const [inline, display] = renders;
    expect(inline.querySelector('.katex-display')).toBeNull();
    expect(inline.classList.contains('Tiptap-mathematics-render--display')).toBe(false);
    expect(display.querySelector('.katex-display')).not.toBeNull();
    expect(display.classList.contains('Tiptap-mathematics-render--display')).toBe(true);
  });

  test('currency dollars are left as prose', () => {
    const editor = galley(doc);
    const currency = editor.view.dom.querySelectorAll('p')[2];

    expect(currency.querySelector('.Tiptap-mathematics-render')).toBeNull();
    expect(currency.textContent).toBe('It costs $5 and $10, and prose dollars stay prose.');
  });

  test('read-only galleys typeset display math too', () => {
    const editor = galley(doc, false);
    const display = editor.view.dom.querySelector('.Tiptap-mathematics-render--display');

    expect(display?.querySelector('.katex-display')).not.toBeNull();
    expect(display?.classList.contains('Tiptap-mathematics-render--editable')).toBe(false);
  });

  test('round-trips the source byte-identical', () => {
    expect(markdownOf(galley(doc))).toBe(doc);
  });

  test('a display span split over lines still sets in display mode', () => {
    const editor = galley('Before.\n\n$$\na^2 + b^2 = c^2\n$$\n\nAfter.');
    expect(editor.view.dom.querySelector('.katex-display')).not.toBeNull();
  });
});

describe('math delimiter preservation', () => {
  test.each([
    String.raw`$\text{price \$5}$`,
    String.raw`$$\text{price \$5}$$`,
    String.raw`\(\frac{a_1}{b} + x^2\)`,
    String.raw`\[\sum_{i=1}^{n} i\]`,
  ])('renders and preserves %s', (formula) => {
    const source = `Before.\n\n${formula}\n\nAfter.`;
    const editor = galley(source, false);
    expect(editor.view.dom.querySelectorAll('.katex')).toHaveLength(1);
    expect(editor.view.dom.querySelector('.katex-error')).toBeNull();
    expect(markdownOf(editor)).toBe(source);
    expect(editor.view.dom.querySelectorAll('.katex-display')).toHaveLength(
      formula.startsWith('$$') || formula.startsWith('\\[') ? 1 : 0
    );
  });

  test('leaves inline code and fenced code alone', () => {
    const source = '`\\(x^2\\)` and `$x$`\n\n```tex\n\\[x^2\\]\n$$x$$\n```';
    const editor = galley(source, false);
    expect(editor.view.dom.querySelector('.katex')).toBeNull();
    expect(markdownOf(editor)).toBe(source);
  });

  test('invalid math remains recoverable without throwing', () => {
    const source = String.raw`Before $\frac{a}$ after.`;
    const editor = galley(source, false);
    expect(editor.view.dom.querySelector('.katex-error')).not.toBeNull();
    expect(markdownOf(editor)).toBe(source);
  });
});

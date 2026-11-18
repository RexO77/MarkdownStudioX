import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { GalleyEditor } from './GalleyEditor';

test('multiline math uses a non-editable preview and never serializes over source', () => {
  const source = 'Before.\n\n$$\nx % comment\n\n+y\n$$\n\nAfter.';
  const onChange = vi.fn();
  const view = render(<GalleyEditor value={source} onChange={onChange} />);
  const preview = screen.getByLabelText('Typeset galley preview');
  expect(preview.querySelectorAll('.katex-display')).toHaveLength(1);
  expect(preview.querySelector('.katex-html')?.textContent).toContain('y');
  expect(preview.getAttribute('contenteditable')).not.toBe('true');
  expect(screen.getByText(/Edit it in MARKDOWN view/)).toBeInTheDocument();
  fireEvent.input(preview);
  view.unmount();
  expect(onChange).not.toHaveBeenCalled();
});

test('external source changes can enter and leave guarded math without writes', async () => {
  const onChange = vi.fn();
  const view = render(<GalleyEditor value="Ordinary Markdown." onChange={onChange} />);
  expect(screen.queryByLabelText('Typeset galley preview')).toBeNull();
  view.rerender(<GalleyEditor value={'$$\nx % comment\n+y\n$$'} onChange={onChange} />);
  expect(await screen.findByLabelText('Typeset galley preview')).toBeInTheDocument();
  view.rerender(<GalleyEditor value="Ordinary Markdown." onChange={onChange} />);
  expect(screen.queryByLabelText('Typeset galley preview')).toBeNull();
  view.unmount();
  expect(onChange).not.toHaveBeenCalled();
});

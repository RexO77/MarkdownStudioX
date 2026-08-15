import { Extension, type Editor, type Range } from '@tiptap/core';
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion';
import {
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  SquareCode,
  Minus,
  Table,
  Info,
  type LucideIcon,
} from 'lucide-react';

export interface SlashItem {
  title: string;
  hint: string;
  keywords: string;
  icon: LucideIcon;
  command: (editor: Editor, range: Range) => void;
}

export const SLASH_ITEMS: SlashItem[] = [
  {
    title: 'Text',
    hint: 'Plain paragraph',
    keywords: 'paragraph text plain body',
    icon: Pilcrow,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: 'Heading 1',
    hint: 'Section title',
    keywords: 'h1 heading title section',
    icon: Heading1,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    hint: 'Ruled section head',
    keywords: 'h2 heading subtitle',
    icon: Heading2,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    hint: 'Subsection',
    keywords: 'h3 heading subsection',
    icon: Heading3,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run(),
  },
  {
    title: 'Bullet list',
    hint: 'Unordered list',
    keywords: 'bullet list unordered ul',
    icon: List,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Numbered list',
    hint: 'Ordered list',
    keywords: 'numbered list ordered ol',
    icon: ListOrdered,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'Task list',
    hint: 'Checkboxes',
    keywords: 'task todo checkbox checklist',
    icon: ListChecks,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: 'Quote',
    hint: 'Set-in quotation',
    keywords: 'quote blockquote citation',
    icon: Quote,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: 'Code listing',
    hint: 'Syntax-highlighted block',
    keywords: 'code listing block fence pre',
    icon: SquareCode,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: 'Table',
    hint: '3×3 with header row',
    keywords: 'table grid columns rows',
    icon: Table,
    command: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: 'Alert stamp',
    hint: 'Note · click label to change type',
    keywords: 'alert note tip important warning caution callout stamp',
    icon: Info,
    command: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: 'alert', attrs: { type: 'note' }, content: [{ type: 'paragraph' }] })
        .run(),
  },
  {
    title: 'Divider',
    hint: 'Horizontal rule',
    keywords: 'divider rule hr separator line',
    icon: Minus,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

export function filterSlashItems(query: string): SlashItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(
    (item) => item.title.toLowerCase().includes(q) || item.keywords.includes(q)
  );
}

export interface SlashMenuState {
  open: boolean;
  query: string;
  clientRect: (() => DOMRect | null) | null;
  command: ((item: SlashItem) => void) | null;
}

interface SlashCommandCallbacks {
  onState: (state: SlashMenuState) => void;
  onKeyDown: (event: KeyboardEvent) => boolean;
}

/** Slash command menu, Notion-style: '/' opens a block palette at the caret. */
export function createSlashCommand(callbacks: SlashCommandCallbacks) {
  return Extension.create({
    name: 'slashCommand',

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: '/',
          allowSpaces: false,
          command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashItem }) => {
            props.command(editor, range);
          },
          items: ({ query }: { query: string }) => filterSlashItems(query),
          render: () => ({
            onStart: (props: SuggestionProps<SlashItem>) => {
              callbacks.onState({
                open: true,
                query: props.query,
                clientRect: (props.clientRect as (() => DOMRect | null)) ?? null,
                command: (item) => props.command(item),
              });
            },
            onUpdate: (props: SuggestionProps<SlashItem>) => {
              callbacks.onState({
                open: true,
                query: props.query,
                clientRect: (props.clientRect as (() => DOMRect | null)) ?? null,
                command: (item) => props.command(item),
              });
            },
            onKeyDown: (props: SuggestionKeyDownProps) => callbacks.onKeyDown(props.event),
            onExit: () => {
              callbacks.onState({ open: false, query: '', clientRect: null, command: null });
            },
          }),
        }),
      ];
    },
  });
}

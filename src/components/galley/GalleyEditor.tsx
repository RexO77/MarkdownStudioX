import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { createLowlight, common } from 'lowlight';
import { Markdown } from 'tiptap-markdown';
import { Bold, Italic, Strikethrough, Code, Link2, Unlink, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label, SectionRule } from '@/components/chrome';
import { findLossyConstructs } from '@/lib/galley-safety';
import { createSlashCommand, filterSlashItems, type SlashMenuState } from './slash-command';
import { CodeBlockView } from './CodeBlockView';
import { Alert } from './alert';

const lowlight = createLowlight(common);

export interface GalleyFormatApi {
  applyFormat: (format: string) => void;
}

interface GalleyEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  formatApiRef?: React.MutableRefObject<GalleyFormatApi | null>;
  className?: string;
}

const CLOSED_SLASH: SlashMenuState = { open: false, query: '', clientRect: null, command: null };

/**
 * The editable galley: the typeset page IS the editor. Markdown stays the
 * source of truth — rich edits serialize back out, source edits parse back
 * in, guarded so the focused surface always wins.
 */
export const GalleyEditor = forwardRef<HTMLDivElement, GalleyEditorProps>(
  ({ value, onChange, onScroll, formatApiRef, className }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => scrollRef.current as HTMLDivElement);

    const lastMarkdown = useRef(value);
    const updateTimer = useRef<ReturnType<typeof setTimeout>>();
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const editorInstanceRef = useRef<ReturnType<typeof useEditor>>(null);

    // Re-scanned when the source (or any other external writer) changes.
    // Keystrokes inside a focused galley are ignored so we don't flip
    // read-only mid-edit, and so we don't re-run on every debounce echo.
    const [lossyConstructs, setLossyConstructs] = useState(() => findLossyConstructs(value));
    const isReadOnly = lossyConstructs.length > 0;
    const isReadOnlyRef = useRef(isReadOnly);
    isReadOnlyRef.current = isReadOnly;

    // Slash menu state, mirrored in refs for the suggestion keyboard handler
    const [slash, setSlash] = useState<SlashMenuState>(CLOSED_SLASH);
    const [slashIndex, setSlashIndex] = useState(0);
    const slashRef = useRef(slash);
    const slashIndexRef = useRef(slashIndex);
    slashRef.current = slash;
    slashIndexRef.current = slashIndex;

    // Bubble-menu link editing
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkValue, setLinkValue] = useState('');
    const linkInputRef = useRef<HTMLInputElement>(null);

    const extensions = useMemo(() => {
      const slashExtension = createSlashCommand({
        onState: (state) => {
          setSlash(state);
          setSlashIndex(0);
        },
        onKeyDown: (event) => {
          const items = filterSlashItems(slashRef.current.query);
          if (!slashRef.current.open || items.length === 0) return false;

          if (event.key === 'ArrowDown') {
            setSlashIndex((slashIndexRef.current + 1) % items.length);
            return true;
          }
          if (event.key === 'ArrowUp') {
            setSlashIndex((slashIndexRef.current - 1 + items.length) % items.length);
            return true;
          }
          if (event.key === 'Enter') {
            const item = items[slashIndexRef.current];
            if (item) slashRef.current.command?.(item);
            return true;
          }
          return false;
        },
      });

      return [
        StarterKit.configure({ codeBlock: false }),
        CodeBlockLowlight.extend({
          addNodeView() {
            return ReactNodeViewRenderer(CodeBlockView);
          },
        }).configure({ lowlight, defaultLanguage: 'text' }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer' },
        }),
        Image,
        TaskList,
        TaskItem.configure({ nested: true }),
        Table.configure({ resizable: false }),
        TableRow,
        TableCell,
        TableHeader,
        Alert,
        Typography,
        Placeholder.configure({
          placeholder: "Write, or type '/' for blocks…",
        }),
        Markdown.configure({
          html: false,
          tightLists: true,
          linkify: true,
          breaks: true,
          transformPastedText: true,
        }),
        slashExtension,
      ];
    }, []);

    const editor = useEditor({
      extensions,
      content: value,
      editable: !isReadOnly,
      editorProps: {
        attributes: {
          'aria-label': 'Typeset galley editor',
        },
      },
      onUpdate: ({ editor }) => {
        // Never serialize a document we cannot round-trip — even a
        // programmatic update would write escaped HTML/footnotes back.
        // Read from the ref: useEditor keeps this closure from first render.
        if (isReadOnlyRef.current) return;
        if (updateTimer.current) clearTimeout(updateTimer.current);
        updateTimer.current = setTimeout(() => {
          const md = editor.storage.markdown.getMarkdown();
          if (md !== lastMarkdown.current) {
            lastMarkdown.current = md;
            onChangeRef.current(md);
          }
        }, 200);
      },
    });

    editorInstanceRef.current = editor;

    // External source changes (source pane typing, find & replace, AI format)
    // parse back into the galley — but never while the galley itself is focused.
    useEffect(() => {
      if (!editor || value === lastMarkdown.current) return;
      if (editor.isFocused) return;
      setLossyConstructs(findLossyConstructs(value));
      const t = setTimeout(() => {
        lastMarkdown.current = value;
        editor.commands.setContent(value, false);
      }, 150);
      return () => clearTimeout(t);
    }, [value, editor]);

    useEffect(() => {
      editor?.setEditable(!isReadOnly);
    }, [editor, isReadOnly]);

    // Flush any pending serialization on unmount — switching view or document
    // must never discard the last keystrokes. Skip lossy documents: serializing
    // them would write escaped HTML/footnotes back over the original source.
    useEffect(() => {
      return () => {
        if (!updateTimer.current) return;
        clearTimeout(updateTimer.current);
        if (isReadOnlyRef.current) return;
        const ed = editorInstanceRef.current;
        if (!ed) return;
        const md = ed.storage.markdown.getMarkdown();
        if (md !== lastMarkdown.current) {
          lastMarkdown.current = md;
          onChangeRef.current(md);
        }
      };
    }, []);

    // Toolbar / command palette routing
    useImperativeHandle(
      formatApiRef,
      () => ({
        applyFormat: (format: string) => {
          if (!editor || isReadOnly) return;
          const chain = editor.chain().focus();
          switch (format) {
            case 'bold':
              chain.toggleBold().run();
              break;
            case 'italic':
              chain.toggleItalic().run();
              break;
            case 'code':
              chain.toggleCode().run();
              break;
            case 'heading':
              chain.toggleHeading({ level: 1 }).run();
              break;
            case 'list':
              chain.toggleBulletList().run();
              break;
            case 'quote':
              chain.toggleBlockquote().run();
              break;
            case 'codeblock':
              chain.toggleCodeBlock().run();
              break;
            case 'link':
              if (!editor.state.selection.empty) {
                setLinkValue(editor.getAttributes('link').href || '');
                setLinkOpen(true);
              }
              break;
          }
        },
      }),
      [editor, isReadOnly]
    );

    useEffect(() => {
      if (linkOpen) {
        requestAnimationFrame(() => linkInputRef.current?.focus());
      }
    }, [linkOpen]);

    const applyLink = useCallback(() => {
      if (!editor) return;
      const href = linkValue.trim();
      if (href) {
        const withProtocol = /^[a-z][a-z0-9+.-]*:|^[#/]/i.test(href) ? href : `https://${href}`;
        editor.chain().focus().extendMarkRange('link').setLink({ href: withProtocol }).run();
      } else {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      }
      setLinkOpen(false);
      setLinkValue('');
    }, [editor, linkValue]);

    const slashItems = filterSlashItems(slash.query);
    const slashRect = slash.open ? slash.clientRect?.() : null;

    const bubbleButton = (
      active: boolean,
      onClick: () => void,
      label: string,
      icon: React.ReactNode,
      withBorder = true
    ) => (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center',
          withBorder && 'border-l border-border',
          active
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:bg-foreground hover:text-background'
        )}
      >
        {icon}
      </button>
    );

    return (
      <div className={cn('relative flex h-full w-full flex-col bg-background', className)}>
        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[38rem] px-6 py-8 md:px-10">
            {isReadOnly && (
              <div className="mb-4 border border-border bg-secondary px-3 py-2 font-mono text-[11px] leading-4 text-muted-foreground">
                <span className="font-bold uppercase tracking-[0.06em] text-foreground">Read-only</span>
                {' — this document contains '}
                {lossyConstructs.join(' and ')}
                {', which the galley cannot edit without corrupting. Edit it in RICH TEXT view.'}
              </div>
            )}
            {/* No running head: the header already names the document, and the
                writing surface should open on the writing. */}
            <EditorContent editor={editor} className="galley galley-editable pb-24" />
          </div>
        </div>

        {/* Selection bubble: format marks + link editing */}
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 120, placement: 'top' }}
            shouldShow={({ editor: e, state }) =>
              e.isEditable && !state.selection.empty && !e.isActive('codeBlock') && !e.isActive('image')
            }
          >
            <div className="flex items-center border border-border bg-popover shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              {linkOpen ? (
                <div className="flex items-center gap-1 px-1.5 py-1">
                  <Link2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <input
                    ref={linkInputRef}
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyLink();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setLinkOpen(false);
                      }
                    }}
                    placeholder="paste or type a url…"
                    className="w-52 bg-transparent font-mono text-[12px] placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={applyLink}
                    aria-label="Apply link"
                    className="inline-flex h-6 w-6 items-center justify-center text-primary hover:bg-secondary"
                  >
                    <CornerDownLeft className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  {bubbleButton(
                    editor.isActive('bold'),
                    () => editor.chain().focus().toggleBold().run(),
                    'Bold (⌘B)',
                    <Bold className="h-3.5 w-3.5" />,
                    false
                  )}
                  {bubbleButton(
                    editor.isActive('italic'),
                    () => editor.chain().focus().toggleItalic().run(),
                    'Italic (⌘I)',
                    <Italic className="h-3.5 w-3.5" />
                  )}
                  {bubbleButton(
                    editor.isActive('strike'),
                    () => editor.chain().focus().toggleStrike().run(),
                    'Strikethrough',
                    <Strikethrough className="h-3.5 w-3.5" />
                  )}
                  {bubbleButton(
                    editor.isActive('code'),
                    () => editor.chain().focus().toggleCode().run(),
                    'Inline code (⌘E)',
                    <Code className="h-3.5 w-3.5" />
                  )}
                  {editor.isActive('link')
                    ? bubbleButton(
                        true,
                        () => editor.chain().focus().extendMarkRange('link').unsetLink().run(),
                        'Remove link',
                        <Unlink className="h-3.5 w-3.5" />
                      )
                    : bubbleButton(
                        false,
                        () => {
                          setLinkValue('');
                          setLinkOpen(true);
                        },
                        'Add link (⌘K)',
                        <Link2 className="h-3.5 w-3.5" />
                      )}
                </>
              )}
            </div>
          </BubbleMenu>
        )}

        {/* Slash menu: the block palette at the caret */}
        {slash.open && slashRect && slashItems.length > 0 && (
          <div
            role="listbox"
            aria-label="Insert block"
            className="fixed z-50 w-60 border border-border bg-popover shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
            style={{
              left: Math.min(slashRect.left, window.innerWidth - 260),
              top:
                slashRect.bottom + 288 < window.innerHeight
                  ? slashRect.bottom + 4
                  : Math.max(8, slashRect.top - 4 - Math.min(288, slashItems.length * 42 + 26)),
            }}
          >
            <SectionRule>Insert block</SectionRule>
            <div className="max-h-[262px] overflow-y-auto">
              {slashItems.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  role="option"
                  aria-selected={index === slashIndex}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setSlashIndex(index)}
                  onClick={() => slash.command?.(item)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-2.5 py-2 text-left',
                    index === slashIndex ? 'bg-foreground text-background' : 'text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-3.5 w-3.5 shrink-0',
                      index === slashIndex ? 'text-background' : 'text-muted-foreground'
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="cap-center block font-mono text-[12px] font-bold">{item.title}</span>
                    <Label
                      className={cn(
                        'mt-1 block',
                        index === slashIndex ? 'text-background/70' : 'text-muted-foreground'
                      )}
                    >
                      {item.hint}
                    </Label>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

GalleyEditor.displayName = 'GalleyEditor';

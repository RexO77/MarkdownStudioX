import { Extension, type Editor } from '@tiptap/core';
import Text from '@tiptap/extension-text';
import { Plugin, PluginKey, type Selection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type MarkdownIt from 'markdown-it';
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs';
import { createMathSpanRegex, parseMathSpan, renderMathSpanInto } from '@/lib/math';

const DOLLAR = 0x24;
const BACKSLASH = 0x5c;

/**
 * markdown-it inline rule: swallow a whole dollar or TeX-delimited span as one
 * literal text token so its underscores, asterisks and tildes never reach
 * the emphasis parser. Without this, `$a*b*c$` loses its asterisks to
 * <em> on the way into the galley and the span can never round-trip.
 */
function mathProtectionRule(state: StateInline, silent: boolean): boolean {
  const first = state.src.charCodeAt(state.pos);
  if (first !== DOLLAR && first !== BACKSLASH) return false;
  if (state.pos > 0 && state.src.charCodeAt(state.pos - 1) === BACKSLASH) return false;

  const regex = createMathSpanRegex();
  regex.lastIndex = state.pos;
  const match = regex.exec(state.src);
  if (!match || match.index !== state.pos || regex.lastIndex > state.posMax) {
    return false;
  }

  if (!silent) {
    const token = state.push('text', '', 0);
    token.content = match[0];
  }
  state.pos = regex.lastIndex;
  return true;
}

/** tiptap-markdown escapes `<` and `>` in text the same way. */
const escapeAngles = (value: string) => value.replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Replaces the stock Text node so math spans serialize verbatim. The default
 * serializer backslash-escapes markdown punctuation — turning `$\frac{a}{b}$`
 * into `$\\frac{a}{b}$`, which is a LaTeX line break, corrupting the stored
 * markdown for every other tool. Requires `StarterKit.configure({ text: false })`.
 */
export const MathAwareText = Text.extend({
  addStorage() {
    return {
      markdown: {
        serialize(
          state: { text: (text: string, escape?: boolean) => void },
          node: ProseMirrorNode
        ) {
          const text = node.text ?? '';
          const regex = createMathSpanRegex();
          let last = 0;
          for (let match = regex.exec(text); match; match = regex.exec(text)) {
            if (match.index > last) state.text(escapeAngles(text.slice(last, match.index)));
            state.text(match[0], false);
            last = match.index + match[0].length;
          }
          if (last < text.length) state.text(escapeAngles(text.slice(last)));
        },
        parse: {
          // Reading is markdown-it's job; see mathProtectionRule.
        },
      },
    };
  },
});

/** Keeps the TeX source in the document but out of sight and out of flow. */
const HIDDEN_SOURCE =
  'display: inline-block; height: 0; opacity: 0; overflow: hidden; position: absolute; width: 0;';

function renderWidget(raw: string, editable: boolean): HTMLElement {
  const element = document.createElement('span');
  element.className = 'Tiptap-mathematics-render';
  if (editable) element.classList.add('Tiptap-mathematics-render--editable');
  if (parseMathSpan(raw).display) element.classList.add('Tiptap-mathematics-render--display');
  renderMathSpanInto(raw, element);
  return element;
}

/**
 * Typeset every math span outside code. A span the caret sits in shows its
 * TeX source as a manuscript chip instead, so it can be edited in place.
 */
function buildMathDecorations(doc: ProseMirrorNode, selection: Selection, editable: boolean) {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos, parent) => {
    if (!node.isText || !node.text) return;
    // Never typeset inside code — fenced blocks or `inline code` spans.
    if (parent?.type.name === 'codeBlock') return;
    if (node.marks.some((mark) => mark.type.name === 'code')) return;

    const regex = createMathSpanRegex();
    for (let match = regex.exec(node.text); match; match = regex.exec(node.text)) {
      const raw = match[0];
      const from = pos + match.index;
      const to = from + raw.length;

      if (editable && selection.from >= from && selection.to <= to) {
        decorations.push(Decoration.inline(from, to, { class: 'Tiptap-mathematics-editor' }));
        continue;
      }

      decorations.push(
        Decoration.inline(from, to, {
          class: 'Tiptap-mathematics-editor Tiptap-mathematics-editor--hidden',
          style: HIDDEN_SOURCE,
        }),
        // The key lets ProseMirror keep an unchanged formula's DOM instead of
        // re-running KaTeX on every transaction.
        Decoration.widget(from, () => renderWidget(raw, editable), {
          key: `math:${editable ? 'e' : 'r'}:${raw}`,
        })
      );
    }
  });

  return DecorationSet.create(doc, decorations);
}

function mathPlugin(editor: Editor) {
  let cache: {
    doc: ProseMirrorNode;
    from: number;
    to: number;
    editable: boolean;
    decorations: DecorationSet;
  } | null = null;

  return new Plugin({
    key: new PluginKey('galleyMathematics'),
    props: {
      // Derived from (doc, selection, editable) rather than plugin state:
      // toggling editable re-reads decorations without dispatching anything.
      decorations(state) {
        const editable = editor.isEditable;
        const { from, to } = state.selection;
        if (
          cache &&
          cache.doc === state.doc &&
          cache.from === from &&
          cache.to === to &&
          cache.editable === editable
        ) {
          return cache.decorations;
        }
        const decorations = buildMathDecorations(state.doc, state.selection, editable);
        cache = { doc: state.doc, from, to, editable, decorations };
        return decorations;
      },
    },
  });
}

/**
 * KaTeX rendering in the galley. Decoration-based: the document keeps the
 * plain `$...$` text (so tiptap-markdown round-trips it untouched) and the
 * typeset formula is overlaid whenever the caret is outside the span.
 * `$$...$$` sets in display mode, exactly as the preview and exports do.
 */
export const GalleyMathematics = Extension.create({
  name: 'galleyMathematics',

  addStorage() {
    return {
      markdown: {
        parse: {
          setup(markdownit: MarkdownIt) {
            markdownit.inline.ruler.before('escape', 'math', mathProtectionRule);
          },
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [mathPlugin(this.editor)];
  },
});

import { Mathematics } from '@tiptap/extension-mathematics';
import Text from '@tiptap/extension-text';
import type { EditorState } from '@tiptap/pm/state';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type MarkdownIt from 'markdown-it';
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs';
import { createMathSpanRegex } from '@/lib/math';

const DOLLAR = 0x24;
const BACKSLASH = 0x5c;

/**
 * markdown-it inline rule: swallow a whole `$...$` / `$$...$$` span as one
 * literal text token so its underscores, asterisks and tildes never reach
 * the emphasis parser. Without this, `$a*b*c$` loses its asterisks to
 * <em> on the way into the galley and the span can never round-trip.
 */
function mathProtectionRule(state: StateInline, silent: boolean): boolean {
  if (state.src.charCodeAt(state.pos) !== DOLLAR) return false;
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

/** Never typeset inside code — fenced blocks or `inline code` spans. */
function shouldRenderMath(state: EditorState, pos: number, node: ProseMirrorNode): boolean {
  const $pos = state.doc.resolve(pos);
  if ($pos.parent.type.name === 'codeBlock') return false;
  return !node.marks.some((mark) => mark.type.name === 'code');
}

/**
 * KaTeX rendering in the galley. Decoration-based: the document keeps the
 * plain `$...$` text (so tiptap-markdown round-trips it untouched) and the
 * typeset formula is overlaid whenever the caret is outside the span.
 */
export const GalleyMathematics = Mathematics.extend({
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
}).configure({
  regex: createMathSpanRegex(),
  katexOptions: { throwOnError: false },
  shouldRender: shouldRenderMath,
});

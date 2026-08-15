import React from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import type MarkdownIt from 'markdown-it';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Info, Lightbulb, MessageSquareWarning, TriangleAlert, OctagonAlert } from 'lucide-react';

const ALERT_TYPES = ['note', 'tip', 'important', 'warning', 'caution'] as const;
type AlertType = (typeof ALERT_TYPES)[number];

interface MarkdownSerializerState {
  wrapBlock: (
    delimiter: string,
    firstDelimiter: string | null,
    node: ProseMirrorNode,
    render: () => void,
  ) => void;
  write: (content: string) => void;
  renderContent: (node: ProseMirrorNode) => void;
}

const ALERT_ICONS: Record<AlertType, React.FC<{ className?: string }>> = {
  note: Info,
  tip: Lightbulb,
  important: MessageSquareWarning,
  warning: TriangleAlert,
  caution: OctagonAlert,
};

/**
 * markdown-it core rule: a blockquote whose first line is [!TYPE] becomes
 * <div data-alert="type">, which the Alert node picks up via parseHTML.
 */
function githubAlertsPlugin(md: MarkdownIt) {
  md.core.ruler.after('block', 'github_alerts', (state) => {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'blockquote_open') continue;

      // First inline token inside this blockquote
      let inline = null;
      for (let j = i + 1; j < tokens.length && tokens[j].type !== 'blockquote_close'; j++) {
        if (tokens[j].type === 'inline') {
          inline = tokens[j];
          break;
        }
      }
      if (!inline) continue;

      // Tolerates the escaped form (\[!NOTE\]) that some serializers emit
      const match = inline.content.match(/^\\?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\\?\]\\?\s*/i);
      if (!match) continue;

      const type = match[1].toLowerCase();

      // Find the matching close before renaming anything
      let depth = 0;
      let closeIndex = -1;
      for (let k = i; k < tokens.length; k++) {
        if (tokens[k].type === 'blockquote_open') depth++;
        else if (tokens[k].type === 'blockquote_close') {
          depth--;
          if (depth === 0) {
            closeIndex = k;
            break;
          }
        }
      }
      if (closeIndex === -1) continue;

      tokens[i].type = 'alert_open';
      tokens[i].tag = 'div';
      tokens[i].attrSet('data-alert', type);
      tokens[closeIndex].type = 'alert_close';
      tokens[closeIndex].tag = 'div';

      // Strip the [!TYPE] marker and any break that followed it
      inline.content = inline.content.slice(match[0].length);
      if (inline.children) {
        const first = inline.children.find((c) => c.type === 'text');
        if (first) first.content = first.content.replace(/^\\?\[!\w+\\?\]\\?\s*/i, '');
        while (
          inline.children.length > 0 &&
          ((inline.children[0].type === 'text' && !inline.children[0].content) ||
            inline.children[0].type === 'softbreak' ||
            inline.children[0].type === 'hardbreak')
        ) {
          inline.children.shift();
        }
      }
    }
    return true;
  });
}

const AlertView: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
  const type = (ALERT_TYPES.includes(node.attrs.type) ? node.attrs.type : 'note') as AlertType;
  const Icon = ALERT_ICONS[type];

  const cycleType = () => {
    if (!editor.isEditable) return;
    const next = ALERT_TYPES[(ALERT_TYPES.indexOf(type) + 1) % ALERT_TYPES.length];
    updateAttributes({ type: next });
  };

  return (
    <NodeViewWrapper className={`alert alert-${type}`} data-alert={type}>
      <div className="alert-label" contentEditable={false}>
        <button
          type="button"
          onClick={cycleType}
          title="Change alert type"
          aria-label={`Alert type: ${type}. Click to change.`}
          className="inline-flex cursor-pointer items-center gap-[6px] border-none bg-transparent p-0 font-inherit text-inherit hover:opacity-70"
        >
          <Icon className="h-3 w-3" />
          <span>{type}</span>
        </button>
      </div>
      <NodeViewContent className="alert-content" />
    </NodeViewWrapper>
  );
};

/**
 * GitHub-style alerts as a first-class block: rendered as the galley's
 * proof stamps, serialized back to exact `> [!NOTE]` markdown.
 */
export const Alert = Node.create({
  name: 'alert',

  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'note',
        parseHTML: (element) => element.getAttribute('data-alert') || 'note',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-alert]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-alert': node.attrs.type,
        class: `alert alert-${node.attrs.type}`,
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AlertView);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProseMirrorNode) {
          const type = String(node.attrs.type || 'note').toUpperCase();
          state.wrapBlock('> ', null, node, () => {
            state.write(`[!${type}]\n`);
            state.renderContent(node);
          });
        },
        parse: {
          setup(markdownit: MarkdownIt) {
            markdownit.use(githubAlertsPlugin);
          },
        },
      },
    };
  },
});

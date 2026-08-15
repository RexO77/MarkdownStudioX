import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  'text',
  'bash',
  'c',
  'cpp',
  'css',
  'go',
  'html',
  'java',
  'javascript',
  'json',
  'jsx',
  'markdown',
  'python',
  'rust',
  'sql',
  'tsx',
  'typescript',
  'yaml',
];

/**
 * Code listings in the editable galley keep the read-only preview's grammar:
 * a hairline listing head carrying the language (now a picker) and a copy
 * control, with the code set on the shared 24px ruling.
 */
export const CodeBlockView: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
  const [copied, setCopied] = useState(false);
  const language = node.attrs.language || 'text';

  const handleCopy = () => {
    navigator.clipboard
      .writeText(node.textContent)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {
        // Clipboard unavailable; nothing to report inline
      });
  };

  return (
    <NodeViewWrapper className="listing" data-language={language}>
      <div className="listing-head" contentEditable={false}>
        <select
          value={LANGUAGES.includes(language) ? language : 'text'}
          onChange={(e) => updateAttributes({ language: e.target.value })}
          disabled={!editor.isEditable}
          aria-label="Listing language"
          className={cn(
            'cursor-pointer appearance-none border-none bg-transparent p-0',
            'font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground',
            'hover:text-foreground focus:outline-none'
          )}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className={cn(
            'listing-copy',
            copied && 'copied'
          )}
        >
          {copied ? <Check className="h-[11px] w-[11px]" /> : <Copy className="h-[11px] w-[11px]" />}
          <span>{copied ? 'copied' : 'copy'}</span>
        </button>
      </div>
      <pre spellCheck={false}>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

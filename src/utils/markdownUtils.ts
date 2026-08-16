import { marked } from 'marked';
import { markedSmartypants } from 'marked-smartypants';
import { createMathSpanRegex, renderMathSpanToHtml } from '@/lib/math';

// Smart punctuation: straight quotes become “curly”, -- becomes –, --- becomes —.
// Code spans and listings keep their straight quotes.
marked.use(markedSmartypants());

// KaTeX math: $inline$ and $$display$$, same delimiter rules as the galley.
marked.use({
  extensions: [
    {
      name: 'math',
      level: 'inline',
      start(src: string) {
        return createMathSpanRegex().exec(src)?.index;
      },
      tokenizer(src: string) {
        const match = createMathSpanRegex().exec(src);
        if (match && match.index === 0) {
          return { type: 'math', raw: match[0] };
        }
        return undefined;
      },
      renderer(token) {
        return renderMathSpanToHtml(token.raw);
      },
    },
  ],
});

// Custom renderer for GitHub-style markdown, typeset for the galley
const renderer = new marked.Renderer();

renderer.heading = function (text: string, level: number) {
  const escapedText = text.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\w]+/g, '-');
  return `<h${level} id="${escapedText}">${text}</h${level}>`;
};

// Blockquotes, including GitHub alerts (> [!NOTE] ...)
renderer.blockquote = function (quote: string) {
  const match = quote.match(
    /^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>)?\s*/i
  );

  if (match) {
    const type = match[1].toUpperCase();
    let content = quote.slice(match[0].length);
    if (content.startsWith('</p>')) {
      content = content.slice(4).trim();
    } else {
      content = '<p>' + content;
    }

    return `<div class="alert alert-${type.toLowerCase()}">
      <div class="alert-label">${getAlertIcon(type)}<span>${type}</span></div>
      <div class="alert-content">${content}</div>
    </div>`;
  }

  return `<blockquote>${quote}</blockquote>`;
};

// Task lists
renderer.listitem = function (text: string) {
  const taskPattern = /^\s*\[([x\sX])\]\s*([\s\S]*)/;
  const match = text.match(taskPattern);

  if (match) {
    const checked = match[1].toLowerCase() === 'x';
    const content = match[2];
    return `<li class="task-list-item${checked ? ' done' : ''}">
      <input type="checkbox" ${checked ? 'checked' : ''} disabled aria-hidden="true"> <span class="task-text">${content}</span>
    </li>`;
  }

  return `<li>${text}</li>`;
};

renderer.table = function (header: string, body: string) {
  return `<div class="table-wrapper">
    <table>
      <thead>${header}</thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
};

// Code listings carry their language so the preview can label them
renderer.code = function (code: string, language: string | undefined) {
  const validLang = language && language.match(/^[a-zA-Z0-9-_]+$/);
  const lang = validLang ? language : '';

  return `<div class="listing" data-language="${lang}"><pre><code class="language-${lang}">${escapeHtml(code)}</code></pre></div>`;
};

// Inline code, with color-chip rendering for hex/rgb/hsl values
renderer.codespan = function (code: string) {
  const colorPatterns = [
    /^#[0-9A-Fa-f]{6}$/,
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/,
  ];

  for (const pattern of colorPatterns) {
    if (pattern.test(code)) {
      return `<code class="color-code"><span class="color-preview" style="background-color: ${code}"></span>${code}</code>`;
    }
  }

  return `<code>${escapeHtml(code)}</code>`;
};

// Alert label icons, drawn in one stroke weight (lucide geometry)
function getAlertIcon(type: string): string {
  const svg = (paths: string) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

  const icons: Record<string, string> = {
    NOTE: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    TIP: svg(
      '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'
    ),
    IMPORTANT: svg(
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v2"/><path d="M12 13h.01"/>'
    ),
    WARNING: svg(
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-2Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
    ),
    CAUTION: svg(
      '<path d="M12 16h.01"/><path d="M12 8v4"/><path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/>'
    ),
  };
  return icons[type] || icons.NOTE;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const convertMarkdownToHtml = (markdown: string): string => {
  marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
    renderer: renderer,
  });

  let processedMarkdown = markdown;

  // Math spans sit out the preprocessing passes below — a formula like
  // $x ~ y$ or $[\^2]$ must not be eaten by the strikethrough or footnote
  // regexes. Masked here, restored verbatim just before parsing.
  const maskedMath: string[] = [];
  processedMarkdown = processedMarkdown.replace(createMathSpanRegex(), (span) => {
    maskedMath.push(span);
    return `MATH${maskedMath.length - 1}`;
  });

  // Strikethrough (GitHub style with ~~ or single ~)
  processedMarkdown = processedMarkdown.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  processedMarkdown = processedMarkdown.replace(/(?<!~)~([^~\n]+)~(?!~)/g, '<del>$1</del>');

  // Footnotes: definitions must be replaced before references, or the
  // reference pattern consumes the definition markers first.
  processedMarkdown = processedMarkdown.replace(
    /^\[\^(\w+)\]:\s*(.+)$/gm,
    '<div class="footnote" id="fn-$1"><a href="#ref-$1">$1</a>. $2</div>'
  );
  processedMarkdown = processedMarkdown.replace(
    /\[\^(\w+)\]/g,
    '<sup><a href="#fn-$1" id="ref-$1">$1</a></sup>'
  );

  // Emoji shortcodes
  const emojiMap: { [key: string]: string } = {
    ':+1:': '👍',
    ':-1:': '👎',
    ':shipit:': '🚢',
    ':tada:': '🎉',
    ':rocket:': '🚀',
    ':fire:': '🔥',
    ':heart:': '❤️',
    ':smile:': '😄',
    ':laughing:': '😆',
    ':confused:': '😕',
    ':cry:': '😢',
  };

  Object.entries(emojiMap).forEach(([code, emoji]) => {
    processedMarkdown = processedMarkdown.replace(new RegExp(escapeRegex(code), 'g'), emoji);
  });

  processedMarkdown = processedMarkdown.replace(
    /MATH(\d+)/g,
    (_, index) => maskedMath[Number(index)]
  );

  return marked.parse(processedMarkdown, { async: false }) as string;
};

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

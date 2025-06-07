
import { marked } from 'marked';

// Custom renderer for GitHub-style markdown
const renderer = new marked.Renderer();

// Override heading renderer to add proper styling
renderer.heading = function(text: string, level: number) {
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${level} id="${escapedText}" class="heading-${level}">${text}</h${level}>`;
};

// Override blockquote renderer to handle GitHub alerts
renderer.blockquote = function(quote: string) {
  // Check for GitHub alerts
  const alertTypes = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'];
  
  for (const type of alertTypes) {
    const alertPattern = new RegExp(`^<p>\\[!${type}\\]\\s*</p>\\s*<p>([\\s\\S]*?)</p>$`);
    const match = quote.match(alertPattern);
    
    if (match) {
      const content = match[1];
      const alertClass = `alert alert-${type.toLowerCase()}`;
      const icon = getAlertIcon(type);
      return `<div class="${alertClass}">
        <div class="alert-icon">${icon}</div>
        <div class="alert-content">${content}</div>
      </div>`;
    }
  }
  
  // Regular blockquote
  return `<blockquote class="blockquote">${quote}</blockquote>`;
};

// Override list renderer to handle task lists
renderer.listitem = function(text: string) {
  // Check for task list items
  const taskPattern = /^\[([x\s])\]\s*(.*)/;
  const match = text.match(taskPattern);
  
  if (match) {
    const checked = match[1] === 'x';
    const content = match[2];
    return `<li class="task-list-item">
      <input type="checkbox" ${checked ? 'checked' : ''} disabled> ${content}
    </li>`;
  }
  
  return `<li>${text}</li>`;
};

// Override table renderer for better styling
renderer.table = function(header: string, body: string) {
  return `<div class="table-wrapper">
    <table class="markdown-table">
      <thead>${header}</thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
};

// Override code renderer for better syntax highlighting
renderer.code = function(code: string, language: string | undefined) {
  const validLang = language && language.match(/^[a-zA-Z0-9-_]+$/);
  const lang = validLang ? language : '';
  
  return `<pre class="code-block"><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
};

// Override codespan for inline code
renderer.codespan = function(code: string) {
  // Check for color codes
  const colorPatterns = [
    /^#[0-9A-Fa-f]{6}$/,  // HEX
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,  // RGB
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/  // HSL
  ];
  
  for (const pattern of colorPatterns) {
    if (pattern.test(code)) {
      return `<code class="color-code">
        <span class="color-preview" style="background-color: ${code}"></span>
        ${code}
      </code>`;
    }
  }
  
  return `<code class="inline-code">${escapeHtml(code)}</code>`;
};

function getAlertIcon(type: string): string {
  const icons = {
    NOTE: '💡',
    TIP: '💡',
    IMPORTANT: '❗',
    WARNING: '⚠️',
    CAUTION: '🚨'
  };
  return icons[type as keyof typeof icons] || '📝';
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Configure marked with GitHub Flavored Markdown options
export const convertMarkdownToHtml = (markdown: string): string => {
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert newlines to <br>
    pedantic: false,
    sanitize: false,
    smartypants: false,
    renderer: renderer
  });

  // Pre-process markdown for GitHub-specific features
  let processedMarkdown = markdown;

  // Process strikethrough (GitHub style with ~~ or ~)
  processedMarkdown = processedMarkdown.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  processedMarkdown = processedMarkdown.replace(/(?<!~)~([^~\n]+)~(?!~)/g, '<del>$1</del>');

  // Process subscript and superscript
  processedMarkdown = processedMarkdown.replace(/<sub>([^<]+)<\/sub>/g, '<sub>$1</sub>');
  processedMarkdown = processedMarkdown.replace(/<sup>([^<]+)<\/sup>/g, '<sup>$1</sup>');
  processedMarkdown = processedMarkdown.replace(/<ins>([^<]+)<\/ins>/g, '<ins>$1</ins>');

  // Process footnotes
  processedMarkdown = processedMarkdown.replace(/\[\^(\w+)\]/g, '<sup><a href="#fn-$1" id="ref-$1">$1</a></sup>');
  processedMarkdown = processedMarkdown.replace(/\[\^(\w+)\]:\s*(.+)/g, '<div class="footnote" id="fn-$1"><a href="#ref-$1">$1</a>: $2</div>');

  // Process mentions (simplified - would need actual user data in real implementation)
  processedMarkdown = processedMarkdown.replace(/@(\w+)/g, '<span class="mention">@$1</span>');

  // Process issue references (simplified)
  processedMarkdown = processedMarkdown.replace(/#(\d+)/g, '<a href="#issue-$1" class="issue-link">#$1</a>');

  // Process emoji shortcuts
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
    ':cry:': '😢'
  };

  Object.entries(emojiMap).forEach(([code, emoji]) => {
    processedMarkdown = processedMarkdown.replace(new RegExp(escapeRegex(code), 'g'), emoji);
  });

  return marked.parse(processedMarkdown, { async: false }) as string;
};

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getSavedMarkdown = (): string => {
  return localStorage.getItem('markdown-content') || '';
};

export const saveMarkdown = (content: string): void => {
  localStorage.setItem('markdown-content', content);
};

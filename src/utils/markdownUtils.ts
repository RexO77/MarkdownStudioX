
import { marked } from 'marked';

export const convertMarkdownToHtml = (markdown: string): string => {
  // Configure marked for GitHub-style markdown
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert newlines to <br>
    smartLists: true,
    smartypants: true, // Use "smart" typographic punctuation for things like quotes and dashes
    headerIds: true,
  });
  
  return marked.parse(markdown, { async: false }) as string;
};

export const getSavedMarkdown = (): string => {
  return localStorage.getItem('markdown-content') || '';
};

export const saveMarkdown = (content: string): void => {
  localStorage.setItem('markdown-content', content);
};

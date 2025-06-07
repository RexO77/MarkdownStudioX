
import { marked } from 'marked';

export const convertMarkdownToHtml = (markdown: string): string => {
  // Configure marked for GitHub-style markdown
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert newlines to <br>
  });
  
  return marked.parse(markdown, { async: false }) as string;
};

export const getSavedMarkdown = (): string => {
  return localStorage.getItem('markdown-content') || '';
};

export const saveMarkdown = (content: string): void => {
  localStorage.setItem('markdown-content', content);
};

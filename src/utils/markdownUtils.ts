import { marked } from 'marked';

export const convertMarkdownToHtml = (markdown: string): string => {
  return marked(markdown);
};

export const getSavedMarkdown = (): string => {
  return localStorage.getItem('markdown-content') || '';
};

export const saveMarkdown = (content: string): void => {
  localStorage.setItem('markdown-content', content);
};
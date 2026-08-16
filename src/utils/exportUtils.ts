import { convertMarkdownToHtml } from './markdownUtils';
import { containsMath } from '@/lib/math';

// Standalone HTML exports can't carry the KaTeX fonts inline, so equations
// pull the stylesheet from a CDN. Only added when the document has math.
const KATEX_CSS_LINK =
  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.css">';

// Helper to download a blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// The galley, carried into every export: STIX/Times body on a 24px ruling,
// Courier listings, print-ruled tables. Matches the in-app typeset preview.
const GALLEY_EXPORT_CSS = `
  body {
    font-family: 'STIX Two Text', 'Times New Roman', Georgia, serif;
    font-size: 16px;
    line-height: 24px;
    color: #201c18;
    background: #ffffff;
    max-width: 608px;
    margin: 0 auto;
    padding: 48px 24px;
  }
  h1 { font-size: 30px; line-height: 36px; font-weight: 700; margin: 48px 0 12px; }
  body > h1:first-of-type { text-align: center; margin-top: 0; }
  h2 { font-size: 22px; line-height: 24px; font-weight: 700; margin: 44px 0 20px; padding-bottom: 7px; border-bottom: 1px solid #d9d4c8; }
  h3 { font-size: 18px; line-height: 24px; font-weight: 700; margin: 40px 0 8px; }
  h4 { font-size: 16px; line-height: 24px; font-weight: 700; font-style: italic; margin: 40px 0 8px; }
  h5, h6 { font-size: 14px; line-height: 24px; font-weight: 700; margin: 20px 0 4px; }
  p { margin: 0 0 24px; }
  a { color: #1068c6; text-decoration: underline; text-underline-offset: 3px; }
  code { font-family: 'Courier Prime', 'Courier New', monospace; font-size: 0.875em; background: #f2f0e9; padding: 1px 5px; }
  .listing { border: 1px solid #d9d4c8; background: #f2f0e9; margin: 24px 0; }
  .listing-head { display: none; }
  .listing pre { margin: 0; padding: 11px 14px; overflow-x: auto; }
  .listing code { background: none; padding: 0; font-size: 13px; line-height: 24px; }
  pre code { background: none; }
  blockquote { margin: 24px 0; padding-left: 20px; border-left: 1px solid #79736a; font-style: italic; }
  ul, ol { margin: 0 0 24px; padding-left: 26px; }
  li { margin: 0; }
  .task-list-item { list-style: none; margin-left: -22px; }
  .table-wrapper { margin: 24px 0; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; line-height: 20px; }
  thead th { border-top: 2px solid #201c18; border-bottom: 1px solid #201c18; padding: 8px 12px; text-align: left; }
  tbody td { border-bottom: 1px solid #d9d4c8; padding: 8px 12px; vertical-align: top; }
  tbody tr:last-child td { border-bottom: 2px solid #201c18; }
  img { max-width: 100%; border: 1px solid #d9d4c8; margin: 24px 0; }
  hr { border: none; border-top: 1px solid #d9d4c8; width: 40%; margin: 24px auto; }
  .alert { border: 1px solid #666; margin: 24px 0; }
  .alert-label { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-bottom: 1px solid; font-family: 'Courier Prime', 'Courier New', monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
  .alert-label svg { width: 12px; height: 12px; }
  .alert-content { padding: 12px 14px; }
  .alert-content p:last-child { margin-bottom: 0; }
  .alert-note { border-color: #1068c6; } .alert-note .alert-label { color: #1068c6; border-color: #1068c6; }
  .alert-tip { border-color: #20714b; } .alert-tip .alert-label { color: #20714b; border-color: #20714b; }
  .alert-important { border-color: #6b4a9b; } .alert-important .alert-label { color: #6b4a9b; border-color: #6b4a9b; }
  .alert-warning { border-color: #8a6414; } .alert-warning .alert-label { color: #8a6414; border-color: #8a6414; }
  .alert-caution { border-color: #a63a22; } .alert-caution .alert-label { color: #a63a22; border-color: #a63a22; }
  .footnote { margin-top: 32px; padding-top: 8px; border-top: 1px solid #d9d4c8; font-size: 13px; line-height: 20px; color: #79736a; }
  .footnote + .footnote { margin-top: 0; border-top: none; padding-top: 0; }
  .color-code { font-family: 'Courier Prime', 'Courier New', monospace; background: #f2f0e9; padding: 1px 5px; }
  .katex { font-size: 1.06em; }
  .color-preview { display: inline-block; width: 10px; height: 10px; border: 1px solid #d9d4c8; }
`;

// Export as Markdown file
export const exportToMarkdown = async (content: string, filename: string = 'document') => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `${filename}.md`);
};

// Export as HTML file
export const exportToHtml = async (content: string, filename: string = 'document') => {
  const html = convertMarkdownToHtml(content);

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  ${containsMath(content) ? `${KATEX_CSS_LINK}\n  ` : ''}<style>${GALLEY_EXPORT_CSS}</style>
</head>
<body>
${html}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${filename}.html`);
};

export const exportToPdf = async (content: string, filename: string = 'document') => {
  const html2pdf = (await import('html2pdf.js')).default;
  const html = convertMarkdownToHtml(content);

  // The PDF renders in-app, where the real Courier Prime/STIX faces are
  // loaded, so the typeset page carries straight through.
  const container = document.createElement('div');
  container.innerHTML = html;

  const style = document.createElement('style');
  style.textContent = GALLEY_EXPORT_CSS
    .replace(/body \{/g, '.galley-export {')
    .replace(/body > /g, '.galley-export > ');
  container.prepend(style);
  container.className = 'galley-export';
  container.style.cssText = `
    font-family: 'STIX Two Text', 'Times New Roman', Georgia, serif;
    font-size: 16px;
    line-height: 24px;
    color: #201c18;
    background: #ffffff;
    max-width: 608px;
    padding: 48px 24px;
  `;

  document.body.appendChild(container);

  const options = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  await html2pdf().set(options).from(container).save();
  document.body.removeChild(container);
};

// Simple HTML-based Word export (no docx library needed!)
export const exportToWord = async (content: string, filename: string = 'document') => {
  const html = convertMarkdownToHtml(content);

  // Create HTML that Word can open
  const wordContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Document</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; color: #201c18; }
        h1 { font-size: 22pt; }
        body > h1:first-of-type { text-align: center; }
        h2 { font-size: 16pt; border-bottom: 1pt solid #d9d4c8; padding-bottom: 4pt; }
        h3 { font-size: 13pt; }
        h4 { font-size: 12pt; font-style: italic; }
        a { color: #1068c6; }
        code { font-family: 'Courier New', monospace; font-size: 10pt; background: #f2f0e9; }
        pre { background: #f2f0e9; border: 1pt solid #d9d4c8; padding: 8pt; font-family: 'Courier New', monospace; font-size: 10pt; }
        blockquote { border-left: 1pt solid #79736a; padding-left: 12pt; font-style: italic; margin-left: 0; }
        table { border-collapse: collapse; width: 100%; }
        thead th { border-top: 2pt solid #201c18; border-bottom: 1pt solid #201c18; padding: 5pt 8pt; text-align: left; }
        tbody td { border-bottom: 1pt solid #d9d4c8; padding: 5pt 8pt; }
        .alert { border: 1pt solid #666; margin: 10pt 0; }
        .alert-label { font-family: 'Courier New', monospace; font-size: 9pt; font-weight: bold; padding: 3pt 8pt; border-bottom: 1pt solid #666; }
        .alert-content { padding: 6pt 8pt; }
        .footnote { border-top: 1pt solid #d9d4c8; font-size: 10pt; color: #79736a; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;

  const blob = new Blob([wordContent], { type: 'application/msword' });
  downloadBlob(blob, `${filename}.doc`);
};

export const exportToText = async (content: string, filename: string = 'document') => {
  // Convert markdown to plain text by removing markdown syntax
  const plainText = content
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${filename}.txt`);
};

export const exportToLatex = async (content: string, title: string) => {
  // Convert markdown to LaTeX format
  const latexContent = content
    // Headers
    .replace(/^# (.+)$/gm, '\\section{$1}')
    .replace(/^## (.+)$/gm, '\\subsection{$1}')
    .replace(/^### (.+)$/gm, '\\subsubsection{$1}')
    .replace(/^#### (.+)$/gm, '\\paragraph{$1}')
    .replace(/^##### (.+)$/gm, '\\subparagraph{$1}')

    // Bold and italic
    .replace(/\*\*([^*]+)\*\*/g, '\\textbf{$1}')
    .replace(/\*([^*]+)\*/g, '\\textit{$1}')
    .replace(/__([^_]+)__/g, '\\textbf{$1}')
    .replace(/_([^_]+)_/g, '\\textit{$1}')

    // Code
    .replace(/`([^`]+)`/g, '\\texttt{$1}')
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```(\w*\n)?|```$/g, '');
      return `\\begin{verbatim}\n${code}\n\\end{verbatim}`;
    })

    // Lists
    .replace(/^[-*+] (.+)$/gm, '\\item $1')
    .replace(/^\d+\. (.+)$/gm, '\\item $1')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '\\href{$2}{$1}')

    // Blockquotes
    .replace(/^> (.+)$/gm, '\\begin{quotation}\n$1\n\\end{quotation}');

  // Create complete LaTeX document
  const fullLatexContent = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{hyperref}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}

\\title{${title.replace(/([&%$#_{}])/g, '\\$1')}}
\\author{Markdown Studio X}
\\date{\\today}

\\begin{document}

\\maketitle

${latexContent}

\\end{document}`;

  const blob = new Blob([fullLatexContent], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.tex`);
};

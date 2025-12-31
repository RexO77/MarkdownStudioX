import { convertMarkdownToHtml } from './markdownUtils';

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
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${html}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${filename}.html`);
};

export const exportToPdf = async (content: string) => {
  const html2pdf = (await import('html2pdf.js')).default;
  const html = convertMarkdownToHtml(content);

  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    padding: 40px;
    color: #333;
  `;

  const style = document.createElement('style');
  style.textContent = `
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    img { max-width: 100%; }
  `;
  container.prepend(style);

  document.body.appendChild(container);

  const options = {
    margin: 10,
    filename: 'document.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  await html2pdf().set(options).from(container).save();
  document.body.removeChild(container);
};

// Simple HTML-based Word export (no docx library needed!)
export const exportToWord = async (content: string) => {
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
        body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; }
        h1 { font-size: 18pt; }
        h2 { font-size: 14pt; }
        h3 { font-size: 12pt; }
        code { font-family: Consolas, monospace; background: #f0f0f0; }
        pre { background: #f0f0f0; padding: 10pt; }
        table { border-collapse: collapse; }
        th, td { border: 1pt solid #ccc; padding: 5pt; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;

  const blob = new Blob([wordContent], { type: 'application/msword' });
  downloadBlob(blob, 'document.doc');
};

export const exportToText = async (content: string) => {
  // Convert markdown to plain text by removing markdown syntax
  let plainText = content
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
  downloadBlob(blob, 'document.txt');
};

export const exportToLatex = async (content: string, title: string) => {
  // Convert markdown to LaTeX format
  let latexContent = content
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


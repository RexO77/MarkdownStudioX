import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Spacing } from 'docx';
import { convertMarkdownToHtml } from './markdownUtils';

export const exportToPdf = async (content: string) => {
  const html = convertMarkdownToHtml(content);
  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.width = '800px';
  element.style.padding = '40px';
  element.style.backgroundColor = 'white';
  element.style.lineHeight = '1.6';
  element.style.wordBreak = 'break-word';
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 800,
      height: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      unit: 'px',
      format: 'a4',
      orientation: 'portrait'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    // First page
    pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
    heightLeft -= pdfHeight;
    
    // Additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;
    }

    pdf.save('document.pdf');
  } finally {
    document.body.removeChild(element);
  }
};

export const exportToWord = async (content: string) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: content.split('\n').map(line => 
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24,
            })
          ],
          spacing: {
            before: 240,
            after: 240,
            line: 360,
          },
        })
      ),
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'document.docx');
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
  saveAs(blob, 'document.txt');
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
    .replace(/^> (.+)$/gm, '\\begin{quotation}\n$1\n\\end{quotation}')
    
    // Escape special LaTeX characters
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}');

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
\\author{Markdown Studio}
\\date{\\today}

\\begin{document}

\\maketitle

${latexContent}

\\end{document}`;

  const blob = new Blob([fullLatexContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.tex`);
};

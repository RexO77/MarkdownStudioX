import MarkdownIt from 'markdown-it';
import { createMathSpanRegex } from '@/lib/math';
import { isLatexDocument } from '@/lib/latex';

/** Escape prose once, never TeX extracted from a math token. */
export function escapeLatexText(text: string): string {
  const replacements: Record<string, string> = {
    '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '$': '\\$', '&': '\\&',
    '#': '\\#', '%': '\\%', '_': '\\_', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}',
  };
  return text.replace(/[\\{}$&#%_~^]/g, (character) => replacements[character]);
}

// Separate instance: export rules cannot change the editor or HTML renderer.
const parser = new MarkdownIt({ html: false, linkify: false });
parser.inline.ruler.before('escape', 'latex_export_math', (state, silent) => {
  const regex = createMathSpanRegex();
  regex.lastIndex = state.pos;
  const match = regex.exec(state.src);
  if (!match || match.index !== state.pos || regex.lastIndex > state.posMax) return false;
  if (!silent) state.push('math', '', 0).content = match[0];
  state.pos = regex.lastIndex;
  return true;
});
parser.block.ruler.before('paragraph', 'latex_export_display', (state, start, end, silent) => {
  const offset = state.bMarks[start] + state.tShift[start];
  const source = state.src.slice(offset);
  if (!source.startsWith('$$') && !source.startsWith('\\[')) return false;
  const match = createMathSpanRegex().exec(source);
  if (!match || match.index !== 0) return false;
  const finish = offset + match[0].length;
  let next = start;
  while (next < end && state.eMarks[next] < finish) next += 1;
  if (next >= end || state.src.slice(finish, state.eMarks[next]).trim()) return false;
  if (silent) return true;
  const token = state.push('math', '', 0);
  token.content = match[0];
  token.block = true;
  state.line = next + 1;
  return true;
});

type Token = ReturnType<typeof parser.parse>[number];
function render(tokens: Token[]): string {
  return tokens.map((token, index) => {
    switch (token.type) {
      case 'math': return token.content + (token.block ? '\n\n' : '');
      case 'inline': return render(token.children ?? []);
      case 'text': case 'html_inline': case 'html_block': return escapeLatexText(token.content);
      case 'softbreak': return '\n';
      case 'hardbreak': return '\\\\\n';
      case 'paragraph_open': return '';
      case 'paragraph_close': return '\n\n';
      case 'heading_open': return `\\${['section', 'subsection', 'subsubsection', 'paragraph', 'subparagraph', 'subparagraph'][Number(token.tag.slice(1)) - 1]}{`;
      case 'heading_close': return '}\n\n';
      case 'strong_open': return '\\textbf{';
      case 'em_open': return '\\textit{';
      case 'strong_close': case 'em_close': return '}';
      case 's_open': case 's_close': return ''; // Preserve the words without requiring another package.
      case 'code_inline': return `\\texttt{${escapeLatexText(token.content)}}`;
      case 'fence': case 'code_block':
        // Escape every line rather than letting a literal end-verbatim terminate the block.
        return '\\begin{flushleft}\\ttfamily\n' + token.content.split('\n').map((line) => `${escapeLatexText(line) || '\\mbox{}'}\\par`).join('\n') + '\n\\end{flushleft}\n';
      case 'bullet_list_open': return '\\begin{itemize}\n';
      case 'bullet_list_close': return '\\end{itemize}\n';
      case 'ordered_list_open': return '\\begin{enumerate}\n';
      case 'ordered_list_close': return '\\end{enumerate}\n';
      case 'list_item_open': return '\\item ';
      case 'list_item_close': return '\n';
      case 'blockquote_open': return '\\begin{quotation}\n';
      case 'blockquote_close': return '\\end{quotation}\n';
      case 'link_open': return `\\href{${escapeLatexText(token.attrGet('href') ?? '')}}{`;
      case 'link_close': return '}';
      case 'image': return escapeLatexText(token.content || 'Image');
      case 'hr': return '\\par\\noindent\\rule{\\linewidth}{0.4pt}\\par\n';
      case 'table_open': {
        let columns = 0;
        for (const following of tokens.slice(index + 1)) {
          if (following.type === 'tr_close') break;
          if (following.type === 'th_open') columns += 1;
        }
        return `\\begin{tabular}{${'l'.repeat(Math.max(1, columns))}}\n`;
      }
      case 'table_close': return '\\end{tabular}\n\n';
      case 'tr_close': return '\\\\\n';
      case 'th_close': case 'td_close': return tokens[index + 1]?.type === 'tr_close' ? '' : ' & ';
      default: return token.children ? render(token.children) : '';
    }
  }).join('');
}

export function createLatexDocument(content: string, title: string): string {
  if (isLatexDocument(content)) return content;
  // Use pdfLaTeX’s default font encoding so a basic export does not depend
  // on the separately installed CM-Super font maps. Full TeX passes through.
  return `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{hyperref}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\title{${escapeLatexText(title)}}
\\author{Markdown Studio X}
\\date{\\today}
\\begin{document}
\\maketitle
${render(parser.parse(content, {}))}
\\end{document}`;
}

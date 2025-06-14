
import { useCallback } from 'react';
import { toast } from 'sonner';

interface SmartPasteHandlerProps {
  onContentChange: (content: string) => void;
  currentContent: string;
}

export const useSmartPaste = ({ onContentChange, currentContent }: SmartPasteHandlerProps) => {
  
  const detectContentType = useCallback((text: string) => {
    // URL detection
    if (/^https?:\/\//.test(text.trim())) {
      if (text.includes('youtube.com') || text.includes('youtu.be')) {
        return 'youtube';
      }
      if (text.includes('github.com')) {
        return 'github';
      }
      if (text.includes('figma.com')) {
        return 'figma';
      }
      return 'url';
    }

    // Code detection
    if (text.includes('function ') || text.includes('const ') || text.includes('import ')) {
      return 'javascript';
    }
    if (text.includes('def ') || text.includes('import ')) {
      return 'python';
    }
    if (text.includes('SELECT ') || text.includes('INSERT ')) {
      return 'sql';
    }

    // JSON detection
    try {
      JSON.parse(text);
      return 'json';
    } catch {}

    // CSV detection
    if (text.includes(',') && text.split('\n').length > 1) {
      const lines = text.split('\n');
      const firstLine = lines[0].split(',');
      if (firstLine.length > 1 && lines.length > 1) {
        return 'csv';
      }
    }

    // Email detection
    if (text.includes('@') && /\S+@\S+\.\S+/.test(text)) {
      return 'email';
    }

    return 'text';
  }, []);

  const formatContent = useCallback((text: string, type: string) => {
    switch (type) {
      case 'youtube':
        const videoId = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return videoId ? `[![YouTube Video](https://img.youtube.com/vi/${videoId[1]}/0.jpg)](${text})` : `[YouTube Video](${text})`;
      
      case 'github':
        return `[GitHub Repository](${text})`;
      
      case 'figma':
        return `[Figma Design](${text})`;
      
      case 'url':
        return `[Link](${text})`;
      
      case 'javascript':
      case 'python':
      case 'sql':
        return `\`\`\`${type}\n${text}\n\`\`\``;
      
      case 'json':
        try {
          const formatted = JSON.stringify(JSON.parse(text), null, 2);
          return `\`\`\`json\n${formatted}\n\`\`\``;
        } catch {
          return `\`\`\`json\n${text}\n\`\`\``;
        }
      
      case 'csv':
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
        
        let markdown = `| ${headers.join(' | ')} |\n`;
        markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
        rows.forEach(row => {
          markdown += `| ${row.join(' | ')} |\n`;
        });
        return markdown;
      
      case 'email':
        return `[${text}](mailto:${text})`;
      
      default:
        return text;
    }
  }, []);

  const handleSmartPaste = useCallback((event: ClipboardEvent) => {
    event.preventDefault();
    
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    // Handle different types of clipboard content
    const text = clipboardData.getData('text/plain');
    const html = clipboardData.getData('text/html');
    
    if (html && html.includes('<')) {
      // Convert HTML to markdown (basic conversion)
      let markdown = html
        .replace(/<h([1-6])>(.*?)<\/h[1-6]>/g, (_, level, content) => `${'#'.repeat(parseInt(level))} ${content}\n`)
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<code>(.*?)<\/code>/g, '`$1`')
        .replace(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags
      
      onContentChange(currentContent + '\n\n' + markdown.trim() + '\n\n');
      toast.success('HTML converted to markdown!');
      return;
    }

    if (text) {
      const contentType = detectContentType(text);
      const formattedContent = formatContent(text, contentType);
      
      onContentChange(currentContent + '\n\n' + formattedContent + '\n\n');
      
      if (contentType !== 'text') {
        toast.success(`${contentType.toUpperCase()} content formatted automatically!`);
      }
    }
  }, [currentContent, onContentChange, detectContentType, formatContent]);

  return { handleSmartPaste };
};

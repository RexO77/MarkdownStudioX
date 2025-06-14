
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Moon, Sun, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';

interface UnifiedEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const UnifiedEditor = ({ value, onChange, className }: UnifiedEditorProps) => {
  const [preview, setPreview] = useState('');
  const [activeView, setActiveView] = useState<'edit' | 'preview' | 'split'>('split');
  const [showPreview, setShowPreview] = useState(true);
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => {
    const htmlContent = convertMarkdownToHtml(value);
    setPreview(htmlContent);
  }, [value]);

  useEffect(() => {
    if (isMobile) {
      setActiveView('edit');
      setShowPreview(false);
    } else {
      setActiveView('split');
      setShowPreview(true);
    }
  }, [isMobile]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleView = () => {
    if (isMobile) {
      setActiveView(activeView === 'edit' ? 'preview' : 'edit');
    } else {
      setShowPreview(!showPreview);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Mobile Controls */}
      {isMobile && (
        <div className="flex-shrink-0 flex justify-between items-center p-3 border-b bg-card/50 backdrop-blur-sm z-10">
          <div className="flex gap-2">
            <Button
              variant={activeView === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('edit')}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant={activeView === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('preview')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Desktop Controls */}
      {!isMobile && (
        <div className="flex-shrink-0 flex justify-end items-center p-3 border-b bg-card/50 backdrop-blur-sm z-10">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleView}
              className="flex items-center gap-2"
            >
              {showPreview ? <PanelRightClose className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Editor Content - Fixed height calculation */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Editor Panel */}
        {(activeView === 'edit' || activeView === 'split') && (
          <div className={cn(
            "flex flex-col min-h-0",
            isMobile ? "w-full" : showPreview ? "w-1/2 border-r" : "w-full"
          )}>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 p-6 bg-background text-foreground resize-none focus:outline-none
                font-mono text-sm leading-relaxed transition-colors duration-200
                placeholder:text-muted-foreground min-h-0"
              placeholder="# Start writing your Markdown here...

Try some examples:
- **Bold text**
- *Italic text*
- `Code snippet`
- [Link](https://example.com)

## Code Block
```javascript
console.log('Hello, World!');
```

> This is a blockquote

1. Numbered list
2. Another item"
            />
          </div>
        )}

        {/* Preview Panel */}
        {(activeView === 'preview' || (activeView === 'split' && showPreview)) && (
          <div className={cn(
            "flex flex-col overflow-hidden min-h-0",
            isMobile ? "w-full" : "w-1/2"
          )}>
            <div className="flex-1 overflow-auto bg-card/30 min-h-0">
              <div 
                className="prose prose-slate dark:prose-invert max-w-none p-6
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:text-foreground
                  prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:text-foreground
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:text-foreground
                  prose-p:text-foreground prose-p:leading-7 prose-p:mb-4
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-code:bg-muted prose-code:px-2 prose-code:py-1 
                  prose-code:rounded-md prose-code:text-sm prose-code:text-foreground
                  prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-4 
                  prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:border
                  prose-ul:text-foreground prose-ol:text-foreground
                  prose-li:text-foreground prose-li:marker:text-muted-foreground
                  prose-blockquote:border-l-4 prose-blockquote:border-primary 
                  prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                  prose-strong:text-foreground prose-em:text-foreground
                  prose-hr:border-border
                  transition-colors duration-200"
                dangerouslySetInnerHTML={{ __html: preview || '<p class="text-muted-foreground italic">Your preview will appear here...</p>' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedEditor;

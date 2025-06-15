
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Preview from './Preview';
import { RestrictedEditorToolbar } from './editor/RestrictedEditorToolbar';
import { useAuth } from '@/hooks/useAuth';
import { AIFeatureGate } from './auth/AIFeatureGate';
import { EnhancedEditor } from './editor/EnhancedEditor';
import { TemplatePanel } from './editor/TemplatePanel';
import { useSmartEditor } from '@/hooks/useSmartEditor';
import { useIsMobile } from '@/hooks/use-mobile';

interface UnifiedEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const UnifiedEditor = ({ value, onChange, className }: UnifiedEditorProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<'edit' | 'preview' | 'split'>('split');
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { smartFormat, isProcessing } = useSmartEditor({
    onContentChange: onChange,
    currentContent: value
  });

  // Auto-adjust view for mobile
  useEffect(() => {
    if (isMobile && activeView === 'split') {
      setActiveView('edit');
    }
  }, [isMobile, activeView]);

  const handleSmartFormat = () => {
    if (!user) return;
    smartFormat();
  };

  const handleToggleTemplates = () => {
    if (!user) return;
    setShowTemplates(!showTemplates);
  };

  const handleViewChange = (view: 'edit' | 'preview' | 'split') => {
    if (isMobile && view === 'split') {
      setActiveView('edit');
      return;
    }
    setActiveView(view);
  };

  const renderEditor = () => {
    if (user) {
      return (
        <EnhancedEditor
          value={value}
          onChange={onChange}
          className="h-full"
          placeholder="Start writing your markdown..."
        />
      );
    }

    return (
      <div className="h-full flex flex-col">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start writing your markdown... (Sign in to unlock AI features)"
          className={cn(
            'flex-1 w-full resize-none border-0 bg-transparent px-4 py-4',
            'text-sm leading-relaxed',
            'focus:outline-none focus:ring-0',
            'font-mono'
          )}
          spellCheck={false}
        />
      </div>
    );
  };

  const showEdit = activeView === 'edit' || activeView === 'split';
  const showPreview = activeView === 'preview' || activeView === 'split';

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      <RestrictedEditorToolbar
        onSmartFormat={handleSmartFormat}
        isProcessing={isProcessing}
        showTemplates={showTemplates}
        onToggleTemplates={handleToggleTemplates}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {/* Template Panel - Only for authenticated users */}
      {user && showTemplates && (
        <TemplatePanel 
          visible={showTemplates}
          onInsertTemplate={(template) => {
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newValue = value.substring(0, start) + template + value.substring(end);
              onChange(newValue);
            } else {
              onChange(value + '\n\n' + template);
            }
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        {showEdit && (
          <div className={cn(
            'border-r border-border bg-background',
            showPreview ? 'w-1/2' : 'w-full'
          )}>
            {user ? (
              renderEditor()
            ) : (
              <div className="h-full flex flex-col">
                {renderEditor()}
                
                {/* Non-authenticated user AI features showcase */}
                <div className="border-t p-4 bg-muted/30">
                  <div className="max-w-md mx-auto">
                    <AIFeatureGate 
                      feature="AI Format & Enhancement"
                      description="Get intelligent formatting, grammar improvements, and content enhancement powered by AI."
                    >
                      <div />
                    </AIFeatureGate>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview Panel */}
        {showPreview && (
          <div className={cn(
            'bg-background',
            showEdit ? 'w-1/2' : 'w-full'
          )}>
            <Preview content={value} />
          </div>
        )}
      </div>

      {/* AI Features Showcase for non-authenticated users */}
      {!user && !showEdit && activeView === 'preview' && (
        <div className="border-t p-4 bg-muted/30">
          <div className="max-w-md mx-auto">
            <AIFeatureGate 
              feature="Smart Templates & AI Tools"
              description="Access pre-built templates, smart text selection, and AI-powered content generation."
            >
              <div />
            </AIFeatureGate>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedEditor;

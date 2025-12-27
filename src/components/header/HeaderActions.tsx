
import React from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from '../ExportMenu';
import { Github, Star, Save, Sparkles, Loader2 } from 'lucide-react';

interface HeaderActionsProps {
    content: string;
    onSave: () => void;
    onFormat: () => void;
    isFormatting: boolean;
}

const HeaderActions = ({ content, onSave, onFormat, isFormatting }: HeaderActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            <ExportMenu content={content} />

            <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105"
                onClick={() => window.open('https://github.com/RexO77/MarkdowntoTextconverter', '_blank')}
            >
                <Github className="h-4 w-4" />
                <Star className="h-4 w-4" />
                <span className="hidden md:inline">Star</span>
            </Button>

            <Button
                onClick={onSave}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-accent transition-all duration-200 hover:scale-105"
            >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
            </Button>

            <Button
                onClick={onFormat}
                disabled={isFormatting}
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
                {isFormatting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                    {isFormatting ? 'Formatting...' : 'AI Format'}
                </span>
            </Button>
        </div>
    );
};

export default HeaderActions;


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from '../ExportMenu';
import { ApiKeyDialog, hasApiKey } from '@/components/ui/api-key-dialog';
import { Github, Star, Save, Sparkles, Loader2, Key } from 'lucide-react';

interface HeaderActionsProps {
    content: string;
    onSave: () => void;
    onFormat: () => void;
    isFormatting: boolean;
}

const HeaderActions = ({ content, onSave, onFormat, isFormatting }: HeaderActionsProps) => {
    const [hasKey, setHasKey] = useState(false);
    const [showKeyDialog, setShowKeyDialog] = useState(false);

    useEffect(() => {
        setHasKey(hasApiKey());
    }, []);

    const handleFormatClick = () => {
        if (!hasKey) {
            setShowKeyDialog(true);
            return;
        }
        onFormat();
    };

    return (
        <div className="flex items-center gap-2">
            <ExportMenu content={content} />

            {/* API Key Status Button */}
            <ApiKeyDialog
                trigger={
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`hidden sm:flex items-center gap-2 transition-all duration-200 hover:scale-105 ${hasKey
                                ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950'
                                : 'text-muted-foreground hover:bg-accent'
                            }`}
                    >
                        <Key className="h-4 w-4" />
                        <span className="hidden md:inline">
                            {hasKey ? 'API Key Set' : 'Set API Key'}
                        </span>
                    </Button>
                }
                onKeySet={setHasKey}
            />

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
                onClick={handleFormatClick}
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

            {/* Hidden dialog for when format is clicked without key */}
            {showKeyDialog && (
                <ApiKeyDialog
                    trigger={<span />}
                    onKeySet={(newHasKey) => {
                        setHasKey(newHasKey);
                        setShowKeyDialog(false);
                        if (newHasKey) {
                            // Trigger format after key is set
                            setTimeout(onFormat, 100);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default HeaderActions;


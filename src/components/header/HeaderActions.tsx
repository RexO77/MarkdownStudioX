
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ExportMenu from '../ExportMenu';
import { ApiKeyDialog, hasApiKey } from '@/components/ui/api-key-dialog';
import { Github, Star, Save, Key } from 'lucide-react';

interface HeaderActionsProps {
    content: string;
    onSave: () => void;
}

const HeaderActions = ({ content, onSave }: HeaderActionsProps) => {
    const [hasKey, setHasKey] = useState(false);

    useEffect(() => {
        setHasKey(hasApiKey());
    }, []);

    return (
        <div className="flex items-center gap-2">
            <ExportMenu content={content} />

            {/* API Key Status Button */}
            <ApiKeyDialog
                trigger={
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`hidden sm:flex items-center gap-2 ${hasKey
                            ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50'
                            : 'text-muted-foreground'
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
                className="hidden sm:flex items-center gap-2"
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
                className="flex items-center gap-2"
            >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
            </Button>
        </div>
    );
};

export default HeaderActions;




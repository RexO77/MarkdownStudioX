import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_KEY_STORAGE_KEY = 'groq-api-key';

export function getStoredApiKey(): string | null {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setStoredApiKey(key: string): void {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function clearStoredApiKey(): void {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function hasApiKey(): boolean {
    return !!getStoredApiKey();
}

interface ApiKeyDialogProps {
    trigger?: React.ReactNode;
    onKeySet?: (hasKey: boolean) => void;
}

export function ApiKeyDialog({ trigger, onKeySet }: ApiKeyDialogProps) {
    const [open, setOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [hasExistingKey, setHasExistingKey] = useState(false);

    useEffect(() => {
        const existingKey = getStoredApiKey();
        setHasExistingKey(!!existingKey);
        if (existingKey) {
            // Show masked version
            setApiKey('••••••••••••' + existingKey.slice(-4));
        }
    }, [open]);

    const handleSave = () => {
        if (!apiKey.trim() || apiKey.startsWith('••••')) {
            toast.error('Please enter a valid API key');
            return;
        }

        if (!apiKey.startsWith('gsk_')) {
            toast.error('Invalid Groq API key format. Keys should start with "gsk_"');
            return;
        }

        setStoredApiKey(apiKey.trim());
        setHasExistingKey(true);
        onKeySet?.(true);
        toast.success('API key saved successfully!', {
            description: 'Your key is stored locally in your browser'
        });
        setOpen(false);
    };

    const handleClear = () => {
        clearStoredApiKey();
        setApiKey('');
        setHasExistingKey(false);
        onKeySet?.(false);
        toast.success('API key removed');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // If user starts typing over masked value, clear it
        if (apiKey.startsWith('••••')) {
            setApiKey(e.target.value.replace(/•/g, ''));
        } else {
            setApiKey(e.target.value);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Key className="h-4 w-4" />
                        {hasExistingKey ? 'API Key Set' : 'Set API Key'}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Groq API Key
                    </DialogTitle>
                    <DialogDescription className="space-y-2">
                        <p>
                            Enter your Groq API key to enable AI-powered formatting features.
                            Your key is stored locally in your browser and never sent to our servers.
                        </p>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                            id="api-key"
                            type="password"
                            placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                            value={apiKey}
                            onChange={handleInputChange}
                            className="font-mono"
                        />
                    </div>

                    {hasExistingKey && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <Check className="h-4 w-4" />
                            API key is configured
                        </div>
                    )}

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-muted-foreground">
                                Don't have an API key?{' '}
                                <a
                                    href="https://console.groq.com/keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    Get one free from Groq
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Groq offers generous free tier limits for personal use.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {hasExistingKey && (
                        <Button variant="outline" onClick={handleClear} className="sm:mr-auto">
                            Remove Key
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Key
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

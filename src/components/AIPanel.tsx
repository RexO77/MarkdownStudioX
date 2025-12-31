import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Sparkles, RefreshCw, Undo2, Volume2,
    FileText, Maximize2, Minimize2, RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getStoredApiKey } from '@/components/ui/api-key-dialog';

interface AIPanelProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    onContentChange: (content: string) => void;
}

type Tone = 'formal' | 'casual' | 'creative' | 'professional';
type ContentType = 'article' | 'blog' | 'documentation' | 'academic' | 'social';
type LengthAction = 'expand' | 'condense' | 'rephrase';

interface AIHistoryEntry {
    content: string;
    timestamp: number;
}

const toneOptions: { value: Tone; label: string; description: string }[] = [
    { value: 'formal', label: 'Formal', description: 'Professional and polished' },
    { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
    { value: 'creative', label: 'Creative', description: 'Imaginative and engaging' },
    { value: 'professional', label: 'Professional', description: 'Business-appropriate' },
];

const contentTypeOptions: { value: ContentType; label: string }[] = [
    { value: 'article', label: 'Article' },
    { value: 'blog', label: 'Blog Post' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'academic', label: 'Academic' },
    { value: 'social', label: 'Social Media' },
];

const lengthOptions: { value: LengthAction; label: string; icon: React.ReactNode }[] = [
    { value: 'expand', label: 'Expand', icon: <Maximize2 className="h-4 w-4" /> },
    { value: 'condense', label: 'Condense', icon: <Minimize2 className="h-4 w-4" /> },
    { value: 'rephrase', label: 'Rephrase', icon: <RotateCw className="h-4 w-4" /> },
];

export const AIPanel: React.FC<AIPanelProps> = ({
    isOpen,
    onClose,
    content,
    onContentChange,
}) => {
    const [tone, setTone] = useState<Tone>('professional');
    const [contentType, setContentType] = useState<ContentType>('article');
    const [lengthAction, setLengthAction] = useState<LengthAction | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState<AIHistoryEntry[]>([]);

    const addToHistory = useCallback((newContent: string) => {
        setHistory((prev) => [...prev.slice(-2), { content: newContent, timestamp: Date.now() }]);
    }, []);

    const handleUndo = useCallback(() => {
        if (history.length > 0) {
            const lastEntry = history[history.length - 1];
            onContentChange(lastEntry.content);
            setHistory((prev) => prev.slice(0, -1));
            toast.success('Reverted to previous version');
        }
    }, [history, onContentChange]);

    const handleFormat = async () => {
        if (!content.trim()) {
            toast.error('No content to format');
            return;
        }

        const apiKey = getStoredApiKey();
        if (!apiKey) {
            toast.error('Please set your Groq API key in settings');
            return;
        }

        setIsProcessing(true);
        addToHistory(content);

        try {
            const customPrompt = buildPrompt(tone, contentType, lengthAction);
            const formatted = await formatWithCustomPrompt(content, customPrompt, apiKey);
            onContentChange(formatted);
            toast.success('Content formatted successfully!');
        } catch (error) {
            console.error('AI Format error:', error);
            toast.error('Failed to format content');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="fixed right-0 top-16 bottom-0 z-40 w-80 bg-background border-l flex flex-col shadow-lg"
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold">AI Enhancement</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        <div>
                            <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                                <Volume2 className="h-4 w-4" />
                                Tone
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {toneOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setTone(option.value)}
                                        className={cn(
                                            'p-3 rounded-lg border text-left transition-all',
                                            tone === option.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <div className="text-sm font-medium">{option.label}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {option.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                                <FileText className="h-4 w-4" />
                                Content Type
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {contentTypeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setContentType(option.value)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-full text-sm border transition-all',
                                            contentType === option.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                                <RefreshCw className="h-4 w-4" />
                                Adjust Length
                            </Label>
                            <div className="flex gap-2">
                                {lengthOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setLengthAction(
                                            lengthAction === option.value ? null : option.value
                                        )}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all',
                                            lengthAction === option.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        {option.icon}
                                        <span className="text-sm">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isProcessing && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                                <span className="text-sm text-primary">Processing with AI...</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t space-y-2">
                        <Button
                            onClick={handleFormat}
                            disabled={isProcessing || !content.trim()}
                            className="w-full"
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Format Now
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            className="w-full"
                        >
                            <Undo2 className="h-4 w-4 mr-2" />
                            Undo Last Change
                            {history.length > 0 && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    ({history.length} saved)
                                </span>
                            )}
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

function buildPrompt(tone: Tone, contentType: ContentType, lengthAction: LengthAction | null): string {
    const toneInstructions: Record<Tone, string> = {
        formal: 'Use formal language, avoid contractions, and maintain a professional tone.',
        casual: 'Use conversational language with a friendly, approachable tone.',
        creative: 'Be imaginative and engaging, use vivid descriptions and varied sentence structures.',
        professional: 'Balance formality with accessibility, suitable for business contexts.',
    };

    const contentInstructions: Record<ContentType, string> = {
        article: 'Structure as a well-organized article with clear sections.',
        blog: 'Format as an engaging blog post with a personal touch.',
        documentation: 'Create clear, technical documentation with precise language.',
        academic: 'Use academic writing conventions with citations support.',
        social: 'Keep it concise and impactful for social media.',
    };

    const lengthInstructions: Record<LengthAction, string> = {
        expand: 'Expand the content with more details, examples, and explanations.',
        condense: 'Condense the content to be more concise while keeping key points.',
        rephrase: 'Rephrase the content in a fresh way while maintaining the meaning.',
    };

    let prompt = `Format this Markdown content with these specifications:
  
TONE: ${toneInstructions[tone]}

CONTENT TYPE: ${contentInstructions[contentType]}`;

    if (lengthAction) {
        prompt += `

LENGTH: ${lengthInstructions[lengthAction]}`;
    }

    prompt += `

Also apply these styling rules:
- Add relevant emojis to headers and key points
- Fix any spelling or grammar issues
- Ensure proper markdown formatting
- Structure content with clear hierarchy`;

    return prompt;
}

async function formatWithCustomPrompt(content: string, customPrompt: string, apiKey: string): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: customPrompt },
                { role: 'user', content: content },
            ],
            temperature: 0.5,
            max_completion_tokens: 32768,
            top_p: 1,
            stream: false,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

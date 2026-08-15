import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Undo2, Loader2 } from 'lucide-react';
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

const toneOptions: { value: Tone; label: string }[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' },
    { value: 'creative', label: 'Creative' },
];

const contentTypeOptions: { value: ContentType; label: string }[] = [
    { value: 'article', label: 'Article' },
    { value: 'blog', label: 'Blog post' },
    { value: 'documentation', label: 'Docs' },
    { value: 'academic', label: 'Academic' },
    { value: 'social', label: 'Social' },
];

const lengthOptions: { value: LengthAction; label: string }[] = [
    { value: 'expand', label: 'Expand' },
    { value: 'condense', label: 'Condense' },
    { value: 'rephrase', label: 'Rephrase' },
];

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        {children}
    </div>
);

const OptionButton: React.FC<{
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ selected, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={cn(
            'border px-2 py-1.5 text-left font-mono text-[11px] tracking-[0.02em]',
            selected
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-foreground hover:bg-secondary'
        )}
    >
        {children}
    </button>
);

export const AIPanel: React.FC<AIPanelProps> = ({ isOpen, onClose, content, onContentChange }) => {
    const [tone, setTone] = useState<Tone>('professional');
    const [contentType, setContentType] = useState<ContentType>('article');
    const [lengthAction, setLengthAction] = useState<LengthAction | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState<AIHistoryEntry[]>([]);

    // Escape closes the panel, like every other overlay
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

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
            toast.error('Nothing to format yet');
            return;
        }

        const apiKey = getStoredApiKey();
        if (!apiKey) {
            toast.error('Add your Groq API key first', {
                description: 'Use the key button in the header. Keys stay in your browser.',
            });
            return;
        }

        setIsProcessing(true);
        addToHistory(content);

        try {
            const customPrompt = buildPrompt(tone, contentType, lengthAction);
            const formatted = await formatWithCustomPrompt(content, customPrompt, apiKey);
            onContentChange(formatted);
            toast.success('Manuscript reformatted');
        } catch (error) {
            console.error('AI Format error:', error);
            toast.error('Formatting failed', {
                description: error instanceof Error ? error.message : 'Check your key and try again.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 288 }}
                    exit={{ width: 0, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full shrink-0 overflow-hidden border-l border-border bg-background"
                    role="complementary"
                    aria-label="AI formatting"
                >
                <div className="flex h-full w-72 flex-col">
                    <div className="flex h-8 shrink-0 items-center justify-between border-b border-border pl-3 pr-1">
                        <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                            <Sparkles className="h-3 w-3 text-primary" />
                            AI Format
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close AI panel"
                            className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-5 overflow-y-auto p-3">
                        <div>
                            <SectionLabel>Tone</SectionLabel>
                            <div className="grid grid-cols-2 gap-1">
                                {toneOptions.map((option) => (
                                    <OptionButton
                                        key={option.value}
                                        selected={tone === option.value}
                                        onClick={() => setTone(option.value)}
                                    >
                                        {option.label}
                                    </OptionButton>
                                ))}
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Content type</SectionLabel>
                            <div className="grid grid-cols-2 gap-1">
                                {contentTypeOptions.map((option) => (
                                    <OptionButton
                                        key={option.value}
                                        selected={contentType === option.value}
                                        onClick={() => setContentType(option.value)}
                                    >
                                        {option.label}
                                    </OptionButton>
                                ))}
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Length</SectionLabel>
                            <div className="grid grid-cols-3 gap-1">
                                {lengthOptions.map((option) => (
                                    <OptionButton
                                        key={option.value}
                                        selected={lengthAction === option.value}
                                        onClick={() =>
                                            setLengthAction(lengthAction === option.value ? null : option.value)
                                        }
                                    >
                                        {option.label}
                                    </OptionButton>
                                ))}
                            </div>
                            <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                                Optional. Leave off to keep the current length.
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 space-y-1.5 border-t border-border p-3">
                        <button
                            type="button"
                            onClick={handleFormat}
                            disabled={isProcessing || !content.trim()}
                            className={cn(
                                'flex h-8 w-full items-center justify-center gap-2',
                                'bg-primary font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-primary-foreground',
                                'hover:opacity-90 disabled:opacity-50'
                            )}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin [animation-duration:600ms]" />
                                    Formatting…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Format manuscript
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            className={cn(
                                'flex h-8 w-full items-center justify-center gap-2 border border-border',
                                'font-mono text-[11px] uppercase tracking-[0.04em] text-foreground',
                                'hover:bg-secondary disabled:opacity-40'
                            )}
                        >
                            <Undo2 className="h-3.5 w-3.5" />
                            Undo{history.length > 0 ? ` (${history.length})` : ''}
                        </button>
                    </div>
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

Also apply these rules:
- Fix any spelling or grammar issues
- Ensure proper markdown formatting (headings, lists, code fences)
- Structure content with clear hierarchy
- Return only the markdown document, no commentary`;

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

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kbd } from '@/components/ui/kbd';
import { useTheme } from '@/components/ui/theme-provider';
import { setStoredApiKey } from '@/components/ui/api-key-dialog';
import { Label, LAYER, Segmented } from '@/components/chrome';
import { toast } from 'sonner';

interface WelcomeScreenProps {
    onComplete: () => void;
}

const ONBOARDING_KEY = 'markdown-studio-onboarded';

export const hasCompletedOnboarding = (): boolean => {
    try {
        return localStorage.getItem(ONBOARDING_KEY) === 'true';
    } catch {
        return false;
    }
};

export const setOnboardingComplete = () => {
    try {
        localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
        // Ignore storage errors
    }
};

/** Natural case in the data; the label cut does the uppercasing. */
const THEME_CHOICES = [
    { id: 'light' as const, label: 'Light', Icon: Sun },
    { id: 'dark' as const, label: 'Dark', Icon: Moon },
    { id: 'system' as const, label: 'System', Icon: Monitor },
];

const SHORTCUTS = [
    { keys: '⌘⌥N', action: 'new document' },
    { keys: '⌘B', action: 'bold' },
    { keys: '⌘I', action: 'italic' },
    { keys: '⌘K', action: 'link' },
    { keys: '⌘F', action: 'find' },
    { keys: '⌘P', action: 'commands' },
    { keys: '⌘\\', action: 'index' },
];

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const sectionVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.08 + i * 0.07, duration: 0.3, ease: EASE_OUT },
    }),
};

const SectionHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2>
        <Label weight="strong" className="text-foreground">
            {children}
        </Label>
    </h2>
);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
    const [apiKey, setApiKey] = useState('');
    const { theme, setTheme } = useTheme();

    const handleStart = () => {
        const trimmed = apiKey.trim();
        if (trimmed) {
            if (!trimmed.startsWith('gsk_')) {
                toast.error('Groq keys start with “gsk_”. Leave blank to skip.');
                return;
            }
            setStoredApiKey(trimmed);
        }
        setOnboardingComplete();
        onComplete();
    };

    return (
        <div className={cn('fixed inset-0 overflow-y-auto bg-background', LAYER.dialog)}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-6 py-10"
            >
                {/* Running head */}
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="flex items-baseline justify-between border-b border-border pb-2 font-mono text-[11px] font-bold tracking-[0.02em]"
                >
                    <span className="cap-center">Markdown Studio X</span>
                    <Label weight="strong" className="text-muted-foreground">
                        msx(1)
                    </Label>
                </motion.div>

                <div className="space-y-8 py-10">
                    <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
                        <SectionHead>Name</SectionHead>
                        <p className="mt-2 pl-6 font-serif text-[17px] leading-6">
                            <span className="font-mono text-[14px] font-bold">Markdown Studio X</span> — write
                            markdown, watch it typeset.
                        </p>
                    </motion.section>

                    <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
                        <SectionHead>Description</SectionHead>
                        <p className="mt-2 max-w-[58ch] pl-6 font-serif text-[16px] leading-6 text-foreground/90">
                            The manuscript on the left, a typeset page on the right, rendered live as you
                            type. Documents stay in this browser — no account, no server, free. Optional AI
                            formatting runs on your own key.
                        </p>
                    </motion.section>

                    <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
                        <SectionHead>Options</SectionHead>
                        <div className="mt-3 space-y-4 pl-6">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <code className="font-mono text-[12px] text-muted-foreground">--theme</code>
                                <Segmented
                                    label="Theme"
                                    items={THEME_CHOICES}
                                    value={theme}
                                    onChange={setTheme}
                                    compactLabels={false}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <code className="font-mono text-[12px] text-muted-foreground">--ai-key</code>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="gsk_… (optional)"
                                    aria-label="Groq API key (optional)"
                                    className={cn(
                                        'w-56 border border-input bg-transparent px-2 py-1.5 font-mono text-[12px]',
                                        'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring'
                                    )}
                                />
                                <a
                                    href="https://console.groq.com/keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-[11px] text-primary hover:underline"
                                >
                                    get a free key ↗
                                </a>
                            </div>
                            <Label weight="strong" className="block font-normal text-muted-foreground">
                                Both live in Settings afterwards. Keys are stored only in this browser.
                            </Label>
                        </div>
                    </motion.section>

                    <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
                        <SectionHead>Shortcuts</SectionHead>
                        <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1.5 pl-6 sm:grid-cols-3">
                            {SHORTCUTS.map((s) => (
                                <div key={s.action} className="flex items-center gap-2 font-mono text-[12px]">
                                    <Kbd keys={s.keys} />
                                    <span className="text-muted-foreground">{s.action}</span>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>

                <motion.div
                    custom={5}
                    initial="hidden"
                    animate="visible"
                    variants={sectionVariants}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border pt-4"
                >
                    <Label weight="strong" className="font-normal text-muted-foreground">
                        Free · local-first · open source
                    </Label>
                    <button
                        type="button"
                        onClick={handleStart}
                        className={cn(
                            'inline-flex h-9 items-center gap-2 px-4',
                            'bg-primary font-mono text-[12px] font-bold uppercase tracking-[0.04em] text-primary-foreground',
                            'hover:opacity-90'
                        )}
                    >
                        <span className="cap-center">Start writing</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

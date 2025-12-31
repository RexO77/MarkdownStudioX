import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowRight, ArrowLeft, Check, KeyRound,
    Palette, Keyboard, Split, Moon, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ui/theme-provider';

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

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [apiKey, setApiKey] = useState('');
    const { theme, setTheme } = useTheme();

    const steps = [
        { id: 'welcome', title: 'Welcome' },
        { id: 'api-key', title: 'API Setup' },
        { id: 'theme', title: 'Theme' },
        { id: 'features', title: 'Features' },
    ];

    const goNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const goPrev = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleComplete = () => {
        if (apiKey.trim()) {
            localStorage.setItem('groq-api-key', apiKey.trim());
        }
        setOnboardingComplete();
        onComplete();
    };

    const handleSkip = () => {
        setOnboardingComplete();
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg mx-4"
            >
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {steps.map((s, i) => (
                        <div
                            key={s.id}
                            className={cn(
                                'w-2 h-2 rounded-full transition-all',
                                i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/60' : 'bg-muted'
                            )}
                        />
                    ))}
                </div>

                {/* Content Card */}
                <div className="bg-background/80 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="p-8"
                        >
                            {step === 0 && (
                                <div className="text-center space-y-6">
                                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                        <Sparkles className="h-10 w-10 text-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold mb-2">Welcome to Markdown Studio X</h1>
                                        <p className="text-muted-foreground">
                                            A beautiful, AI-powered markdown editor for modern writers
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 text-left text-sm">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Split className="h-5 w-5 text-primary shrink-0" />
                                            <span>Split-pane editor with live preview</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Sparkles className="h-5 w-5 text-primary shrink-0" />
                                            <span>AI-powered formatting and enhancement</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Keyboard className="h-5 w-5 text-primary shrink-0" />
                                            <span>Keyboard shortcuts for power users</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                                            <KeyRound className="h-8 w-8 text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Connect to AI</h2>
                                        <p className="text-muted-foreground text-sm">
                                            Enter your Groq API key to enable AI features (optional)
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="api-key">Groq API Key</Label>
                                        <Input
                                            id="api-key"
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="gsk_..."
                                            className="font-mono"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Get your free API key at{' '}
                                            <a
                                                href="https://console.groq.com/keys"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                console.groq.com
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                                            <Palette className="h-8 w-8 text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Choose Your Theme</h2>
                                        <p className="text-muted-foreground text-sm">
                                            Select a theme that suits your preference
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={cn(
                                                'p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3',
                                                theme === 'light'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                            )}
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-white border shadow flex items-center justify-center">
                                                <Sun className="h-6 w-6 text-amber-500" />
                                            </div>
                                            <span className="font-medium">Light</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={cn(
                                                'p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3',
                                                theme === 'dark'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                            )}
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center">
                                                <Moon className="h-6 w-6 text-blue-400" />
                                            </div>
                                            <span className="font-medium">Dark</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center mb-4">
                                            <Check className="h-8 w-8 text-green-500" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
                                        <p className="text-muted-foreground text-sm">
                                            Here are some keyboard shortcuts to get you started
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {[
                                            { keys: '⌘ B', action: 'Bold' },
                                            { keys: '⌘ I', action: 'Italic' },
                                            { keys: '⌘ K', action: 'Insert Link' },
                                            { keys: '⌘ F', action: 'Find & Replace' },
                                            { keys: '⌘ P', action: 'Command Palette' },
                                            { keys: '⌘ \\', action: 'Toggle Sidebar' },
                                        ].map((shortcut) => (
                                            <div
                                                key={shortcut.action}
                                                className="flex items-center justify-between p-2 rounded bg-muted/50"
                                            >
                                                <span>{shortcut.action}</span>
                                                <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">
                                                    {shortcut.keys}
                                                </kbd>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                        <Button
                            variant="ghost"
                            onClick={step === 0 ? handleSkip : goPrev}
                            className="text-muted-foreground"
                        >
                            {step === 0 ? (
                                'Skip'
                            ) : (
                                <>
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Back
                                </>
                            )}
                        </Button>

                        <Button onClick={goNext}>
                            {step === steps.length - 1 ? (
                                <>
                                    Get Started
                                    <Sparkles className="h-4 w-4 ml-1" />
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

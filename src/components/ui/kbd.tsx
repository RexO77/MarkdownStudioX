import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Splits a shortcut string into individual key caps.
 * '⌘⇧Q' → ['⌘','⇧','Q'], '⌘\\' → ['⌘','\\'], 'esc' → ['esc'],
 * '⌘ + K' / '⌘-K' separators are tolerated.
 */
export function splitKeys(shortcut: string): string[] {
  const cleaned = shortcut.replace(/\s*\+\s*/g, '').trim();
  const keys: string[] = [];
  let rest = cleaned;
  const MODIFIERS = ['⌘', '⇧', '⌥', '⌃'];
  while (rest.length > 0 && MODIFIERS.includes(rest[0])) {
    keys.push(rest[0]);
    rest = rest.slice(1);
  }
  if (rest.length > 0) keys.push(rest);
  return keys;
}

const KEY_NAMES: Record<string, string> = {
  '⌘': 'Cmd',
  '⇧': 'Shift',
  '⌥': 'Option',
  '⌃': 'Ctrl',
};

interface KbdProps {
  keys: string;
  className?: string;
  /** 'chrome' for tooltips/menus (on popover), 'inverse' for inverse-video rows */
  tone?: 'chrome' | 'inverse';
}

/** A shortcut rendered as individual key caps: [⌘] [⇧] [Q] */
export const Kbd: React.FC<KbdProps> = ({ keys, className, tone = 'chrome' }) => {
  const caps = splitKeys(keys);
  return (
    <span
      className={cn('inline-flex items-center gap-[3px]', className)}
      aria-label={caps.map((k) => KEY_NAMES[k] || k).join(' ')}
    >
      {caps.map((cap, i) => (
        <kbd
          key={i}
          aria-hidden="true"
          className={cn(
            'inline-flex h-[18px] min-w-[18px] items-center justify-center px-1',
            'border font-mono text-[11px] leading-none',
            tone === 'chrome'
              ? 'border-border bg-muted text-foreground shadow-[0_1px_0_hsl(var(--border))]'
              : 'border-background/40 bg-transparent text-background'
          )}
        >
          {cap}
        </kbd>
      ))}
    </span>
  );
};

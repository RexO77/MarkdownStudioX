import React from 'react';
import { cn } from '@/lib/utils';
import { HOVER, INK, PRESS, SELECTED } from './tokens';
import { Label } from './Label';

interface LabelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The visible text. Kept as the accessible name unless `aria-label` is given. */
  children: React.ReactNode;
  /** Optional 12px icon set before the label. */
  icon?: React.ReactNode;
  /** Open/selected state: full inverse video. */
  active?: boolean;
  /** `accent` inks the label Bell blue — reserved for a single primary action per surface. */
  tone?: 'rest' | 'accent';
  /** Fill the height of the bar it sits in rather than the standing 36/28px. */
  fill?: boolean;
  /** `row` is the 24px cut used inside dense panels beside 24px icon buttons. */
  size?: 'bar' | 'row';
}

/**
 * A chrome text button — an 11px uppercase label, optionally with an icon.
 *
 * Same interaction grammar as `IconButton`; use this when the action needs a
 * word (EXPORT, NEW, CLEAR SEARCH) instead of a glyph.
 */
export const LabelButton = React.forwardRef<HTMLButtonElement, LabelButtonProps>(
  function LabelButton(
    { children, icon, active, tone = 'rest', fill, size = 'bar', className, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        className={cn(
          'inline-flex items-center gap-1.5',
          size === 'row' ? 'h-6 px-1.5' : 'px-2.5',
          fill ? 'h-full' : size === 'bar' && 'h-9 md:h-7',
          tone === 'accent' ? INK.accent : INK.rest,
          HOVER,
          PRESS,
          'disabled:pointer-events-none disabled:opacity-40',
          active && `${SELECTED} hover:bg-foreground hover:text-background`,
          className
        )}
        {...props}
      >
        {icon}
        <Label weight="strong">{children}</Label>
      </button>
    );
  }
);

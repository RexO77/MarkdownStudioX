import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';
import { HOVER, ICON_BUTTON_SIZE, INK, PRESS, ROW_BUTTON_SIZE, TOGGLED } from './tokens';

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Spoken name and tooltip text. Required — chrome buttons carry no visible label. */
  label: string;
  /** Rendered in the tooltip as key caps and appended to the accessible name. */
  shortcut?: string;
  /** Toggled-on state: holds the hover fill and reports aria-pressed. */
  active?: boolean;
  /** `bar` is the standing 36/28px button; `row` is the 24px one inside a list row. */
  size?: 'bar' | 'row';
  /** Suppress the tooltip where one would be noise (a row's hover actions). */
  tooltip?: boolean;
  /** Tooltip placement. */
  side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * The chrome icon button: square, borderless at rest, faded ink.
 *
 * Hover raises to the secondary fill, press flips to inverse video, and a
 * toggled button holds the hover fill — the one interaction grammar shared
 * by the header, the toolbar and every panel.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, shortcut, active, size = 'bar', tooltip = true, side = 'bottom', className, children, ...props },
  ref
) {
  const button = (
    <button
      ref={ref}
      type="button"
      aria-label={shortcut ? `${label} (${shortcut})` : label}
      aria-pressed={active}
      className={cn(
        // shrink-0 is load-bearing: inside a crowded bar a squeezed flex
        // child compresses to a sliver and the icons pile onto each other.
        'inline-flex shrink-0 items-center justify-center',
        size === 'bar' ? ICON_BUTTON_SIZE : ROW_BUTTON_SIZE,
        INK.rest,
        HOVER,
        PRESS,
        'disabled:pointer-events-none disabled:opacity-40',
        active && TOGGLED,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={side} className="flex items-center gap-2.5 font-mono text-[11px]">
        <span>{label}</span>
        {shortcut && <Kbd keys={shortcut} />}
      </TooltipContent>
    </Tooltip>
  );
});

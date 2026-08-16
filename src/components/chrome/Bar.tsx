import React from 'react';
import { cn } from '@/lib/utils';
import { BAR, GUTTER, type BarTrack } from './tokens';

interface BarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which stacked track this bar occupies. */
  track: BarTrack;
  /** Rendered element — `header` for the app head, `div` elsewhere. */
  as?: 'header' | 'div' | 'footer';
  /** Hairline placement. Bars above content rule below; the statusline rules above. */
  rule?: 'bottom' | 'top' | 'none';
  /** Children stretch to the bar's full height instead of centering in it. */
  stretch?: boolean;
  /** Drop the standard 8px gutter (for bars whose children own their padding). */
  flush?: boolean;
}

/**
 * A chrome bar: fixed track height, one hairline, the shared 8px gutter.
 *
 * Every horizontal band of chrome goes through this so the header, the
 * toolbar and the index head keep the same left edge and the same rule.
 */
export const Bar = React.forwardRef<HTMLDivElement, BarProps>(function Bar(
  { track, as = 'div', rule = 'bottom', stretch, flush, className, children, ...props },
  ref
) {
  const Element = as;
  return (
    <Element
      ref={ref as React.Ref<HTMLDivElement & HTMLElement>}
      className={cn(
        'flex shrink-0 justify-between bg-background',
        BAR[track],
        stretch ? 'items-stretch' : 'items-center',
        rule === 'bottom' && 'border-b border-border',
        rule === 'top' && 'border-t border-border',
        !flush && GUTTER,
        className
      )}
      {...props}
    >
      {children}
    </Element>
  );
});

/** The 1px × 16px stroke that separates clusters inside a bar. */
export const BarDivider = () => (
  <div className="mx-1.5 h-4 w-px shrink-0 bg-border" aria-hidden="true" />
);

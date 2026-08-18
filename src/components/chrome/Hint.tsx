import React from 'react';
import { cn } from '@/lib/utils';
import { HINT, INK } from './tokens';

interface HintProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Render inline (inside a row) rather than as its own paragraph. */
  as?: 'p' | 'span';
}

/**
 * The 11px explanatory line beneath a control — natural case, muted ink.
 *
 * The counterpart to `Label`: `Label` marks a thing in one or two words and
 * shouts to do it, `Hint` explains in a sentence and must not. Reach for this
 * for anything phrase-length, and never letter-space or uppercase it back.
 */
export const Hint = React.forwardRef<HTMLElement, HintProps>(function Hint(
  { as = 'p', className, children, ...props },
  ref
) {
  const Tag = as as 'p';
  return (
    <Tag ref={ref as React.Ref<HTMLParagraphElement>} className={cn(HINT, INK.rest, className)} {...props}>
      {children}
    </Tag>
  );
});

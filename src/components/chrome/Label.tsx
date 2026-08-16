import React from 'react';
import { cn } from '@/lib/utils';
import { LABEL, LABEL_STRONG } from './tokens';

interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `strong` is the bold 0.06em cut used by section rules and switch cells. */
  weight?: 'normal' | 'strong';
  /** Keep the source casing (document names, status verbs). */
  preserveCase?: boolean;
}

/**
 * An 11px Courier Prime label — the floor of the type system.
 *
 * Always use this rather than hand-rolling the classes: it carries the
 * cap-height trim that makes a label center optically against the icon
 * beside it, which hand-rolled `leading-none` labels do not.
 */
export const Label = React.forwardRef<HTMLSpanElement, LabelProps>(function Label(
  { weight = 'normal', preserveCase, className, children, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        weight === 'strong' ? LABEL_STRONG : LABEL,
        preserveCase && 'normal-case',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

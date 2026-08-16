import React from 'react';
import { cn } from '@/lib/utils';
import { INK, ROW_GUTTER, STRIP } from './tokens';
import { Label } from './Label';

interface SectionRuleProps {
  children: React.ReactNode;
  /** Optional trailing content — a count, a control. */
  trailing?: React.ReactNode;
  className?: string;
}

/**
 * A raised-ground strip naming the group beneath it — "STARRED", "ALL FILES",
 * "RECENT". A 24px track so it reads as a rule, not a row.
 */
export const SectionRule: React.FC<SectionRuleProps> = ({ children, trailing, className }) => (
  <div
    className={cn(
      'flex h-6 shrink-0 items-center justify-between',
      STRIP,
      ROW_GUTTER,
      INK.rest,
      className
    )}
  >
    <Label weight="strong">{children}</Label>
    {trailing}
  </div>
);

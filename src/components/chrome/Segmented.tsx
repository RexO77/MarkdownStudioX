import React from 'react';
import { cn } from '@/lib/utils';
import { HOVER, ICON, INK, SELECTED } from './tokens';
import { Label } from './Label';

export interface SegmentedItem<T extends string> {
  id: T;
  label: string;
  Icon?: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  /** Hide this cell on small screens (the SPLIT view has nowhere to go on mobile). */
  mobileHidden?: boolean;
}

interface SegmentedProps<T extends string> {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Spoken name of the group. */
  label: string;
  /** Drop the text labels below `sm` and keep only the icons. */
  compactLabels?: boolean;
  className?: string;
}

/**
 * A bordered N-cell switch — the view switcher's anatomy, generalized.
 *
 * The selected cell is full inverse video and the flip is instant; cells are
 * divided by hairlines, never by gaps.
 */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
  compactLabels = true,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex h-7 shrink-0 items-stretch border border-border md:h-6', className)}
    >
      {items.map((item, index) => {
        const selected = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex h-full items-center gap-1.5 px-2.5',
              index > 0 && 'border-l border-border',
              selected ? SELECTED : cn(INK.rest, HOVER)
            )}
          >
            {item.Icon && <item.Icon className={cn(ICON.sm, 'shrink-0')} strokeWidth={1.75} />}
            <Label className={cn(compactLabels && 'hidden sm:inline')}>{item.label}</Label>
          </button>
        );
      })}
    </div>
  );
}

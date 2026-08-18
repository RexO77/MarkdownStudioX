import React from 'react';
import { cn } from '@/lib/utils';
import { Kbd } from '@/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HOVER, ICON, INK, SELECTED } from './tokens';
import { Label } from './Label';

export interface SegmentedItem<T extends string> {
  id: T;
  label: string;
  Icon?: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  /** Direct keyboard trigger shown in the cell's tooltip. */
  shortcut?: string;
  /** Hide this cell on small screens (the SPLIT view has nowhere to go on mobile). */
  mobileHidden?: boolean;
}

interface SegmentedProps<T extends string> {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Spoken name of the group. */
  label: string;
  /** Drop the text labels below `md` and keep only the icons. */
  compactLabels?: boolean;
  /**
   * What one cell *is*, for tooltips and spoken labels — "view" reads as
   * "SPLIT view". Omit when the cell label already stands alone: a theme
   * switch announcing "Light view" is a lie the group name already covers.
   */
  itemNoun?: string;
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
  itemNoun,
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
        const cellName = itemNoun ? `${item.label} ${itemNoun}` : item.label;
        const button = (
          <button
            type="button"
            aria-label={item.shortcut ? `${cellName} (${item.shortcut})` : cellName}
            aria-pressed={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex h-full items-center gap-1.5 px-2.5',
              index > 0 && 'border-l border-border',
              selected ? SELECTED : cn(INK.rest, HOVER)
            )}
          >
            {item.Icon && <item.Icon className={cn(ICON.sm, 'shrink-0')} strokeWidth={1.75} />}
            {/* md, not sm: mobile *mode* has one boundary, and it is the
                same one the JS hook (use-mobile) reads. */}
            <Label className={cn(compactLabels && 'hidden md:inline')}>{item.label}</Label>
          </button>
        );

        if (!item.shortcut) return <React.Fragment key={item.id}>{button}</React.Fragment>;

        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="bottom" className="flex items-center gap-2.5 font-mono text-[11px]">
              <span>{cellName}</span>
              <Kbd keys={item.shortcut} />
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

import React from 'react';
import { Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICON, LabelButton, LAYER } from '@/components/chrome';
import { Kbd } from '@/components/ui/kbd';

/**
 * The only chrome left in focus mode: a faint way back out, in the corner the
 * eye is least likely to be on. It brightens on hover; Escape does the same
 * job without it. Below md it stays fully inked — hover never fires on touch
 * and there is no Escape key, so a faded exit is a locked door.
 */
export const FocusModeExit = ({ onExit }: { onExit: () => void }) => (
  <div
    className={cn(
      'absolute right-2 flex items-center gap-2 top-[max(0.5rem,env(safe-area-inset-top))]',
      LAYER.raised,
      'opacity-100 transition-opacity md:opacity-25 md:hover:opacity-100 md:focus-within:opacity-100'
    )}
  >
    <Kbd keys="esc" className="max-md:hidden" />
    <LabelButton icon={<Minimize2 className={ICON.sm} />} onClick={onExit}>
      Leave focus
    </LabelButton>
  </div>
);

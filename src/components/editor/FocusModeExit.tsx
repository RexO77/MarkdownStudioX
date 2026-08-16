import React from 'react';
import { Minimize2 } from 'lucide-react';
import { ICON, LabelButton } from '@/components/chrome';
import { Kbd } from '@/components/ui/kbd';

/**
 * The only chrome left in focus mode: a faint way back out, in the corner the
 * eye is least likely to be on. It brightens on hover; Escape does the same
 * job without it.
 */
export const FocusModeExit = ({ onExit }: { onExit: () => void }) => (
  <div className="absolute right-2 top-2 z-20 flex items-center gap-2 opacity-25 transition-opacity hover:opacity-100 focus-within:opacity-100">
    <Kbd keys="esc" />
    <LabelButton icon={<Minimize2 className={ICON.sm} />} onClick={onExit}>
      Leave focus
    </LabelButton>
  </div>
);

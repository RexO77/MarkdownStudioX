
import React, { useState, useEffect } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { useTheme } from '@/components/ui/theme-provider';
import { useFocusMode } from '@/components/layout/FocusMode';
import { Sparkles, FileText, Settings, Palette, Eye, Zap } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { setTheme, themes } = useTheme();
  const { setMode } = useFocusMode();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="AI Actions">
          <CommandItem onSelect={() => runCommand(() => console.log('Format with AI'))}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Format with AI</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => console.log('Improve writing'))}>
            <Zap className="mr-2 h-4 w-4" />
            <span>Improve writing</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Focus Modes">
          <CommandItem onSelect={() => runCommand(() => setMode('default'))}>
            <Eye className="mr-2 h-4 w-4" />
            <span>Default Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setMode('zen'))}>
            <Eye className="mr-2 h-4 w-4" />
            <span>Zen Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setMode('distraction-free'))}>
            <Eye className="mr-2 h-4 w-4" />
            <span>Distraction Free</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Themes">
          {themes.map((theme) => (
            <CommandItem key={theme.name} onSelect={() => runCommand(() => setTheme(theme.name))}>
              <Palette className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{theme.label}</span>
                <span className="text-xs text-muted-foreground">{theme.description}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Documents">
          <CommandItem onSelect={() => runCommand(() => console.log('New document'))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>New Document</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => console.log('Settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

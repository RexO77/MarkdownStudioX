import { useCallback, useEffect, useState } from 'react';

/**
 * Focus mode: every bar of chrome steps out and the writing surface takes the
 * whole screen, backed by real fullscreen where the browser allows it.
 *
 * Escape leaves — but only if nothing nearer the caret already claimed the
 * key (the galley's slash menu and the find bar both handle their own
 * Escape and mark the event handled).
 */
export interface FocusMode {
  isFocusMode: boolean;
  enterFocusMode: () => void;
  exitFocusMode: () => void;
  toggleFocusMode: () => void;
}

export function useFocusMode(): FocusMode {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const enterFocusMode = useCallback(() => {
    setIsFocusMode(true);
    // Fullscreen needs a user gesture and can be blocked outright; the mode
    // is still worth having without it.
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  }, []);

  const exitFocusMode = useCallback(() => {
    setIsFocusMode(false);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }
  }, []);

  const toggleFocusMode = useCallback(() => {
    if (isFocusMode) exitFocusMode();
    else enterFocusMode();
  }, [isFocusMode, enterFocusMode, exitFocusMode]);

  // Leaving fullscreen by any route (Esc, the OS chrome) leaves focus mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsFocusMode(false);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isFocusMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        exitFocusMode();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, exitFocusMode]);

  return { isFocusMode, enterFocusMode, exitFocusMode, toggleFocusMode };
}

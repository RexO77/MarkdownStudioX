import * as React from 'react';

/**
 * The keyboard is part of the viewport.
 *
 * `dvh` tracks the browser chrome but not the software keyboard; only
 * `window.visualViewport` reports the space actually left above it. This
 * hook is the app's entire visualViewport surface: floats that must stay
 * reachable while typing (command palette list, slash-menu flip) read
 * their budget from here instead of `innerHeight`.
 *
 * Falls back to the layout viewport where the API is missing.
 */

interface VisualViewportState {
  height: number;
  offsetTop: number;
}

function subscribe(callback: () => void) {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  vv.addEventListener('resize', callback);
  vv.addEventListener('scroll', callback);
  return () => {
    vv.removeEventListener('resize', callback);
    vv.removeEventListener('scroll', callback);
  };
}

// Snapshot must be referentially stable between events or the store loops;
// cache it and refresh only when the numbers actually move.
let cached: VisualViewportState = { height: 0, offsetTop: 0 };

function getSnapshot(): VisualViewportState {
  const vv = window.visualViewport;
  const height = Math.round(vv ? vv.height : window.innerHeight);
  const offsetTop = Math.round(vv ? vv.offsetTop : 0);
  if (height !== cached.height || offsetTop !== cached.offsetTop) {
    cached = { height, offsetTop };
  }
  return cached;
}

const SERVER_SNAPSHOT: VisualViewportState = { height: 0, offsetTop: 0 };

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function useVisualViewport(): VisualViewportState {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

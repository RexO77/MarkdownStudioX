import * as React from "react"

/**
 * Mobile *mode* is decided at one boundary — 768px, Tailwind's `md` — in
 * both JS and CSS. Everything that changes behavior below it (drawers,
 * SPLIT coercion, compact labels, key-cap visibility) reads this hook;
 * density stepping inside a mode may still use `sm`/`lg`.
 *
 * `useSyncExternalStore` reads the media query synchronously, so the first
 * render is already correct — the old lazy-effect version rendered a
 * desktop frame first and corrected itself after paint, which is where the
 * mobile split-view flash came from.
 */

const QUERY = "(max-width: 767px)"

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

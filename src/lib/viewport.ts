/**
 * Stable viewport height for scroll-driven animations.
 *
 * On iOS Safari / Android Chrome, window.innerHeight changes every time the
 * browser toolbar shows or hides while scrolling, and a 'resize' event fires.
 * The pinned stages use CSS 100svh (which does NOT change), so reading the live
 * innerHeight made progress values and positions jump on phones.
 *
 * This returns the 100svh value in px, re-measured only when the width changes
 * (rotation / real window resize), never on toolbar show/hide.
 */
let cachedH = 0;
let cachedW = 0;

function measure(): number {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height || window.innerHeight;
  probe.remove();
  return h;
}

export function stableVH(): number {
  if (typeof window === 'undefined') return 0;
  const w = window.innerWidth;
  if (!cachedH || w !== cachedW) {
    cachedW = w;
    cachedH = measure();
  }
  return cachedH;
}

/** True when a resize event is only the mobile toolbar showing/hiding. */
let lastResizeW = typeof window !== 'undefined' ? window.innerWidth : 0;
export function isToolbarOnlyResize(): boolean {
  const w = window.innerWidth;
  const same = w === lastResizeW;
  lastResizeW = w;
  return same && window.matchMedia('(pointer: coarse)').matches;
}

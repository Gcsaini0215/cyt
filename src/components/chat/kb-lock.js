/* Phone chat screens (owner, 2026-11-24): keep the screen still while typing.
   - isKeyboardUp: the iPhone home-screen app shrinks the page with the keyboard, so innerHeight - visualViewport.height
     stays ~0 there; a focused typing box on a touch phone with a clearly shorter visible screen also counts.
   - lockPagePan: with the keyboard up, a drag on the header / typing box made iPhone slide the whole visible screen and
     the chat chased it ("the screen shakes"). Only a list that can still scroll that way may move; nothing else does. */

export function isKeyboardUp(vv) {
  if (!vv || typeof window === "undefined") return false;
  if (window.innerHeight - vv.height > 150) return true;
  const typing = /^(TEXTAREA|INPUT)$/.test(document.activeElement?.tagName || "");
  return typing && window.matchMedia("(pointer: coarse)").matches && window.screen.height - vv.height > 200;
}

const scrollableY = (n) => {
  const cs = getComputedStyle(n);
  return /(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1;
};

const sideScroll = (n) => /(auto|scroll)/.test(getComputedStyle(n).overflowX) && n.scrollWidth > n.clientWidth + 1;

export function lockPagePan() {
  if (typeof window === "undefined" || !window.matchMedia("(pointer: coarse)").matches) return () => {};
  let y0 = 0, x0 = 0;
  const start = (e) => { y0 = e.touches[0] ? e.touches[0].clientY : 0; x0 = e.touches[0] ? e.touches[0].clientX : 0; };
  const move = (e) => {
    if (e.touches.length > 1) return; // pinch zoom stays
    const dy = (e.touches[0] ? e.touches[0].clientY : 0) - y0;
    const dx = (e.touches[0] ? e.touches[0].clientX : 0) - x0;
    let n = e.target instanceof Element ? e.target : null;
    // a sideways drag on a row that scrolls sideways (suggestion chips, filters) is fine
    if (Math.abs(dx) > Math.abs(dy)) { for (let m = n; m && m !== document.body; m = m.parentElement) if (sideScroll(m)) return; }
    while (n && n !== document.body && n !== document.documentElement) {
      if (scrollableY(n)) {
        const atTop = n.scrollTop <= 0;
        const atEnd = n.scrollTop + n.clientHeight >= n.scrollHeight - 1;
        if ((dy > 0 && atTop) || (dy < 0 && atEnd)) break; // would spill over to the screen
        return; // the list scrolls itself
      }
      n = n.parentElement;
    }
    if (e.cancelable) e.preventDefault();
  };
  document.addEventListener("touchstart", start, { passive: true });
  document.addEventListener("touchmove", move, { passive: false });
  return () => {
    document.removeEventListener("touchstart", start);
    document.removeEventListener("touchmove", move);
  };
}

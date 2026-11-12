import { useEffect, useRef } from "react";

/* Pull down at the top of a page to refresh — only in the installed app (home-screen), where there is no
   browser reload; a normal browser tab keeps its own pull-to-refresh. Used by the therapist and client portals.
   Render the returned ref on an element with class "ptr" (styles: PTR_CSS). */
export const PTR_CSS = `
.ptr { position: fixed; left: 50%; top: calc(var(--ptr-top, 64px) - 20px); z-index: 1250; width: 40px; height: 40px; margin-left: -20px; border-radius: 50%;
  background: #fff; color: #14532d; display: grid; place-items: center; box-shadow: 0 6px 18px -6px rgba(20,83,45,.5); pointer-events: none; opacity: 0; transition: opacity .15s; }
.ptr svg { width: 22px; height: 22px; transition: transform .1s linear; }
.ptr.ready { background: #14532d; color: #fff; }
.ptr.spin svg { animation: ptrSpin .7s linear infinite; }
@keyframes ptrSpin { to { transform: rotate(360deg); } }
`;

const installed = () =>
  typeof window !== "undefined" &&
  ((window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true);

export default function usePullToRefresh() {
  const ref = useRef(null);
  useEffect(() => {
    if (!installed()) return undefined;
    let startY = null; let pull = 0; let busy = false;
    const blocked = (t) => t?.closest?.("[role=dialog], .MuiDialog-root, .MuiModal-root, textarea, input, select, .tn-drawer-wrap, .cls-sheet-wrap");
    const onStart = (e) => {
      if (busy || window.scrollY > 0 || e.touches.length !== 1 || blocked(e.target)) { startY = null; return; }
      startY = e.touches[0].clientY; pull = 0;
    };
    const onMove = (e) => {
      if (startY == null) return;
      pull = Math.max(0, e.touches[0].clientY - startY);
      const n = ref.current; if (!n) return;
      const d = Math.min(pull, 140);
      n.style.opacity = d > 8 ? String(Math.min(1, d / 70)) : "0";
      n.style.transform = `translateY(${Math.round(d * 0.6)}px)`;
      if (n.firstChild) n.firstChild.style.transform = `rotate(${Math.round(d * 2.4)}deg)`;
      n.classList.toggle("ready", pull > 90);
    };
    const onEnd = () => {
      if (startY == null) return;
      const n = ref.current;
      if (pull > 90 && n) { busy = true; n.classList.add("spin"); setTimeout(() => window.location.reload(), 250); }
      else if (n) { n.style.opacity = "0"; n.style.transform = ""; n.classList.remove("ready"); }
      startY = null; pull = 0;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);
  return ref;
}

// the round arrow drawn in the indicator
export const PTR_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';

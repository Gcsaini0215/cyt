import { useEffect, useRef } from "react";

/* Pull down to refresh, inside a chat's own scrolling list (owner, 2026-11-25). Starts only when the list is already
   at the very top; past ~60px it refreshes. The round arrow / spinner is drawn on the page itself (not inside the
   list React re-renders while it refreshes), centred over the top of that list. */
export function usePullRefresh(ref, onRefresh, on = true) {
  const cb = useRef(onRefresh);
  cb.current = onRefresh;
  useEffect(() => {
    const el = ref.current;
    if (!el || !on) return undefined;
    let y0 = null, d = 0, busy = false, dot = null;
    const place = (extra) => {
      if (!dot) { dot = document.createElement("div"); dot.className = "ptr-dot"; dot.innerHTML = "<span>↓</span>"; document.body.appendChild(dot); }
      const r = el.getBoundingClientRect();
      dot.style.left = `${Math.round(r.left + r.width / 2)}px`;
      dot.style.top = `${Math.round(r.top + extra)}px`;
    };
    const hide = () => { if (dot) { dot.remove(); dot = null; } };
    const start = (e) => { if (busy || el.scrollTop > 0 || e.touches.length > 1) { y0 = null; return; } y0 = e.touches[0].clientY; d = 0; };
    const move = (e) => {
      if (y0 == null) return;
      const dy = e.touches[0].clientY - y0;
      if (dy <= 0 || el.scrollTop > 0) { d = 0; hide(); if (el.scrollTop > 0) y0 = null; return; }
      d = Math.min(110, dy * 0.5);
      place(d - 30);
      dot.style.opacity = String(Math.min(1, d / 40));
      dot.firstChild.style.transform = `rotate(${d >= 60 ? 180 : 0}deg)`;
    };
    const end = async () => {
      if (y0 == null) return;
      y0 = null;
      if (d >= 60 && !busy) {
        busy = true;
        place(14); dot.style.opacity = "1"; dot.innerHTML = '<i class="ptr-spin"></i>';
        const t0 = Date.now();
        try { await cb.current(); } catch { /* keep what's shown */ }
        const wait = 600 - (Date.now() - t0); // don't just flash
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        busy = false;
      }
      d = 0; hide();
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: true });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
      hide();
    };
  }, [ref, on]);
  return {};
}

// kept so the lists can render it — the indicator itself is drawn by the hook
export function PullBar() { return null; }

export const settle = (p) => Promise.resolve(p).catch(() => {});

export const PTR_CSS = `
.lc-msgs, .lc-items, .lsm-msgs, .pc-msgs, .cm-items, .cm-msgs { overflow-anchor: none; }
.ptr-dot { position: fixed; z-index: 2147483601; width: 36px; height: 36px; margin-left: -18px; border-radius: 50%; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.18);
  display: grid; place-items: center; color: #636366; font-size: 18px; line-height: 1; pointer-events: none; }
.ptr-dot span { display: inline-block; transition: transform .15s ease; }
.ptr-spin { display: block; width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid #d1d1d6; border-top-color: #636366; animation: ptrSpin .7s linear infinite; }
@keyframes ptrSpin { to { transform: rotate(360deg); } }
`;

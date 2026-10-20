import React, { useState, useEffect } from "react";
import ConsultationForm from "../home/consultation-form";

// Lead form ("Chat with CYT") — the site's main lead source. It opens by itself once per visit, after
// `delay` ms (default 12 s: long enough to read the top of the page — waiting 25 s+ cost leads), or sooner
// when someone shows interest or is about to go: scrolled ~30% of the page, (desktop) moves to leave the tab,
// or (phones, which have no "leaving" signal) scrolls back up fast after reading.
// It comes back on every page load (a refresh, another page, a later visit) — closing it only hides it for the
// page in view. Once someone has sent their details it never opens by itself again.
// Anything on the site can open it on demand: window.dispatchEvent(new Event(OPEN_CHAT_EVENT)).
export const OPEN_CHAT_EVENT = "cyt:open-chat";
const SENT_KEY = "cyt_lead_sent";

const store = (fn) => { try { return fn(); } catch { return null; } };
const mayAutoOpen = () => store(() => !localStorage.getItem(SENT_KEY)) !== false;

// title / note: page-specific copy ("Looking for a psychologist in Bangalore?") — people fill a form
// that speaks to what they came for far more than a generic one.
const BookingPopup = ({ delay = 12000, scrollAt = 0.3, forTherapist = false, showHeading = true, showLocation = true, showSource = true, onClose, title = "Chat with CYT", note = "Share a few details and our team will message you on WhatsApp.", sourceTag = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    const openNow = () => setIsOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, openNow);

    let done = !mayAutoOpen();
    const fire = () => {
      if (done) return;
      done = true;
      setIsOpen(true);
    };
    // phones: a quick flick back up after reading a while is the usual "I'm leaving" gesture
    let lastY = window.scrollY, lastT = Date.now(), deepest = 0;
    const onScroll = () => {
      const y = window.scrollY, t = Date.now();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && y / max >= scrollAt) fire();
      deepest = Math.max(deepest, y);
      const up = lastY - y, dt = Math.max(1, t - lastT);
      if (window.innerWidth < 768 && deepest > 500 && up > 0 && up / dt > 1.8) fire(); // >1.8 px/ms upward
      lastY = y; lastT = t;
    };
    const onLeave = (e) => { if (!e.relatedTarget && e.clientY <= 0) fire(); };
    const timer = setTimeout(fire, delay);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", check);
      window.removeEventListener(OPEN_CHAT_EVENT, openNow);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [delay, scrollAt]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const head = (
    <div className="bp-wa-head">
      <span className="bp-wa-avatar">💬</span>
      <div className="bp-wa-titles">
        <h5 className="bp-wa-title">{title}</h5>
        <span className="bp-wa-sub">Our team usually replies within minutes</span>
      </div>
      <button className="bp-wa-close" onClick={handleClose} aria-label="Close">✕</button>
    </div>
  );

  const body = (showHeadingProp) => (
    <div className="bp-wa-body">
      <p className="bp-wa-note">{note}</p>
      <ConsultationForm showHeading={showHeadingProp} showLocation={showLocation} showSource={showSource} variant="whatsapp" forTherapist={forTherapist}
        sourceTag={sourceTag || (typeof window !== "undefined" ? `Popup · ${window.location.pathname}` : "")} />
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bp-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes bp-fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bp-pop-in   { from { opacity: 0; transform: scale(.94) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        .bp-overlay {
          position: fixed; inset: 0; z-index: 100000;
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(4px);
          animation: bp-fade-in .25s ease;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }

        /* ── Desktop / tablet modal — centered on every viewport ─────── */
        .bp-modal {
          background: #fff; border-radius: 24px;
          width: 100%; max-width: 460px;
          position: relative;
          box-shadow: 0 32px 64px rgba(0,0,0,.28);
          max-height: 90vh; overflow-y: auto; overflow-x: hidden;
          animation: bp-pop-in .3s cubic-bezier(.4,0,.2,1);
        }

        /* ── Mobile bottom sheet ───────────────────── */
        .bp-sheet-wrap {
          position: fixed; inset: 0; z-index: 100000;
          display: flex; align-items: flex-end;
        }
        .bp-sheet-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,.5);
          backdrop-filter: blur(3px);
          animation: bp-fade-in .25s ease;
        }
        .bp-sheet {
          position: relative; z-index: 1;
          width: 100%; background: #fff;
          border-radius: 22px 22px 0 0;
          max-height: 92vh; overflow-y: auto; overflow-x: hidden;
          animation: bp-slide-up .32s cubic-bezier(.4,0,.2,1);
        }
        .bp-sheet-handle {
          width: 40px; height: 4px; border-radius: 2px;
          background: #e2e8f0; margin: 12px auto 6px; display: block;
        }

        /* ── "WhatsApp" header + wallpaper body — shared by both layouts ── */
        .bp-wa-head {
          display: flex; align-items: center; gap: 12px;
          background: #075e54; color: #fff;
          padding: 15px 18px;
        }
        .bp-modal .bp-wa-head { border-radius: 24px 24px 0 0; }
        .bp-wa-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: #25d366;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .bp-wa-titles { flex: 1; min-width: 0; }
        .bp-wa-title { margin: 0; font-size: 14.5px; font-weight: 800; color: #fff; }
        .bp-wa-sub { font-size: 11px; color: rgba(255,255,255,.72); }
        .bp-wa-close {
          width: 30px; height: 30px; border-radius: 50%; border: none; flex-shrink: 0;
          background: rgba(255,255,255,.15); color: #fff; font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s;
        }
        .bp-wa-close:hover { background: rgba(255,255,255,.28); }

        .bp-wa-body {
          background: #e5ddd5;
          padding: 20px 22px 24px;
          padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
        }
        .bp-wa-note {
          background: #fff; border-radius: 10px; padding: 10px 13px;
          font-size: 12.5px; color: #3b4a54; line-height: 1.5;
          margin: 0 0 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,.08);
        }

        @media (max-width: 380px) {
          .bp-wa-body { padding: 16px 16px 20px; }
        }
      ` }} />

      {isMobile ? (
        /* ── Mobile: bottom sheet ── */
        <div className="bp-sheet-wrap">
          <div className="bp-sheet-overlay" onClick={handleClose} />
          <div className="bp-sheet">
            <span className="bp-sheet-handle"></span>
            {head}
            {body(false)}
          </div>
        </div>
      ) : (
        /* ── Tablet / desktop: centered modal ── */
        <div className="bp-overlay" onClick={handleClose}>
          <div className="bp-modal" onClick={e => e.stopPropagation()}>
            {head}
            {body(showHeading)}
          </div>
        </div>
      )}
    </>
  );
};

export default BookingPopup;

import React, { useState, useEffect } from "react";
import ConsultationForm from "../home/consultation-form";

const BookingPopup = ({ delay = 10000, showHeading = true, showLocation = true, showSource = true, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    const timer = setTimeout(() => setIsOpen(true), delay);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", check);
    };
  }, [delay]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const head = (
    <div className="bp-wa-head">
      <span className="bp-wa-avatar">💬</span>
      <div className="bp-wa-titles">
        <h5 className="bp-wa-title">Chat with CYT</h5>
        <span className="bp-wa-sub">Typically replies within minutes</span>
      </div>
      <button className="bp-wa-close" onClick={handleClose} aria-label="Close">✕</button>
    </div>
  );

  const body = (showHeadingProp) => (
    <div className="bp-wa-body">
      <p className="bp-wa-note">Share a few details and our team will message you on WhatsApp.</p>
      <ConsultationForm showHeading={showHeadingProp} showLocation={showLocation} showSource={showSource} variant="whatsapp" />
    </div>
  );

  return (
    <>
      <style>{`
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
      `}</style>

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

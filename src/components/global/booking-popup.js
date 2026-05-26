import React, { useState, useEffect } from "react";
import ConsultationForm from "../home/consultation-form";
import Link from "next/link";

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

        /* ── Desktop modal ─────────────────────────── */
        .bp-modal {
          background: #fff; border-radius: 24px;
          width: 100%; max-width: 520px;
          position: relative;
          box-shadow: 0 32px 64px rgba(0,0,0,.28);
          max-height: 90vh; overflow-y: auto;
          animation: bp-pop-in .3s cubic-bezier(.4,0,.2,1);
        }
        .bp-modal-inner { padding: 36px 32px 28px; }

        /* close btn */
        .bp-close {
          position: absolute; top: 14px; right: 14px;
          width: 34px; height: 34px; border-radius: 50%;
          border: none; background: #f1f5f9;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 18px; color: #64748b;
          transition: background .2s; z-index: 2;
        }
        .bp-close:hover { background: #e2e8f0; color: #1e293b; }

        /* green accent bar at top */
        .bp-top-bar {
          height: 5px;
          background: linear-gradient(90deg, #1a6b44, #228756, #4ade80);
          border-radius: 24px 24px 0 0;
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
          max-height: 92vh; overflow-y: auto;
          animation: bp-slide-up .32s cubic-bezier(.4,0,.2,1);
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        .bp-sheet-handle {
          width: 40px; height: 4px; border-radius: 2px;
          background: #e2e8f0; margin: 12px auto 0; display: block;
        }
        .bp-sheet-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px 10px;
          border-bottom: 1px solid #f1f5f9;
        }
        .bp-sheet-title { font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; }
        .bp-sheet-close {
          width: 30px; height: 30px; border-radius: 50%; border: none;
          background: #f1f5f9; color: #64748b; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .bp-sheet-body { padding: 16px 20px 24px; }

        /* ── Consent line ──────────────────────────── */
        .bp-consent {
          display: flex; gap: 9px; align-items: flex-start;
          margin-top: 14px; padding: 10px 12px;
          background: #f0fdf4; border-radius: 10px;
          border: 1px solid #bbf7d0;
        }
        .bp-consent input[type="checkbox"] {
          margin-top: 2px; flex-shrink: 0;
          accent-color: #228756; width: 15px; height: 15px; cursor: pointer;
        }
        .bp-consent-text {
          font-size: 12px; color: #475569; line-height: 1.55; margin: 0;
        }
        .bp-consent-text a { color: #228756; font-weight: 600; text-decoration: none; }
        .bp-consent-text a:hover { text-decoration: underline; }
      `}</style>

      {isMobile ? (
        /* ── Mobile: Bottom sheet ── */
        <div className="bp-sheet-wrap">
          <div className="bp-sheet-overlay" onClick={handleClose} />
          <div className="bp-sheet">
            <span className="bp-sheet-handle"></span>
            <div className="bp-sheet-head">
              <h5 className="bp-sheet-title">Free Consultation</h5>
              <button className="bp-sheet-close" onClick={handleClose}>✕</button>
            </div>
            <div className="bp-sheet-body">
              <ConsultationForm showHeading={false} showLocation={showLocation} showSource={showSource} />
              <ConsentLine />
            </div>
          </div>
        </div>
      ) : (
        /* ── Desktop: Centered modal ── */
        <div className="bp-overlay" onClick={handleClose}>
          <div className="bp-modal" onClick={e => e.stopPropagation()}>
            <div className="bp-top-bar"></div>
            <button className="bp-close" onClick={handleClose}>✕</button>
            <div className="bp-modal-inner">
              <ConsultationForm showHeading={showHeading} showLocation={showLocation} showSource={showSource} />
              <ConsentLine />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function ConsentLine() {
  const [checked, setChecked] = useState(false);
  return (
    <div className="bp-consent">
      <input
        type="checkbox"
        id="bp-consent-check"
        checked={checked}
        onChange={e => setChecked(e.target.checked)}
      />
      <p className="bp-consent-text">
        <label htmlFor="bp-consent-check" style={{ cursor: "pointer" }}>
          I consent to being contacted by the Choose Your Therapist team for consultation purposes.
          My information will be kept strictly confidential as per our{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </label>
      </p>
    </div>
  );
}

export default BookingPopup;

import React from "react";
import dynamic from "next/dynamic";
import Close from "@mui/icons-material/Close";

const ConsultationConsentModal = dynamic(() => import("./consultation-consent-modal"), { ssr: false });

export default function ConsultOfferBar({ delay = 3000 }) {
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    let pollTimer;
    let cancelled = false;
    const maxWaitAt = Date.now() + delay + 15000; // give up waiting after 15s past the base delay

    const isBlocked = () =>
      document.getElementById("cyt-cookie-consent-bar") ||
      document.getElementById("cyt-location-consent-bar");

    const tryShow = () => {
      if (cancelled) return;
      if (!isBlocked() || Date.now() > maxWaitAt) {
        setVisible(true);
      } else {
        pollTimer = setTimeout(tryShow, 500);
      }
    };

    const t = setTimeout(tryShow, delay);
    return () => {
      cancelled = true;
      clearTimeout(t);
      clearTimeout(pollTimer);
    };
  }, [delay]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible || dismissed) return null;

  return (
    <>
      <style>{`
        @keyframes cob-slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .cob-wrap {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 9990;
          animation: cob-slide-up 0.5s cubic-bezier(.16,1,.3,1);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          will-change: transform;
        }
        .cob-card {
          position: relative;
          width: 100%;
          background: linear-gradient(90deg, #071e33 0%, #0d3a5c 55%, #0f4c74 100%);
          border-top: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 -10px 30px rgba(3,20,36,0.35);
        }
        /* Bleeds solid colour below the visible edge so iOS/Android elastic
           overscroll at the bottom of the page never reveals a gap under the bar. */
        .cob-card::after {
          content: "";
          position: absolute;
          left: 0; right: 0; top: 100%;
          height: 100px;
          background: #0f4c74;
          pointer-events: none;
        }
        .cob-inner {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          box-sizing: border-box;
        }
        .cob-text { flex: 1 1 auto; min-width: 0; order: 1; }
        .cob-title {
          margin: 0; color: #fff; font-weight: 800; font-size: 15px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          display: flex; align-items: baseline; gap: 9px;
        }
        .cob-title-short { display: none; }
        .cob-price-old { color: rgba(255,255,255,0.45); text-decoration: line-through; font-weight: 600; font-size: 12.5px; flex-shrink: 0; }
        .cob-price-new { color: #6ee7b7; font-weight: 900; font-size: 16px; flex-shrink: 0; }
        .cob-sub { margin: 3px 0 0; color: rgba(255,255,255,0.6); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cob-cta {
          order: 2;
          background: #ffffff;
          color: #0d3a5c; border: none;
          padding: 11px 22px; border-radius: 12px;
          font-size: 13.5px; font-weight: 700; cursor: pointer;
          white-space: nowrap; flex-shrink: 0;
          box-shadow: 0 8px 20px rgba(0,0,0,0.22);
          transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .cob-cta:hover { transform: translateY(-1px); background: #f0f9ff; box-shadow: 0 10px 26px rgba(0,0,0,0.28); }
        .cob-close {
          order: 3;
          background: rgba(255,255,255,0.08); border: none; cursor: pointer;
          color: rgba(255,255,255,0.55); padding: 8px; border-radius: 9px;
          display: flex; align-items: center; line-height: 1; flex-shrink: 0;
        }
        .cob-close:hover { color: #fff; background: rgba(255,255,255,0.16); }

        /* iPad / tablet — single row still fits, but give it real height & presence
           instead of the cramped compact bar it was collapsing to. */
        @media (max-width: 1024px) and (min-width: 601px) {
          .cob-inner { padding: 18px 28px; gap: 14px 18px; }
          .cob-title { font-size: 16px; }
          .cob-price-old { font-size: 13px; }
          .cob-price-new { font-size: 18px; }
          .cob-sub { font-size: 12.5px; }
          .cob-cta { padding: 14px 28px; font-size: 14.5px; border-radius: 13px; }
          .cob-close { padding: 10px; }
        }

        /* Mobile — text+close on row 1, full-width CTA on row 2 */
        @media (max-width: 600px) {
          .cob-inner { padding: 14px 16px 16px; gap: 10px 12px; }
          .cob-title-full { display: none; }
          .cob-title-short { display: inline; }
          .cob-title { font-size: 13.5px; gap: 6px; }
          .cob-price-old { font-size: 11.5px; }
          .cob-price-new { font-size: 15px; }
          .cob-sub { display: none; }
          .cob-close { order: 2; }
          .cob-cta {
            order: 3;
            flex: 1 1 100%;
            width: 100%;
            padding: 15px 16px;
            font-size: 14.5px;
            border-radius: 12px;
            text-align: center;
          }
        }
        @media (max-width: 340px) {
          .cob-price-old { display: none; }
        }
      `}</style>

      <div className="cob-wrap">
        <div className="cob-card">
          <div className="cob-inner">
            <div className="cob-text">
              <p className="cob-title">
                <span className="cob-title-full">15-Min Therapist Consultation</span>
                <span className="cob-title-short">15-Min Consult</span>
                <span className="cob-price-old">₹499</span>
                <span className="cob-price-new">₹99</span>
              </p>
              <p className="cob-sub">Talk to our team today &amp; get matched with the right therapist.</p>
            </div>
            <button className="cob-close" onClick={handleDismiss} aria-label="Dismiss">
              <Close sx={{ fontSize: 17 }} />
            </button>
            <button className="cob-cta" onClick={() => setModalOpen(true)}>Book Now</button>
          </div>
        </div>
      </div>

      <ConsultationConsentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

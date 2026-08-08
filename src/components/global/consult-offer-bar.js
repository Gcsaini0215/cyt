import React from "react";
import dynamic from "next/dynamic";
import Close from "@mui/icons-material/Close";

const ConsultationConsentModal = dynamic(() => import("./consultation-consent-modal"), { ssr: false });

export default function ConsultOfferBar({ delay = 3000 }) {
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
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
        }
        .cob-card {
          width: 100%;
          background: linear-gradient(90deg, #071e33 0%, #0d3a5c 55%, #0f4c74 100%);
          border-top: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 -10px 30px rgba(3,20,36,0.35);
        }
        .cob-inner {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 13px 24px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-sizing: border-box;
        }
        .cob-text { flex: 1; min-width: 0; }
        .cob-title {
          margin: 0; color: #fff; font-weight: 800; font-size: 15px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          display: flex; align-items: baseline; gap: 9px;
        }
        .cob-title-short { display: none; }
        .cob-price-old { color: rgba(255,255,255,0.45); text-decoration: line-through; font-weight: 600; font-size: 12.5px; flex-shrink: 0; }
        .cob-price-new { color: #6ee7b7; font-weight: 900; font-size: 16px; flex-shrink: 0; }
        .cob-sub { margin: 3px 0 0; color: rgba(255,255,255,0.6); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cob-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .cob-cta {
          background: #ffffff;
          color: #0d3a5c; border: none;
          padding: 11px 22px; border-radius: 12px;
          font-size: 13.5px; font-weight: 700; cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 8px 20px rgba(0,0,0,0.22);
          transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .cob-cta:hover { transform: translateY(-1px); background: #f0f9ff; box-shadow: 0 10px 26px rgba(0,0,0,0.28); }
        .cob-close {
          background: rgba(255,255,255,0.08); border: none; cursor: pointer;
          color: rgba(255,255,255,0.55); padding: 7px; border-radius: 9px;
          display: flex; align-items: center; line-height: 1;
        }
        .cob-close:hover { color: #fff; background: rgba(255,255,255,0.16); }

        /* Tablet */
        @media (max-width: 900px) {
          .cob-sub { display: none; }
        }

        /* Mobile — keep it one compact row */
        @media (max-width: 600px) {
          .cob-inner { padding: 9px 12px; gap: 10px; }
          .cob-title-full { display: none; }
          .cob-title-short { display: inline; }
          .cob-title { font-size: 12.5px; gap: 6px; }
          .cob-price-old { font-size: 10.5px; }
          .cob-price-new { font-size: 13.5px; }
          .cob-cta { padding: 9px 14px; font-size: 12px; border-radius: 10px; }
          .cob-close { padding: 6px; }
        }
        @media (max-width: 360px) {
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
            <div className="cob-actions">
              <button className="cob-cta" onClick={() => setModalOpen(true)}>Book Now</button>
              <button className="cob-close" onClick={handleDismiss} aria-label="Dismiss">
                <Close sx={{ fontSize: 17 }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConsultationConsentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible]     = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs]         = useState({ analytics: true, marketing: false });

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent_v2")) {
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent_v2", JSON.stringify({ analytics: true, marketing: true }));
    setVisible(false);
  };
  const savePrefs = () => {
    localStorage.setItem("cookie_consent_v2", JSON.stringify(prefs));
    setVisible(false);
  };
  const dismiss = () => {
    localStorage.setItem("cookie_consent_v2", JSON.stringify({ analytics: false, marketing: false }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99998, background: "#1a202c", color: "#fff", boxShadow: "0 -4px 20px rgba(0,0,0,0.25)", animation: "ckSlideUp 0.35s ease" }}>
      <style>{`
        @keyframes ckSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .ck-wrap { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; align-items: center; gap: 14px; }
        .ck-text { flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; }
        .ck-msg { margin: 0; font-size: 13px; color: #cbd5e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ck-btns { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .ck-btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.22); color: #cbd5e0; padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .ck-btn-accept { background: #228756; border: none; color: #fff; padding: 7px 18px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .ck-btn-x { background: transparent; border: none; color: rgba(255,255,255,0.4); padding: 6px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; line-height: 1; }
        .ck-btn-x:hover { color: rgba(255,255,255,0.8); }
        @media (max-width: 600px) {
          .ck-wrap { flex-direction: column; align-items: stretch; gap: 10px; padding: 12px 16px; }
          .ck-msg { white-space: normal; font-size: 12px; }
          .ck-btns { justify-content: flex-end; }
        }
      `}</style>

      {!customize ? (
        <div className="ck-wrap">
          {/* Text */}
          <div className="ck-text">
            <i className="feather-shield" style={{ fontSize: 18, color: "#4ade80", flexShrink: 0 }} />
            <p className="ck-msg">
              We use cookies to enhance your experience.{" "}
              <Link href="/privacy-policy" style={{ color: "#4ade80", fontWeight: 600 }}>Privacy</Link>
              {" & "}
              <Link href="/terms-conditions" style={{ color: "#4ade80", fontWeight: 600 }}>Terms</Link>.
            </p>
          </div>
          {/* Buttons */}
          <div className="ck-btns">
            <button className="ck-btn-ghost" onClick={() => setCustomize(true)}>Customize</button>
            <button className="ck-btn-accept" onClick={accept}>Accept All</button>
            <button className="ck-btn-x" onClick={dismiss} title="Dismiss">
              <i className="feather-x" style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      ) : (
        /* Customize panel */
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#fff" }}>Cookie Preferences</p>
            <button onClick={() => setCustomize(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13 }}>
              <i className="feather-arrow-left" style={{ fontSize: 14 }} /> Back
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px" }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Essential</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>Required for the site to function.</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.12)", padding: "3px 10px", borderRadius: 20 }}>Always On</span>
            </div>

            {[
              { key: "analytics", label: "Analytics", desc: "Help us understand how visitors use our site." },
              { key: "marketing", label: "Marketing", desc: "Used to deliver relevant ads and campaigns." },
            ].map(({ key, label, desc }) => (
              <label key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{desc}</p>
                </div>
                <div onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                  style={{ width: 40, height: 22, borderRadius: 11, background: prefs[key] ? "#228756" : "#4a5568", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
                  <div style={{ position: "absolute", top: 3, left: prefs[key] ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="ck-btn-ghost" onClick={dismiss}>Reject All</button>
            <button className="ck-btn-accept" onClick={savePrefs}>Save Preferences</button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible]       = useState(false);
  const [customize, setCustomize]   = useState(false);
  const [prefs, setPrefs]           = useState({ analytics: true, marketing: false });

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
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99998,
      background: "#1a202c", color: "#fff",
      boxShadow: "0 -4px 24px rgba(0,0,0,0.22)",
      animation: "cookieSlideUp 0.4s ease",
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cookieSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      ` }} />

      {!customize ? (
        /* ── Main banner ── */
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <i className="feather-shield" style={{ fontSize: 20, color: "#228756", flexShrink: 0 }}></i>
            <p style={{ margin: 0, fontSize: 13, color: "#cbd5e0", lineHeight: 1.6 }}>
              We use cookies to enhance your experience and analyze traffic.{" "}
              <Link href="/privacy-policy" style={{ color: "#4ade80", textDecoration: "underline", fontWeight: 600 }}>Privacy Policy</Link>
              {" & "}
              <Link href="/terms-conditions" style={{ color: "#4ade80", textDecoration: "underline", fontWeight: 600 }}>Terms</Link>.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
            <button onClick={() => setCustomize(true)} style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.25)",
              color: "#cbd5e0", padding: "8px 16px", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              Customize
            </button>
            <button onClick={accept} style={{
              background: "#228756", border: "none", color: "#fff",
              padding: "8px 20px", borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              Accept All
            </button>
            <button onClick={dismiss} style={{
              background: "transparent", border: "none", color: "rgba(255,255,255,0.4)",
              padding: "8px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center",
            }} title="Dismiss">
              <i className="feather-x" style={{ fontSize: 16 }}></i>
            </button>
          </div>
        </div>
      ) : (
        /* ── Customize panel ── */
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#fff" }}>Cookie Preferences</p>
            <button onClick={() => setCustomize(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
              <i className="feather-arrow-left" style={{ fontSize: 16 }}></i> Back
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {/* Essential — always on */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px" }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Essential Cookies</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>Required for the site to function. Cannot be disabled.</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.12)", padding: "3px 10px", borderRadius: 20 }}>Always On</span>
            </div>

            {/* Analytics */}
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Analytics Cookies</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>Help us understand how visitors use our site.</p>
              </div>
              <div onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                style={{ width: 40, height: 22, borderRadius: 11, background: prefs.analytics ? "#228756" : "#4a5568", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 3, left: prefs.analytics ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </div>
            </label>

            {/* Marketing */}
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Marketing Cookies</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>Used to deliver relevant ads and campaigns.</p>
              </div>
              <div onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
                style={{ width: 40, height: 22, borderRadius: 11, background: prefs.marketing ? "#228756" : "#4a5568", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 3, left: prefs.marketing ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </div>
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button onClick={dismiss} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#cbd5e0", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Reject All
            </button>
            <button onClick={savePrefs} style={{ background: "#228756", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

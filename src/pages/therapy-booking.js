import React, { useState, useEffect } from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import ConsultationForm from "../components/home/consultation-form";

const DEFAULT_PIC =
  "https://e7.pngegg.com/pngimages/753/432/png-clipart-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-thumbnail.png";

export async function getServerSideProps() {
  try {
    const res = await fetch(
      "https://api.chooseyourtherapist.in/api/get-therapists-profile?pageSize=60"
    );
    const json = await res.json();
    const pics = (json.data || [])
      .map((t) => {
        const pic = t.profile || (t.user && t.user.profile) || "";
        if (!pic) return null;
        return `https://api.chooseyourtherapist.in/uploads/images/${pic}`;
      })
      .filter(Boolean);
    return { props: { pics } };
  } catch {
    return { props: { pics: [] } };
  }
}

export default function TherapyBooking({ pics = [] }) {
  const [allPics, setAllPics] = useState(pics);

  useEffect(() => {
    if (pics.length > 0) { setAllPics(pics); return; }
    fetch("https://api.chooseyourtherapist.in/api/get-therapists-profile?pageSize=60")
      .then(r => r.json())
      .then(json => {
        const loaded = (json.data || []).map(t => {
          const pic = t.profile || (t.user && t.user.profile) || "";
          if (!pic) return null;
          return `https://api.chooseyourtherapist.in/uploads/images/${pic}`;
        }).filter(Boolean);
        if (loaded.length > 0) setAllPics(loaded);
      }).catch(() => {});
  }, [pics]);

  const TILE_COUNT = 84;
  const tiles = [];
  if (allPics.length > 0) {
    for (let i = 0; i < TILE_COUNT; i++) tiles.push(allPics[i % allPics.length]);
  }

  const trustItems = [
    { icon: "feather-shield", t: "100% Confidential" },
    { icon: "feather-check-circle", t: "Verified Therapists" },
    { icon: "feather-clock", t: "24-hr Response" },
    { icon: "feather-lock", t: "Safe & Secure" },
  ];

  return (
    <>
      <Head>
        <title>Find Your Therapist in 30 Minutes — Free | Choose Your Therapist</title>
        <meta name="description" content="Connect with a verified psychologist, share your concerns, and book your therapy appointment — all in 30 minutes." />
        <link rel="canonical" href="https://chooseyourtherapist.in/therapy-booking" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chooseyourtherapist.in/therapy-booking" />
        <meta property="og:title" content="Find Your Therapist in 30 Minutes — Free | Choose Your Therapist" />
        <meta property="og:description" content="Talk to a verified mental health expert for free. No commitment, fully confidential. Find your therapist in 30 minutes." />
        <meta property="og:image" content="https://chooseyourtherapist.in/api/og-therapy" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find Your Therapist in 30 Minutes — Free | Choose Your Therapist" />
        <meta name="twitter:description" content="Talk to a verified mental health expert for free. No commitment, fully confidential. Find your therapist in 30 minutes." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/api/og-therapy" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes _tb_fd      { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes _tb_pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.35)} 60%{box-shadow:0 0 0 12px rgba(74,222,128,0)} }
        @keyframes _tb_shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes _tb_up      { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
        @keyframes _tb_down    { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
        .tb-col-up   { animation: _tb_up   60s linear infinite; }
        .tb-col-down { animation: _tb_down 70s linear infinite; }
        @media (max-width: 900px) { .tb-col-hide { display: none !important; } }
        @media (max-width: 767px) {
          .tb-two-col { flex-direction: column !important; }
          .tb-left { padding: 60px 20px 24px !important; }
          .tb-right { padding: 0 20px 40px !important; }
          .tb-h1 { font-size: 28px !important; }
          .tb-badge { display: none !important; }
          .tb-trust { display: none !important; }
          .tb-footer-links { gap: 12px !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'Inter', sans-serif", background: "#060f09", minHeight: "100vh" }}>
        <MyNavbar />

        {/* ── HERO ── */}
        <section style={{ position: "relative", overflow: "hidden", background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

          {/* Collage background */}
          {tiles.length > 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 0 }}>
              {[0,1,2,3,4,5,6].map(col => {
                const hide = col >= 4;
                const colTiles = tiles.filter((_, i) => i % 7 === col);
                const doubled = [...colTiles, ...colTiles];
                return (
                  <div key={col} className={hide ? "tb-col-hide" : ""} style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                    <div className={col % 2 === 0 ? "tb-col-up" : "tb-col-down"} style={{ display: "flex", flexDirection: "column" }}>
                      {doubled.map((src, idx) => (
                        <div key={idx} style={{ width: "100%", aspectRatio: "1/1", flexShrink: 0, overflow: "hidden" }}>
                          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                            onError={e => { e.target.src = DEFAULT_PIC; }} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Overlay */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", zIndex: 1 }} />

          {/* Two-column content */}
          <div className="tb-two-col" style={{
            position: "relative", zIndex: 2, flex: 1,
            display: "flex", alignItems: "stretch",
            maxWidth: 1180, margin: "0 auto", width: "100%",
          }}>

            {/* LEFT — headline */}
            <div className="tb-left" style={{
              flex: "0 0 50%", padding: "100px 48px 60px 24px",
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              {/* Badge */}
              <div className="tb-badge" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(74,222,128,.15)", border: "1px solid rgba(74,222,128,.3)",
                borderRadius: 50, padding: "7px 18px", marginBottom: 28,
                animation: "_tb_pulse 2.5s ease infinite", alignSelf: "flex-start",
              }}>
                <i className="feather-shield" style={{ fontSize: 12, color: "#4ade80" }}></i>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", letterSpacing: 1.2, textTransform: "uppercase" }}>
                  100% Free · No Commitment
                </span>
              </div>

              {/* Headline */}
              <h1 className="tb-h1" style={{
                fontSize: "clamp(30px, 3.5vw, 52px)", fontWeight: 900, color: "#fff",
                lineHeight: 1.12, letterSpacing: "-.8px", margin: "0 0 20px",
                animation: "_tb_fd .7s cubic-bezier(.22,1,.36,1) both",
              }}>
                Real Support.{" "}<br />
                Right Therapist.{" "}
                <span style={{
                  background: "linear-gradient(90deg,#4ade80,#86efac,#4ade80)",
                  backgroundSize: "200%", WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent", backgroundClip: "text",
                  animation: "_tb_shimmer 3s linear infinite",
                }}>
                  Start Today.
                </span>
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: 16, color: "rgba(255,255,255,.68)", lineHeight: 1.7,
                margin: "0 0 36px", fontWeight: 500, maxWidth: 420,
                animation: "_tb_fd .7s cubic-bezier(.22,1,.36,1) .1s both",
              }}>
                Fill the form and our team will match you with the right therapist — completely free, fully confidential.
              </p>

              {/* Trust pills */}
              <div className="tb-trust" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {trustItems.map(p => (
                  <div key={p.t} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 50, padding: "6px 14px",
                    fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 600,
                  }}>
                    <i className={p.icon} style={{ fontSize: 12, color: "#4ade80" }}></i>
                    {p.t}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — form */}
            <div className="tb-right" style={{
              flex: "0 0 50%", padding: "100px 24px 60px 48px",
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              <div style={{ position: "relative", animation: "_tb_fd .8s cubic-bezier(.22,1,.36,1) .2s both" }}>
                {/* Glow ring */}
                <div style={{
                  position: "absolute", inset: -4, borderRadius: 28,
                  background: "linear-gradient(135deg, rgba(74,222,128,.35), rgba(26,92,56,.1), rgba(74,222,128,.18))",
                  filter: "blur(1px)", zIndex: 0,
                }} />
                {/* Card */}
                <div style={{
                  background: "#fff", borderRadius: 24, padding: "36px 30px",
                  boxShadow: "0 32px 80px rgba(0,0,0,.35)",
                  position: "relative", zIndex: 1, textAlign: "left",
                }}>
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontWeight: 800, fontSize: 20, color: "#0f172a", margin: "0 0 4px" }}>
                      Book a Free Consultation
                    </h4>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                      Our team will reach out within 24 hours.
                    </p>
                  </div>
                  <ConsultationForm showHeading={false} />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer style={{
          background: "#060f09", borderTop: "1px solid rgba(255,255,255,.07)",
          padding: "14px 24px", display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        }}>
          <div className="tb-footer-links" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: "Home", href: "/" },
              { label: "View Therapists", href: "/view-all-therapist" },
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Contact Us", href: "/contact-us" },
            ].map(l => (
              <a key={l.label} href={l.href} style={{ fontSize: 12, color: "rgba(255,255,255,.35)", textDecoration: "none", fontWeight: 600 }}>
                {l.label}
              </a>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.22)", margin: 0 }}>
            © {new Date().getFullYear()} Choose Your Therapist
          </p>
        </footer>
      </div>
    </>
  );
}

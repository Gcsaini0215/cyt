import React from "react";
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
  // Build a grid of tiles — repeat images if fewer than needed
  const TILE_COUNT = 84;
  const tiles = [];
  if (pics.length > 0) {
    for (let i = 0; i < TILE_COUNT; i++) {
      tiles.push(pics[i % pics.length]);
    }
  }

  return (
    <>
      <Head>
        <title>Find Your Therapist in 30 Minutes — Free | Choose Your Therapist</title>
        <meta name="description" content="Connect with a verified psychologist, share your concerns, and book your therapy appointment — all in 30 minutes." />
        <link rel="canonical" href="https://chooseyourtherapist.in/therapy-booking" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chooseyourtherapist.in/therapy-booking" />
        <meta property="og:title" content="Find Your Therapist in 30 Minutes — Free | Choose Your Therapist" />
        <meta property="og:description" content="Talk to a verified mental health expert for free. No commitment, fully confidential. Find your therapist in 30 minutes." />
        <meta property="og:image" content="https://chooseyourtherapist.in/api/og-therapy" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/svg+xml" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find Your Therapist in 30 Minutes — Free | Choose Your Therapist" />
        <meta name="twitter:description" content="Talk to a verified mental health expert for free. No commitment, fully confidential. Find your therapist in 30 minutes." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/api/og-therapy" />

        {/* WhatsApp uses og:image — same as above */}

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes _fd  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes _fr  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes _pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.35)} 60%{box-shadow:0 0 0 12px rgba(74,222,128,0)} }
        @keyframes _shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes _scrollUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes _scrollDown {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .tb-col-up   { animation: _scrollUp   60s linear infinite; }
        .tb-col-down { animation: _scrollDown  70s linear infinite; }

        @media (max-width: 900px) {
          .tb-col-mobile-hide { display: none !important; }
          .tb-badge { display: none !important; }
          .tb-footer-trust { display: none !important; }
        }
      `}</style>

      <div id="__next" style={{ fontFamily: "'Inter', sans-serif", background: "#060f09", minHeight: "100vh" }}>
        <MyNavbar />

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section
          style={{
            minHeight: "100vh",
            position: "relative",
            display: "flex",
            alignItems: "stretch",
            overflow: "hidden",
            background: "#000",
          }}
        >
          {/* ── BACKGROUND COLLAGE ── */}
          {tiles.length > 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                gap: 0,
                overflow: "hidden",
                zIndex: 0,
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((col) => {
                const hideMobile = col >= 4;
                const colTiles = tiles.filter((_, i) => i % 7 === col);
                const doubled = [...colTiles, ...colTiles];
                const isEven = col % 2 === 0;
                return (
                  <div
                    key={col}
                    className={hideMobile ? "tb-col-mobile-hide" : ""}
                    style={{ flex: 1, overflow: "hidden", minWidth: 0 }}
                  >
                    <div
                      className={isEven ? "tb-col-up" : "tb-col-down"}
                      style={{ display: "flex", flexDirection: "column", gap: 0 }}
                    >
                      {doubled.map((src, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: "100%",
                            aspectRatio: "1 / 1",
                            flexShrink: 0,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={src}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "top center",
                              display: "block",
                            }}
                            onError={(e) => { e.target.src = DEFAULT_PIC; }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dark black overlay over the collage */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,.84)",
              zIndex: 1,
            }}
          />

          {/* ── CONTENT ── */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: 640,
              margin: "0 auto",
              padding: "80px 24px 60px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {/* Badge */}
            <div
              className="tb-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(74,222,128,.15)",
                border: "1px solid rgba(74,222,128,.3)",
                borderRadius: 50,
                padding: "7px 18px",
                marginBottom: 24,
                animation: "_pulse 2.5s ease infinite",
              }}
            >
              <i className="feather-shield" style={{ fontSize: 13, color: "#4ade80" }}></i>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", letterSpacing: 1.2, textTransform: "uppercase" }}>
                100% Free · No Commitment
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(32px, 4.5vw, 54px)",
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.15,
                letterSpacing: "-.8px",
                margin: "0 0 16px",
                maxWidth: 720,
                animation: "_fd .7s cubic-bezier(.22,1,.36,1) both",
              }}
            >
              Real Support. Right Therapist.{" "}
              <span
                style={{
                  background: "linear-gradient(90deg,#4ade80,#86efac,#4ade80)",
                  backgroundSize: "200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "_shimmer 3s linear infinite",
                }}
              >
                Start Today.
              </span>
            </h1>

            {/* Sub */}
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,.72)",
                lineHeight: 1.7,
                margin: "0 0 32px",
                fontWeight: 500,
                maxWidth: 480,
                animation: "_fd .7s cubic-bezier(.22,1,.36,1) .1s both",
              }}
            >
              Fill the form and our team will match you with the right therapist. Completely free, fully confidential.
            </p>

            {/* Form Card */}
            <div
              style={{
                position: "relative",
                width: "100%",
                animation: "_fd .8s cubic-bezier(.22,1,.36,1) .25s both",
              }}
            >
              {/* Glow ring */}
              <div
                style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: 28,
                  background: "linear-gradient(135deg, rgba(74,222,128,.4), rgba(26,92,56,.15), rgba(74,222,128,.2))",
                  filter: "blur(1px)",
                  zIndex: 0,
                }}
              />
              {/* Card */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  padding: "36px 30px",
                  boxShadow: "0 32px 80px rgba(0,0,0,.3)",
                  position: "relative",
                  zIndex: 1,
                  textAlign: "left",
                }}
              >
                <ConsultationForm showHeading={false} />
              </div>
            </div>
          </div>
        </section>

        {/* ── LANDING PAGE FOOTER ── */}
        <footer style={{
          background: "#060f09",
          borderTop: "1px solid rgba(255,255,255,.07)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          {/* Trust items */}
          <div className="tb-footer-trust" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "nowrap" }}>
            {[
              { icon: "feather-shield", t: "100% Confidential" },
              { icon: "feather-check-circle", t: "Verified Therapists" },
              { icon: "feather-clock", t: "24-hr Response" },
              { icon: "feather-lock", t: "Safe & Secure" },
            ].map(p => (
              <div key={p.t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.50)", fontWeight: 600, whiteSpace: "nowrap" }}>
                <i className={p.icon} style={{ fontSize: 12, color: "#4ade80" }}></i>
                {p.t}
              </div>
            ))}
          </div>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {[
              { label: "Home", href: "/" },
              { label: "View Therapists", href: "/view-all-therapist" },
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Contact Us", href: "/contact-us" },
            ].map(l => (
              <a key={l.label} href={l.href} style={{ fontSize: 12, color: "rgba(255,255,255,.35)", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.22)", margin: 0, whiteSpace: "nowrap" }}>
            © {new Date().getFullYear()} Choose Your Therapist
          </p>
        </footer>
      </div>
    </>
  );
}

import React from "react";
import Head from "next/head";
import Footer from "../components/footer";
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

export default function TherapyBooking({ pics }) {
  // Build a grid of tiles — repeat images if fewer than needed
  const TILE_COUNT = 48;
  const tiles = [];
  if (pics.length > 0) {
    for (let i = 0; i < TILE_COUNT; i++) {
      tiles.push(pics[i % pics.length]);
    }
  }

  return (
    <>
      <Head>
        <title>Find the Right Therapist — Free | Choose Your Therapist</title>
        <meta
          name="description"
          content="Book a free 15-minute discovery call with our verified psychologists. Confidential, no commitment required."
        />
        <link
          rel="canonical"
          href="https://chooseyourtherapist.in/therapy-booking"
        />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes _fd  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes _fr  { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes _pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.35)} 60%{box-shadow:0 0 0 12px rgba(74,222,128,0)} }
        @keyframes _shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes _scrollUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes _scrollDown {
          0%   { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .tb-col-up   { animation: _scrollUp   28s linear infinite; }
        .tb-col-down { animation: _scrollDown  24s linear infinite; }

        @media (max-width: 900px) {
          .tb-grid { grid-template-columns: 1fr !important; }
          .tb-mosaic { display: none !important; }
          .tb-left { text-align: center; align-items: center !important; }
          .tb-pills { justify-content: center !important; }
          .tb-trust { justify-content: center !important; }
        }
      `}</style>

      <div id="__next" style={{ fontFamily: "inherit" }}>
        <MyNavbar />

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section
          style={{
            minHeight: "100vh",
            position: "relative",
            display: "flex",
            alignItems: "stretch",
            overflow: "hidden",
            background: "#071f12",
          }}
        >
          {/* ── BACKGROUND COLLAGE ── */}
          {tiles.length > 0 && (
            <div
              className="tb-mosaic"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                gap: 4,
                overflow: "hidden",
                zIndex: 0,
              }}
            >
              {/* 6 scrolling columns of square tiles */}
              {[0, 1, 2, 3, 4, 5].map((col) => {
                const colTiles = tiles.filter((_, i) => i % 6 === col);
                // Duplicate for infinite scroll
                const doubled = [...colTiles, ...colTiles];
                const isEven = col % 2 === 0;
                return (
                  <div
                    key={col}
                    style={{ flex: 1, overflow: "hidden", minWidth: 0 }}
                  >
                    <div
                      className={isEven ? "tb-col-up" : "tb-col-down"}
                      style={{ display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      {doubled.map((src, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: "100%",
                            aspectRatio: "1 / 1",
                            flexShrink: 0,
                            overflow: "hidden",
                            borderRadius: 8,
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
                            onError={(e) => {
                              e.target.src = DEFAULT_PIC;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dark green overlay over the collage */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg, rgba(7,31,18,.88) 0%, rgba(13,61,37,.80) 45%, rgba(7,20,13,.92) 100%)",
              zIndex: 1,
            }}
          />

          {/* ── CONTENT ── */}
          <div
            className="tb-grid"
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: 1180,
              margin: "0 auto",
              padding: "100px 24px 80px",
              display: "grid",
              gridTemplateColumns: "1fr 540px",
              gap: 64,
              alignItems: "center",
            }}
          >
            {/* LEFT */}
            <div
              className="tb-left"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                animation: "_fd .7s cubic-bezier(.22,1,.36,1) both",
              }}
            >
              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(74,222,128,.15)",
                  border: "1px solid rgba(74,222,128,.3)",
                  borderRadius: 50,
                  padding: "7px 18px",
                  marginBottom: 28,
                  animation: "_pulse 2.5s ease infinite",
                }}
              >
                <i
                  className="feather-shield"
                  style={{ fontSize: 13, color: "#4ade80" }}
                ></i>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#4ade80",
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
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
                  margin: "0 0 20px",
                }}
              >
                Real Support.<br />
                Right Therapist.<br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg,#4ade80,#86efac,#4ade80)",
                    backgroundSize: "200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "_shimmer 3s linear infinite",
                  }}
                >
                  Start Today — Free.
                </span>
              </h1>

              {/* Sub */}
              <p
                style={{
                  fontSize: 17,
                  color: "rgba(255,255,255,.72)",
                  lineHeight: 1.7,
                  margin: "0 0 36px",
                  fontWeight: 500,
                  maxWidth: 460,
                }}
              >
                Fill the form and our team will match you with a verified
                therapist in 24 hours. Completely free, fully confidential.
              </p>

              {/* Pills */}
              <div
                className="tb-pills"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 48,
                }}
              >
                {[
                  { icon: "feather-shield", t: "100% Confidential" },
                  { icon: "feather-check-circle", t: "Verified Experts" },
                  { icon: "feather-clock", t: "24-hr Response" },
                  { icon: "feather-heart", t: "Zero Pressure" },
                ].map((p) => (
                  <div
                    key={p.t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255,255,255,.09)",
                      border: "1px solid rgba(255,255,255,.15)",
                      borderRadius: 50,
                      padding: "8px 16px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(255,255,255,.88)",
                    }}
                  >
                    <i
                      className={p.icon}
                      style={{ fontSize: 12, color: "#4ade80" }}
                    ></i>
                    {p.t}
                  </div>
                ))}
              </div>

              {/* Trust numbers */}
              <div
                className="tb-trust"
                style={{ display: "flex", gap: 36, flexWrap: "wrap" }}
              >
                {[
                  { num: "500+", lbl: "Clients helped" },
                  { num: "100+", lbl: "Verified therapists" },
                  { num: "4.9★", lbl: "Average rating" },
                ].map((t) => (
                  <div key={t.lbl}>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 900,
                        color: "#4ade80",
                        lineHeight: 1,
                      }}
                    >
                      {t.num}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,.55)",
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      {t.lbl}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Form */}
            <div
              style={{
                position: "relative",
                animation: "_fr .7s cubic-bezier(.22,1,.36,1) .15s both",
              }}
            >
              {/* Glow ring */}
              <div
                style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: 28,
                  background:
                    "linear-gradient(135deg, rgba(74,222,128,.4), rgba(26,92,56,.15), rgba(74,222,128,.2))",
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
                }}
              >
                <ConsultationForm showHeading={false} />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

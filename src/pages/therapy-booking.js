import React, { useState, useEffect } from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import ConsultationForm from "../components/home/consultation-form";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        <meta name="twitter:description" content="Talk to a verified mental health expert for free. No commitment, fully confidential." />
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
          .tb-banner { padding: 28px 0 24px 0 !important; }
          .tb-badge { display: none !important; }
          .tb-title { font-size: 22px !important; line-height: 1.3 !important; margin-bottom: 8px !important; }
          .tb-subtitle { font-size: 13px !important; padding: 0 4px !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <MyNavbar />

        {/* ── BANNER (collage bg) ── */}
        <section className="tb-banner" style={{
          position: "relative", overflow: "hidden", background: "#000",
          padding: "60px 0 50px",
        }}>
            {/* Collage */}
            {tiles.length > 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 0 }}>
                {[0,1,2,3,4,5,6].map(col => {
                  const colTiles = tiles.filter((_, i) => i % 7 === col);
                  const doubled = [...colTiles, ...colTiles];
                  return (
                    <div key={col} className={col >= 4 ? "tb-col-hide" : ""} style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
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

            {/* Content */}
            <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px" }}>
              <div className="tb-badge" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(74,222,128,.15)", border: "1px solid rgba(74,222,128,.3)",
                borderRadius: 50, padding: "7px 18px", marginBottom: 20,
                animation: "_tb_pulse 2.5s ease infinite",
              }}>
                <i className="feather-shield" style={{ fontSize: 12, color: "#4ade80" }}></i>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", letterSpacing: 1.2, textTransform: "uppercase" }}>
                  100% Free · No Commitment
                </span>
              </div>

              <h1 className="tb-title" style={{
                fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 900, color: "#fff",
                lineHeight: 1.15, letterSpacing: "-.6px", margin: "0 0 14px",
                animation: "_tb_fd .7s cubic-bezier(.22,1,.36,1) both",
              }}>
                Real Support. Right Therapist.{" "}
                <span style={{
                  background: "linear-gradient(90deg,#4ade80,#86efac,#4ade80)",
                  backgroundSize: "200%", WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent", backgroundClip: "text",
                  animation: "_tb_shimmer 3s linear infinite",
                }}>
                  Start Today.
                </span>
              </h1>

              <p className="tb-subtitle" style={{
                fontSize: 15, color: "rgba(255,255,255,.72)", lineHeight: 1.7,
                margin: "0 auto", fontWeight: 500, maxWidth: 520,
                animation: "_tb_fd .7s cubic-bezier(.22,1,.36,1) .1s both",
              }}>
                Fill the form below and our team will match you with the right therapist — completely free, fully confidential.
              </p>
            </div>
          </section>

        {/* ── FORM SECTION ── */}
        <div style={{ background: "#f8fafc", padding: isMobile ? "24px 0" : "60px 0" }}>
          <div className={isMobile ? "" : "container"}>
            <div className="row justify-content-center" style={{ margin: 0 }}>
              <div className="col-lg-7 col-md-9 col-12" style={{ padding: isMobile ? "0 12px" : undefined }}>

                <div style={{
                  background: "#fff", borderRadius: "16px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0", overflow: "hidden",
                }}>
                  {/* Green top bar */}
                  <div style={{ height: "4px", background: "linear-gradient(90deg, #22bb33, #4ade80)" }} />

                  <div style={{ padding: isMobile ? "24px 16px 28px" : "32px 36px 36px" }}>
                    <div style={{ marginBottom: "20px" }}>
                      <h5 style={{ fontWeight: 800, fontSize: "22px", marginBottom: "4px", color: "#0f172a" }}>
                        Book a Consultation
                      </h5>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                        Our team will reach out on WhatsApp within 24 hours.
                      </p>
                    </div>
                    <ConsultationForm showHeading={false} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <NewsLetter />
        <Footer />
      </div>
    </>
  );
}

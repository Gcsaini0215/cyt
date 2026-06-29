import React, { useState, useEffect } from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import AppointmentForm from "../components/appointment/appointment-form";

const DEFAULT_PIC = "https://e7.pngegg.com/pngimages/753/432/png-clipart-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-thumbnail.png";

export async function getServerSideProps() {
  try {
    const res = await fetch("https://api.chooseyourtherapist.in/api/get-therapists-profile?pageSize=60");
    const json = await res.json();
    const pics = (json.data || [])
      .map(t => {
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

export default function AppointmentPage({ pics = [] }) {
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

  return (
    <div id="__next" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Head>
        <title>Book an Appointment | Choose Your Therapist</title>
        <meta name="description" content="Request a therapy appointment at Choose Your Therapist. Fill in your details and we will confirm your session time via WhatsApp." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://chooseyourtherapist.in/appointment" />
        <meta property="og:title" content="Book an Appointment | Choose Your Therapist" />
        <meta property="og:description" content="Request a therapy appointment. We will confirm your session time via WhatsApp." />
        <meta property="og:url" content="https://chooseyourtherapist.in/appointment" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes _ap_fd      { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes _ap_pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.35)} 60%{box-shadow:0 0 0 12px rgba(74,222,128,0)} }
        @keyframes _ap_shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes _ap_up      { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
        @keyframes _ap_down    { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
        .ap-col-up   { animation: _ap_up   60s linear infinite; }
        .ap-col-down { animation: _ap_down 70s linear infinite; }
        @media (max-width: 900px) { .ap-col-hide { display: none !important; } }
        @media (max-width: 767px) {
          .ap-banner { padding: 28px 0 24px 0 !important; }
          .ap-badge  { display: none !important; }
          .ap-title  { font-size: 22px !important; line-height: 1.3 !important; margin-bottom: 8px !important; }
          .ap-sub    { font-size: 13px !important; }
        }
      `}</style>

      <MyNavbar />

      {/* ── BANNER ── */}
      <section className="ap-banner" style={{ position: "relative", overflow: "hidden", background: "#000", padding: "60px 0 50px" }}>

        {/* Collage bg */}
        {tiles.length > 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", zIndex: 0 }}>
            {[0,1,2,3,4,5,6].map(col => {
              const colTiles = tiles.filter((_, i) => i % 7 === col);
              const doubled = [...colTiles, ...colTiles];
              return (
                <div key={col} className={col >= 4 ? "ap-col-hide" : ""} style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                  <div className={col % 2 === 0 ? "ap-col-up" : "ap-col-down"} style={{ display: "flex", flexDirection: "column" }}>
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

        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", zIndex: 1 }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px" }}>
          <div className="ap-badge" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(74,222,128,.15)", border: "1px solid rgba(74,222,128,.3)",
            borderRadius: 50, padding: "7px 18px", marginBottom: 20,
            animation: "_ap_pulse 2.5s ease infinite",
          }}>
            <i className="feather-calendar" style={{ fontSize: 12, color: "#4ade80" }}></i>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", letterSpacing: 1.2, textTransform: "uppercase" }}>
              Book a Session · We Confirm via WhatsApp
            </span>
          </div>

          <h1 className="ap-title" style={{
            fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 900, color: "#fff",
            lineHeight: 1.15, letterSpacing: "-.6px", margin: "0 0 14px",
            animation: "_ap_fd .7s cubic-bezier(.22,1,.36,1) both",
          }}>
            Request an Appointment.{" "}
            <span style={{
              background: "linear-gradient(90deg,#4ade80,#86efac,#4ade80)",
              backgroundSize: "200%", WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "_ap_shimmer 3s linear infinite",
            }}>
              We Handle the Rest.
            </span>
          </h1>

          <p className="ap-sub" style={{
            fontSize: 15, color: "rgba(255,255,255,.72)", lineHeight: 1.7,
            margin: "0 auto", fontWeight: 500, maxWidth: 500,
            animation: "_ap_fd .7s cubic-bezier(.22,1,.36,1) .1s both",
          }}>
            Fill in your details and our team will contact you on WhatsApp to confirm your session time — usually within a few hours.
          </p>
        </div>
      </section>

      {/* ── FORM ── */}
      <AppointmentForm />

      <Footer />
    </div>
  );
}

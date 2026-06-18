import React from "react";
import Head from "next/head";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import ConsultationForm from "../components/home/consultation-form";

const G  = "#1a5c38";
const GL = "#228756";

export default function TherapyBooking() {
  return (
    <>
      <Head>
        <title>Free 15-Min Consultation | Choose Your Therapist</title>
        <meta name="description" content="Book a free 15-minute discovery call with our verified psychologists. Confidential, no commitment required." />
        <link rel="canonical" href="https://chooseyourtherapist.in/therapy-booking" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes _fd  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes _fr  { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes _pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.35)} 60%{box-shadow:0 0 0 12px rgba(74,222,128,0)} }
        @keyframes _shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes _float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      <div id="__next" style={{ fontFamily: "inherit" }}>
        <MyNavbar />

        {/* ══ FULL PAGE HERO WITH BG IMAGE ══════════════════════════════ */}
        <section style={{
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden",
        }}>

          {/* Background image */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1600&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          }} />

          {/* Dark overlay — stronger on right, lighter on left so image shows */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg, rgba(7,31,18,.82) 0%, rgba(13,61,37,.75) 40%, rgba(13,61,37,.88) 65%, rgba(7,20,13,.95) 100%)",
          }} />

          {/* Content grid */}
          <div style={{
            position: "relative", zIndex: 1,
            width: "100%", maxWidth: 1180,
            margin: "0 auto",
            padding: "100px 24px 80px",
            display: "grid",
            gridTemplateColumns: "1fr 440px",
            gap: 64,
            alignItems: "center",
          }}>

            {/* ── LEFT: Copy ── */}
            <div style={{ animation: "_fd .7s cubic-bezier(.22,1,.36,1) both" }}>

              {/* Badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(74,222,128,.15)", border: "1px solid rgba(74,222,128,.3)",
                borderRadius: 50, padding: "7px 18px", marginBottom: 28,
                animation: "_pulse 2.5s ease infinite",
              }}>
                <i className="feather-phone-call" style={{ fontSize: 13, color: "#4ade80" }}></i>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", letterSpacing: 1.2, textTransform: "uppercase" }}>
                  Free 15-Min Discovery Call
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: "clamp(32px, 4.5vw, 54px)",
                fontWeight: 900, color: "#fff",
                lineHeight: 1.15, letterSpacing: "-.8px",
                margin: "0 0 20px",
              }}>
                Not sure if you<br />
                need therapy?<br />
                <span style={{
                  background: "linear-gradient(90deg,#4ade80,#86efac,#4ade80)",
                  backgroundSize: "200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "_shimmer 3s linear infinite",
                }}>
                  Let's find out — free.
                </span>
              </h1>

              {/* Sub */}
              <p style={{
                fontSize: 17, color: "rgba(255,255,255,.72)",
                lineHeight: 1.7, margin: "0 0 36px",
                fontWeight: 500, maxWidth: 460,
              }}>
                Talk to one of our verified mental health experts. No pressure, no commitment — just a warm, confidential conversation to understand your needs.
              </p>

              {/* Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 48 }}>
                {[
                  { icon: "feather-shield",       t: "100% Confidential"  },
                  { icon: "feather-check-circle",  t: "Verified Experts"   },
                  { icon: "feather-clock",         t: "24-hr Response"     },
                  { icon: "feather-heart",         t: "Zero Pressure"      },
                ].map(p => (
                  <div key={p.t} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.15)",
                    borderRadius: 50, padding: "8px 16px",
                    fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.88)",
                  }}>
                    <i className={p.icon} style={{ fontSize: 12, color: "#4ade80" }}></i>
                    {p.t}
                  </div>
                ))}
              </div>

              {/* Trust numbers */}
              <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
                {[
                  { num: "500+", lbl: "Clients helped" },
                  { num: "100+", lbl: "Verified therapists" },
                  { num: "4.9★", lbl: "Average rating" },
                ].map(t => (
                  <div key={t.lbl}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#4ade80", lineHeight: 1 }}>{t.num}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontWeight: 600, marginTop: 4 }}>{t.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Form ── */}
            <div style={{
              position: "relative",
              animation: "_fr .7s cubic-bezier(.22,1,.36,1) .15s both",
            }}>
              {/* Glow ring */}
              <div style={{
                position: "absolute", inset: -4, borderRadius: 28,
                background: "linear-gradient(135deg, rgba(74,222,128,.4), rgba(26,92,56,.15), rgba(74,222,128,.2))",
                filter: "blur(1px)",
                zIndex: 0,
              }} />

              {/* Floating icons */}
              <div style={{ position:"absolute", top:-20, left:-20, width:46, height:46, borderRadius:14, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(0,0,0,.15)", animation:"_float 3s ease-in-out infinite", zIndex:2 }}>
                <i className="feather-heart" style={{ fontSize:20, color:G }}></i>
              </div>
              <div style={{ position:"absolute", top:50, right:-18, width:40, height:40, borderRadius:12, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(0,0,0,.15)", animation:"_float 3s ease-in-out 1s infinite", zIndex:2 }}>
                <i className="feather-star" style={{ fontSize:16, color:"#f59e0b" }}></i>
              </div>
              <div style={{ position:"absolute", bottom:60, right:-16, width:36, height:36, borderRadius:10, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(0,0,0,.15)", animation:"_float 3s ease-in-out 1.8s infinite", zIndex:2 }}>
                <i className="feather-shield" style={{ fontSize:14, color:GL }}></i>
              </div>

              {/* Card */}
              <div style={{
                background: "#fff", borderRadius: 24,
                padding: "36px 30px",
                boxShadow: "0 32px 80px rgba(0,0,0,.3)",
                position: "relative", zIndex: 1,
              }}>
                {/* Card header */}
                <div style={{ textAlign: "center", marginBottom: 22 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <i className="feather-calendar" style={{ fontSize: 20, color: G }}></i>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: GL, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    ✦ Book a Free Consultation
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>
                    Talk to an Expert Today
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    We'll reach out on WhatsApp within 24 hours
                  </div>
                </div>

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

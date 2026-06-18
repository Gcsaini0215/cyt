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
        @keyframes _fd { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _sp { to { transform: rotate(360deg); } }
      `}</style>

      <div id="__next" style={{ background: "#f4f6f8", minHeight: "100vh" }}>
        <MyNavbar />

        {/* ── Hero banner ── */}
        <div style={{
          background: `linear-gradient(135deg, ${G} 0%, #0d3d25 100%)`,
          padding: "52px 20px 100px",
          textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
            borderRadius: 50, padding: "6px 18px", marginBottom: 20,
          }}>
            <i className="feather-phone-call" style={{ fontSize: 13, color: "#4ade80" }}></i>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>Free 15-Min Call</span>
          </div>

          <h1 style={{
            fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 900, color: "#fff",
            margin: "0 0 14px", lineHeight: 1.2, letterSpacing: "-0.5px",
          }}>
            Not sure where to start?<br />
            <span style={{ color: "#4ade80" }}>Talk to an expert — free.</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.75)", margin: 0, fontWeight: 500 }}>
            Confidential · No commitment · Response within 24 hrs
          </p>
        </div>

        {/* ── Form card ── */}
        <div style={{ maxWidth: 540, margin: "-64px auto 0", padding: "0 16px 80px" }}>
          <div style={{
            background: "#fff", borderRadius: 24,
            boxShadow: "0 8px 48px rgba(0,0,0,.12)",
            padding: "32px 28px 36px",
            animation: "_fd .4s ease",
          }}>
            {/* Card header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "#f0fdf4", display: "flex",
                alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <i className="feather-heart" style={{ fontSize: 22, color: GL }}></i>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: "0 0 6px" }}>
                Book Your Free Consultation
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                Fill in your details and our team will reach out on WhatsApp to schedule your call.
              </p>
            </div>

            {/* Trust badges */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 20,
              marginBottom: 24, flexWrap: "wrap",
            }}>
              {[
                { icon: "feather-shield", t: "100% Confidential" },
                { icon: "feather-users",  t: "Verified Experts"  },
                { icon: "feather-lock",   t: "No Spam Ever"      },
              ].map(b => (
                <span key={b.t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b", fontWeight: 700 }}>
                  <i className={b.icon} style={{ fontSize: 11, color: GL }}></i>{b.t}
                </span>
              ))}
            </div>

            <ConsultationForm showHeading={false} />
          </div>

          {/* Bottom note */}
          <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 20, lineHeight: 1.6 }}>
            By submitting, you agree to be contacted by our team.<br />
            We never share your information with third parties.
          </p>
        </div>

        <Footer />
      </div>
    </>
  );
}

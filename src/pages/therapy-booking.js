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

        {/* ── Form card ── */}
        <div style={{ maxWidth: 540, margin: "0 auto", padding: "32px 16px 80px" }}>
          <div style={{
            background: "#fff", borderRadius: 24,
            boxShadow: "0 8px 48px rgba(0,0,0,.12)",
            padding: "32px 28px 36px",
            animation: "_fd .4s ease",
          }}>
            <ConsultationForm showHeading={true} />
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

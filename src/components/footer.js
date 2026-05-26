import React from "react";
const logo1 = "/logo.png";
import ImageTag from "../utils/image-tag";
import Link from "next/link";

const quickLinks = [
  ["Find a Therapist", "/view-all-therapist"],
  ["Student Mentorship", "/mentorship-for-students"],
  ["How It Works", "/how-it-works"],
  ["Mental Health Blog", "/blog-view"],
  ["Emergency Help", "/emergency-support"],
];

const portalLinks = [
  ["Client Login", "/login"],
  ["Client Sign Up", "/register"],
  ["Therapist Join Us", "/therapist-registration"],
  ["Apply for Internship", "/internship-registration"],
  ["Intern Login", "/intern-login"],
];

const contacts = [
  { icon: "feather-phone", label: "Support Hotline", val: "+91 80777 57951", href: "tel:+918077757951" },
  { icon: "feather-mail", label: "Email", val: "chooseyourtherapist@gmail.com", href: "mailto:chooseyourtherapist@gmail.com" },
  { icon: "feather-map-pin", label: "Office", val: "Sector 51, Noida, Uttar Pradesh, India", href: null },
];

const socials = [
  { icon: "feather-facebook", color: "#1877F2", href: "#" },
  { icon: "feather-instagram", color: "#E4405F", href: "#" },
  { icon: "feather-linkedin", color: "#0A66C2", href: "#" },
  { icon: "feather-message-circle", color: "#25D366", href: "https://wa.me/918077757951" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: "#0f172a", color: "#64748b" }}>
      <style>{`
        .ft-link { color:#64748b; font-size:14px; text-decoration:none; line-height:1; display:inline-block; transition:color .15s; }
        .ft-link:hover { color:#228756; }
        .ft-head { color:#e2e8f0; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:1px; margin:0 0 20px; }
        .ft-bottom-link { color:#475569; font-size:13px; text-decoration:none; transition:color .15s; }
        .ft-bottom-link:hover { color:#94a3b8; }
      `}</style>

      {/* green accent line at top */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#1a6b44,#228756,#4ade80,#228756,#1a6b44)" }}></div>

      {/* main content */}
      <div style={{ padding: "60px 0 48px" }}>
        <div className="container">
          <div className="row g-5">

            {/* Col 1: Brand */}
            <div className="col-lg-4 col-md-12">
              <Link href="/">
                <ImageTag
                  alt="Choose Your Therapist"
                  height="52"
                  width="160"
                  src={logo1}
                  style={{ filter: "brightness(0) invert(1)", marginBottom: "18px", display: "block" }}
                />
              </Link>
              <p style={{ color: "#475569", lineHeight: 1.8, fontSize: "14px", maxWidth: 310, margin: "0 0 24px" }}>
                Professional mental health support at your fingertips. We connect you with verified therapists for a healthier, happier life.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                {socials.map(({ icon, color, href }) => (
                  <a
                    key={icon}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={icon}
                    style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: "rgba(255,255,255,.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color, fontSize: 17, textDecoration: "none",
                      border: "1px solid rgba(255,255,255,.07)"
                    }}
                  >
                    <i className={icon}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="col-lg-2 col-md-4 col-6">
              <p className="ft-head">Quick Access</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "11px" }}>
                {quickLinks.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="ft-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Portals */}
            <div className="col-lg-2 col-md-4 col-6">
              <p className="ft-head">Portals</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "11px" }}>
                {portalLinks.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="ft-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div className="col-lg-4 col-md-4 col-12">
              <p className="ft-head">Connect With Us</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {contacts.map(({ icon, label, val, href }) => (
                  <div key={label} style={{ display: "flex", gap: "13px", alignItems: "flex-start" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: "rgba(34,135,86,.15)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <i className={icon} style={{ color: "#228756", fontSize: 15 }}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#334155", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 3 }}>
                        {label}
                      </div>
                      {href ? (
                        <a href={href} style={{ color: "#64748b", fontSize: "13.5px", fontWeight: 600, textDecoration: "none" }}>
                          {val}
                        </a>
                      ) : (
                        <span style={{ color: "#64748b", fontSize: "13.5px", fontWeight: 600 }}>{val}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "14px 0" }}>
        <div className="container">
          <p style={{ textAlign: "center", color: "#334155", fontSize: "12px", margin: 0, lineHeight: 1.7 }}>
            <span style={{ color: "#475569", fontWeight: 700 }}>DISCLAIMER:</span>{" "}
            Choose Your Therapist connects you with independent licensed professionals. We do not provide medical advice or emergency services directly.
            For crisis support, contact{" "}
            <span style={{ color: "#64748b", fontWeight: 700 }}>Tele Manas: 1800-89-14416</span>.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "16px 0" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-12">
              <p className="text-center text-lg-start mb-0" style={{ color: "#334155", fontSize: "13px" }}>
                © {currentYear}{" "}
                <Link href="/" style={{ color: "#475569", fontWeight: 700, textDecoration: "none" }}>
                  Choose Your Therapist LLP
                </Link>
                . All Rights Reserved.
              </p>
            </div>
            <div className="col-lg-6 col-12 mt_sm--10">
              <div style={{ display: "flex", gap: "18px", justifyContent: "center", flexWrap: "wrap" }}
                className="justify-content-lg-end">
                <Link href="/terms-conditions" className="ft-bottom-link">Terms of Service</Link>
                <span style={{ color: "#1e293b" }}>·</span>
                <Link href="/privacy-policy" className="ft-bottom-link">Privacy Policy</Link>
                <span style={{ color: "#1e293b" }}>·</span>
                <Link href="/cancellation-policy" className="ft-bottom-link">Cancellation Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

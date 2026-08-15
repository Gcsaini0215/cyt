import React from "react";
const logo1 = "/logo.png";
import ImageTag from "../utils/image-tag";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="rbt-footer footer-style-1 cyt-footer-academic">
      <style>{`
        .cyt-footer-academic { background: #fff; border-top: 3px solid #d4af37; }
        .cyt-footer-academic .footer-top { padding-top: 64px; padding-bottom: 40px; }
        .cyt-footer-academic .description { color: #52667f !important; opacity: 1 !important; }
        .cyt-footer-academic .ft-title { color: #0f3d24 !important; font-size: 13px; font-weight: 800 !important; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 2px solid #d4af37; display: inline-block; }
        .cyt-footer-academic .ft-link a,
        .cyt-footer-academic .ft-link a.color-black { color: #475569 !important; font-size: 14px; transition: color .15s ease; }
        .cyt-footer-academic .ft-link a:hover { color: #166534 !important; }

        .cyt-footer-academic .social-icon a {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: #f8faf9; border: 1px solid #dbe3df;
          transition: all .18s ease;
        }
        .cyt-footer-academic .social-icon a:hover { background: #fdf6e3; border-color: #d4af37; transform: translateY(-2px); }

        .cyt-footer-academic .single-info .icon { background: #eef5f1 !important; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cyt-footer-academic .single-info .icon i { color: #166534 !important; font-size: 15px !important; }
        .cyt-footer-academic .single-info .text span {
          color: #94a3b8 !important; font-size: 11px !important; font-weight: 700 !important;
          text-transform: uppercase; letter-spacing: .4px; line-height: 1.4; margin-bottom: 2px;
        }
        .cyt-footer-academic .single-info .text a,
        .cyt-footer-academic .single-info .text span.color-black {
          color: #132a1c !important; font-size: 14.5px !important; font-weight: 700 !important; line-height: 1.4;
        }
        .cyt-footer-academic .single-info .text a:hover { color: #166534 !important; }

        .cyt-footer-academic .disclaimer-bar { background: #f8faf9 !important; border-top: 1px solid #eef2f0 !important; border-bottom: 1px solid #eef2f0; }
        .cyt-footer-academic .disclaimer-bar p { color: #64748b !important; }
        .cyt-footer-academic .disclaimer-bar .fw-bold { color: #166534 !important; }

        .cyt-footer-academic .copyright-area { border-top: none !important; }
        .cyt-footer-academic .copyright-area p,
        .cyt-footer-academic .copyright-area .color-black { color: #64748b !important; font-size: 13px !important; font-weight: 500 !important; }
        .cyt-footer-academic .copyright-area p a { color: #132a1c !important; font-size: 13px !important; font-weight: 700 !important; }
        .cyt-footer-academic .copyright-link { font-size: 13px !important; }
        .cyt-footer-academic .copyright-link a { color: #132a1c !important; font-size: 13px !important; font-weight: 600 !important; }
        .cyt-footer-academic .copyright-area a:hover { color: #166534 !important; }
        .cyt-footer-academic .copyright-link .separator { color: #dbe3df !important; font-size: 13px !important; }

        /* ── iPad tuning (768–1024) ────────────────────── */
        @media (min-width:768px) and (max-width:1024px) {
          .cyt-footer-academic .footer-top { padding-top: 52px; padding-bottom: 32px; }
          .cyt-footer-academic .footer-widget { margin-bottom: 8px; }
        }
        /* ── Mobile tuning (<576) ───────────────────────── */
        @media (max-width:575px) {
          .cyt-footer-academic .footer-top { padding-top: 40px; padding-bottom: 20px; }
          .cyt-footer-academic .disclaimer-bar p { font-size: 11px !important; line-height: 1.6; }
        }
      `}</style>

      {/* Main Footer Content */}
      <div className="footer-top">
        <div className="container">
          <div className="row g-5">
            {/* Column 1: Brand & Identity */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="footer-widget">
                <div className="logo">
                  <Link href="/">
                    <ImageTag
                      alt="Choose Your Therapist"
                      height={"60"}
                      width={"180"}
                      src={logo1}
                    />
                  </Link>
                </div>
                <p className="description mt--25" style={{ lineHeight: '1.8' }}>
                  Professional mental health support at your fingertips. We connect you with verified therapists to begin your journey toward emotional well-being.
                </p>
                <ul className="social-icon social-default justify-content-start mt--30 gap-3">
                  <li><a href="#" aria-label="Facebook"><i className="feather-facebook"></i></a></li>
                  <li><a href="#" aria-label="Instagram"><i className="feather-instagram"></i></a></li>
                  <li><a href="#" aria-label="LinkedIn"><i className="feather-linkedin"></i></a></li>
                  <li><a href="https://wa.me/918077757951" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><i className="feather-message-circle"></i></a></li>
                </ul>
              </div>
            </div>

            {/* Column 2: Quick Navigation */}
            <div className="col-lg-2 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title">Quick Access</h5>
                <ul className="ft-link liststyle-none mt--20">
                  <li className="mb--12"><Link href="/view-all-therapist">Find a Therapist</Link></li>
                  <li className="mb--12"><Link href="/mentorship-for-students">Student Mentorship</Link></li>
                  <li className="mb--12"><Link href="/how-it-works">How It Works</Link></li>
                  <li className="mb--12"><Link href="/blog-view">Mental Health Blog</Link></li>
                  <li><Link href="/emergency-support">Emergency Help</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 3: Portals */}
            <div className="col-lg-2 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title">Member Portals</h5>
                <ul className="ft-link liststyle-none mt--20">
                  <li className="mb--12"><Link href="/login">Client Login</Link></li>
                  <li className="mb--12"><Link href="/register">Client Sign Up</Link></li>
                  <li className="mb--12"><Link href="/therapist-registration">Therapist Join Us</Link></li>
                  <li className="mb--12"><Link href="/internship-registration">Apply for Internship</Link></li>
                  <li><Link href="/supervision-login">Trainee Login</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 4: Contact & Office */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="footer-widget">
                <h5 className="ft-title">Connect With Us</h5>
                <div className="contact-info mt--20">
                  <div className="single-info d-flex align-items-center mb--20">
                    <div className="icon rounded-circle p-3 mr--15">
                      <i className="feather-phone"></i>
                    </div>
                    <div className="text">
                      <span className="d-block fs-14">Support Hotline</span>
                      <a href="tel:+918077757951" className="fw-bold">+91 80777 57951</a>
                    </div>
                  </div>
                  <div className="single-info d-flex align-items-center mb--20">
                    <div className="icon rounded-circle p-3 mr--15">
                      <i className="feather-mail"></i>
                    </div>
                    <div className="text">
                      <span className="d-block fs-14">Email Address</span>
                      <a href="mailto:Chooseyourtherapist@gmail.com" className="fw-bold">Chooseyourtherapist@gmail.com</a>
                    </div>
                  </div>
                  <div className="single-info d-flex align-items-start">
                    <div className="icon rounded-circle p-3 mr--15">
                      <i className="feather-map-pin"></i>
                    </div>
                    <div className="text">
                      <span className="d-block fs-14">Head Office</span>
                      <span className="color-black">Sector 51, Noida, Uttar Pradesh, India</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Disclaimer Bar */}
      <div className="disclaimer-bar py-4">
        <div className="container">
          <p className="text-center mb-0" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
            <span className="fw-bold mr--10">DISCLAIMER:</span>
            Choose Your Therapist connects you with independent licensed professionals. We do not provide medical advice or emergency services directly.
            For crisis support, contact <span className="fw-bold">Tele Manas: 1800-89-14416</span>.
          </p>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="copyright-area py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12">
              <p className="text-center text-lg-start mb-0 fs-14">
                © {currentYear} <Link href="/" className="fw-bold">Choose Your Therapist LLP</Link>. All Rights Reserved.
              </p>
            </div>
            <div className="col-lg-6 col-md-12 mt_sm--10 mt_md--10">
              <div className="copyright-link rbt-link-hover justify-content-center justify-content-lg-end d-flex gap-3 flex-wrap mb-0 fs-14">
                <Link href="/terms-conditions">Terms of Service</Link>
                <span className="separator">|</span>
                <Link href="/privacy-policy">Privacy Policy</Link>
                <span className="separator">|</span>
                <Link href="/cancellation-policy">Cancellation Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

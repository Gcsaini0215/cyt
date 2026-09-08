import React from "react";
const logo1 = "/logo.png";
import ImageTag from "../utils/image-tag";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="rbt-footer footer-style-1 cyt-footer-academic">
      <style dangerouslySetInnerHTML={{ __html: `
        html, body { background-color: #0f1a13 !important; }
        .cyt-footer-academic { background: #0f1a13; border-top: 3px solid #d4af37; overscroll-behavior-y: none; }
        .cyt-footer-academic .footer-top { padding-top: 64px; padding-bottom: 40px; }
        .cyt-footer-academic .footer-logo-chip { display: inline-block; background: #fff; border-radius: 10px; padding: 10px 14px; }
        .cyt-footer-academic .description { color: rgba(255,255,255,.65) !important; opacity: 1 !important; }
        .cyt-footer-academic .ft-title { color: #7fd8a5 !important; font-size: 14px; font-weight: 800 !important; letter-spacing: .2px; margin-bottom: 6px; padding-bottom: 8px; border-bottom: 2px solid #d4af37; display: inline-block; }
        .cyt-footer-academic .ft-link a,
        .cyt-footer-academic .ft-link a.color-black { color: rgba(255,255,255,.75) !important; font-size: 14px; transition: color .15s ease; }
        .cyt-footer-academic .ft-link a:hover { color: #d4af37 !important; }
        .cyt-footer-academic .ft-cities-col { column-count: 2; column-gap: 18px; }
        .cyt-footer-academic .ft-cities-col li { break-inside: avoid; -webkit-column-break-inside: avoid; }

        .cyt-footer-academic .social-icon a {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
          color: #fff;
          transition: all .18s ease;
        }
        .cyt-footer-academic .social-icon a:hover { background: rgba(212,175,55,.15); border-color: #d4af37; transform: translateY(-2px); }

        .cyt-footer-academic .single-info .icon { background: rgba(255,255,255,.08) !important; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cyt-footer-academic .single-info .icon i { color: #7fd8a5 !important; font-size: 15px !important; }
        .cyt-footer-academic .single-info .text span {
          color: rgba(255,255,255,.5) !important; font-size: 11px !important; font-weight: 700 !important;
          letter-spacing: .2px; line-height: 1.4; margin-bottom: 2px;
        }
        .cyt-footer-academic .single-info .text a,
        .cyt-footer-academic .single-info .text span.color-black {
          color: #fff !important; font-size: 14px !important; font-weight: 400 !important; line-height: 1.4;
        }
        .cyt-footer-academic .single-info .text a:hover { color: #d4af37 !important; }

        .cyt-footer-academic .disclaimer-bar { background: #0a1310 !important; border-top: 1px solid rgba(255,255,255,.08) !important; border-bottom: 1px solid rgba(255,255,255,.08); padding: 32px 0 26px !important; }
        .cyt-footer-academic .disclaimer-bar p { color: rgba(255,255,255,.6) !important; }
        .cyt-footer-academic .disclaimer-bar .fw-bold { color: #7fd8a5 !important; }
        .cyt-footer-academic .legal-block { text-align: left; margin-bottom: 18px; }
        .cyt-footer-academic .legal-block:last-child { margin-bottom: 0; }
        .cyt-footer-academic .legal-block h6 { color: #7fd8a5 !important; font-size: 13px; font-weight: 800; letter-spacing: .3px; margin-bottom: 8px; }
        .cyt-footer-academic .legal-block p { color: rgba(255,255,255,.55) !important; font-size: 12px; line-height: 1.7; letter-spacing: .2px; text-align: left; }
        .cyt-footer-academic .legal-block p + p { margin-top: 8px; }

        .cyt-footer-academic .copyright-area { border-top: none !important; }
        .cyt-footer-academic .copyright-area p,
        .cyt-footer-academic .copyright-area .color-black { color: rgba(255,255,255,.6) !important; font-size: 14px !important; font-weight: 500 !important; }
        .cyt-footer-academic .copyright-area p a { color: #fff !important; font-size: 14px !important; font-weight: 700 !important; }
        .cyt-footer-academic .copyright-link { font-size: 14px !important; }
        .cyt-footer-academic .copyright-link a { color: #fff !important; font-size: 14px !important; font-weight: 600 !important; }
        .cyt-footer-academic .copyright-area a:hover { color: #d4af37 !important; }
        .cyt-footer-academic .copyright-link .separator { color: rgba(255,255,255,.3) !important; font-size: 14px !important; }

        .cyt-footer-academic .footer-logo-chip img { max-width: 100%; height: auto; }

        .cyt-footer-academic .ft-contact-row { background: #0a1310; border-top: 1px solid rgba(255,255,255,.08); border-bottom: 1px solid rgba(255,255,255,.08); padding: 22px 0; }
        .cyt-footer-academic .ft-contact-row .contact-row-inner { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 20px 40px; }
        .cyt-footer-academic .ft-contact-row .single-info { margin-bottom: 0 !important; }

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
      ` }} />

      {/* Main Footer Content */}
      <div className="footer-top">
        <div className="container">
          <div className="row g-4">
            {/* Column 1: Brand & Identity */}
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="footer-widget">
                <div className="logo">
                  <Link href="/" className="footer-logo-chip">
                    <ImageTag
                      alt="Choose Your Therapist"
                      height={"60"}
                      width={"180"}
                      src={logo1}
                    />
                  </Link>
                </div>
                <p className="description mt--25" style={{ lineHeight: '1.8' }}>
                  Professional mental health support at your fingertips.
                </p>
              </div>
            </div>

            {/* Column 2: Get Started */}
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title">Get Started</h5>
                <ul className="ft-link liststyle-none mt--20">
                  <li className="mb--12"><Link href="/view-all-therapist">Find a Therapist</Link></li>
                  <li className="mb--12"><Link href="/therapy-booking">Free Consultation</Link></li>
                  <li className="mb--12"><Link href="/how-it-works">How It Works</Link></li>
                  <li className="mb--12"><Link href="/service-page">Our Services</Link></li>
                  <li className="mb--12"><Link href="/blogs">Blog</Link></li>
                  <li className="mb--12"><Link href="/faqs">FAQs</Link></li>
                  <li><Link href="/emergency-support">Emergency Help</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 3: Self-Help Tools */}
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title">Self-Help Tools</h5>
                <ul className="ft-link liststyle-none mt--20">
                  <li className="mb--12"><Link href="/self-assessment">Self-Assessment</Link></li>
                  <li className="mb--12"><Link href="/wellness-toolkit">Wellness Toolkit</Link></li>
                  <li className="mb--12"><Link href="/daily-journal">Daily Journal</Link></li>
                  <li className="mb--12"><Link href="/plans">Therapy Plans</Link></li>
                  <li><Link href="/allworkshop">Workshops</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 4: Programs */}
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title">Programs</h5>
                <ul className="ft-link liststyle-none mt--20">
                  <li className="mb--12"><Link href="/mentorship-for-students">Student Mentorship</Link></li>
                  <li className="mb--12"><Link href="/internship-registration">Apply for Internship</Link></li>
                  <li className="mb--12"><Link href="/internship-modules">Internship Curriculum</Link></li>
                  <li><Link href="/probono-therapist">Pro Bono Program</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 5: Member Portals */}
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title">Member Portals</h5>
                <ul className="ft-link liststyle-none mt--20">
                  <li className="mb--12"><Link href="/login">Client Login</Link></li>
                  <li className="mb--12"><Link href="/register">Client Sign Up</Link></li>
                  <li className="mb--12"><Link href="/therapist-registration">Therapist Join Us</Link></li>
                  <li><Link href="/supervision-login">Trainee Login</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 6: Cities We Serve */}
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title">Cities We Serve</h5>
                <ul className="ft-link ft-cities-col liststyle-none mt--20">
                  <li className="mb--10"><Link href="/psychologist-in-noida-delhi">Noida</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/mumbai">Mumbai</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/bangalore">Bangalore</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/pune">Pune</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/hyderabad">Hyderabad</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/chennai">Chennai</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/kolkata">Kolkata</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/ahmedabad">Ahmedabad</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/jaipur">Jaipur</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/lucknow">Lucknow</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/chandigarh">Chandigarh</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/delhi">Delhi</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/uttarakhand">Haridwar</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/uttarakhand">Dehradun</Link></li>
                  <li className="mb--10"><Link href="/psychologist-in/uttarakhand">Rishikesh</Link></li>
                  <li><Link href="/psychologist-in/uttarakhand">Haldwani</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 7: International Clients */}
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title">International Clients</h5>
                <ul className="ft-link liststyle-none mt--20">
                  <li className="mb--12"><Link href="/appointment">Request an Appointment</Link></li>
                  <li className="mb--12"><Link href="/therapy-booking">Book an Online Session</Link></li>
                  <li className="mb--12"><Link href="/view-all-therapist">Browse Our Therapists</Link></li>
                  <li><Link href="/emergency-support">Emergency Support</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 8: Corporate */}
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title">Corporate</h5>
                <ul className="ft-link liststyle-none mt--20">
                  <li className="mb--12"><Link href="/about-us">About Us</Link></li>
                  <li className="mb--12"><Link href="/for-business">Corporate Wellness</Link></li>
                  <li className="mb--12"><Link href="/contact-us">Contact Us</Link></li>
                  <li className="mb--12"><Link href="/terms-conditions">Terms of Service</Link></li>
                  <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Row */}
      <div className="ft-contact-row">
        <div className="container">
          <div className="contact-row-inner">
            <div className="single-info d-flex align-items-center">
              <div className="icon rounded-circle p-2 mr--12">
                <i className="feather-phone"></i>
              </div>
              <div className="text">
                <a href="tel:+918077757951">+91 80777 57951</a>
              </div>
            </div>
            <div className="single-info d-flex align-items-center">
              <div className="icon rounded-circle p-2 mr--12">
                <i className="feather-mail"></i>
              </div>
              <div className="text">
                <a href="mailto:Chooseyourtherapist@gmail.com">Chooseyourtherapist@gmail.com</a>
              </div>
            </div>
            <div className="single-info d-flex align-items-center">
              <div className="icon rounded-circle p-2 mr--12">
                <i className="feather-map-pin"></i>
              </div>
              <div className="text">
                <span className="color-black">Sector 51, Noida, Uttar Pradesh, India</span>
              </div>
            </div>
            <ul className="social-icon social-default justify-content-center mb-0 gap-3">
              <li><a href="#" aria-label="Facebook"><i className="feather-facebook"></i></a></li>
              <li><a href="#" aria-label="Instagram"><i className="feather-instagram"></i></a></li>
              <li><a href="#" aria-label="LinkedIn"><i className="feather-linkedin"></i></a></li>
              <li><a href="https://wa.me/918077757951" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><i className="feather-message-circle"></i></a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Clean Disclaimer Bar */}
      <div className="disclaimer-bar">
        <div className="container">
          <div className="legal-block">
            <h6>Disclaimer</h6>
            <p className="mb-0">
              The information available on this website — including but not limited to articles, blogs, self-assessment tools, wellness resources, FAQs and other content (&quot;Content&quot;) — is published by Choose Your Therapist solely for informational purposes and is not a substitute for professional medical or psychological advice, diagnosis or treatment.
            </p>
            <p className="mb-0">
              The Content must not be construed as therapy, medical advice, diagnosis or prescription. We strongly advise you to consult a qualified, licensed mental health professional regarding your specific condition or treatment. Reliance on any information on this website is solely at your own discretion and risk. For a medical or psychiatric emergency, contact your nearest hospital or <span className="fw-bold">Tele Manas: 1800-89-14416</span> immediately.
            </p>
          </div>
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

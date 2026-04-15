import React from "react";
const logo1 = "/logo.png";
import ImageTag from "../utils/image-tag";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="rbt-footer footer-style-1 bg-color-white">
      {/* Main Footer Content */}
      <div className="footer-top pt--100 pb--60">
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
                <p className="description mt--25 color-black" style={{ lineHeight: '1.8', opacity: '0.8' }}>
                  Professional mental health support at your fingertips. We connect you with verified therapists to begin your journey toward emotional well-being.
                </p>
                <ul className="social-icon social-default justify-content-start mt--30 gap-3">
                  <li><a href="#" style={{ color: '#1877F2' }} aria-label="Facebook"><i className="feather-facebook"></i></a></li>
                  <li><a href="#" style={{ color: '#E4405F' }} aria-label="Instagram"><i className="feather-instagram"></i></a></li>
                  <li><a href="#" style={{ color: '#0A66C2' }} aria-label="LinkedIn"><i className="feather-linkedin"></i></a></li>
                  <li><a href="https://wa.me/918077757951" style={{ color: '#25D366' }} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><i className="feather-message-circle"></i></a></li>
                </ul>
              </div>
            </div>

            {/* Column 2: Quick Navigation */}
            <div className="col-lg-2 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title color-black fw-bold">Quick Access</h5>
                <ul className="ft-link liststyle-none mt--20">
                  <li className="mb--12"><Link href="/view-all-therapist" className="color-black hover-primary">Find a Therapist</Link></li>
                  <li className="mb--12"><Link href="/mentorship-for-students" className="color-black hover-primary">Student Mentorship</Link></li>
                  <li className="mb--12"><Link href="/how-it-works" className="color-black hover-primary">How It Works</Link></li>
                  <li className="mb--12"><Link href="/blog-view" className="color-black hover-primary">Mental Health Blog</Link></li>
                  <li><Link href="/emergency-support" className="color-black hover-primary">Emergency Help</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 3: Portals */}
            <div className="col-lg-2 col-md-6 col-sm-6">
              <div className="footer-widget">
                <h5 className="ft-title color-black fw-bold">Member Portals</h5>
                <ul className="ft-link liststyle-none mt--20">
                  <li className="mb--12"><Link href="/login" className="color-black hover-primary">Client Login</Link></li>
                  <li className="mb--12"><Link href="/register" className="color-black hover-primary">Client Sign Up</Link></li>
                  <li className="mb--12"><Link href="/therapist-registration" className="color-black hover-primary">Therapist Join Us</Link></li>
                  <li><Link href="/contact-us" className="color-black hover-primary">Contact Support</Link></li>
                </ul>
              </div>
            </div>

            {/* Column 4: Contact & Office */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="footer-widget">
                <h5 className="ft-title color-black fw-bold">Connect With Us</h5>
                <div className="contact-info mt--20">
                  <div className="single-info d-flex align-items-center mb--20">
                    <div className="icon bg-primary-opacity rounded-circle p-3 mr--15" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}>
                      <i className="feather-phone color-primary"></i>
                    </div>
                    <div className="text">
                      <span className="d-block color-black fs-14" style={{ opacity: '0.6' }}>Support Hotline</span>
                      <a href="tel:+918077757951" className="color-black fw-bold">+91 80777 57951</a>
                    </div>
                  </div>
                  <div className="single-info d-flex align-items-center mb--20">
                    <div className="icon bg-primary-opacity rounded-circle p-3 mr--15" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}>
                      <i className="feather-mail color-primary"></i>
                    </div>
                    <div className="text">
                      <span className="d-block color-black fs-14" style={{ opacity: '0.6' }}>Email Address</span>
                      <a href="mailto:Chooseyourtherapist@gmail.com" className="color-black fw-bold">Chooseyourtherapist@gmail.com</a>
                    </div>
                  </div>
                  <div className="single-info d-flex align-items-start">
                    <div className="icon bg-primary-opacity rounded-circle p-3 mr--15" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}>
                      <i className="feather-map-pin color-primary"></i>
                    </div>
                    <div className="text">
                      <span className="d-block color-black fs-14" style={{ opacity: '0.6' }}>Head Office</span>
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
      <div className="disclaimer-bar py-4" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #eee' }}>
        <div className="container">
          <p className="text-center mb-0 color-black" style={{ fontSize: '12px', opacity: '0.7', letterSpacing: '0.5px' }}>
            <span className="fw-bold mr--10">DISCLAIMER:</span> 
            Choose Your Therapist connects you with independent licensed professionals. We do not provide medical advice or emergency services directly. 
            For crisis support, contact <span className="fw-bold">Tele Manas: 1800-89-14416</span>.
          </p>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="copyright-area py-4" style={{ borderTop: '1px solid #eee' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12">
              <p className="text-center text-lg-start mb-0 color-black fs-14">
                © {currentYear} <Link href="/" className="color-black hover-primary fw-bold">Choose Your Therapist LLP</Link>. All Rights Reserved.
              </p>
            </div>
            <div className="col-lg-6 col-md-12 mt_sm--10 mt_md--10">
              <div className="copyright-link rbt-link-hover justify-content-center justify-content-lg-end d-flex gap-3 flex-wrap mb-0 fs-14 color-black">
                <Link href="/terms-conditions" className="hover-primary">Terms of Service</Link>
                <span className="separator" style={{ opacity: 0.3 }}>|</span>
                <Link href="/privacy-policy" className="hover-primary">Privacy Policy</Link>
                <span className="separator" style={{ opacity: 0.3 }}>|</span>
                <Link href="/cancellation-policy" className="hover-primary">Cancellation Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

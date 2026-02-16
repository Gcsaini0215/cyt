import { useState, useEffect } from "react";
const logo1 = "/logo.png";
import ImageTag from "../utils/image-tag";
import { Link } from "react-router-dom";

export default function Footer() {
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  useEffect(() => {
    const isAccepted = localStorage.getItem("cookiesAccepted") === "true";
    setCookiesAccepted(isAccepted);
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setCookiesAccepted(true);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 🍪 Cookie Consent Banner */}
      {!cookiesAccepted && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: "600px",
            background: "#f0fff4",
            border: "1px solid #a5d6a7",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 9999,
            animation: "fadeIn 0.4s ease-in-out",
          }}
        >
          <div
            style={{
              color: "#1b5e20",
              textAlign: "center",
              fontSize: "15px",
              lineHeight: 1.5,
              marginBottom: "12px",
            }}
          >
            🍪 We use cookies to enhance your browsing experience and ensure a
            secure connection. Please read our{" "}
            <Link
              to="/privacy-policy"
              style={{
                color: "#2e7d32",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              Privacy Policy
            </Link>
            .
          </div>
          <button
            onClick={handleAcceptCookies}
            style={{
              background: "#2e7d32",
              color: "#fff",
              border: "none",
              borderRadius: "25px",
              padding: "8px 30px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "15px",
              boxShadow: "0 2px 6px rgba(46,125,50,0.2)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#1b5e20")}
            onMouseOut={(e) => (e.target.style.background = "#2e7d32")}
          >
            Accept
          </button>
        </div>
      )}



      {/* Animation CSS */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 600px) {
            .cookie-banner {
              width: 95%;
              padding: 14px 16px;
              font-size: 14px;
            }
          }
        `}
      </style>

      {/* Separator */}
      <div className="rbt-separator-mid">
        <div className="container">
          <hr className="rbt-separator m-0" />
        </div>
      </div>

      {/* Footer Content */}
      <footer className="rbt-footer footer-style-1">
        <div className="footer-top">
          <div className="container">
            <div className="row row--15 mt_dec--30">
              {/* Logo & Tagline */}
              <div className="col-lg-4 col-md-6 col-sm-6 col-12 mt--30">
                <div className="footer-widget">
                  <div className="logo">
                    <Link to="/">
                      <ImageTag
                        alt="Choose Your Therapist"
                        height={"50"}
                        width={"152"}
                        src={logo1}
                      />
                    </Link>
                  </div>
                  <p className="description mt--20">
                    Because healing starts with your choice.
                  </p>
                  <div className="contact-btn mt--30">
                    <Link
                      className="rbt-btn hover-icon-reverse btn-border-gradient radius-round"
                      to="/contact-us"
                    >
                      <div className="icon-reverse-wrapper">
                        <span className="btn-text">Connect With Us</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </div>
                    </Link>
                  </div>

                  <div className="mt-4">
                    <h5 className="ft-title">Quick Links</h5>
                    <ul className="ft-link">
                      <li><Link to="/how-it-works">How It Works</Link></li>
                      <li><Link to="/faqs">FAQ</Link></li>
                      <li><Link to="/emergency-support">Emergency Support</Link></li>
                      <li><Link to="/mentorship-for-students">Student Mentorship</Link></li>
                      <li><Link to="/therapist-registration">Therapist Registration</Link></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* For Clients */}
              <div className="col-lg-2 col-md-6 col-sm-6 col-12 mt--30">
                <div className="footer-widget">
                  <h5 className="ft-title">For Clients</h5>
                  <ul className="ft-link">
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/register">Sign Up</Link></li>
                    <li><Link to="/view-all-therapist">Therapist Directory</Link></li>
                  </ul>
                  <h5 className="ft-title mt-3">Services for Daily Life Issues</h5>
                  <ul className="ft-link">
                    <li><Link to="#">Stress & Anxiety Management</Link></li>
                    <li><Link to="#">Depression Support</Link></li>
                    <li><Link to="#">Relationship & Marriage Counseling</Link></li>
                    <li><Link to="#">Teen & Adolescent Guidance</Link></li>
                    <li><Link to="#">Workplace Stress & Burnout</Link></li>
                    <li><Link to="#">Self-Esteem & Confidence Building</Link></li>
                    <li><Link to="#">Mindfulness & Meditation</Link></li>
                  </ul>
                </div>
              </div>

              {/* For Students */}
              <div className="col-lg-2 col-md-6 col-sm-6 col-12 mt--30">
                <div className="footer-widget">
                  <h5 className="ft-title">Mentorship for Students</h5>
                  <ul className="ft-link">
                    <li><Link to="#">Internship & Practical Training</Link></li>
                    <li><Link to="#">Career Mentorship</Link></li>
                    <li><Link to="#">Research Guidance</Link></li>
                    <li><Link to="#">Workshops & Webinars</Link></li>
                    <li><Link to="#">Networking Opportunities</Link></li>
                    <li><Link to="#">Case Study Discussions</Link></li>
                    <li><Link to="#">Resume & Portfolio Support</Link></li>
                    <li><Link to="#">Clinical Skills Development</Link></li>
                    <li><Link to="#">Ethical Practice & Guidelines</Link></li>
                  </ul>
                </div>
              </div>

              {/* For Therapists */}
              <div className="col-lg-2 col-md-6 col-sm-6 col-12 mt--30">
                <div className="footer-widget">
                  <h5 className="ft-title">For Therapists</h5>
                  <ul className="ft-link">
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/therapist-registration">Sign Up</Link></li>
                  </ul>
                  <h5 className="ft-title mt-3">Professional Types</h5>
                  <ul className="ft-link">
                    <li><Link to="#">Counselling Psychologist</Link></li>
                    <li><Link to="#">Clinical Psychologist</Link></li>
                    <li><Link to="#">Psychiatrist</Link></li>
                    <li><Link to="#">Special Educator</Link></li>
                  </ul>
                </div>
              </div>

              {/* Contact Info */}
              <div className="col-lg-2 col-md-6 col-sm-6 col-12 mt--30">
                <div className="footer-widget">
                  <h5 className="ft-title">Get Contact</h5>
                  <ul className="ft-link">
                    <li>
                      <span>Phone: </span>
                      <a href="tel:+918077757951">+91 80777 57951</a>
                    </li>
                    <li>
                      <span>E-mail: </span>
                      <a href="mailto:Chooseyourtherapist@gmail.com">Chooseyourtherapist@gmail.com</a>
                    </li>
                    <li>
                      <span>Official Address: </span>
                      Gate No-3, D-137, near LPS GLOBAL SCHOOL, Block D, Sector 51, Noida, Uttar Pradesh 201301, India
                    </li>
                  </ul>
                  <ul className="social-icon social-default icon-naked justify-content-start mt--20">
                    <li><a href="#"><i className="feather-facebook"></i></a></li>
                    <li><a href="#"><i className="feather-twitter"></i></a></li>
                    <li><a href="#"><i className="feather-instagram"></i></a></li>
                    <li><a href="#"><i className="feather-linkedin"></i></a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Disclaimer Section */}
      <div className="container mt-4 mb-4">
        <div
          style={{
            background: "#f5f5f5",
            padding: "15px 20px",
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <strong>Disclaimer:</strong> This platform is a{" "}
          <u>network of independent therapists</u>. All therapists work independently, and the
          platform only connects you to a therapist. If you face any difficulty connecting to a
          therapist, you can contact <strong>+91 80777 57951</strong>. For{" "}
          <u>emergency situations</u>, please contact the free helpline{" "}
          <strong>Tele Manas Toll-Free: 1800 89 14416</strong>.
        </div>
      </div>

      {/* Bottom Section */}
      <div className="rbt-separator-mid">
        <div className="container">
          <hr className="rbt-separator m-0" />
        </div>
      </div>

      <div className="copyright-area copyright-style-1 ptb--20">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-12">
              <p className="rbt-link-hover text-center text-lg-start">
                © 2024{" "}
                <a href="https://chooseyourtherapist.in">
                  Choose Your Therapist LLP.
                </a>{" "}
                All Rights Reserved
              </p>
            </div>
            <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-12">
              <ul className="copyright-link rbt-link-hover justify-content-center justify-content-lg-end mt_sm--10 mt_md--10">
                <li><Link to="/terms-conditions">Terms of Service</Link></li>
                <li><Link to="/cancellation-policy">Cancellation Policy</Link></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

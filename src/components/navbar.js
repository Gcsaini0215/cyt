import React, { useEffect } from "react";
import "swiper/css";
import "swiper/css/pagination";
import logo1 from "../assets/img/logo.png";
import { Link } from "react-router-dom";
import ImageTag from "../utils/image-tag";
import { getDecodedToken, getToken } from "../utils/jwt";
import BottomNavigation from "./bottom-navigation";

export default function App() {
  const [show, setShow] = React.useState(false);
  const [showChatbot, setShowChatbot] = React.useState(false);
  const [userType, setUserType] = React.useState(0);

  useEffect(() => {
    const data = getToken();
    if (data) {
      const userData = getDecodedToken();
      if (userData.role === 1) {
        setUserType(2);
      } else {
        setUserType(1);
      }
    }

    // Google Tag Integration
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = "https://www.googletagmanager.com/gtag/js?id=G-GFBR3SJQT3";
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-GFBR3SJQT3');
    `;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  const GREEN_STRIP_HEIGHT = 35; // desktop

  return (
    <>
      {/* Top Green Strip */}
      <div className="top-strip">
        <div className="top-strip-desktop">
          <div className="left-info">
            <span><i className="feather-phone"></i> +91-807-775-7951</span>
            <span className="divider">|</span>
            <span><i className="feather-mail"></i> info.cyt@gmail.com</span>
          </div>
          <div className="right-info">
            <span><i className="feather-map-pin"></i> Block D-137, Sector 51, Noida, Uttar Pradesh 201301</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="rbt-header rbt-header-10 header-sticky">
        <div className="rbt-header-wrapper header-space-betwween">
          <div className="container-fluid">
            <div className="mainbar-row rbt-navigation-start align-items-center">
              <div className="header-left rbt-header-content">
                <div className="header-info">
                  <div className="logo">
                    <Link to="/" style={{ cursor: "pointer" }}>
                      <ImageTag alt="Education Logo Images" height={"50"} width={"152"} src={logo1} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="rbt-main-navigation d-none d-xl-block">
                <nav className="mainmenu-nav">
                  <ul className="mainmenu">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/view-all-therapist">Therapist Directory</Link></li>
                    <li className="has-dropdown">
                      <Link to="#">Services <i className="feather-chevron-down"></i></Link>
                      <ul className="submenu">
                        <li><Link to="/therapy-booking">Therapy Booking</Link></li>
                        <li><Link to="/mind-matters">Mind Matters Programs</Link></li>
                      </ul>
                    </li>
                    <li className="has-dropdown">
                      <Link to="#">About <i className="feather-chevron-down"></i></Link>
                      <ul className="submenu">
                        <li><Link to="/about-us">About us</Link></li>
                        <li><Link to="/contact-us">Contact us</Link></li>
                      </ul>
                    </li>
                    <li><Link to="/faqs">Faqs</Link></li>
                  </ul>
                </nav>
              </div>

              {/* Header Right */}
              <div className="header-right">
                <ul className="quick-access">
                  <li className="access-icon">
                    <a
                      href="https://api.whatsapp.com/send?phone=918077757951&text=Hi%20Choose%20Your%20Therapist%20team,%20I%20need%20help"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rbt-round-btn"
                      style={{
                        backgroundColor: "#25D366",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        textDecoration: "none",
                        boxShadow: "0 2px 8px rgba(37, 211, 102, 0.3)"
                      }}
                    >
                      <i
                        className="fab fa-whatsapp"
                        style={{ color: "#fff", fontSize: "18px" }}
                      ></i>
                    </a>
                  </li>
                  <li className="account-access rbt-user-wrapper d-none d-xl-block">
                    {userType === 1 || userType === 2 ? (
                      <Link
                        to={userType === 1 ? "/my-dashboard" : "/therapist-dashboard"}
                        className="service-menu-parent"
                      >
                        <i className="feather-user"></i> {userType === 1 ? "Profile" : "Therapist Profile"}
                      </Link>
                    ) : (
                      <Link to="/login" className="service-menu-parent">
                        <i className="feather-user"></i> Sign In/Sign Up
                      </Link>
                    )}
                  </li>
                </ul>
                <div className="rbt-btn-wrapper d-none d-xl-block">
                  <Link
                    className="rbt-btn rbt-marquee-btn marquee-auto btn-border-gradient radius-round btn-sm hover-transform-none"
                    to="/therapist-registration"
                  >
                    <span data-text="Are You a Therapist?">Are You a Therapist?</span>
                  </Link>
                </div>

                {/* Mobile Menu Button - Hidden on mobile since we use bottom nav */}
                <div className="mobile-menu-bar d-none d-xl-none" onClick={() => setShow(true)}>
                  <div className="hamberger">
                    <button className="hamberger-button rbt-round-btn">
                      <i className="feather-menu"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={show ? "popup-mobile-menu active" : "popup-mobile-menu"}>
        <div className="inner-wrapper">
          <div className="mobile-menu-header">
            <button className="close-menu" onClick={() => setShow(false)}>
              <i className="feather-x"></i>
            </button>
          </div>
          <ul className="mobile-menu">
            <li><Link to="/" onClick={() => setShow(false)}>Home</Link></li>
            <li><Link to="/view-all-therapist" onClick={() => setShow(false)}>Therapist Directory</Link></li>
            <li className="has-dropdown">
              <Link to="#" onClick={() => setShow(false)}>Services <i className="feather-chevron-down"></i></Link>
              <ul className="submenu">
                <li><Link to="/therapy-booking" onClick={() => setShow(false)}>Therapy Booking</Link></li>
                <li><Link to="/mind-matters" onClick={() => setShow(false)}>Mind Matters Programs</Link></li>
              </ul>
            </li>
            <li className="has-dropdown">
              <Link to="#" onClick={() => setShow(false)}>About <i className="feather-chevron-down"></i></Link>
              <ul className="submenu">
                <li><Link to="/about-us" onClick={() => setShow(false)}>About us</Link></li>
                <li><Link to="/contact-us" onClick={() => setShow(false)}>Contact us</Link></li>
              </ul>
            </li>
            <li><Link to="/faqs" onClick={() => setShow(false)}>Faqs</Link></li>
            <li>
              {userType === 1 || userType === 2 ? (
                <Link to={userType === 1 ? "/my-dashboard" : "/therapist-dashboard"} onClick={() => setShow(false)}>
                  {userType === 1 ? "Profile" : "Therapist Profile"}
                </Link>
              ) : (
                <Link to="/login" onClick={() => setShow(false)}>Sign In/Sign Up</Link>
              )}
            </li>
            <li>
              <Link to="/therapist-registration" onClick={() => setShow(false)}>Are You a Therapist?</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* FAQ Chatbot Widget */}
      {showChatbot && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.3s ease"
          }}
          onClick={() => setShowChatbot(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "450px",
              height: "80%",
              maxHeight: "650px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              animation: "slideUp 0.3s ease"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: "#228756",
                color: "#fff",
                padding: "16px",
                borderRadius: "12px 12px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px"
                  }}
                >
                  <i className="feather-help-circle" style={{ color: "#228756", fontSize: "20px" }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>FAQ Assistant</div>
                  <div style={{ fontSize: "12px", opacity: 0.9 }}>Get instant answers</div>
                </div>
              </div>
              <button
                onClick={() => setShowChatbot(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                ×
              </button>
            </div>

            {/* FAQ Content */}
            <div
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                backgroundColor: "#f8f9fa"
              }}
            >
              <div style={{ marginBottom: "16px", textAlign: "center" }}>
                <div style={{
                  backgroundColor: "#e3f2fd",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1565c0"
                }}>
                  👋 Hi! I'm here to help answer your questions about our therapy services. Click on any question below to get instant answers!
                </div>
              </div>

              {/* FAQ Items */}
              <div style={{ marginBottom: "12px" }}>
                <button
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const content = button.nextElementSibling;
                    const arrow = button.querySelector('.arrow');
                    if (content && arrow) {
                      content.style.display = content.style.display === 'block' ? 'none' : 'block';
                      arrow.style.transform = content.style.display === 'block' ? 'rotate(90deg)' : 'rotate(0deg)';
                    }
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span>How do I book a therapy session?</span>
                  <span className="arrow" style={{ transition: "transform 0.2s", fontSize: "12px" }}>▶</span>
                </button>
                <div style={{
                  display: "none",
                  padding: "12px 16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "0 0 8px 8px",
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  You can book a therapy session by browsing our therapist directory, selecting a therapist that matches your needs, and clicking "Book Appointment". You'll be guided through the process of choosing a date and time that works for you.
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <button
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const content = button.nextElementSibling;
                    const arrow = button.querySelector('.arrow');
                    if (content && arrow) {
                      content.style.display = content.style.display === 'block' ? 'none' : 'block';
                      arrow.style.transform = content.style.display === 'block' ? 'rotate(90deg)' : 'rotate(0deg)';
                    }
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span>What types of therapy do you offer?</span>
                  <span className="arrow" style={{ transition: "transform 0.2s", fontSize: "12px" }}>▶</span>
                </button>
                <div style={{
                  display: "none",
                  padding: "12px 16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "0 0 8px 8px",
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  We offer various types of therapy including Counselling Psychology, Clinical Psychology, and specialized support for stress management, anxiety, depression, relationship counseling, and adolescent guidance.
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <button
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const content = button.nextElementSibling;
                    const arrow = button.querySelector('.arrow');
                    if (content && arrow) {
                      content.style.display = content.style.display === 'block' ? 'none' : 'block';
                      arrow.style.transform = content.style.display === 'block' ? 'rotate(90deg)' : 'rotate(0deg)';
                    }
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span>Are your therapists verified?</span>
                  <span className="arrow" style={{ transition: "transform 0.2s", fontSize: "12px" }}>▶</span>
                </button>
                <div style={{
                  display: "none",
                  padding: "12px 16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "0 0 8px 8px",
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  Yes! All our therapists are verified professionals with proper qualifications and experience. We thoroughly vet each therapist before they join our platform to ensure quality and safety for our clients.
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <button
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const content = button.nextElementSibling;
                    const arrow = button.querySelector('.arrow');
                    if (content && arrow) {
                      content.style.display = content.style.display === 'block' ? 'none' : 'block';
                      arrow.style.transform = content.style.display === 'block' ? 'rotate(90deg)' : 'rotate(0deg)';
                    }
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span>What are your consultation fees?</span>
                  <span className="arrow" style={{ transition: "transform 0.2s", fontSize: "12px" }}>▶</span>
                </button>
                <div style={{
                  display: "none",
                  padding: "12px 16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "0 0 8px 8px",
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  Our therapy sessions are affordably priced starting from ₹500 per session. The exact fees vary depending on the therapist's experience and specialization. You can see the pricing for each therapist in their profile.
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <button
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const content = button.nextElementSibling;
                    const arrow = button.querySelector('.arrow');
                    if (content && arrow) {
                      content.style.display = content.style.display === 'block' ? 'none' : 'block';
                      arrow.style.transform = content.style.display === 'block' ? 'rotate(90deg)' : 'rotate(0deg)';
                    }
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span>Do you offer online therapy?</span>
                  <span className="arrow" style={{ transition: "transform 0.2s", fontSize: "12px" }}>▶</span>
                </button>
                <div style={{
                  display: "none",
                  padding: "12px 16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "0 0 8px 8px",
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  Yes! We offer both online and in-person therapy sessions. You can choose your preferred mode when booking an appointment. Online sessions are conducted through secure video calls.
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <button
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const content = button.nextElementSibling;
                    const arrow = button.querySelector('.arrow');
                    if (content && arrow) {
                      content.style.display = content.style.display === 'block' ? 'none' : 'block';
                      arrow.style.transform = content.style.display === 'block' ? 'rotate(90deg)' : 'rotate(0deg)';
                    }
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span>How do I know which therapist is right for me?</span>
                  <span className="arrow" style={{ transition: "transform 0.2s", fontSize: "12px" }}>▶</span>
                </button>
                <div style={{
                  display: "none",
                  padding: "12px 16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "0 0 8px 8px",
                  fontSize: "14px",
                  lineHeight: "1.5"
                }}>
                  You can browse therapist profiles to see their specializations, experience, and reviews. We recommend considering your specific needs (anxiety, depression, relationships, etc.) and reading therapist profiles to find the best match.
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div
              style={{
                padding: "16px",
                borderTop: "1px solid #e0e0e0",
                backgroundColor: "#fff",
                borderRadius: "0 0 12px 12px"
              }}
            >
              <button
                onClick={() => {
                  window.open('https://wa.me/918077757951?text=Hi, I have a question about your therapy services.', '_blank');
                  setShowChatbot(false);
                }}
                style={{
                  width: "100%",
                  backgroundColor: "#25D366",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <i className="feather-message-circle" style={{ fontSize: "16px" }}></i>
                Still need help? Chat with us on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS */}
      <style jsx>{`
        .top-strip {
          width: 100%;
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
        }
        .top-strip-desktop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #2ecc71;
          color: #fff;
          padding: 0 15px;
          font-size: 14px;
          height: ${GREEN_STRIP_HEIGHT}px;
          line-height: ${GREEN_STRIP_HEIGHT}px;
        }
        .top-strip-desktop .left-info { display: flex; align-items: center; }
        .top-strip-desktop .divider { margin: 0 10px; }
        .top-strip-desktop .right-info { text-align: right; }
        @media (max-width: 991px) { .top-strip-desktop { display: none; } }

        .rbt-header.rbt-header-10 {
          position: sticky;
          top: ${GREEN_STRIP_HEIGHT}px;
          z-index: 10001;
          background: #fff;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
          border-bottom: 1px solid #f0f0f0;
        }
        @media (max-width: 991px) { .rbt-header.rbt-header-10 { top: 0; } }

        /* Mobile Menu */
        .popup-mobile-menu {
          position: fixed;
          top: 0;
          left: -100%;
          width: 80%;
          height: 100%;
          background: #fff;
          z-index: 10010;
          overflow-y: auto;
          transition: all 0.3s ease-in-out;
          box-shadow: 2px 0 12px rgba(0,0,0,0.2);
        }
        .popup-mobile-menu.active { left: 0; }
        .mobile-menu-header { display: flex; justify-content: flex-end; padding: 15px; border-bottom: 1px solid #eee; }
        .mobile-menu { list-style: none; padding: 20px; }
        .mobile-menu li { margin-bottom: 15px; }
        .mobile-menu li a { text-decoration: none; color: #333; font-weight: 500; }
        .mobile-menu .submenu { padding-left: 15px; list-style: disc; }

        /* WhatsApp Chat Widget Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes whatsappPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
          }
        }
      `}</style>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </>
  );
}

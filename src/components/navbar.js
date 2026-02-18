import React, { useEffect } from "react";
import "swiper/css";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import ImageTag from "../utils/image-tag";
import { getDecodedToken, getToken } from "../utils/jwt";
import BottomNavigation from "./bottom-navigation";
import useTherapistStore from "../store/therapistStore";
import { imagePath, defaultProfile } from "../utils/url";

export default function App() {
  const [show, setShow] = React.useState(false);
  const [showChatbot, setShowChatbot] = React.useState(false);
  const [userType, setUserType] = React.useState(0);
  const [activeDropdown, setActiveDropdown] = React.useState("");
  const { therapistInfo, fetchTherapistInfo } = useTherapistStore();

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? "" : name);
  };

  useEffect(() => {
    const data = getToken();
    if (data) {
      const userData = getDecodedToken();
      if (userData.role === 1) {
        setUserType(2);
        fetchTherapistInfo();
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
                  <div className="logo d-flex align-items-center">
                    <Link to="/" style={{ cursor: "pointer" }}>
                      <ImageTag alt="Education Logo Images" height={"40"} width={"120"} src="/assets/img/logo.png" />
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
                        
                        <li><Link to="/plans">Therapy Plan</Link></li>
                      </ul>
                    </li>
                    <li className="has-dropdown">
                      <Link to="#">About <i className="feather-chevron-down"></i></Link>
                      <ul className="submenu">
                        <li><Link to="/about-us">Our Story</Link></li>
                        <li><Link to="/contact-us">Contact us</Link></li>
                         <li><Link to="/faqs">Faqs</Link></li>
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Header Right */}
              <div className="header-right">
                <ul className="quick-access">
                  <li className="account-access rbt-user-wrapper d-none d-xl-block">
                    {userType === 1 || userType === 2 ? (
                      <Link
                        to={userType === 1 ? "/my-dashboard" : "/therapist-dashboard"}
                        className="service-menu-parent d-flex align-items-center gap-2"
                      >
                        {userType === 2 && (
                          <div className="thumbnail rbt-avatars size-xs">
                            <ImageTag
                              alt={therapistInfo.user.name || "Profile"}
                              style={{
                                height: 35,
                                width: 35,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1.5px solid #2ecc71"
                              }}
                              src={therapistInfo.user.profile && therapistInfo.user.profile !== "null" 
                                ? `${imagePath}/${therapistInfo.user.profile}` 
                                : defaultProfile}
                            />
                          </div>
                        )}
                        {userType === 1 && <i className="feather-user"></i>}
                        <span style={{ fontWeight: 600, color: "#228756", fontSize: "14px" }}>
                          {userType === 1 ? "My Profile" : (therapistInfo.user.name || "Therapist Profile")}
                        </span>
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

                {/* Mobile Menu Button - Moved to right corner */}
                <div className="mobile-menu-bar d-flex d-xl-none" onClick={() => setShow(true)}>
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
        <style>{`
          .popup-mobile-menu .inner-wrapper::-webkit-scrollbar {
            display: none;
          }
          .popup-mobile-menu .inner-wrapper {
            scrollbar-width: none;
            -ms-overflow-style: none;
            width: 260px !important;
            padding: 0 !important;
            background: rgba(255, 255, 255, 0.98) !important;
            backdrop-filter: blur(10px);
            border-right: 1px solid rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .mobile-menu-header {
            padding: 20px !important;
            background: transparent;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .popup-mobile-menu .mobile-menu {
            padding: 10px 20px !important;
            flex: 1;
          }
          .popup-mobile-menu .mobile-menu li a {
            font-size: 14px !important;
            font-weight: 500 !important;
            color: #334155 !important;
            padding: 12px 0 !important;
            border-bottom: 1px solid #f1f5f9 !important;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .popup-mobile-menu .mobile-menu li a i {
            font-size: 14px;
            color: #94a3b8;
          }
          .popup-mobile-menu .mobile-menu li.has-dropdown > a::after {
            display: none !important;
          }
          .popup-mobile-menu .mobile-menu .submenu {
            background: #f8fafc !important;
            border-radius: 12px !important;
            margin: 8px 0 !important;
            padding: 8px 12px !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          }
          .popup-mobile-menu .mobile-menu .submenu li a {
            border-bottom: none !important;
            font-size: 13px !important;
            color: #64748b !important;
            padding: 8px 0 !important;
          }
          .nav-ad-banner {
            margin: 20px;
            padding: 16px;
            background: linear-gradient(135deg, #228756 0%, #1a6d45 100%);
            border-radius: 16px;
            color: white;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(34, 135, 86, 0.2);
          }
          .nav-ad-banner::before {
            content: "";
            position: absolute;
            top: -20px;
            right: -20px;
            width: 70px;
            height: 70px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
          }
          .mobile-footer-section {
            padding: 20px;
            background: #f8fafc;
            border-top: 1px solid #f1f5f9;
          }
          .social-links-mobile {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 15px;
          }
          .social-links-mobile a {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
          }
          .social-links-mobile a:hover {
            color: #228756;
            transform: translateY(-2px);
          }
          .contact-pill-mobile {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: white;
            border-radius: 10px;
            margin-bottom: 10px;
            font-size: 12px;
            color: #475569;
            border: 1px solid #f1f5f9;
          }
          .contact-pill-mobile i {
            color: #228756;
          }
        `}</style>
        <div className="inner-wrapper">
          <div className="mobile-menu-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div className="logo">
                <Link to="/" onClick={() => setShow(false)}>
                  <ImageTag alt="Logo" height={"35"} width={"110"} src="/assets/img/logo.png" />
                </Link>
              </div>
              <button className="close-menu" onClick={() => setShow(false)} style={{ background: '#f8fafc', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                <i className="feather-x" style={{ fontSize: '18px', color: '#64748b' }}></i>
              </button>
            </div>
          </div>
          
          <ul className="mobile-menu" style={{ borderTop: 'none' }}>
            <li className="mb-2">
              {userType === 1 || userType === 2 ? (
                <div 
                  style={{ 
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    marginBottom: '10px'
                  }}
                >
                  <Link 
                    to={userType === 1 ? "/my-dashboard" : "/therapist-dashboard"} 
                    onClick={() => setShow(false)}
                    className="d-flex align-items-center gap-3"
                    style={{ borderBottom: 'none !important', padding: '0 !important' }}
                  >
                    <div style={{ position: 'relative' }}>
                      <ImageTag
                        alt="Profile"
                        style={{
                          height: 40,
                          width: 40,
                          borderRadius: "12px",
                          objectFit: "cover",
                          border: "2px solid #fff",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                        }}
                        src={userType === 2 && therapistInfo.user.profile && therapistInfo.user.profile !== "null" 
                          ? `${imagePath}/${therapistInfo.user.profile}` 
                          : defaultProfile}
                      />
                      <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#228756', borderRadius: '50%', border: '2px solid #fff' }}></div>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', display: 'block' }}>
                        {userType === 1 ? "My Profile" : (therapistInfo.user.name || "Therapist")}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>View Dashboard</span>
                    </div>
                  </Link>
                </div>
              ) : (
                <Link to="/login" onClick={() => setShow(false)} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', color: '#228756 !important', fontWeight: '700', justifyContent: 'center' }}>
                  <i className="feather-user" style={{ marginRight: '8px', color: '#228756' }}></i> Sign In / Sign Up
                </Link>
              )}
            </li>

            <li><Link to="/" onClick={() => setShow(false)}>Home <i className="feather-chevron-right"></i></Link></li>
            <li><Link to="/view-all-therapist" onClick={() => setShow(false)}>Therapist Directory <i className="feather-chevron-right"></i></Link></li>
            <li className={`has-dropdown ${activeDropdown === "services" ? "open" : ""}`}>
              <Link to="#" onClick={(e) => { e.preventDefault(); toggleDropdown("services"); }}>
                Services <i className={`feather-chevron-${activeDropdown === "services" ? "up" : "down"}`}></i>
              </Link>
              <ul className="submenu" style={{ display: activeDropdown === "services" ? "block" : "none" }}>
                <li><Link to="/therapy-booking" onClick={() => setShow(false)}>Therapy Booking</Link></li>
                <li><Link to="/plans" onClick={() => setShow(false)}>Therapy Plan</Link></li>
              </ul>
            </li>
            <li className={`has-dropdown ${activeDropdown === "about" ? "open" : ""}`}>
              <Link to="#" onClick={(e) => { e.preventDefault(); toggleDropdown("about"); }}>
                About <i className={`feather-chevron-${activeDropdown === "about" ? "up" : "down"}`}></i>
              </Link>
              <ul className="submenu" style={{ display: activeDropdown === "about" ? "block" : "none" }}>
                <li><Link to="/about-us" onClick={() => setShow(false)}>Our Story</Link></li>
                <li><Link to="/contact-us" onClick={() => setShow(false)}>Contact us</Link></li>
                <li><Link to="/faqs" onClick={() => setShow(false)}>Faqs</Link></li>
              </ul>
            </li>
          </ul>

          <div className="nav-ad-banner">
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>Grow Your Practice</h4>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', marginBottom: '14px', lineHeight: '1.4' }}>India's leading network of verified therapists.</p>
            <Link 
              to="/therapist-registration" 
              onClick={() => setShow(false)}
              style={{ 
                display: 'inline-block',
                background: 'white',
                color: '#228756',
                padding: '8px 20px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              Join Now
            </Link>
          </div>

          <div className="mobile-footer-section">
            <div className="contact-pill-mobile">
              <i className="feather-phone"></i>
              <span>+91-807-775-7951</span>
            </div>
            <div className="contact-pill-mobile">
              <i className="feather-mail"></i>
              <span>info.cyt@gmail.com</span>
            </div>
            
            <div className="social-links-mobile">
              <a href="#"><i className="feather-instagram"></i></a>
              <a href="#"><i className="feather-facebook"></i></a>
              <a href="#"><i className="feather-linkedin"></i></a>
              <a href="#"><i className="feather-twitter"></i></a>
            </div>
          </div>
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
                  window.location.href = 'tel:+918077757951';
                  setShowChatbot(false);
                }}
                style={{
                  width: "100%",
                  backgroundColor: "#228756",
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
                <i className="feather-phone" style={{ fontSize: "16px" }}></i>
                Call Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS */}
      <style>{`
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
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 10010;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease-in-out;
        }
        .popup-mobile-menu.active {
          opacity: 1;
          visibility: visible;
        }
        .popup-mobile-menu .inner-wrapper {
          position: absolute;
          top: 0;
          left: -230px;
          width: 230px !important;
          height: 100%;
          background: #fff !important;
          transition: all 0.3s ease-in-out;
          box-shadow: 2px 0 12px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
        }
        .popup-mobile-menu.active .inner-wrapper {
          left: 0;
        }
        .mobile-menu-header { display: flex; justify-content: flex-end; padding: 15px; border-bottom: 1px solid #eee; }
        .mobile-menu { list-style: none; padding: 20px; flex: 1; overflow-y: auto; }
        .mobile-menu li { margin-bottom: 15px; }
        .mobile-menu li a { text-decoration: none; color: #333; font-weight: 500; }
        .mobile-menu .submenu { padding-left: 15px; list-style: disc; }

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
      `}</style>

      {/* Bottom Navigation for Mobile */}
    </>
  );
}

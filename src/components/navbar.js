import React, { useEffect } from "react";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import { useRouter } from "next/router";
import ImageTag from "../utils/image-tag";
import { getDecodedToken, getToken } from "../utils/jwt";
import useTherapistStore from "../store/therapistStore";
import { imagePath, defaultProfile } from "../utils/url";

const LEAD_STRIP_MESSAGES = [
  { icon: "feather-heart", text: "Feeling anxious or low? Talk to a verified psychologist today.", href: "/view-all-therapist" },
  { icon: "feather-percent", text: "Affordable sessions — no waitlists, no judgment.", href: "/view-all-therapist?sort=fee" },
  { icon: "feather-check-circle", text: "Verified therapists across India, online & in-person.", href: "/view-all-therapist" },
  { icon: "feather-shield", text: "100% confidential sessions. Your privacy, our promise.", href: "/view-all-therapist" },
  { icon: "feather-phone", text: "Book in under 2 minutes — call +91-807-775-7951", href: "tel:+918077757951" },
  { icon: "feather-users", text: "Couples, teens, individuals — therapy for every stage of life.", href: "/view-all-therapist" },
];

const PHONE = "+918077757951";
const WHATSAPP = "https://wa.me/918077757951";

export default function App() {
  const router = useRouter();
  const [show, setShow] = React.useState(false);
  const [stripIdx, setStripIdx] = React.useState(0);
  const [userType, setUserType] = React.useState(0);
  const [activeDropdown, setActiveDropdown] = React.useState("");
  const [isSticky, setIsSticky] = React.useState(false);
  const [showAccountMenu, setShowAccountMenu] = React.useState(false);
  const accountMenuRef = React.useRef(null);
  const { therapistInfo, fetchTherapistInfo } = useTherapistStore();

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? "" : name);
  };

  useEffect(() => {
    if (!showAccountMenu) return;
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setShowAccountMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showAccountMenu]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
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

    // GA4 (G-GFBR3SJQT3) is loaded by the GTM container in _document.js —
    // injecting gtag.js here too downloaded it twice and double-counted
    // page views.

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchTherapistInfo]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setStripIdx((i) => (i + 1) % LEAD_STRIP_MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, []);

  // current page highlighted in the menu
  const path = router?.pathname || "";
  const isActive = (href) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));
  const navCls = (href) => (isActive(href) ? "is-active" : undefined);
  const close = () => setShow(false);

  const GREEN_STRIP_HEIGHT = 35; // desktop

  return (
    <>
      {/* Top Green Strip — running lead-gen ticker */}
      <div className={`top-strip ${isSticky ? "is-stuck" : ""}`}>
        <div className="top-strip-desktop">
          <div className="strip-rot" aria-live="off">
            {LEAD_STRIP_MESSAGES.map((m, i) => {
              const props = { className: `strip-item${i === stripIdx ? " on" : ""}`, tabIndex: i === stripIdx ? 0 : -1, "aria-hidden": i !== stripIdx };
              return m.href.startsWith("tel:")
                ? <a key={i} {...props} href={m.href}><i className={m.icon}></i> {m.text}</a>
                : <Link key={i} {...props} href={m.href}><i className={m.icon}></i> {m.text}</Link>;
            })}
          </div>
          <a className="strip-call" href={`tel:${PHONE}`}><i className="feather-phone"></i> +91 80777 57951</a>
        </div>
      </div>

      {/* Header */}
      <header className={`rbt-header rbt-header-10 ${isSticky ? "header-sticky" : ""}`}>
        <div className={`rbt-header-wrapper ${isSticky ? "rbt-sticky" : "header-space-betwween"}`}>
          <div className="container-fluid">
            <div className="mainbar-row rbt-navigation-start align-items-center">
              <div className="header-left rbt-header-content">
                <div className="header-info">
                  <div className="logo d-flex align-items-center">
                    <Link href="/" style={{ cursor: "pointer" }}>
                      <ImageTag alt="Education Logo Images" height={"55"} width={"165"} src="/assets/img/logo-nav.webp" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="rbt-main-navigation d-none d-lg-block">
                <nav className="mainmenu-nav">
                  <ul className="mainmenu">
                    <li className={navCls("/")}><Link href="/" aria-current={isActive("/") ? "page" : undefined}>Home</Link></li>
                    <li className={navCls("/view-all-therapist")}><Link href="/view-all-therapist" aria-current={isActive("/view-all-therapist") ? "page" : undefined}>Therapist Directory</Link></li>
                    <li className={`has-dropdown ${["/therapy-booking", "/self-assessment", "/psychologist-in-noida-delhi"].some(isActive) ? "is-active" : ""}`}>
                      <a href="#" role="button" aria-haspopup="true" onClick={(e) => e.preventDefault()}>Services <i className="feather-chevron-down"></i></a>
                      <ul className="submenu">
                        <li><Link href="/therapy-booking">Therapy Booking</Link></li>
                        <li><Link href="/self-assessment">Self Assessment</Link></li>
                      <li><Link href="/psychologist-in-noida-delhi">Psychologist in Noida</Link></li>
                      </ul>
                    </li>
                    <li className={navCls("/about-us")}><Link href="/about-us">Our Story</Link></li>
                    <li className={navCls("/for-business")}><Link href="/for-business">Corporate</Link></li>
                    <li className={navCls("/contact-us")}><Link href="/contact-us">Contact us</Link></li>
                  </ul>
                </nav>
              </div>

              {/* Header Right */}
              <div className="header-right">
                <ul className="quick-access">
                  <li className="account-access rbt-user-wrapper d-none d-lg-block">
                    {userType === 1 || userType === 2 ? (
                      <Link
                        href={userType === 1 ? "/my-dashboard" : "/therapist-dashboard"}
                        className="nav-profile-pill"
                      >
                        <span className="nav-profile-av">
                          {userType === 2 ? (
                            <ImageTag
                              alt={therapistInfo.user.name || "Profile"}
                              src={therapistInfo.user.profile && therapistInfo.user.profile !== "null"
                                ? `${imagePath}/${therapistInfo.user.profile}`
                                : defaultProfile}
                            />
                          ) : (
                            <i className="feather-user"></i>
                          )}
                        </span>
                        <span className="nav-profile-name">
                          {userType === 1 ? "My Profile" : (therapistInfo.user.name || "Therapist Profile")}
                        </span>
                      </Link>
                    ) : (
                      <div className="nav-account-dropdown" ref={accountMenuRef}>
                        <button
                          type="button"
                          className="nav-account-trigger"
                          onClick={() => setShowAccountMenu((v) => !v)}
                          aria-expanded={showAccountMenu}
                          aria-haspopup="true"
                        >
                          <span>Account</span>
                          <i className={`feather-chevron-${showAccountMenu ? "up" : "down"}`}></i>
                        </button>
                        {showAccountMenu && (
                          <div className="nav-account-menu">
                            <Link href="/login" onClick={() => setShowAccountMenu(false)}>
                              <i className="feather-log-in"></i> Log In
                            </Link>
                            <Link href="/register" onClick={() => setShowAccountMenu(false)}>
                              <i className="feather-user-plus"></i> Create Account
                            </Link>
                            <Link href="/therapist-registration" onClick={() => setShowAccountMenu(false)} className="nav-acc-sep">
                              <i className="feather-briefcase"></i> Join as a therapist
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                </ul>
                {/* Main CTA is for clients; therapists get a quieter link (and the Account menu).
                    Neither makes sense for a therapist who's already logged in. */}
                {userType !== 2 && (
                  <div className="rbt-btn-wrapper nav-ctas d-none d-lg-flex">
                    <Link className="nav-for-ther" href="/therapist-registration">For therapists</Link>
                    <Link className="nav-cta-btn" href="/view-all-therapist">
                      <i className="feather-search" aria-hidden="true"></i> Find a Therapist
                    </Link>
                  </div>
                )}

                {/* phones: a one-tap way to book next to the menu button */}
                {userType !== 2 && (
                  <Link className="nav-mob-book d-lg-none" href="/view-all-therapist">Book</Link>
                )}

                {/* Mobile Menu Button - Moved to right corner */}
                <div className="mobile-menu-bar d-flex d-lg-none" onClick={() => setShow(true)}>
                  <div className="hamberger">
                    <button className="hamberger-button rbt-round-btn" aria-label="Open menu">
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div className="logo">
                <Link href="/" onClick={() => setShow(false)}>
                  <ImageTag alt="Logo" height={"45"} width={"135"} src="/assets/img/logo-nav.webp" />
                </Link>
              </div>
              <button className="close-menu" onClick={() => setShow(false)} style={{ background: '#f8fafc', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                <i className="feather-x" style={{ fontSize: '18px', color: '#64748b' }}></i>
              </button>
            </div>
          </div>
          
          <ul className="mobile-menu" style={{ borderTop: 'none' }}>
            <li className="profile-section-mobile">
              {userType === 1 || userType === 2 ? (
                <div 
                  style={{ 
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '20px',
                    border: '1.5px solid #f1f5f9',
                  }}
                >
                  <Link 
                    href={userType === 1 ? "/my-dashboard" : "/therapist-dashboard"} 
                    onClick={() => setShow(false)}
                    className="d-flex align-items-center gap-3"
                    style={{ border: 'none !important', padding: '0 !important', background: 'transparent !important', flexDirection: 'row !important' }}
                  >
                    <ImageTag
                      alt="Profile"
                      style={{
                        height: 44,
                        width: 44,
                        borderRadius: "14px",
                        objectFit: "cover",
                        border: "2px solid #fff",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                      }}
                      src={userType === 2 && therapistInfo.user.profile && therapistInfo.user.profile !== "null" 
                        ? `${imagePath}/${therapistInfo.user.profile}` 
                        : defaultProfile}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#1e293b', display: 'block' }}>
                        {userType === 1 ? "My Profile" : (therapistInfo.user.name || "Therapist")}
                      </span>
                      <span style={{ fontSize: '11px', color: '#2ecc71', fontWeight: '700' }}>ONLINE DASHBOARD</span>
                    </div>
                  </Link>
                </div>
              ) : (
                <Link href="/login" onClick={() => setShow(false)}>
                  <i className="feather-user"></i> Sign In / Sign Up
                </Link>
              )}
            </li>

            <li className={navCls("/")}><Link href="/" onClick={close}><i className="feather-home"></i> Home</Link></li>
            <li className={navCls("/view-all-therapist")}><Link href="/view-all-therapist" onClick={close}><i className="feather-users"></i> Therapist Directory</Link></li>
            <li className={navCls("/noida-appointment")}><Link href="/noida-appointment" onClick={close}><i className="feather-map-pin"></i> Book in Noida</Link></li>
            <li className={navCls("/about-us")}><Link href="/about-us" onClick={close}><i className="feather-heart"></i> Our Story</Link></li>
            <li className={navCls("/for-business")}><Link href="/for-business" onClick={close}><i className="feather-briefcase"></i> Corporate</Link></li>
            <li className={navCls("/contact-us")}><Link href="/contact-us" onClick={close}><i className="feather-mail"></i> Contact</Link></li>
            
            <li className={`has-dropdown ${activeDropdown === "services" ? "open" : ""}`}>
              <Link href="#" onClick={(e) => { e.preventDefault(); toggleDropdown("services"); }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="feather-grid" style={{ marginBottom: '0 !important' }}></i>
                  <span>Our Services</span>
                </div>
                <i className={`feather-chevron-${activeDropdown === "services" ? "up" : "down"}`} style={{ color: '#94a3b8' }}></i>
              </Link>
              <ul className="submenu" style={{ display: activeDropdown === "services" ? "block" : "none" }}>
                <li><Link href="/therapy-booking" onClick={close}>Therapy Booking</Link></li>
                <li><Link href="/self-assessment" onClick={close}>Self Assessment</Link></li>
                <li><Link href="/psychologist-in-noida-delhi" onClick={close}>Psychologist in Noida</Link></li>
              </ul>
            </li>
          </ul>

          <div className="mobile-menu-foot">
            {userType !== 2 && <Link className="mm-cta" href="/view-all-therapist" onClick={close}><i className="feather-search"></i> Find a Therapist</Link>}
            <div className="mm-contact">
              <a href={`tel:${PHONE}`}><i className="feather-phone"></i> Call</a>
              <a href={WHATSAPP} target="_blank" rel="noreferrer"><i className="feather-message-circle"></i> WhatsApp</a>
            </div>
            {userType !== 2 && <Link className="mm-ther" href="/therapist-registration" onClick={close}>Are you a therapist? Join us →</Link>}
          </div>
        </div>
      </div>

      {/* CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
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
          align-items: center;
          background: linear-gradient(135deg,#f0cf6e,#d4af37);
          color: #111;
          font-size: 13px;
          font-weight: 500;
          height: ${GREEN_STRIP_HEIGHT}px;
          border-bottom: 2px solid #175c37;
          overflow: hidden;
          position: relative;
        }
        .top-strip-desktop::before,
        .top-strip-desktop::after {
          content: ""; position: absolute; top: 0; bottom: 0; width: 48px; z-index: 2; pointer-events: none;
        }
        .top-strip-desktop::before { left: 0; background: linear-gradient(90deg,#f0cf6e,transparent); }
        .top-strip-desktop::after { right: 0; background: linear-gradient(-90deg,#d4af37,transparent); }
        .top-strip-desktop::before, .top-strip-desktop::after { display: none; }
        .strip-rot { position: relative; flex: 1; height: 100%; }
        .strip-item {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 7px;
          white-space: nowrap; color: inherit; text-decoration: none; font-weight: 600;
          opacity: 0; transform: translateY(6px); transition: opacity .45s ease, transform .45s ease; pointer-events: none;
        }
        .strip-item.on { opacity: 1; transform: none; pointer-events: auto; }
        .strip-item:hover { color: #14532d; text-decoration: underline; }
        .strip-item i { color: #14532d; }
        .strip-call { position: absolute; right: clamp(20px, 3vw, 40px); top: 0; bottom: 0; display: flex; align-items: center; gap: 6px; font-weight: 700; color: #14532d; text-decoration: none; z-index: 3; }
        .strip-call:hover { text-decoration: underline; color: #14532d; }
        @media (max-width: 1199px) { .strip-call { display: none; } }
        @media (prefers-reduced-motion: reduce) { .strip-item { transition: none; } }
        @media (max-width: 991px) { .top-strip-desktop { display: none; } }

        .rbt-header.rbt-header-10 {
          position: sticky;
          top: ${GREEN_STRIP_HEIGHT}px;
          z-index: 10001;
          background: #fff;
          box-shadow: 0 2px 16px rgba(15,61,36,.07);
          border-bottom: 1px solid #dbe3df;
        }
        @media (max-width: 991px) { .rbt-header.rbt-header-10 { top: 0; } }

        /* ── Full-width header, stuck right under the top strip (desktop) ── */
        @media (min-width: 992px) {
          .rbt-header.rbt-header-10 {
            top: ${GREEN_STRIP_HEIGHT}px;
            background: #fff;
            border-bottom: 1px solid #e7efe9;
            box-shadow: 0 6px 20px -12px rgba(15,61,36,.22);
            padding: 0;
          }
          .rbt-header.rbt-header-10 .rbt-header-wrapper {
            background: #fff !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          /* once scrolled, the theme pins the header (position: fixed) — keep the strip
             pinned above it and the header directly under the strip, full width */
          .top-strip.is-stuck { position: fixed; top: 0; left: 0; right: 0; }
          /* scrolled: a slimmer bar leaves more room for the page */
          .rbt-header.rbt-header-10 .rbt-header-wrapper.rbt-sticky { padding-top: 0 !important; padding-bottom: 0 !important; }
          .rbt-header.rbt-header-10 .rbt-header-wrapper.rbt-sticky .mainbar-row { height: 62px; min-height: 0; }
          .rbt-header.rbt-header-10 .rbt-header-wrapper.rbt-sticky .logo img { height: 36px !important; width: auto !important; }
          .rbt-header.rbt-header-10 .rbt-header-wrapper.rbt-sticky {
            top: ${GREEN_STRIP_HEIGHT}px !important;
            border-bottom: 1px solid #e7efe9 !important;
            box-shadow: 0 8px 24px -12px rgba(15,61,36,.30) !important;
            animation: none;
          }
          .rbt-header.rbt-header-10 .rbt-header-wrapper.header-space-betwween { padding-left: 0; padding-right: 0; }
          .rbt-header.rbt-header-10 .rbt-header-wrapper > .container-fluid {
            padding-left: clamp(20px, 3vw, 40px);
            padding-right: clamp(20px, 3vw, 40px);
          }

          /* ── never let the header's contents overlap — at any width or
                browser zoom. Only horizontal spacing is touched; the row's
                vertical rhythm is left exactly as the theme sets it. ── */
          .rbt-header.rbt-header-10 .mainbar-row { flex-wrap: nowrap; gap: 12px; }
          .rbt-header.rbt-header-10 .header-left,
          .rbt-header.rbt-header-10 .header-right { flex: 0 0 auto; }
          .rbt-header.rbt-header-10 .rbt-main-navigation {
            flex: 1 1 auto; min-width: 0; margin-left: 10px !important; margin-right: 10px !important;
          }
          .rbt-header.rbt-header-10 .mainmenu-nav .mainmenu {
            display: flex; align-items: center; flex-wrap: nowrap;
            gap: clamp(4px, 0.9vw, 20px);
          }
          .rbt-header.rbt-header-10 .mainmenu-nav .mainmenu > li { margin: 0 !important; }
          .rbt-header.rbt-header-10 .mainmenu-nav .mainmenu > li > a {
            padding-left: 0 !important; padding-right: 0 !important; white-space: nowrap;
          }

          /* page banners run up behind the header — zoom-safe: a fixed
             over-pull past any possible header height, with a matching pad, so
             the gap under the header stays constant at every zoom level. */
          .cyt-hero,
          .login-banner,
          .reg-banner,
          .sa-banner,
          .contact-banner,
          .reg-client-banner,
          section.tb-banner,
          section.ab-section,
          .vat-banner,
          .ph-banner,
          .pl-banner,
          .intern-banner {
            margin-top: -200px !important;
            padding-top: 216px !important;
          }
        }
        @media (min-width: 1440px) {
          /* bar stays full width; its contents line up with a 1380px column */
          .rbt-header.rbt-header-10 .rbt-header-wrapper > .container-fluid { padding-left: max(40px, calc((100vw - 1380px) / 2)); padding-right: max(40px, calc((100vw - 1380px) / 2)); }
        }

        /* ── Nav link accents (academic green) ────────── */
        .mainmenu-nav .mainmenu > li > a { color: #132a1c !important; font-weight: 600 !important; position: relative; }
        .mainmenu-nav .mainmenu > li.is-active > a { color: #1e7a4c !important; }
        .mainmenu-nav .mainmenu > li.is-active > a::after { content: ""; position: absolute; left: 0; right: 0; top: calc(50% + 13px); height: 2.5px; border-radius: 2px; background: #d4a24c; }
        .mainmenu-nav .mainmenu > li.has-dropdown.is-active > a::after { right: 16px; }
        .mainmenu-nav .mainmenu > li > a:hover,
        .mainmenu-nav .mainmenu > li.has-dropdown:hover > a { color: #166534 !important; }
        .mainmenu-nav .submenu a:hover { color: #166534 !important; }

        /* ── Profile pill (logged in / logged out) ─────── */
        .nav-profile-pill {
          display: flex; align-items: center; gap: 9px;
          padding: 5px 14px 5px 5px; border-radius: 30px;
          border: 1.5px solid #dbe3df; background: #f8faf9;
          text-decoration: none !important; transition: all .18s ease;
        }
        .nav-profile-pill:hover { border-color: #166534; background: #f0fdf4; }
        .nav-profile-av {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          overflow: hidden; display: flex; align-items: center; justify-content: center;
          background: #eef5f1; border: 2px solid #d4af37;
          color: #166534; font-size: 15px;
        }
        .nav-profile-av img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 50%; }
        .nav-profile-name { font-weight: 700; color: #132a1c; font-size: 14.5px; white-space: nowrap; }

        /* ── Account dropdown (logged-out state) ─────────── */
        .nav-account-dropdown { position: relative; }
        .nav-account-trigger {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 30px;
          border: 1.5px solid #dbe3df; background: #f8faf9;
          font-weight: 700; color: #132a1c; font-size: 14px;
          cursor: pointer; transition: all .18s ease;
        }
        .nav-account-trigger:hover,
        .nav-account-trigger[aria-expanded="true"] { border-color: #166534; background: #f0fdf4; color: #166534; }
        .nav-account-trigger i { font-size: 14px; }
        .nav-account-menu {
          position: absolute; top: calc(100% + 10px); right: 0; z-index: 20;
          min-width: 190px; background: #fff; border: 1px solid #e7efe9; border-radius: 14px;
          box-shadow: 0 18px 38px -16px rgba(15,61,36,.3), 0 4px 12px rgba(15,61,36,.08);
          padding: 8px; display: flex; flex-direction: column; gap: 2px;
          animation: navAccountMenuIn .16s ease both;
        }
        @keyframes navAccountMenuIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .nav-account-menu a {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 9px;
          font-weight: 700; font-size: 13.5px; color: #132a1c;
          text-decoration: none !important; transition: background .15s ease;
        }
        .nav-account-menu a:hover { background: #f0fdf4; color: #166534; }
        .nav-account-menu a i { font-size: 15px; color: #166534; flex-shrink: 0; }
        .nav-account-menu a.nav-acc-sep { border-top: 1px solid #eef2f0; border-radius: 0 0 9px 9px; margin-top: 4px; padding-top: 12px; color: #475569; }
        @media (prefers-reduced-motion: reduce) { .nav-account-menu { animation: none; } }

        /* ── Header CTAs: "Find a Therapist" (clients) + a quiet "For therapists" link ── */
        .nav-ctas { align-items: center; gap: 16px; }
        .nav-for-ther { font-size: 13.5px; font-weight: 700; color: #475569 !important; white-space: nowrap; text-decoration: none !important; }
        .nav-for-ther:hover { color: #1e7a4c !important; text-decoration: underline !important; }
        .nav-cta-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          padding: 11px 20px; border-radius: 10px; background: #1e7a4c; color: #fff !important;
          font-weight: 800; font-size: 14px; white-space: nowrap;
          text-decoration: none !important; box-shadow: 0 8px 18px -10px rgba(30,122,76,.8); transition: background .18s ease;
        }
        .nav-cta-btn:hover { background: #186640; }
        .nav-mob-book {
          display: inline-flex; align-items: center; height: 36px; padding: 0 14px; margin-right: 10px; border-radius: 10px;
          background: #1e7a4c; color: #fff !important; font-size: 13.5px; font-weight: 800; text-decoration: none !important;
        }
        .header-right { display: flex; align-items: center; }

        /* ── Tablet landscape (iPad 1024–1194px): same desktop menu, compacted ── */
        @media (min-width: 992px) and (max-width: 1199.98px) {
          .rbt-header.rbt-header-10 { padding: 0 8px; }
          .rbt-header.rbt-header-10 .rbt-header-wrapper > .container-fluid { padding-left: 12px; padding-right: 12px; }
          .rbt-header.rbt-header-10 .mainbar-row { gap: 8px; }
          .rbt-header.rbt-header-10 .logo img { width: 120px !important; height: auto !important; }
          .rbt-header.rbt-header-10 .rbt-main-navigation { margin-left: 4px !important; margin-right: 4px !important; }
          .rbt-header.rbt-header-10 .mainmenu-nav .mainmenu { gap: 14px; }
          .rbt-header.rbt-header-10 .mainmenu-nav .mainmenu > li > a { font-size: 14px !important; }
          .nav-account-trigger { padding: 7px 12px; font-size: 13px; }
          .nav-profile-pill { padding: 4px 10px 4px 4px; }
          .nav-profile-av { width: 30px; height: 30px; }
          .nav-profile-name { font-size: 13px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; }
          .rbt-header.rbt-header-10 .rbt-btn-wrapper { margin-left: 8px; }
          .nav-cta-btn { padding: 9px 13px; font-size: 13px; }
          .nav-for-ther { display: none; }
        }

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
          left: -290px;
          width: 290px !important; max-width: 86vw;
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
        .mobile-menu li.is-active > a { color: #1e7a4c !important; font-weight: 700 !important; }
        .mobile-menu-foot { padding: 14px 18px calc(18px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #eef2f0; display: flex; flex-direction: column; gap: 10px; }
        .mm-cta { display: flex; align-items: center; justify-content: center; gap: 8px; height: 46px; border-radius: 12px; background: #1e7a4c; color: #fff !important; font-weight: 800; font-size: 15px; text-decoration: none !important; }
        .mm-contact { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .mm-contact a { display: flex; align-items: center; justify-content: center; gap: 6px; height: 42px; border-radius: 12px; border: 1.5px solid #dbe5df; color: #14532d !important; font-weight: 700; font-size: 14px; text-decoration: none !important; }
        .mm-ther { text-align: center; font-size: 13px; font-weight: 600; color: #64748b !important; text-decoration: none !important; padding: 4px 0; }

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
      ` }} />

      {/* Bottom Navigation for Mobile */}
    </>
  );
}

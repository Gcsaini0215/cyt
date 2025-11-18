import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getToken } from "../../utils/jwt";

export default function MobileBottomNav() {
  const location = useLocation();
  const isLoggedIn = !!getToken();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // More robust mobile detection that accounts for zoom and device type
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 1024; // Increased from 768 to be more inclusive
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setIsMobile((isMobileDevice || isSmallScreen) && isTouchDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // Don't render if not mobile
  if (!isMobile) {
    return null;
  }

  return (
    <ul className="mobile-bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      display: isMobile ? 'flex' : 'none'
    }}>
      <li className={location.pathname === "/" ? "active" : ""}>
        <Link to="/">
          <i className="feather-home"></i>
          <span>Home</span>
        </Link>
      </li>
      <li className={location.pathname === "/view-all-therapist" ? "active" : ""}>
        <Link to="/view-all-therapist">
          <i className="feather-users"></i>
          <span>Therapists</span>
        </Link>
      </li>
      <li className={location.pathname === "/mind-matters" ? "active" : ""}>
        <Link to="/mind-matters">
          <i className="feather-heart"></i>
          <span>Mind Matters</span>
        </Link>
      </li>
      <li className={location.pathname === "/plans" ? "active" : ""}>
        <Link to="/plans">
          <i className="feather-gift"></i>
          <span>Offers</span>
        </Link>
      </li>
      <li className={isLoggedIn ? (location.pathname.includes("/dashboard") || location.pathname.includes("/my-") ? "active" : "") : (location.pathname === "/login" ? "active" : "")}>
        <Link to={isLoggedIn ? "/my-dashboard" : "/login"}>
          <i className="feather-user"></i>
          <span>{isLoggedIn ? "Profile" : "Login"}</span>
        </Link>
      </li>

      {/* Mobile Navigation Styles */}
      <style>
        {`
          .mobile-bottom-nav {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-top: 1px solid rgba(34, 135, 86, 0.1);
            box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.08);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            padding: 8px 0;
            margin: 0;
            list-style: none;
            justify-content: space-around;
            align-items: center;
            height: 70px;
            max-height: 70px;
            will-change: transform;
            transform: translateZ(0);
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 9999;
          }

          .mobile-bottom-nav li {
            flex: 1;
            text-align: center;
            position: relative;
          }

          .mobile-bottom-nav li a {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 6px 8px;
            text-decoration: none;
            color: #666;
            font-size: 11px;
            font-weight: 500;
            transition: all 0.3s ease;
            border-radius: 12px;
            margin: 0 4px;
            min-height: 54px;
            position: relative;
            overflow: hidden;
          }

          .mobile-bottom-nav li a::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(34, 135, 86, 0.1) 0%, rgba(0, 127, 153, 0.1) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            border-radius: 12px;
          }

          .mobile-bottom-nav li.active a::before {
            opacity: 1;
          }

          .mobile-bottom-nav li a i {
            font-size: 18px;
            margin-bottom: 2px;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
          }

          .mobile-bottom-nav li a span {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            z-index: 1;
          }

          .mobile-bottom-nav li.active a {
            color: #228756;
            transform: translateY(-2px);
          }

          .mobile-bottom-nav li.active a i {
            color: #228756;
            transform: scale(1.1);
          }

          .mobile-bottom-nav li a:hover {
            color: #228756;
            transform: translateY(-1px);
          }

          .mobile-bottom-nav li a:hover i {
            transform: scale(1.05);
          }

          /* Touch-friendly interactions */
          @media (hover: none) and (pointer: coarse) {
            .mobile-bottom-nav li a {
              min-height: 48px;
              padding: 8px 6px;
            }

            .mobile-bottom-nav li a:active {
              transform: scale(0.95);
              transition: transform 0.1s ease;
            }
          }

          /* Safe area for devices with notches */
          @supports (padding-bottom: env(safe-area-inset-bottom)) {
            .mobile-bottom-nav {
              padding-bottom: calc(8px + env(safe-area-inset-bottom));
              height: calc(70px + env(safe-area-inset-bottom));
            }
          }

          /* Hide on landscape orientation for very small screens */
          @media (max-height: 400px) and (orientation: landscape) {
            .mobile-bottom-nav {
              display: none !important;
            }
          }

          /* Better visibility on zoom */
          @media (max-width: 1024px) {
            .mobile-bottom-nav {
              display: flex !important;
            }
          }

          /* Ensure navigation stays at bottom and doesn't overlap content */
          html, body {
            overflow-x: hidden;
          }

          @media (max-width: 1024px) {
            html, body {
              padding-bottom: 80px;
            }
          }

          @media (min-width: 1025px) {
            .mobile-bottom-nav {
              display: none !important;
            }
            html, body {
              padding-bottom: 0;
            }
          }
        `}
      </style>
    </ul>
  );
}

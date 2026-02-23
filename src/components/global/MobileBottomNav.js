import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
;
import { getToken } from "../../utils/jwt";

export default function MobileBottomNav() {
  ;
  const isLoggedIn = !!getToken();
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollRef = useRef(0);
  const scrollTimeoutRef = useRef(null);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (currentScroll > lastScrollRef.current && currentScroll > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        lastScrollRef.current = currentScroll;
      }, 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
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
      display: isMobile ? 'flex' : 'none',
      transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <li className={router.pathname === "/" ? "active" : ""}>
        <Link href="/">
          <i className="feather-home"></i>
          <span>Home</span>
        </Link>
      </li>
      <li className={router.pathname === "/view-all-therapist" ? "active" : ""}>
        <Link href="/view-all-therapist">
          <i className="feather-users"></i>
          <span>Therapists</span>
        </Link>
      </li>
      <li className={router.pathname === "/mind-matters" ? "active" : ""}>
        <Link href="/mind-matters">
          <i className="feather-heart"></i>
          <span>Mind Matters</span>
        </Link>
      </li>
      <li className={router.pathname === "/plans" ? "active" : ""}>
        <Link href="/plans">
          <i className="feather-gift"></i>
          <span>Offers</span>
        </Link>
      </li>
      <li className={isLoggedIn ? (router.pathname.includes("/dashboard") || router.pathname.includes("/my-") ? "active" : "") : (router.pathname === "/login" ? "active" : "")}>
        <Link href={isLoggedIn ? "/my-dashboard" : "/login"}>
          <i className="feather-user"></i>
          <span>{isLoggedIn ? "Profile" : "Login"}</span>
        </Link>
      </li>

      {/* Mobile Navigation Styles */}
      <style>
        {`
          .mobile-bottom-nav {
            background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,249,250,0.98) 100%);
            border-top: 2px solid rgba(34, 135, 86, 0.15);
            box-shadow: 0 -4px 32px rgba(34, 135, 86, 0.12), 0 -2px 8px rgba(0, 0, 0, 0.06);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 6px 0;
            margin: 0;
            list-style: none;
            justify-content: space-around;
            align-items: center;
            height: 68px;
            max-height: 68px;
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
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .mobile-bottom-nav li a {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 10px;
            text-decoration: none;
            color: #888;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            border-radius: 14px;
            margin: 0 6px;
            min-height: 56px;
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
            background: linear-gradient(135deg, rgba(34, 135, 86, 0.15) 0%, rgba(34, 135, 86, 0.08) 100%);
            opacity: 0;
            transition: opacity 0.35s ease;
            border-radius: 14px;
          }

          .mobile-bottom-nav li.active a::before {
            opacity: 1;
          }

          .mobile-bottom-nav li a i {
            font-size: 20px;
            margin-bottom: 4px;
            transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
            z-index: 1;
            color: inherit;
          }

          .mobile-bottom-nav li a span {
            font-size: 10px;
            font-weight: 700;
            text-transform: capitalize;
            letter-spacing: 0.3px;
            position: relative;
            z-index: 1;
            color: inherit;
          }

          .mobile-bottom-nav li.active a {
            color: #228756;
            transform: translateY(-3px) scale(1.02);
          }

          .mobile-bottom-nav li.active a i {
            color: #228756;
            transform: scale(1.15) rotate(5deg);
            filter: drop-shadow(0 2px 4px rgba(34, 135, 86, 0.3));
          }

          .mobile-bottom-nav li a:hover {
            color: #228756;
            transform: translateY(-2px);
          }

          .mobile-bottom-nav li a:hover i {
            transform: scale(1.1);
          }

          /* Touch-friendly interactions */
          @media (hover: none) and (pointer: coarse) {
            .mobile-bottom-nav li a {
              min-height: 52px;
              padding: 10px 8px;
            }

            .mobile-bottom-nav li a:active {
              transform: scale(0.92);
              transition: transform 0.1s ease;
            }

            .mobile-bottom-nav li.active a:active {
              transform: scale(0.95) translateY(-2px);
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

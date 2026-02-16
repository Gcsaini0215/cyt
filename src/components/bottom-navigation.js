import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getDecodedToken, getToken } from "../utils/jwt";

export default function BottomNavigation() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [userType, setUserType] = useState(0);
  const [cookiesAccepted, setCookiesAccepted] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === "undefined") return;
      // Comprehensive mobile detection - show on all mobile/tablet devices
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1200;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      // Always show on mobile devices, touch devices, iOS, or small screens
      setIsMobile(isMobileDevice || isTouchDevice || isIOS || isSmallScreen);
    };

    checkMobile();
    if (typeof window !== "undefined") {
      window.addEventListener('resize', checkMobile);
      window.addEventListener('orientationchange', checkMobile);
    }

    const data = getToken();
    if (data) {
      const userData = getDecodedToken();
      if (userData.role === 1) {
        setUserType(2);
      } else {
        setUserType(1);
      }
    }

    // Always consider cookies as accepted on mobile
    setCookiesAccepted(true);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('resize', checkMobile);
        window.removeEventListener('orientationchange', checkMobile);
      }
    };
  }, []);

  const locationPathname = location.pathname;

  // Don't render if not mobile
  if (!isMobile) return null;

  const profilePath = userType === 1 ? "/my-dashboard" : userType === 2 ? "/therapist-dashboard" : "/login";

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: "feather-home",
      path: "/",
      active: locationPathname === "/"
    },
    {
      id: "therapists",
      label: "Therapists",
      icon: "feather-users",
      path: "/view-all-therapist",
      active: locationPathname === "/view-all-therapist"
    },
    {
      id: "book",
      label: "Book",
      icon: "feather-phone",
      path: "/therapy-booking",
      active: locationPathname === "/therapy-booking"
    },
    {
      id: "profile",
      label: userType === 0 ? "Login" : "Profile",
      icon: userType === 0 ? "feather-log-in" : "feather-user",
      path: profilePath,
      active: locationPathname === "/my-dashboard" || locationPathname === "/therapist-dashboard" || locationPathname === "/login"
    },
    {
      id: "offer",
      label: "Offer",
      icon: "feather-package",
      path: "/mind-matters",
      active: locationPathname === "/mind-matters"
    }
  ];

  return (
    <div className={`bottom-navigation ${!cookiesAccepted ? 'with-cookie-banner' : ''}`}>
      <div className="bottom-nav-container">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`bottom-nav-item ${item.active ? 'active' : ''}`}
          >
            <div className="nav-icon">
              <i className={item.icon}></i>
            </div>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
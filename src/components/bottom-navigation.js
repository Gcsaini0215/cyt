import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getDecodedToken, getToken } from "../utils/jwt";
import "./bottom-navigation.css";

export default function BottomNavigation() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [userType, setUserType] = useState(0);
  const [cookiesAccepted, setCookiesAccepted] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      // Comprehensive mobile detection - show on all mobile/tablet devices
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1200;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      // Always show on mobile devices, touch devices, iOS, or small screens
      setIsMobile(isMobileDevice || isTouchDevice || isIOS || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

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
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // Don't render if not mobile
  return null;

  const profilePath = userType === 1 ? "/my-dashboard" : userType === 2 ? "/therapist-dashboard" : "/login";

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: "feather-home",
      path: "/",
      active: location.pathname === "/"
    },
    {
      id: "therapists",
      label: "Therapists",
      icon: "feather-users",
      path: "/view-all-therapist",
      active: location.pathname === "/view-all-therapist"
    },
    {
      id: "book",
      label: "Book",
      icon: "feather-phone",
      path: "/therapy-booking",
      active: location.pathname === "/therapy-booking"
    },
    {
      id: "profile",
      label: userType === 0 ? "Login" : "Profile",
      icon: userType === 0 ? "feather-log-in" : "feather-user",
      path: profilePath,
      active: location.pathname === "/my-dashboard" || location.pathname === "/therapist-dashboard" || location.pathname === "/login"
    },
    {
      id: "offer",
      label: "Offer",
      icon: "feather-package",
      path: "/mind-matters",
      active: location.pathname === "/mind-matters"
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
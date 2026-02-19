import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookie_consent_accepted");
    if (!hasAccepted) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent_accepted", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        .cookie-consent-wrapper {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: #1a202c;
          color: #ffffff;
          padding: 15px 0;
          z-index: 9999;
          box-shadow: 0 -5px 25px rgba(0,0,0,0.15);
          animation: slideUp 0.5s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .cookie-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          gap: 40px;
        }

        .cookie-content {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .cookie-icon {
          font-size: 24px;
          color: #228756;
        }

        .cookie-text {
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
          color: #cbd5e0;
          font-weight: 400;
        }

        .cookie-text a {
          color: #228756;
          text-decoration: underline;
          font-weight: 600;
        }

        .cookie-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-shrink: 0;
        }

        .btn-accept {
          background: #228756;
          color: white;
          border: none;
          padding: 8px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-accept:hover {
          background: #1a6d45;
          transform: translateY(-2px);
        }

        @media (max-width: 991px) {
          .cookie-container {
            flex-direction: column;
            gap: 15px;
            text-align: center;
            padding: 0 20px;
          }
          
          .cookie-content {
            flex-direction: column;
          }
          
          .cookie-text {
            font-size: 13px;
          }

          .cookie-actions {
            width: 100%;
            justify-content: center;
          }

          .btn-accept {
            width: 100%;
            padding: 12px;
          }
        }
      `}</style>
      <div className="cookie-consent-wrapper">
        <div className="cookie-container">
          <div className="cookie-content">
            <div className="cookie-icon">
              <i className="feather-shield"></i>
            </div>
            <p className="cookie-text">
              We use cookies to enhance your experience, analyze site traffic, and provide secure therapy services. 
              By continuing to browse, you agree to our <Link to="/privacy-policy">Privacy Policy</Link> and <Link to="/terms-conditions">Terms of Service</Link>.
            </p>
          </div>
          <div className="cookie-actions">
            <button className="btn-accept" onClick={handleAccept}>
              Accept Cookies
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

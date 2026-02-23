import React from "react";

const PremiumLoader = () => {
  return (
    <div className="premium-loader-container">
      <div className="loader-content">
        <div className="logo-wrapper">
          <img 
            src="/favicon.png" 
            alt="Logo" 
            className="loader-logo"
            width="60"
            height="60"
          />
          <div className="loader-spinner"></div>
        </div>
        <div className="loader-text-wrapper">
          <h3 className="loader-title">Choose Your Therapist</h3>
          <p className="loader-subtitle">Healing starts with your choice...</p>
        </div>
      </div>

      <style>{`
        .premium-loader-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #ffffff;
          z-index: 99999;
        }

        .loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .logo-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 120px;
          height: 120px;
        }

        .loader-logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
          z-index: 2;
          animation: pulse 2s infinite ease-in-out;
        }

        .loader-spinner {
          position: absolute;
          width: 110px;
          height: 110px;
          border: 3px solid rgba(34, 135, 86, 0.1);
          border-top: 3px solid #228756;
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
        }

        .loader-text-wrapper {
          text-align: center;
          animation: fadeInUp 1s ease-out;
        }

        .loader-title {
          font-size: 24px;
          font-weight: 700;
          color: #228756;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .loader-subtitle {
          font-size: 16px;
          color: #666;
          font-weight: 500;
          font-style: italic;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumLoader;

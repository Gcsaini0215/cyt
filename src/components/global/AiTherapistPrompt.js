import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SparklesIcon from "@mui/icons-material/AutoAwesome";

export default function AiTherapistPrompt() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Show after 2 seconds on home page or specific pages
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timer);
    };
  }, []);

  if (!isMobile || !isVisible || router.pathname === "/ai-chat") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "68px", // Exactly above MobileBottomNav (height: 68px)
        left: 0,
        right: 0,
        zIndex: 9998,
        padding: "0 10px 10px", // Padding for internal spacing
        animation: "slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "20px",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          boxShadow: "0 -10px 30px rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          cursor: "pointer",
        }}
        onClick={() => router.push("/ai-chat")}
      >
        {/* Header with Circle Image (Favicon) */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "2px solid #2ecc71",
              padding: "2px",
              background: "#fff",
              flexShrink: 0,
              overflow: "hidden"
            }}
          >
            <img 
              src="/favicon.png" 
              alt="AI Therapist" 
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontSize: "14px", fontWeight: "800", lineHeight: "1" }}>
              AI Therapist
              <span style={{ 
                marginLeft: "8px", 
                fontSize: "9px", 
                background: "#2ecc71", 
                color: "#fff",
                padding: "2px 6px", 
                borderRadius: "10px",
                verticalAlign: "middle"
              }}>LIVE</span>
            </div>
            <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "11px", fontWeight: "500", marginTop: "4px" }}>
              Online & ready to listen...
            </div>
          </div>
          <div style={{ 
            background: "rgba(46, 204, 113, 0.15)", 
            padding: "5px", 
            borderRadius: "50%",
            display: "flex"
          }}>
            <SparklesIcon style={{ color: "#2ecc71", fontSize: "16px" }} />
          </div>
        </div>

        {/* Fake Input Box */}
        <div 
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}
        >
          <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "13px", fontWeight: "400" }}>
            Start typing your message...
          </span>
          <div style={{ 
            background: "#2ecc71", 
            borderRadius: "50%", 
            width: "28px", 
            height: "28px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 0 10px rgba(46, 204, 113, 0.4)"
          }}>
            <i className="feather-send" style={{ color: "#fff", fontSize: "12px" }}></i>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

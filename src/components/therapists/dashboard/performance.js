import React, { useEffect } from "react";
import useTherapistStore from "../../../store/therapistStore";

export default function DashboardSections() {
  const { therapistInfo } = useTherapistStore();

  useEffect(() => {
    const container = document.getElementById("shape-container");
    if (!container) return;
    const colors = ["rgba(89, 200, 47, 0.15)", "rgba(34, 135, 86, 0.15)"];
    for (let i = 0; i < 6; i++) {
      const shape = document.createElement("div");
      shape.className = "floating-shape";
      shape.style.width = 100 + Math.random() * 80 + "px";
      shape.style.height = 100 + Math.random() * 80 + "px";
      shape.style.left = Math.random() * 90 + "%";
      shape.style.top = Math.random() * 90 + "%";
      shape.style.background = colors[Math.floor(Math.random() * colors.length)];
      shape.style.borderRadius = "50%";
      shape.style.filter = "blur(40px)";
      shape.style.animationDuration = 8 + Math.random() * 10 + "s";
      container.appendChild(shape);
    }
  }, []);

  return (
    <div style={{ position: "relative", marginBottom: "30px" }}>
      <div id="shape-container" style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none", overflow: "hidden", zIndex: 0 }}></div>
      
      {/* Elite Professional Banner */}
      <div 
        style={{
          background: "linear-gradient(135deg, #228756 0%, #1b6843 100%)",
          borderRadius: "20px",
          padding: "40px 32px",
          color: "#ffffff",
          boxShadow: "0 15px 35px rgba(27, 104, 67, 0.25)",
          position: "relative",
          overflow: "hidden",
          zIndex: 1
        }}
      >
        {/* Decorative Overlay Pattern */}
        <div style={{ 
          position: "absolute", 
          top: 0, 
          right: 0, 
          bottom: 0, 
          width: "40%", 
          background: "radial-gradient(circle at top right, rgba(89, 200, 47, 0.2), transparent 70%)",
          zIndex: 0 
        }}></div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <div>
            <span style={{ 
              fontSize: "0.9rem", 
              textTransform: "uppercase", 
              letterSpacing: "1.5px", 
              fontWeight: "600", 
              color: "#59c82f",
              display: "block",
              marginBottom: "8px"
            }}>
              Therapist Dashboard
            </span>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#ffffff", lineHeight: "1.2" }}>
              Welcome back, {therapistInfo?.user?.name || "Therapist"} {therapistInfo?.profile_type && `(${therapistInfo.profile_type})`}
            </h2>
          </div>
        </div>

        {/* Abstract Iconography Placeholder */}
        <div style={{ 
          position: "absolute", 
          right: "-20px", 
          bottom: "-20px", 
          opacity: 0.1, 
          fontSize: "12rem", 
          transform: "rotate(-15deg)",
          pointerEvents: "none"
        }}>
          <i className="fa-solid fa-hand-holding-heart"></i>
        </div>
      </div>

      <style>{`
        .floating-shape {
          position: absolute;
          z-index: 0;
          animation: float 10s infinite ease-in-out;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -30px); }
        }
      `}</style>
    </div>
  );
}

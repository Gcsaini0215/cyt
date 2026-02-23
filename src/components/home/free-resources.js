import React from "react";
import Link from "next/link";
import useMediaQuery from "@mui/material/useMediaQuery";
import { 
  FiPlayCircle, 
  FiBookOpen, 
  FiBarChart2, 
  FiWind,
  FiArrowRight
} from "react-icons/fi";

export default function FreeResources() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const tools = [
    {
      title: "Guided Meditation",
      desc: "Instant calm with our curated 5-minute audio sessions.",
      icon: <FiPlayCircle />,
      color: "#228756",
      tag: "Audio"
    },
    {
      title: "Daily Journal",
      desc: "Science-backed prompts to help you process your day.",
      icon: <FiBookOpen />,
      color: "#007f99",
      tag: "PDF"
    },
    {
      title: "Mood Tracker",
      desc: "Visualize your emotions and identify patterns over time.",
      icon: <FiBarChart2 />,
      color: "#f59e0b",
      tag: "Tool"
    },
    {
      title: "Breathing Guide",
      desc: "Interactive exercises to manage anxiety in real-time.",
      icon: <FiWind />,
      color: "#6366f1",
      tag: "Interactive"
    }
  ];

  return (
    <div className="rbt-free-resources-area rbt-section-gap" style={{
      background: '#1a4d32',
      padding: isMobile ? '80px 0' : '120px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="row g-3 g-lg-4">
          {tools.map((tool, index) => (
            <div key={index} className="col-6 col-lg-3">
              <div className="resource-card" style={{
                background: '#ffffff',
                padding: isMobile ? '20px' : '35px',
                borderRadius: isMobile ? '24px' : '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMobile ? 'center' : 'flex-start',
                textAlign: isMobile ? 'center' : 'left',
                gap: isMobile ? '18px' : '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.8)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                height: '100%'
              }}>
                <div style={{
                  width: isMobile ? '56px' : '72px',
                  height: isMobile ? '56px' : '72px',
                  borderRadius: isMobile ? '16px' : '20px',
                  background: `${tool.color}18`,
                  color: tool.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '28px' : '36px',
                  flexShrink: 0,
                  border: `1px solid ${tool.color}30`
                }}>
                  {tool.icon}
                </div>
                <div style={{ flexGrow: 1, width: '100%' }}>
                  {!isMobile && (
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: '700', 
                      color: tool.color, 
                      textTransform: 'uppercase',
                      background: `${tool.color}15`,
                      padding: '4px 12px',
                      borderRadius: '50px',
                      marginBottom: '10px',
                      display: 'inline-block'
                    }}>
                      {tool.tag}
                    </span>
                  )}
                  <h3 style={{ 
                    fontSize: isMobile ? '1.2rem' : '1.8rem', 
                    fontWeight: '800', 
                    color: '#1e293b',
                    marginBottom: '5px'
                  }}>
                    {tool.title}
                  </h3>
                  <p style={{ 
                    fontSize: isMobile ? '0.9rem' : '1.1rem', 
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.4',
                    display: isMobile ? '-webkit-box' : 'block',
                    WebkitLineClamp: isMobile ? 2 : 'none',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {tool.desc}
                  </p>
                </div>
                {!isMobile && (
                  <div className="arrow-icon" style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: '#94a3b8',
                    transition: 'all 0.3s ease'
                  }}>
                    <FiArrowRight />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wave transition at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        lineHeight: 0,
        zIndex: 1
      }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '60px', fill: '#f0fdf4' }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V120c68.47-14.46,140.24-21.41,210.45-12.09,60.2,8,118,25.43,178.61,23.32,54.12-1.89,103.52-21,154.77-33.87,51.25-12.87,105.15-20.41,158-11.88,52.85,8.53,101.45,34.1,153.6,33.56,52.15-.54,101.52-25.13,153.37-23.07C1100.86,110.15,1151,126.31,1200,120V120H0V120Z"></path>
        </svg>
      </div>

      <style>{`
        .resource-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.08) !important;
          border-color: rgba(34, 135, 86, 0.2) !important;
        }
        .resource-card:hover .arrow-icon {
          background: #228756;
          border-color: #228756;
          color: white;
          transform: translateX(5px);
        }
      `}</style>
    </div>
  );
}

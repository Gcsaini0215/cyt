import React from "react";
import { Link } from "react-router-dom";
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
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      padding: isMobile ? '60px 0' : '100px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div className="row mb--40">
          <div className="col-lg-12 text-center">
            <span className="subtitle" style={{ 
              color: '#228756', 
              fontWeight: '700', 
              fontSize: '1rem', 
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              display: 'block',
              marginBottom: '15px'
            }}>
              Complimentary Tools
            </span>
            <h2 className="title" style={{ 
              fontSize: isMobile ? "2.5rem" : "4rem", 
              fontWeight: "900", 
              color: "#1e293b",
              lineHeight: isMobile ? '3rem' : '1.1',
              maxWidth: '900px',
              margin: '0 auto 20px',
              whiteSpace: "normal"
            }}>
              Your Journey to <span style={{ 
                backgroundImage: "linear-gradient(135deg, #228756 0%, #10b981 50%, #007f99 100%)", 
                WebkitBackgroundClip: "text", 
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent"
              }}>Healing</span> Starts for Free
            </h2>
            <p style={{ 
              fontSize: isMobile ? '1.3rem' : '1.5rem', 
              color: '#64748b', 
              maxWidth: '800px', 
              margin: '0 auto',
              fontWeight: '500'
            }}>
              Access professional-grade mental health resources without spending a rupee.
            </p>
          </div>
        </div>

        <div className="row g-3 g-lg-4">
          {tools.map((tool, index) => (
            <div key={index} className="col-6 col-lg-3">
              <div className="resource-card" style={{
                background: '#ffffff',
                padding: isMobile ? '15px' : '30px',
                borderRadius: isMobile ? '20px' : '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMobile ? 'center' : 'flex-start',
                textAlign: isMobile ? 'center' : 'left',
                gap: isMobile ? '15px' : '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                height: '100%'
              }}>
                <div style={{
                  width: isMobile ? '50px' : '64px',
                  height: isMobile ? '50px' : '64px',
                  borderRadius: isMobile ? '12px' : '16px',
                  background: `${tool.color}10`,
                  color: tool.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '24px' : '30px',
                  flexShrink: 0
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

        <div className="row mt--80">
          <div className="col-lg-12 text-center">
            <Link
              className="rbt-btn btn-gradient btn-sm hover-icon-reverse"
              to={"/resources"}
            >
              <span className="icon-reverse-wrapper">
                <span className="btn-text">Explore All Free Resources</span>

                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
              </span>
            </Link>
          </div>
        </div>
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

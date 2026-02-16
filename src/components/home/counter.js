import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useInView } from "react-intersection-observer";
import { 
  FiBarChart2, 
  FiActivity, 
  FiPieChart,
  FiTrendingUp
} from "react-icons/fi";

const AnimatedNumber = ({ value, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = parseInt(value);
      if (start === end) return;

      let totalMiliseconds = duration;
      let incrementTime = (totalMiliseconds / end);

      let timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export default function MentalHealthData() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const dataPoints = [
    {
      value: "150",
      suffix: "M+",
      title: "Treatment Gap",
      desc: "Indians need active mental health interventions, yet 70-92% remain untreated (NMHS).",
      icon: <FiPieChart />,
      color: "#228756",
      bg: "rgba(34, 135, 86, 0.08)",
      link: "https://indianjournalpsychiatry.org/showbacktrack.asp?issn=0019-5545;year=2017;volume=59;issue=1;spage=21;epage=26;aulast=Gautham"
    },
    {
      value: "15",
      suffix: "%",
      title: "Disease Burden",
      desc: "Of the global disease burden will be mental health related by 2030 (WHO).",
      icon: <FiActivity />,
      color: "#007f99",
      bg: "rgba(0, 127, 153, 0.08)",
      link: "https://www.who.int/india/health-topics/mental-health"
    },
    {
      value: "20",
      suffix: "X",
      title: "Economic Impact",
      desc: "Investment in mental health yields up to a 4x return in productivity and health (WHO).",
      icon: <FiTrendingUp />,
      color: "#6366f1",
      bg: "rgba(99, 102, 241, 0.08)",
      link: "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response"
    },
    {
      value: "450",
      suffix: "M",
      title: "Global Context",
      desc: "People globally live with mental disorders, making it a leading cause of ill-health.",
      icon: <FiBarChart2 />,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.08)",
      link: "https://www.who.int/news/item/28-09-2001-the-world-health-report-2001-mental-disorders-affect-one-in-four-people"
    }
  ];

  return (
    <div className="rbt-mental-data-area rbt-section-gap" style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '120px 0'
    }}>
      {/* Subtle Data Grid Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.3,
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row g-5 align-items-center">
          <div className="col-lg-5">
            <div className="section-title text-start">
              <span className="subtitle" style={{ 
                background: '#228756', 
                color: '#ffffff', 
                padding: '8px 20px', 
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                Strategic Insights
              </span>
              <h2 className="title" style={{ 
                fontSize: isMobile ? "2.2rem" : "4.2rem", 
                fontWeight: "900", 
                color: "#1e293b",
                lineHeight: '1.1',
                marginBottom: '25px'
              }}>
                Why Proactive <span style={{ 
                  backgroundImage: "linear-gradient(135deg, #228756 0%, #007f99 100%)", 
                  WebkitBackgroundClip: "text", 
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent"
                }}>Therapy</span> Matters
              </h2>
              <p style={{ 
                fontSize: isMobile ? '1.1rem' : '1.3rem', 
                color: '#64748b', 
                lineHeight: '1.7',
                marginBottom: '40px'
              }}>
                Mental health is no longer just a personal issue—it's a critical factor in professional success and global economic stability. Don't wait for a crisis to seek professional support.
              </p>
              
              <div style={{ 
                padding: '25px', 
                background: '#ffffff', 
                borderRadius: '24px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
              }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>
                  The Cost of Inaction
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px' }}>
                  Untreated mental health issues cost the global economy nearly $1 Trillion annually in lost productivity.
                </p>
                <Link to="/view-all-therapist" className="rbt-btn btn-gradient btn-sm">
                  <span className="btn-text">Invest in Your Mindset</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="row g-4">
              {dataPoints.map((item, index) => (
                <div key={index} className="col-md-6">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="data-card" style={{
                    background: '#ffffff',
                    padding: '40px 30px',
                    borderRadius: '28px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    transition: 'all 0.4s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textDecoration: 'none'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: item.bg,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      marginBottom: '25px'
                    }}>
                      {item.icon}
                    </div>
                    
                    <div style={{ 
                      fontSize: '3.5rem', 
                      fontWeight: '900', 
                      color: '#1e293b', 
                      lineHeight: 1, 
                      marginBottom: '10px',
                      letterSpacing: '-2px'
                    }}>
                      <AnimatedNumber value={item.value} suffix={item.suffix} />
                    </div>

                    <h4 style={{ fontSize: '1.4rem', fontWeight: '800', color: item.color, marginBottom: '12px' }}>
                      {item.title}
                    </h4>
                    
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                      {item.desc}
                    </p>
                    
                    <span style={{ 
                      marginTop: 'auto', 
                      paddingTop: '15px', 
                      fontSize: '12px', 
                      color: '#228756', 
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      Source: {item.title === 'Treatment Gap' ? 'NMHS' : 'WHO'} <i className="feather-external-link"></i>
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .data-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.06) !important;
          border-color: #22875633 !important;
        }
      `}</style>
    </div>
  );
}

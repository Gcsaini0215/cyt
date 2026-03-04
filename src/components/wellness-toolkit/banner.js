import React from "react";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { TypeAnimation } from "react-type-animation";

const styles = `
.wellness-banner {
  position: relative;
  background-image: url('https://i.postimg.cc/dVCjtJTQ/home_slider_01.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 140px 0 100px 0;
  overflow: hidden;
  margin-top: 0px;
}

.wellness-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1;
}

.wellness-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(34, 135, 86, 0.3);
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
  border: 1px solid rgba(34, 135, 86, 0.5);
  backdrop-filter: blur(4px);
}

.wellness-title {
  font-size: 48px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.wellness-animated-text {
  color: #2ecc71;
  display: inline-block;
  min-width: 280px;
  text-align: left;
}

.wellness-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.floating-icon {
  position: absolute;
  color: rgba(46, 204, 113, 0.1);
  z-index: 0;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.float-1 { top: 20%; left: 10%; animation: float 6s ease-in-out infinite; }
.float-2 { bottom: 20%; right: 10%; animation: float 8s ease-in-out infinite; }

@media (max-width: 768px) {
  .wellness-banner { 
    padding: 100px 0 60px 0;
    background-attachment: scroll;
  }
  .wellness-title { font-size: 32px; }
  .wellness-subtitle { font-size: 16px; }
  .wellness-animated-text { min-width: 100%; text-align: center; }
}
`;

export default function WellnessToolkitBanner() {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <>
      <style>{styles}</style>
      <section className="wellness-banner">
        <LocalLibraryIcon className="floating-icon float-1" sx={{ fontSize: 100 }} />
        <AutoFixHighIcon className="floating-icon float-2" sx={{ fontSize: 120 }} />
        
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="wellness-badge">
              <AutoFixHighIcon sx={{ fontSize: 18 }} />
              <span>Free Mental Health Resources</span>
            </div>
            
            <h1 className="wellness-title">
              Your Wellness, <br /> 
              <span className="wellness-animated-text">
                <TypeAnimation
                  sequence={[
                    "In Your Hands",
                    2000,
                    "Always Free",
                    2000,
                    "Starting Today",
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
            </h1>
            
            <p className="wellness-subtitle">
              Explore our curated collection of free tools designed to support your 
              mental well-being journey. From grounding exercises to mood tracking, 
              find everything you need to manage your daily mental health.
            </p>
          </Box>
        </Container>
      </section>
    </>
  );
}

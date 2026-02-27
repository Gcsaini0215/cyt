import React from "react";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import InfoIcon from "@mui/icons-material/Info";
import { TypeAnimation } from "react-type-animation";

const styles = `
.about-banner {
  position: relative;
  background-image: url('https://i.postimg.cc/dVCjtJTQ/home_slider_01.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 140px 0 100px 0;
  overflow: hidden;
  margin-top: 0px;
}

.about-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.about-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
}

.about-title {
  font-size: 48px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.about-animated-text {
  color: #4ade80;
  display: inline-block;
  min-width: 250px;
  text-align: left;
}

.about-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.floating-icon {
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
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
  .about-banner { 
    padding: 100px 0 60px 0;
    background-attachment: scroll;
  }
  .about-title { font-size: 32px; }
  .about-subtitle { font-size: 16px; }
  .about-animated-text { min-width: 100%; text-align: center; }
}
`;

export default function AboutUsBanner() {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <>
      <style>{styles}</style>
      <section className="about-banner">
        <InfoIcon className="floating-icon float-1" sx={{ fontSize: 100 }} />
        <FavoriteIcon className="floating-icon float-2" sx={{ fontSize: 120 }} />
        
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="about-badge">
              <FavoriteIcon sx={{ fontSize: 18 }} />
              <span>Our Story & </span>
            </div>
            
            <h1 className="about-title">
              Empowering Minds, <br />
              <span className="about-animated-text">
                <TypeAnimation
                  sequence={[
                    "Transforming Lives",
                    2000,
                    "Bre",
                    2000,
                    "Healing Together",
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
            </h1>
            
            <p className="about-subtitle">
            we believe that mental health is a fundamental human right. 
              Our mission is to provide a safe, accessible, and professional platform 
              where everyone can find their perfect therapist match and begin their 
              journey toward emotional well-being.
            </p>
          </Box>
        </Container>
      </section>
    </>
  );
}

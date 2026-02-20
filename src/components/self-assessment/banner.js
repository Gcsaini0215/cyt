import React from "react";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { TypeAnimation } from "react-type-animation";

const styles = `
.assessment-banner {
  position: relative;
  background-image: url('https://i.postimg.cc/dVCjtJTQ/home_slider_01.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 140px 0 100px 0;
  overflow: hidden;
  margin-top: 0px;
}

.assessment-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.assessment-badge {
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

.assessment-title {
  font-size: 48px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.assessment-animated-text {
  color: #60a5fa;
  display: inline-block;
  min-width: 250px;
  text-align: left;
}

.assessment-subtitle {
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
  .assessment-banner { 
    padding: 100px 0 60px 0;
    background-attachment: scroll;
  }
  .assessment-title { font-size: 32px; }
  .assessment-subtitle { font-size: 16px; }
  .assessment-animated-text { min-width: 100%; text-align: center; }
}
`;

export default function SelfAssessmentBanner() {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <>
      <style>{styles}</style>
      <section className="assessment-banner">
        <AssignmentIcon className="floating-icon float-1" sx={{ fontSize: 100 }} />
        <CheckCircleIcon className="floating-icon float-2" sx={{ fontSize: 120 }} />
        
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="assessment-badge">
              <AssignmentIcon sx={{ fontSize: 18 }} />
              <span>Know Yourself Better</span>
            </div>
            
            <h1 className="assessment-title">
              Mental Health <br />
              <span className="assessment-animated-text">
                <TypeAnimation
                  sequence={[
                    "Self Assessment",
                    2000,
                    "Understanding You",
                    2000,
                    "Your Journey",
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
            </h1>
            
            <p className="assessment-subtitle">
              Take our comprehensive self-assessment test to understand your mental health better. 
              Get personalized insights and recommendations from our expert psychologists based 
              on your responses. Your journey to better mental health starts here.
            </p>
          </Box>
        </Container>
      </section>
    </>
  );
}

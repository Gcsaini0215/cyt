import React from "react";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { TypeAnimation } from "react-type-animation";

const styles = `
.plans-banner {
  position: relative;
  background-image: url('https://i.postimg.cc/QCWfQP8N/Choose_Your_Therapist_LLP_(1).png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 140px 0 100px 0;
  overflow: hidden;
  margin-top: 0px;
}

.plans-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.plans-badge {
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

.plans-title {
  font-size: 48px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.plans-animated-text {
  color: #4ade80;
  display: inline-block;
  min-width: 280px;
  text-align: left;
}

.plans-subtitle {
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
  .plans-banner { 
    padding: 100px 0 60px 0;
    background-attachment: scroll;
  }
  .plans-title { font-size: 32px; }
  .plans-subtitle { font-size: 16px; }
  .plans-animated-text { min-width: 100%; text-align: center; }
}
`;

export default function PlansHeader({ planType, setPlanType }) {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <section className="plans-banner">
        <AutoAwesomeIcon className="floating-icon float-1" sx={{ fontSize: 100 }} />
        <SupportAgentIcon className="floating-icon float-2" sx={{ fontSize: 120 }} />
        
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="plans-badge">
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              <span>Investment in Yourself</span>
            </div>
            
            <h1 className="plans-title">
              Your Journey to{" "}
              <span className="plans-animated-text">
                <TypeAnimation
                  sequence={[
                    "Mental Wellness",
                    2000,
                    "Inner Peace",
                    2000,
                    "Self Growth",
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
              <br /> Starts with a Single Step
            </h1>
            
            <p className="plans-subtitle">
              Our therapy packages ensure continuity in your healing journey, helping you maintain
              <br /> steady progress toward your emotional well-being goals.
            </p>
          </Box>
        </Container>
      </section>
    </>
  );
}

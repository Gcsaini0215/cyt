import React from "react";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VerifiedIcon from "@mui/icons-material/Verified";
import { TypeAnimation } from "react-type-animation";

const styles = `
.reg-banner {
  position: relative;
  background-image: url('https://i.postimg.cc/5yf8k8ts/bg-image-12dabd.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: scroll;
  padding: 140px 0 100px 0;
  overflow: hidden;
  margin-top: 0px;
}

.reg-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.reg-badge {
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

.reg-title {
  font-size: 48px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.reg-animated-text {
  color: #4ade80;
  display: inline-block;
  min-width: 280px;
  text-align: left;
}

.reg-subtitle {
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
  .reg-banner { 
    padding: 100px 0 60px 0;
  }
  .reg-title { font-size: 32px; }
  .reg-subtitle { font-size: 16px; }
  .reg-animated-text { min-width: 100%; text-align: center; }
}
`;

export default function RegistrationHeader() {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <>
      <style>{styles}</style>
      <section className="reg-banner">
        <VerifiedIcon className="floating-icon float-1" sx={{ fontSize: 100 }} />
        <PersonAddIcon className="floating-icon float-2" sx={{ fontSize: 120 }} />
        
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="reg-badge">
              <VerifiedIcon sx={{ fontSize: 18 }} />
              <span>Be a Preferred Therapist</span>
            </div>
            
            <h1 className="reg-title">
              Join Our Platform to{" "}
              <span className="reg-animated-text">
                <TypeAnimation
                  sequence={[
                    "Build Your Presence",
                    2000,
                    "Strengthen Your Impact",
                    2000,
                    "Expand Your Reach",
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
              <br /> List Yourself on Choose Your Therapist
            </h1>
            
            <p className="reg-subtitle">
              Connect with clients seeking support, showcase your specializations, and offer secure online or in-person sessions for stress, anxiety, relationships, and emotional well-being.
              
            </p>
          </Box>
        </Container>
      </section>
    </>
  );
}

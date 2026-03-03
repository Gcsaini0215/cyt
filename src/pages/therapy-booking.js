import React from "react";
import Head from "next/head";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import ConsultationForm from "../components/home/consultation-form";
import NewsLetter from "../components/home/newsletter";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShieldIcon from "@mui/icons-material/Shield";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PsychologyIcon from "@mui/icons-material/Psychology";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BatteryAlertIcon from "@mui/icons-material/BatteryAlert";
import ExploreIcon from "@mui/icons-material/Explore";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { InView } from "react-intersection-observer";
import { TypeAnimation } from 'react-type-animation';

const bookingStyles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-heart {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.floating-icon {
  animation: float 3s ease-in-out infinite;
}

.pulsing-heart {
  color: #ef4444;
  animation: pulse-heart 2s ease-in-out infinite;
  display: inline-block;
}

.reveal-item {
  opacity: 0;
}

.reveal-item.visible {
  animation: fadeInUp 0.8s ease forwards;
}

.booking-banner {
  position: relative;
  background-image: url('https://i.postimg.cc/dVCjtJTQ/home_slider_01.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 100px 0 80px 0;
  overflow: hidden;
  margin-top: 0px;
}

.booking-banner::before {
  content: ' ';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1;
}

.booking-badge {
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

.booking-title {
  font-size: 42px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 0px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.booking-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  margin-top: 0px;
}

@media (max-width: 768px) {
  .booking-banner { 
    padding: 120px 0 100px 0;
    background-attachment: scroll;
  }
  .booking-title { font-size: 32px; }
  .booking-subtitle { 
    display: block; 
    font-size: 13px; 
    padding: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    margin-top: 15px;
  }
}

.booking-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
  position: relative;
  z-index: 2;
  margin-top: -60px;
}

@media (max-width: 768px) {
  .booking-card {
    padding: 24px;
    margin-top: -40px;
    border-radius: 20px;
  }
}

.trust-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.trust-icon-box {
  width: 70px;
  height: 70px;
  border-radius: 14px;
  background: #f0fdf4;
  color: #228756;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.trust-text {
  font-size: 14px;
  font-weight: 700;
  color: #475569;
}

.who-section {
  background: transparent;
  padding: 0;
}

.who-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.who-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 24px;
  text-align: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #f8fafc;
}

.who-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 40px rgba(34, 135, 86, 0.1);
  border-color: #dcfce7;
}

.who-icon-wrapper {
  width: 60px;
  height: 60px;
  background: #228756;
  color: #ffffff;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 10px 20px rgba(34, 135, 86, 0.2);
  transition: all 0.4s ease;
}

.who-card:hover .who-icon-wrapper {
  transform: scale(1.1);
  background: #4ade80;
}

.who-text {
  color: #1e293b;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
}

@media (max-width: 991px) {
  .who-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .who-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .who-card {
    padding: 30px 20px;
  }
  .who-text {
    font-size: 16px;
  }
  .who-icon-wrapper {
    width: 50px;
    height: 50px;
    margin-bottom: 20px;
  }
}
`;

export default function TherapyBooking() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <>
      <Head>
        <title>Start Your Therapy Journey Today | Free 15-Min Expert Consultation | Choose Your Therapist</title>
        <meta name="description" content="Taking the first step is the hardest part. Book a free 15-minute discovery call with our verified psychologists to navigate your mental health journey with ease and zero pressure." />
        <meta name="keywords" content="free psychologist consultation, 15 minute therapy call, mental health support, psychologist consultation india, therapy booking, verified therapists" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Choose Your Therapist" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="English" />
        <link rel="canonical" href="https://chooseyourtherapist.in/therapy-booking" />
        
        <meta property="og:title" content="Start Your Therapy Journey Today | Free 15-Min Expert Consultation" />
        <meta property="og:description" content="Book a free 15-minute discovery call with our verified psychologists to navigate your mental health journey with ease." />
        <meta property="og:image" content="https://i.postimg.cc/dVCjtJTQ/home_slider_01.jpg" />
        <meta property="og:image:secure_url" content="https://i.postimg.cc/dVCjtJTQ/home_slider_01.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Not Sure If You Need Therapy? Let's Find Out" />
        <meta property="og:url" content="https://chooseyourtherapist.in/therapy-booking" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Start Your Therapy Journey Today | Free 15-Min Expert Consultation" />
        <meta name="twitter:description" content="Book a free 15-minute discovery call with our verified psychologists to navigate your mental health journey with ease." />
        <meta name="twitter:image" content="https://i.postimg.cc/dVCjtJTQ/home_slider_01.jpg" />
        
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>
      
      <style dangerouslySetInnerHTML={{ __html: bookingStyles }} />

      <div>
        <MyNavbar />
        
        {/* Banner Section */}
        <section className="booking-banner">
          <Container maxWidth="lg">
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div className="booking-badge">
                <FavoriteIcon sx={{ fontSize: 18 }} />
                <span>{isMobile ? "Begin Your Healing Journey" : "Begin Your Healing Journey With Us"}</span>
              </div>
              
              <h1 className="booking-title" style={{ minHeight: isMobile ? '80px' : '110px' }}>
                Not Sure If You Need <br />
                <TypeAnimation
                  sequence={[
                    'Therapy?',
                    2000,
                    'Support?',
                    2000,
                    'Guidance?',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  style={{ color: '#4ade80' }}
                />
              </h1>
              
              <p className="booking-subtitle">
                Confidential 15-minute call with verified experts.
              </p>
            </Box>
          </Container>
        </section>

        {/* Form Section */}
        <div style={{ paddingBottom: "80px", backgroundColor: "#f8fafc" }}>
          <Container maxWidth="md">
            <InView triggerOnce threshold={0.1}>
              {({ inView, ref }) => (
                <div ref={ref} className={`booking-card reveal-item ${inView ? "visible" : ""}`}>
                  <div className="row g-4">
                    <div className="col-lg-5 col-md-12">
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                        <div className="floating-icon" style={{ 
                          position: 'absolute', 
                          top: '-40px', 
                          left: '-20px', 
                          fontSize: '40px', 
                          opacity: 0.1,
                          zIndex: 0 
                        }}>
                          <FavoriteIcon sx={{ fontSize: 80, color: '#228756' }} />
                        </div>
                        <Typography variant="h3" sx={{ 
                          fontWeight: 800, 
                          color: "#1e293b", 
                          mb: 3, 
                          letterSpacing: "-1px", 
                          fontSize: isMobile ? "24px" : "42px", 
                          position: 'relative', 
                          zIndex: 1,
                          lineHeight: 1.2
                        }}>
                          Tell us how we can support you <span className="pulsing-heart">❤</span>
                        </Typography>
                        <Typography sx={{ color: "#64748b", mb: 4, lineHeight: 1.6, fontSize: isMobile ? "17px" : "18px", fontWeight: 500 }}>
                          At Choose Your Therapist, our team is dedicated to listening and matching you with the right professional who truly understands your specific needs.
                        </Typography>

                        {/* Trust Indicators */}
                        <div className="row g-3">
                          <div className="col-4">
                            <div className="trust-item">
                              <div className="trust-icon-box">
                                <VerifiedIcon sx={{ fontSize: 40 }} />
                              </div>
                              <span className="trust-text">Verified</span>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="trust-item">
                              <div className="trust-icon-box">
                                <ShieldIcon sx={{ fontSize: 40 }} />
                              </div>
                              <span className="trust-text">Secure</span>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="trust-item">
                              <div className="trust-icon-box">
                                <SupportAgentIcon sx={{ fontSize: 40 }} />
                              </div>
                              <span className="trust-text">Expert</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-7 col-md-12">
                      <div style={{
                        background: "#f8fafc",
                        padding: isMobile ? "20px" : "32px",
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0"
                      }}>
                        <ConsultationForm showHeading={false} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </InView>
          </Container>
        </div>

        {/* Who Is This For Section */}
        <div style={{ paddingTop: "80px", paddingBottom: "80px", backgroundColor: "#ffffff" }}>
          <Container maxWidth="lg">
            <InView triggerOnce threshold={0.1}>
              {({ inView, ref }) => (
                <div ref={ref} className={`reveal-item ${inView ? "visible" : ""}`}>
                  <Box sx={{ mb: 6, textAlign: "center" }}>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 900, 
                      color: "#1e293b", 
                      fontSize: isMobile ? "26px" : "48px", 
                      letterSpacing: "-1.5px",
                      position: 'relative',
                      display: 'inline-block',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80px',
                        height: '4px',
                        backgroundColor: '#228756',
                        borderRadius: '2px'
                      }
                    }}>
                      This Consultation Is For You If..
                    </Typography>
                  </Box>

                  <Box className="who-section">
                    <div className="who-grid">
                      <div className="who-card">
                        <div className="who-icon-wrapper">
                          <PsychologyIcon sx={{ fontSize: 32 }} />
                        </div>
                        <div className="who-text">You feel anxious or overthink constantly</div>
                      </div>
                      <div className="who-card">
                        <div className="who-icon-wrapper">
                          <Diversity1Icon sx={{ fontSize: 32 }} />
                        </div>
                        <div className="who-text">You're struggling in relationships</div>
                      </div>
                      <div className="who-card">
                        <div className="who-icon-wrapper">
                          <HelpOutlineIcon sx={{ fontSize: 32 }} />
                        </div>
                        <div className="who-text">You're unsure if therapy is right for you</div>
                      </div>
                      <div className="who-card">
                        <div className="who-icon-wrapper">
                          <BatteryAlertIcon sx={{ fontSize: 32 }} />
                        </div>
                        <div className="who-text">You feel low or emotionally exhausted</div>
                      </div>
                      <div className="who-card">
                        <div className="who-icon-wrapper">
                          <ExploreIcon sx={{ fontSize: 32 }} />
                        </div>
                        <div className="who-text">You want guidance but don't know where to start</div>
                      </div>
                      <div className="who-card">
                        <div className="who-icon-wrapper">
                          <VolunteerActivismIcon sx={{ fontSize: 32 }} />
                        </div>
                        <div className="who-text">You seek a safe and non-judgmental space</div>
                      </div>
                    </div>
                  </Box>
                </div>
              )}
            </InView>
          </Container>
        </div>

        <NewsLetter />
        <Footer />
      </div>
    </>
  );
}
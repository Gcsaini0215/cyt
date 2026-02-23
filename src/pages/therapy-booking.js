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

const bookingStyles = `
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
  margin-bottom: 15px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.booking-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .booking-banner { 
    padding: 80px 0 50px 0;
    background-attachment: scroll;
  }
  .booking-title { font-size: 32px; }
  .booking-subtitle { font-size: 16px; }
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
  background: linear-gradient(135deg, #f0fdf4 0%, #f7fbf9 100%);
  border-radius: 24px;
  padding: 60px 40px;
  border: 2px solid #dcfce7;
  position: relative;
  overflow: hidden;
}

.who-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(34, 135, 86, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

@media (max-width: 768px) {
  .who-section {
    padding: 40px 24px;
  }
}

.who-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.who-icon {
  color: #228756;
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.who-text {
  color: #475569;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.6;
}
`;

export default function TherapyBooking() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <>
      <Head>
        <title>Book Your Free 15-Minute Consultation | Choose Your Therapist</title>
        <meta name="description" content="Get your free 15-minute consultation with a professional psychologist. Take the first step towards better mental health with verified therapists at Choose Your Therapist." />
        <meta name="keywords" content="therapy booking, free consultation, psychologist, mental health counseling, therapy appointment, verified therapists, confidential therapy" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Choose Your Therapist" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="English" />
        <link rel="canonical" href="https://chooseyourtherapist.in/therapy-booking" />
        
        <meta property="og:title" content="Book Your Free 15-Minute Consultation | Choose Your Therapist" />
        <meta property="og:description" content="Get your free 15-minute consultation with a professional psychologist. Take the first step towards better mental health with verified therapists at Choose Your Therapist." />
        <meta property="og:image" content="https://i.postimg.cc/dVCjtJTQ/home_slider_01.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://chooseyourtherapist.in/therapy-booking" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Book Your Free 15-Minute Consultation | Choose Your Therapist" />
        <meta name="twitter:description" content="Get your free 15-minute consultation with a professional psychologist. Take the first step towards better mental health." />
        <meta name="twitter:image" content="https://i.postimg.cc/dVCjtJTQ/home_slider_01.jpg" />
        
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>
      
      <style>{bookingStyles}</style>

      <div>
        <MyNavbar />
        
        {/* Banner Section */}
        <section className="booking-banner">
          <Container maxWidth="lg">
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div className="booking-badge">
                <FavoriteIcon sx={{ fontSize: 18 }} />
                <span>Begin Your Healing Journey</span>
              </div>
              
              <h1 className="booking-title">
                Not Sure If You Need <br />
                <span style={{ color: "#4ade80" }}>Therapy? Let's Find Out</span>
              </h1>
              
              <p className="booking-subtitle">
                A 15-minute confidential call to understand your concerns and guide you <br className="d-none d-md-block" />
                toward the right therapy support.
              </p>
            </Box>
          </Container>
        </section>

        {/* Form Section */}
        <div style={{ paddingBottom: "80px", backgroundColor: "#f8fafc" }}>
          <Container maxWidth="md">
            <div className="booking-card">
              <div className="row g-4">
                <div className="col-lg-5 col-md-12">
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#1e293b", mb: 3, letterSpacing: "-1px", fontSize: isMobile ? "28px" : "42px" }}>
                      Tell us how we <br /> can help you
                    </Typography>
                    <Typography sx={{ color: "#64748b", mb: 4, lineHeight: 1.6, fontSize: isMobile ? "17px" : "18px", fontWeight: 500 }}>
                      Our team is here to listen and guide you to the right professional for your specific needs.
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
          </Container>
        </div>

        {/* Who Is This For Section */}
        <div style={{ paddingTop: "80px", paddingBottom: "80px", backgroundColor: "#ffffff" }}>
          <Container maxWidth="lg">
            <Box sx={{ mb: 8 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#1e293b", mb: 2, textAlign: "center", fontSize: isMobile ? "28px" : "42px", letterSpacing: "-1px" }}>
                ✔ This Consultation Is For You If:
              </Typography>
              <Typography sx={{ color: "#64748b", mb: 6, textAlign: "center", fontSize: "16px", maxWidth: "700px", mx: "auto" }}>
                Recognize yourself? You're not alone. Thousands have taken this step. Let's talk.
              </Typography>
            </Box>

            <Box className="who-section">
              <div className="row">
                <div className="col-lg-6 col-md-12">
                  <div className="who-item">
                    <CheckCircleIcon className="who-icon" />
                    <div className="who-text">You feel anxious or overthink constantly</div>
                  </div>
                  <div className="who-item">
                    <CheckCircleIcon className="who-icon" />
                    <div className="who-text">You're struggling in relationships</div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-12">
                  <div className="who-item">
                    <CheckCircleIcon className="who-icon" />
                    <div className="who-text">You feel low, unmotivated, or emotionally exhausted</div>
                  </div>
                  <div className="who-item">
                    <CheckCircleIcon className="who-icon" />
                    <div className="who-text">You want professional guidance but don't know where to start</div>
                  </div>
                </div>
              </div>
              <Box sx={{ mt: 4, pt: 4, borderTop: "2px solid #dcfce7", textAlign: "center" }}>
                <Typography sx={{ color: "#228756", fontWeight: 700, fontSize: "16px" }}>
                  You're unsure if therapy is right for you
                </Typography>
              </Box>
            </Box>
          </Container>
        </div>

        <NewsLetter />
        <Footer />
      </div>
    </>
  );
}
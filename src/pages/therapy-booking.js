import React from "react";
import { Helmet } from "react-helmet";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import ConsultationForm from "../components/home/consultation-form";
import NewsLetter from "../components/home/newsletter";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShieldIcon from "@mui/icons-material/Shield";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

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
  content: '';
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
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: #f0fdf4;
  color: #228756;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.trust-text {
  font-size: 14px;
  font-weight: 700;
  color: #475569;
}
`;

export default function TherapyBooking() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <>
      <Helmet>
        <title>Book Your Free 15-Minute Consultation | Choose Your Therapist</title>
        <meta name="description" content="Get your free 15-minute consultation with a professional psychologist. Take the first step towards better mental health with verified therapists at Choose Your Therapist." />
      </Helmet>
      
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
                Book Your Free 15-Minute <br />
                <span style={{ color: "#4ade80" }}>Consultation Today</span>
              </h1>
              
              <p className="booking-subtitle">
                Take the first step towards a healthier mind. Connect with our expert <br className="d-none d-md-block" />
                psychologists for a confidential and professional initial assessment.
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
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 2, letterSpacing: "-1px" }}>
                      Tell us how we <br /> can help you
                    </Typography>
                    <Typography sx={{ color: "#64748b", mb: 4, lineHeight: 1.6 }}>
                      Our team is here to listen and guide you to the right professional for your specific needs.
                    </Typography>

                    {/* Trust Indicators */}
                    <div className="row g-3">
                      <div className="col-4">
                        <div className="trust-item">
                          <div className="trust-icon-box">
                            <VerifiedIcon />
                          </div>
                          <span className="trust-text">Verified</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="trust-item">
                          <div className="trust-icon-box">
                            <ShieldIcon />
                          </div>
                          <span className="trust-text">Secure</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="trust-item">
                          <div className="trust-icon-box">
                            <SupportAgentIcon />
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

        <NewsLetter />
        <Footer />
      </div>
    </>
  );
}
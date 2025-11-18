import React from "react";
import { Helmet } from "react-helmet";
import useMediaQuery from "@mui/material/useMediaQuery";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import ConsultationForm from "../components/home/consultation-form";
import NewsLetter from "../components/home/newsletter";

export default function TherapyBooking() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  return (
    <>
      <Helmet>
        <title>Book Your Free 15-Minute Consultation | Choose Your Therapist</title>
        <meta name="description" content="Get your free 15-minute consultation with a professional psychologist. Take the first step towards better mental health with verified therapists at Choose Your Therapist." />

        {/* Open Graph Tags */}
        <meta property="og:title" content="Book Your Free 15-Minute Consultation | Choose Your Therapist" />
        <meta property="og:description" content="Get your free 15-minute consultation with a professional psychologist. Take the first step towards better mental health with verified therapists at Choose Your Therapist." />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta property="og:url" content="https://www.chooseyourtherapist.in/therapy-booking" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />

        {/* Twitter Card Tags */}
        <meta name="twitter:title" content="Book Your Free 15-Minute Consultation | Choose Your Therapist" />
        <meta name="twitter:description" content="Get your free 15-minute consultation with a professional psychologist. Take the first step towards better mental health with verified therapists at Choose Your Therapist." />
        <meta name="twitter:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
    <div id="__next">
      <MyNavbar />
      {/* Mobile App-like Hero Banner */}
      <div className="mobile-app-banner" style={{
        minHeight: isMobile ? "100vh" : "80vh",
        background: "linear-gradient(135deg, #228756 0%, #2e7d32 50%, #1b5e20 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          animation: "float 6s ease-in-out infinite"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "-15%",
          left: "-10%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite reverse"
        }}></div>

        {/* Floating particles effect */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='white' fill-opacity='0.05'%3e%3ccircle cx='30' cy='30' r='1.5'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          backgroundSize: "60px 60px",
          animation: "particleFloat 20s linear infinite"
        }}></div>

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10 col-12">
              {/* Mobile App Card Layout */}
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: isMobile ? "20px" : "24px",
                padding: isMobile ? "24px 20px" : "40px 32px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                position: "relative",
                overflow: "hidden"
              }}>
                {/* Card Header with Free Badge */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: isMobile ? "20px" : "24px"
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "30px",
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "700",
                    boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span>🎁</span>
                    <span>100% FREE</span>
                  </div>
                </div>

                {/* Main Content */}
                <div style={{ textAlign: "center", marginBottom: isMobile ? "24px" : "32px" }}>
                  <h1 style={{
                    fontSize: isMobile ? "28px" : "42px",
                    fontWeight: "800",
                    color: "#228756",
                    marginBottom: isMobile ? "12px" : "16px",
                    lineHeight: "1.2",
                    letterSpacing: "-0.5px"
                  }}>
                    Free 15-Minute
                    <br />
                    <span style={{
                      background: "linear-gradient(135deg, #228756 0%, #2e7d32 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}>Consultation</span>
                  </h1>

                  <p style={{
                    fontSize: isMobile ? "16px" : "18px",
                    color: "#666",
                    marginBottom: isMobile ? "20px" : "24px",
                    lineHeight: "1.5",
                    fontWeight: "500"
                  }}>
                    Talk with a professional psychologist today
                  </p>

                  {/* Trust Badges */}
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: isMobile ? "16px" : "24px",
                    marginBottom: isMobile ? "24px" : "32px",
                    flexWrap: "wrap"
                  }}>
                    <div style={{
                      background: "rgba(34, 135, 86, 0.1)",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "1px solid rgba(34, 135, 86, 0.2)"
                    }}>
                      <span style={{ color: "#228756", fontWeight: "600", fontSize: "14px" }}>✓ Verified</span>
                    </div>
                    <div style={{
                      background: "rgba(34, 135, 86, 0.1)",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "1px solid rgba(34, 135, 86, 0.2)"
                    }}>
                      <span style={{ color: "#228756", fontWeight: "600", fontSize: "14px" }}>✓ Confidential</span>
                    </div>
                    <div style={{
                      background: "rgba(34, 135, 86, 0.1)",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "1px solid rgba(34, 135, 86, 0.2)"
                    }}>
                      <span style={{ color: "#228756", fontWeight: "600", fontSize: "14px" }}>✓ No Hidden Costs</span>
                    </div>
                  </div>
                </div>

                {/* Consultation Form */}
                <div style={{
                  background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                  padding: isMobile ? "20px" : "24px",
                  borderRadius: "16px",
                  border: "1px solid rgba(0, 0, 0, 0.05)"
                }}>
                  <ConsultationForm showHeading={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <NewsLetter />

      <Footer />

      {/* Mobile App Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(5deg); }
            66% { transform: translateY(10px) rotate(-3deg); }
          }

          @keyframes particleFloat {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-60px); }
          }

          /* Mobile-specific enhancements */
          @media (max-width: 768px) {
            .mobile-app-banner {
              padding: 20px 0;
            }

            /* Touch-friendly interactions */
            .mobile-app-banner * {
              -webkit-tap-highlight-color: rgba(255, 255, 255, 0.1);
            }
          }

          /* Smooth scrolling for mobile */
          @media (max-width: 768px) {
            html {
              scroll-behavior: smooth;
            }
          }
        `}
      </style>
    </div>
    </>
  );
}
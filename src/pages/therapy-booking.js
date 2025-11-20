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
      {/* Standard Page Layout */}
      <div style={{
        paddingTop: isMobile ? "20px" : "40px",
        paddingBottom: isMobile ? "40px" : "60px",
        backgroundColor: "#f8f9fa"
      }}>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10 col-12">
              {/* Standard Card Layout */}
              <div style={{
                background: "white",
                borderRadius: isMobile ? "16px" : "20px",
                padding: isMobile ? "24px 20px" : "40px 32px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                border: "1px solid #e9ecef",
                position: "relative"
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
                    Free 15-Minute{" "}
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
                    marginBottom: isMobile ? "24px" : "32px"
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
                  background: "#f8f9fa",
                  padding: isMobile ? "20px" : "24px",
                  borderRadius: "12px",
                  border: "1px solid #e9ecef"
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

      {/* Page Styles */}
      <style>
        {`
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
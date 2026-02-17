import React from "react";
import {
  Videocam,
  Schedule,
  Assessment,
  Security,
  Psychology,
  PhoneAndroid
} from "@mui/icons-material";

export default function TechnologyShowcase() {
  const technologies = [
    {
      id: 1,
      icon: <Videocam sx={{ fontSize: 40, color: "#2E7D32" }} />,
      title: "Secure Video Therapy",
      description: "HIPAA-compliant video sessions with end-to-end encryption for confidential therapy sessions.",
      features: ["HD Video Quality", "Screen Sharing", "Recording Options"]
    },
    {
      id: 2,
      icon: <Schedule sx={{ fontSize: 40, color: "#2E7D32" }} />,
      title: "Smart Scheduling System",
      description: "AI-powered appointment booking with automatic reminders and rescheduling options.",
      features: ["24/7 Booking", "Auto Reminders", "Calendar Sync"]
    },
    {
      id: 3,
      icon: <Assessment sx={{ fontSize: 40, color: "#2E7D32" }} />,
      title: "Mental Health Assessments",
      description: "Comprehensive digital assessments and progress tracking tools for better therapy outcomes.",
      features: ["PHQ-9 Screening", "Progress Tracking", "Custom Assessments"]
    },
    {
      id: 4,
      icon: <Security sx={{ fontSize: 40, color: "#2E7D32" }} />,
      title: "Secure Patient Portal",
      description: "Encrypted platform for managing appointments, accessing therapy notes, and secure messaging.",
      features: ["Encrypted Data", "Secure Messaging", "Document Sharing"]
    },
    {
      id: 5,
      icon: <Psychology sx={{ fontSize: 40, color: "#2E7D32" }} />,
      title: "AI Therapist Matching",
      description: "Intelligent algorithm matches you with the most suitable therapist based on your needs and preferences.",
      features: ["Personality Matching", "Specialty Focus", "Availability Check"]
    },
    {
      id: 6,
      icon: <PhoneAndroid sx={{ fontSize: 40, color: "#2E7D32" }} />,
      title: "Mobile Therapy App",
      description: "Access therapy anytime, anywhere with our dedicated mobile app for seamless mental health support.",
      features: ["Mobile Sessions", "Emergency Support", "Offline Resources"]
    }
  ];

  return (
    <section className="rbt-technology-showcase-area" style={{ padding: "80px 0", background: "#f8f9fa" }}>
      <div className="container">
        {/* Section Header */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 col-md-10 text-center">
            <div className="section-title">
              <span className="subtitle" style={{
                background: "linear-gradient(135deg, #2E7D32, #388E3C)",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600",
                display: "inline-block",
                marginBottom: "15px"
              }}>
                🏥 Advanced Therapy Technology
              </span>
              <h2 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#1a1a1a",
                marginBottom: "20px",
                lineHeight: "1.2"
              }}>
                Cutting-Edge Tools for Modern Mental Health Care
              </h2>
              <p style={{
                fontSize: "1.1rem",
                color: "#666",
                lineHeight: "1.6",
                maxWidth: "600px",
                margin: "0 auto"
              }}>
                Experience therapy through our state-of-the-art digital platform designed for convenience,
                security, and effective mental health support.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Grid */}
        <div className="row g-4">
          {technologies.map((tech, index) => (
            <div key={tech.id} className="col-lg-4 col-md-6 col-sm-12">
              <div
                className="technology-card"
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "30px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                  border: "1px solid #e9ecef",
                  transition: "all 0.3s ease",
                  height: "100%",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(46, 125, 50, 0.15)";
                  e.currentTarget.style.borderColor = "#2E7D32";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "#e9ecef";
                }}
              >
                {/* Icon Container */}
                <div style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #E8F5E8, #F1F8E9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  border: "2px solid #2E7D32"
                }}>
                  {tech.icon}
                </div>

                {/* Content */}
                <h4 style={{
                  fontSize: "1.3rem",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: "12px",
                  lineHeight: "1.3"
                }}>
                  {tech.title}
                </h4>

                <p style={{
                  fontSize: "0.95rem",
                  color: "#666",
                  lineHeight: "1.6",
                  marginBottom: "20px"
                }}>
                  {tech.description}
                </p>

                {/* Features List */}
                <div style={{ marginTop: "auto" }}>
                  <h6 style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#2E7D32",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Key Features:
                  </h6>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {tech.features.map((feature, idx) => (
                      <li key={idx} style={{
                        fontSize: "0.9rem",
                        color: "#555",
                        marginBottom: "5px",
                        display: "flex",
                        alignItems: "center"
                      }}>
                        <span style={{
                          color: "#2E7D32",
                          marginRight: "8px",
                          fontSize: "12px"
                        }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hover Effect Overlay */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(135deg, rgba(46, 125, 50, 0.02), rgba(56, 142, 60, 0.02))",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                  pointerEvents: "none"
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="row justify-content-center mt-5">
          <div className="col-lg-6 col-md-8 text-center">
            <div style={{
              background: "linear-gradient(135deg, #2E7D32, #388E3C)",
              borderRadius: "12px",
              padding: "30px",
              color: "#fff"
            }}>
              <h3 style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "15px"
              }}>
                Ready to Experience Modern Therapy?
              </h3>
              <p style={{
                fontSize: "1rem",
                marginBottom: "20px",
                opacity: "0.9"
              }}>
                Join thousands of clients who have transformed their mental health journey with our advanced therapy platform.
              </p>
              <button style={{
                background: "#fff",
                color: "#2E7D32",
                border: "none",
                padding: "12px 30px",
                borderRadius: "25px",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05)";
                e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "none";
              }}>
                Start Your Journey Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        @media (max-width: 768px) {
          .rbt-technology-showcase-area {
            padding: 50px 0 !important;
          }

          .technology-card {
            margin-bottom: 20px;
          }

          .section-title h2 {
            font-size: 2rem !important;
          }
        }

        @media (max-width: 480px) {
          .section-title h2 {
            font-size: 1.8rem !important;
          }

          .technology-card {
            padding: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
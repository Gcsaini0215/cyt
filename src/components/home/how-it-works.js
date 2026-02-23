import { useState } from "react";
import { Box, Container, Typography, Grid, Paper, useMediaQuery } from "@mui/material";
import {
  Search,
  CheckCircle,
  Phone,
  Favorite
} from "@mui/icons-material";

export default function HowItWorks() {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      id: 1,
      Icon: Search,
      title: "Find Your Match",
      description: "Browse through our verified therapists. Filter by specialization, experience, and availability to find the perfect match for your needs.",
      details: "Explore profiles, read reviews, and check availability"
    },
    {
      id: 2,
      Icon: CheckCircle,
      title: "Schedule Session",
      description: "Choose your preferred date and time. Book your first session instantly with secure payment options and flexible scheduling.",
      details: "Easy booking with instant confirmation"
    },
    {
      id: 3,
      Icon: Phone,
      title: "Connect Online",
      description: "Join your therapy session from anywhere. Enjoy secure, private video or audio sessions with your chosen therapist.",
      details: "100% confidential and HIPAA compliant"
    },
    {
      id: 4,
      Icon: Favorite,
      title: "Get Better",
      description: "Receive personalized care and support. Track your progress and adjust your therapy plan as you continue your healing journey.",
      details: "Ongoing support and progress tracking"
    }
  ];

  return (
    <section style={{
      padding: isMobile ? '60px 20px' : '100px 40px',
      backgroundColor: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: isMobile ? 6 : 8 }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            sx={{
              fontWeight: 900,
              color: "#0f2f1f",
              mb: 2,
              letterSpacing: "-0.5px"
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#556b63",
              maxWidth: "600px",
              mx: "auto",
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: 500,
              lineHeight: 1.7
            }}
          >
            Simple, straightforward steps to connect with your therapist and start your healing journey
          </Typography>
        </Box>

        {/* Desktop Timeline View */}
        {!isMobile && (
          <Box sx={{ mb: 8 }}>
            {/* Connection Line */}
            <Box sx={{
              position: 'relative',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              mb: 4
            }}>
              <svg
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  top: 0,
                  left: 0,
                  pointerEvents: 'none'
                }}
                viewBox="0 0 1200 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#228756', stopOpacity: 0.8 }} />
                    <stop offset="50%" style={{ stopColor: '#228756', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#228756', stopOpacity: 0.8 }} />
                  </linearGradient>
                </defs>
                <line x1="0" y1="50" x2="1200" y2="50" stroke="url(#lineGradient)" strokeWidth="3" />
              </svg>

              {/* Step Cards */}
              <Grid container spacing={2} sx={{ position: 'relative', zIndex: 2 }}>
                {steps.map((step) => (
                  <Grid item xs={12} sm={6} md={3} key={step.id}>
                    <Box
                      onMouseEnter={() => setHoveredStep(step.id)}
                      onMouseLeave={() => setHoveredStep(null)}
                      sx={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {/* Circle Background */}
                      <Box sx={{
                        position: 'absolute',
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: hoveredStep === step.id 
                          ? 'linear-gradient(135deg, #228756 0%, #1a6f47 100%)'
                          : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        transition: 'all 0.3s ease',
                        boxShadow: hoveredStep === step.id
                          ? '0 12px 30px rgba(34, 135, 86, 0.3)'
                          : '0 4px 12px rgba(34, 135, 86, 0.1)',
                        zIndex: 1
                      }} />

                      {/* Icon */}
                      <step.Icon sx={{
                        fontSize: 50,
                        color: hoveredStep === step.id ? '#ffffff' : '#228756',
                        position: 'relative',
                        zIndex: 2,
                        transition: 'all 0.3s ease',
                        mb: 1
                      }} />

                      {/* Number Badge */}
                      <Box sx={{
                        position: 'absolute',
                        top: -8,
                        right: '10%',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#228756',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '16px',
                        boxShadow: '0 4px 12px rgba(34, 135, 86, 0.3)',
                        zIndex: 3
                      }}>
                        {step.id}
                      </Box>

                      {/* Content */}
                      <Box sx={{
                        mt: 14,
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}>
                        <Typography sx={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#0f2f1f',
                          mb: 1
                        }}>
                          {step.title}
                        </Typography>
                        <Typography sx={{
                          fontSize: '13px',
                          color: hoveredStep === step.id ? '#228756' : '#556b63',
                          lineHeight: 1.5,
                          fontWeight: hoveredStep === step.id ? 600 : 500,
                          transition: 'all 0.3s ease'
                        }}>
                          {hoveredStep === step.id ? step.details : step.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}

        {/* Mobile Card View */}
        {isMobile && (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {steps.map((step, index) => (
              <Grid item xs={12} key={step.id}>
                <Paper sx={{
                  p: 3,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '2px solid #228756',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}>
                    <Box sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #228756 0%, #1a6f47 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 8px 16px rgba(34, 135, 86, 0.2)',
                      position: 'relative'
                    }}>
                      <step.Icon sx={{ fontSize: 32, color: '#ffffff' }} />
                      <Box sx={{
                        position: 'absolute',
                        top: -12,
                        right: -12,
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: '#228756',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '16px',
                        border: '3px solid #ffffff'
                      }}>
                        {step.id}
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#0f2f1f',
                        mb: 1
                      }}>
                        {step.title}
                      </Typography>
                      <Typography sx={{
                        fontSize: '13px',
                        color: '#556b63',
                        lineHeight: 1.6,
                        mb: 1
                      }}>
                        {step.description}
                      </Typography>
                      <Typography sx={{
                        fontSize: '12px',
                        color: '#228756',
                        fontWeight: 600,
                        fontStyle: 'italic'
                      }}>
                        {step.details}
                      </Typography>
                    </Box>
                  </Box>

                  {index < steps.length - 1 && (
                    <Box sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: '2px dashed #228756',
                      textAlign: 'center'
                    }}>
                      <Box sx={{
                        width: 24,
                        height: 24,
                        margin: '-18px auto 0',
                        background: '#ffffff',
                        border: '3px solid #228756',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#228756',
                        fontWeight: 700,
                        fontSize: '14px'
                      }}>
                        ↓
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* CTA Section */}
        <Box sx={{
          textAlign: 'center',
          mt: 8,
          p: isMobile ? 4 : 6,
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #f7fbf9 100%)',
          border: '2px solid #228756',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34, 135, 86, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <Typography variant="h5" sx={{
            fontWeight: 800,
            color: '#0f2f1f',
            mb: 2,
            position: 'relative',
            zIndex: 1
          }}>
            Ready to Start Your Healing Journey?
          </Typography>
          <Typography sx={{
            fontSize: '16px',
            color: '#556b63',
            maxWidth: '500px',
            mx: 'auto',
            mb: 3,
            position: 'relative',
            zIndex: 1
          }}>
            Take the first step today. Connect with a verified therapist in just a few clicks.
          </Typography>
          <Box sx={{
            display: 'inline-flex',
            gap: 2,
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Box sx={{
              px: 6,
              py: 2.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #228756 0%, #1a6f47 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 8px 20px rgba(34, 135, 86, 0.3)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 30px rgba(34, 135, 86, 0.4)'
              }
            }}>
              Get Started Today
            </Box>
            <Box sx={{
              px: 6,
              py: 2.5,
              borderRadius: '12px',
              background: '#ffffff',
              color: '#228756',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              border: '2px solid #228756',
              transition: 'all 0.3s',
              '&:hover': {
                background: '#f0fdf4',
                transform: 'translateY(-3px)'
              }
            }}>
              Learn More
            </Box>
          </Box>
        </Box>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Container>
    </section>
  );
}

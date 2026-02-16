import React from "react";
import { Search, CalendarDays, HeartHandshake, CheckCircle2 } from "lucide-react";
import { Box, Typography, Container, Grid, useTheme, useMediaQuery } from "@mui/material";
const TherapeuticImg = "/assets/img/psychologist.png";

const ProcessSteps = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const steps = [
    {
      icon: <Search size={32} />,
      title: "Discover Your Match",
      description: "Browse through India's largest network of verified therapists. Use our smart filters to find someone who truly understands your cultural and emotional context.",
      color: "#228756",
      tag: "STEP 01"
    },
    {
      icon: <CalendarDays size={32} />,
      title: "Schedule with Ease",
      description: "Book sessions that fit your life. Whether it's early morning or late evening, our therapists offer flexible slots for online or in-person consultations.",
      color: "#007f99",
      tag: "STEP 02"
    },
    {
      icon: <HeartHandshake size={32} />,
      title: "Begin Your Healing",
      description: "Start your therapy journey in a safe, confidential, and non-judgmental space. Your mental well-being is our priority, every step of the way.",
      color: "#228756",
      tag: "STEP 03"
    }
  ];

  return (
    <Box sx={{ 
      position: "relative",
      backgroundColor: "#ffffff",
      overflow: "hidden",
      // Seamless transition from banner's bottom fade
      pt: { xs: 8, md: 12 }, 
      pb: { xs: 10, md: 18 },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "150px",
        background: "linear-gradient(to bottom, #f0fdf4 0%, rgba(255, 255, 255, 0) 100%)",
        opacity: 0.6,
        pointerEvents: "none"
      }
    }}>
      {/* Subtle Background Elements */}
      <Box sx={{
        position: "absolute",
        top: "20%",
        right: "-5%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(34, 135, 86, 0.03) 0%, transparent 70%)",
        borderRadius: "50%",
        zIndex: 0
      }} />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={10} alignItems="center">
          {/* Left Side: Visual Element */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ position: "relative" }}>
              <Box 
                sx={{ 
                  position: "relative",
                  borderRadius: "40px",
                  overflow: "hidden",
                  boxShadow: "0 40px 80px -20px rgba(22, 101, 52, 0.15)",
                  transform: { md: "rotate(-2deg)" },
                  transition: "transform 0.5s ease",
                  "&:hover": { transform: "rotate(0deg)" }
                }}
              >
                <img 
                  src={TherapeuticImg} 
                  alt="Professional Therapy Session" 
                  style={{ 
                    width: "100%", 
                    height: "auto", 
                    display: "block",
                    filter: "contrast(1.05)"
                  }} 
                />
                
                {/* Image Overlay Gradient */}
                <Box sx={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 40%)"
                }} />
              </Box>

              {/* Floating Professional Badge */}
              <Box sx={{
                position: "absolute",
                bottom: { xs: -20, md: 40 },
                left: { xs: "50%", md: -30 },
                transform: { xs: "translateX(-50%)", md: "none" },
                bgcolor: "white",
                p: { xs: 2, md: 3 },
                borderRadius: "24px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: "1px solid rgba(241, 245, 249, 0.8)",
                backdropFilter: "blur(10px)",
                width: "max-content",
                zIndex: 2
              }}>
                <Box sx={{ 
                  bgcolor: "rgba(34, 135, 86, 0.1)", 
                  p: 1.5, 
                  borderRadius: "16px",
                  display: "flex",
                  color: "#228756"
                }}>
                  <CheckCircle2 size={28} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, color: "#1a1a1a", fontSize: "1.2rem", lineHeight: 1 }}>
                    100% Verified
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.85rem", mt: 0.5 }}>
                    Certified Mental Health Experts
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side: Process Content */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="overline"
                sx={{ 
                  color: "#228756", 
                  fontWeight: 800, 
                  letterSpacing: 4,
                  display: "inline-block",
                  mb: 2,
                  fontSize: "0.85rem",
                  bgcolor: "rgba(34, 135, 86, 0.08)",
                  px: 2,
                  py: 0.5,
                  borderRadius: "8px"
                }}
              >
                HOW IT WORKS
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: "#1a1a1a",
                  fontSize: { xs: "2.4rem", md: "3.8rem" },
                  lineHeight: { xs: 1.2, md: 1.1 },
                  mb: 3,
                  letterSpacing: "-0.03em"
                }}
              >
                Empowering Your Path to <br />
                <span style={{ 
                  color: "#228756",
                  background: "linear-gradient(120deg, #166534 0%, #228756 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  Inner Harmony
                </span>
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 500, maxWidth: "540px", lineHeight: 1.6 }}>
                Experience a seamless journey towards mental clarity with our structured, 
                compassionate approach to professional counselling.
              </Typography>
            </Box>

            <Box sx={{ position: "relative" }}>
              {/* Vertical Connector Line (Desktop) */}
              {!isMobile && (
                <Box sx={{
                  position: "absolute",
                  left: "35px",
                  top: "40px",
                  bottom: "40px",
                  width: "2px",
                  background: "linear-gradient(to bottom, transparent, #e2e8f0 10%, #e2e8f0 90%, transparent)",
                  zIndex: 0
                }} />
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {steps.map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: "flex", 
                      gap: 4,
                      position: "relative",
                      zIndex: 1,
                      transition: "all 0.3s ease",
                      p: 2,
                      borderRadius: "24px",
                      "&:hover": {
                        bgcolor: "rgba(248, 250, 252, 0.8)",
                        "& .step-icon": {
                          transform: "scale(1.1)",
                          boxShadow: `0 10px 20px ${item.color}20`,
                          bgcolor: item.color,
                          color: "white"
                        }
                      }
                    }}
                  >
                    <Box
                      className="step-icon"
                      sx={{
                        width: 70,
                        height: 70,
                        minWidth: 70,
                        borderRadius: "20px",
                        bgcolor: "white",
                        color: item.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                        border: "1px solid rgba(226, 232, 240, 0.8)",
                        position: "relative"
                      }}
                    >
                      {item.icon}
                    </Box>
                    
                    <Box>
                      <Typography sx={{ 
                        color: item.color, 
                        fontWeight: 800, 
                        fontSize: "0.75rem", 
                        mb: 0.5,
                        letterSpacing: 1
                      }}>
                        {item.tag}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: "#1a1a1a",
                          mb: 1,
                          fontSize: "1.4rem",
                          letterSpacing: "-0.01em"
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#64748b",
                          lineHeight: 1.7,
                          fontSize: "1.05rem",
                          fontWeight: 500,
                          maxWidth: "480px"
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <style>{`
        @keyframes subtleReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default ProcessSteps;

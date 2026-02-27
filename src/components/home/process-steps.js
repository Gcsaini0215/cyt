import React, { useState, useEffect } from "react";
import { Search, CalendarDays, HeartHandshake, ArrowRight } from "lucide-react";
import { Box, Typography, Container, Grid } from "@mui/material";

const ProcessSteps = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 960px)");
    setIsMobile(query.matches);
    const handle = (e) => setIsMobile(e.matches);
    query.addListener(handle);
    return () => query.removeListener(handle);
  }, []);

  const steps = [
    {
      icon: <Search size={32} />,
      title: "Find Your Expert",
      description: "Browse verified therapists and find the perfect match for your needs.",
      color: "#228756",
      bg: "rgba(34, 135, 86, 0.1)"
    },
    {
      icon: <CalendarDays size={32} />,
      title: "Book a Session",
      description: "Select a convenient time slot and book your session instantly.",
      color: "#007f99",
      bg: "rgba(0, 127, 153, 0.1)"
    },
    {
      icon: <HeartHandshake size={32} />,
      title: "Start Healing",
      description: "Begin your journey to emotional well-being in a safe space.",
      color: "#228756",
      bg: "rgba(34, 135, 86, 0.1)"
    }
  ];

  return (
    <Box sx={{ 
      py: { xs: 10, md: 15 }, 
      backgroundColor: "#ffffff",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative Circles */}
      <Box sx={{
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(34, 135, 86, 0.05) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ textAlign: "center", mb: { xs: 8, md: 12 } }}>
          <Typography
            sx={{ 
              color: "#228756", 
              fontWeight: 800, 
              letterSpacing: 3,
              fontSize: "0.85rem",
              textTransform: "uppercase",
              mb: 2,
              display: "block"
            }}
          >
            Our Simple Process
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: "#1e293b",
              fontSize: { xs: "2.8rem", md: "4.2rem" },
              lineHeight: 1.1,
              mb: 3
            }}
          >
            How it <span style={{ color: "#228756" }}>Works</span>
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: "1.3rem", maxWidth: "750px", mx: "auto", lineHeight: 1.6 }}>
            Experience a seamless path to mental wellness with our structured 3-step approach.
          </Typography>
        </Box>

        <Box sx={{ position: "relative" }}>
          {/* Dashed Path (Desktop only) */}
          {!isMobile && (
            <Box sx={{
              position: "absolute",
              top: "100px",
              left: "10%",
              right: "10%",
              height: "2px",
              borderTop: "3px dashed #cbd5e1",
              zIndex: 0
            }} />
          )}

          <Grid container spacing={4} justifyContent="center">
            {steps.map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box 
                  className="step-card"
                  sx={{ 
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                    px: { md: 2 }
                  }}
                >
                  {/* Icon Wrapper */}
                  <Box sx={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 4,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                    border: "2px solid #fff",
                    position: "relative",
                    transition: "all 0.4s ease",
                    "&::after": {
                      content: `"${index + 1}"`,
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "35px",
                      height: "35px",
                      bgcolor: item.color,
                      color: "#fff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 900,
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
                    }
                  }}>
                    <Box sx={{ color: item.color }}>
                      {item.icon}
                    </Box>
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: "#1e293b",
                      mb: 2,
                      fontSize: "1.8rem",
                      letterSpacing: "-0.01em"
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: "#64748b", lineHeight: 1.7, fontSize: "1.2rem", fontWeight: 500 }}>
                    {item.description}
                  </Typography>

                  {/* Arrow (Mobile only) */}
                  {isMobile && index < steps.length - 1 && (
                    <Box sx={{ my: 4, color: "#cbd5e1" }}>
                      <ArrowRight style={{ transform: "rotate(90deg)" }} />
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <style>{`
        .step-card:hover .MuiBox-root:first-of-type {
          transform: translateY(-10px) scale(1.05);
          border-color: #22875633;
          box-shadow: 0 30px 60px rgba(34, 135, 86, 0.12);
        }
      `}</style>
    </Box>
  );
};

export default ProcessSteps;

import React from "react";
import { 
  CloudLightning, 
  Wind, 
  CloudRain, 
  Waves, 
  Moon, 
  Sprout,
  ArrowRight
} from "lucide-react";
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper,
  useTheme, 
  useMediaQuery 
} from "@mui/material";

const MoodNavigator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const moods = [
    {
      id: "stressed",
      label: "Stressed",
      icon: <CloudLightning size={32} />,
      color: "#f59e0b",
      bg: "#fffbeb",
      description: "Pressure or tension"
    },
    {
      id: "anxious",
      label: "Anxious",
      icon: <Wind size={32} />,
      color: "#0ea5e9",
      bg: "#f0f9ff",
      description: "Worry or unease"
    },
    {
      id: "low",
      label: "Feeling Low",
      icon: <CloudRain size={32} />,
      color: "#6366f1",
      bg: "#eef2ff",
      description: "Sad or unmotivated"
    },
    {
      id: "overwhelmed",
      label: "Overwhelmed",
      icon: <Waves size={32} />,
      color: "#8b5cf6",
      bg: "#f5f3ff",
      description: "Too much to handle"
    },
    {
      id: "lonely",
      label: "Lonely",
      icon: <Moon size={32} />,
      color: "#64748b",
      bg: "#f8fafc",
      description: "Need connection"
    },
    {
      id: "growth",
      label: "Ready to Grow",
      icon: <Sprout size={32} />,
      color: "#228756",
      bg: "#f0fdf4",
      description: "Seeking wellness"
    }
  ];

  return (
    <Box sx={{ 
      position: "relative",
      backgroundColor: "#ffffff",
      pt: { xs: 6, md: 10 },
      pb: { xs: 12, md: 20 }, // Extra padding for the arch
      overflow: "hidden"
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="overline"
            sx={{ 
              color: "#228756", 
              fontWeight: 800, 
              letterSpacing: 4,
              mb: 1,
              display: "block"
            }}
          >
            PERSONALIZED CARE
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: "#1a1a1a",
              fontSize: { xs: "2.2rem", md: "3.5rem" },
              lineHeight: 1.2,
              mb: 2,
              letterSpacing: "-0.02em"
            }}
          >
            How are you <span style={{ color: "#228756" }}>feeling today?</span>
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: "1.1rem", maxWidth: "600px", mx: "auto", fontWeight: 500 }}>
            Select your current state of mind. We'll help you find the right 
            professional support tailored to your emotional needs.
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {moods.map((mood) => (
            <Grid item xs={6} sm={4} md={2} key={mood.id}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: "24px",
                  bgcolor: mood.bg,
                  border: "1px solid transparent",
                  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: `0 20px 40px -10px ${mood.color}20`,
                    borderColor: `${mood.color}40`,
                    "& .mood-icon": {
                      transform: "scale(1.2) rotate(5deg)",
                      color: "white",
                      bgcolor: mood.color
                    },
                    "& .go-arrow": {
                      opacity: 1,
                      transform: "translateX(0)"
                    }
                  }
                }}
              >
                <Box
                  className="mood-icon"
                  sx={{
                    width: { xs: 56, md: 64 },
                    height: { xs: 56, md: 64 },
                    borderRadius: "18px",
                    bgcolor: "white",
                    color: mood.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    transition: "all 0.3s ease",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.03)"
                  }}
                >
                  {mood.icon}
                </Box>
                <Typography sx={{ fontWeight: 800, color: "#1a1a1a", fontSize: { xs: "0.95rem", md: "1.1rem" }, mb: 0.5 }}>
                  {mood.label}
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600, mb: 2, display: { xs: "none", md: "block" } }}>
                  {mood.description}
                </Typography>
                <Box 
                  className="go-arrow"
                  sx={{ 
                    opacity: 0, 
                    transform: "translateX(-10px)", 
                    transition: "all 0.3s ease",
                    color: mood.color,
                    display: "flex"
                  }}
                >
                  <ArrowRight size={20} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Soft Arch Bottom Design */}
      <Box sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: { xs: "60px", md: "120px" },
        bgcolor: "#ffffff",
        zIndex: 2,
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "white",
          borderRadius: "100% 100% 0 0",
          transform: "scaleX(1.1)",
          boxShadow: "0 -20px 40px rgba(0,0,0,0.02)"
        }
      }} />
      
      {/* Seamless shadow/gradient for the arch */}
      <Box sx={{
        position: "absolute",
        bottom: { xs: "58px", md: "118px" },
        left: 0,
        width: "100%",
        height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(34, 135, 86, 0.1), transparent)",
        zIndex: 1
      }} />
    </Box>
  );
};

export default MoodNavigator;

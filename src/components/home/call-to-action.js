import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Paper, useMediaQuery } from "@mui/material";

export default function CallToAction() {
  const isMobile = useMediaQuery("(max-width:600px)");

  const feelingOptions = [
    { emoji: "😊", label: "Happy", color: "#FFD700", bg: "#FFFBEB" },
    { emoji: "😔", label: "Sad", color: "#3B82F6", bg: "#EFF6FF" },
    { emoji: "😰", label: "Anxious", color: "#10B981", bg: "#F0FDF4" },
    { emoji: "😫", label: "Stressed", color: "#F59E0B", bg: "#FFF7ED" },
    { emoji: "😴", label: "Tired", color: "#6366F1", bg: "#EEF2FF" },
  ];

  return (
    <div className="rbt-callto-action-area" style={{ padding: '60px 0', backgroundColor: '#f9fafb' }}>
      <div className="container">
        <Paper elevation={0} sx={{ 
          p: isMobile ? 4 : 6, 
          borderRadius: "32px", 
          textAlign: "center",
          background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
        }}>
          <Typography variant={isMobile ? "h4" : "h3"} sx={{ 
            fontWeight: 900, 
            color: "#1a1a1a", 
            mb: 2,
            letterSpacing: "-0.5px"
          }}>
            How are you feeling today?
          </Typography>
          <Typography variant="body1" sx={{ 
            color: "#64748b", 
            mb: 5, 
            maxWidth: "600px", 
            mx: "auto",
            fontSize: isMobile ? "16px" : "18px"
          }}>
            Your emotions matter. Select how you feel to find the best support for your mental well-being.
          </Typography>

          <Box sx={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: 3, 
            justifyContent: "center",
            mb: 6
          }}>
            {feelingOptions.map((option, index) => (
              <Box
                key={index}
                component={Link}
                to="/view-all-therapist"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isMobile ? "90px" : "110px",
                  height: isMobile ? "90px" : "110px",
                  borderRadius: "24px",
                  bgcolor: option.bg,
                  textDecoration: "none",
                  transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  border: `2px solid transparent`,
                  "&:hover": {
                    transform: "translateY(-10px) scale(1.05)",
                    boxShadow: `0 15px 30px rgba(0,0,0,0.1)`,
                    borderColor: option.color
                  }
                }}
              >
                <span style={{ fontSize: isMobile ? "32px" : "40px", marginBottom: "8px" }}>{option.emoji}</span>
                <Typography sx={{ 
                  fontSize: "14px", 
                  fontWeight: 700, 
                  color: "#1a1a1a" 
                }}>
                  {option.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box>
            <Link
              className="rbt-btn btn-gradient btn-md"
              to="/view-all-therapist"
            >
              <span className="btn-text">Explore All Therapists</span>
            </Link>
          </Box>
        </Paper>
      </div>
    </div>
  );
}

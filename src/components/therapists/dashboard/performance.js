import React, { useEffect } from "react";
import useTherapistStore from "../../../store/therapistStore";
import { Grid, Paper, Box, Typography } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function DashboardSections({ pageData }) {
  const { therapistInfo } = useTherapistStore();

  useEffect(() => {
    const container = document.getElementById("shape-container");
    if (!container) return;
    const colors = ["rgba(89, 200, 47, 0.15)", "rgba(34, 135, 86, 0.15)"];
    for (let i = 0; i < 6; i++) {
      const shape = document.createElement("div");
      shape.className = "floating-shape";
      shape.style.width = 100 + Math.random() * 80 + "px";
      shape.style.height = 100 + Math.random() * 80 + "px";
      shape.style.left = Math.random() * 90 + "%";
      shape.style.top = Math.random() * 90 + "%";
      shape.style.background = colors[Math.floor(Math.random() * colors.length)];
      shape.style.borderRadius = "50%";
      shape.style.filter = "blur(40px)";
      shape.style.animationDuration = 8 + Math.random() * 10 + "s";
      container.appendChild(shape);
    }
  }, []);

  const stats = [
    {
      label: "Total Earnings",
      value: `₹${pageData?.total_earnings || "0"}`,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "#228756" }} />,
      bgColor: "rgba(34, 135, 86, 0.1)",
      borderColor: "rgba(34, 135, 86, 0.2)"
    },
    {
      label: "Upcoming Sessions",
      value: pageData?.upcoming_sessions_count || "0",
      icon: <CalendarMonthIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      bgColor: "rgba(25, 118, 210, 0.1)",
      borderColor: "rgba(25, 118, 210, 0.2)"
    },
    {
      label: "Pending Invoices",
      value: pageData?.pending_invoices_count || "0",
      icon: <DescriptionIcon sx={{ fontSize: 40, color: "#ed6c02" }} />,
      bgColor: "rgba(237, 108, 2, 0.1)",
      borderColor: "rgba(237, 108, 2, 0.2)"
    },
    {
      label: "New Inquiries",
      value: pageData?.new_inquiries_count || "0",
      icon: <PersonAddIcon sx={{ fontSize: 40, color: "#9c27b0" }} />,
      bgColor: "rgba(156, 39, 176, 0.1)",
      borderColor: "rgba(156, 39, 176, 0.2)"
    }
  ];

  return (
    <div style={{ position: "relative", marginBottom: "20px", marginTop: "-10px" }}>
      <div id="shape-container" style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none", overflow: "hidden", zIndex: 0 }}></div>
      
      {/* Elite Professional Banner */}
      <Box 
        sx={{
          background: "linear-gradient(135deg, #228756 0%, #1b6843 100%)",
          borderRadius: "24px",
          padding: { xs: "30px 20px", md: "35px 40px" },
          color: "#ffffff",
          boxShadow: "0 20px 40px rgba(27, 104, 67, 0.2)",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
          marginBottom: "20px",
          border: "none", // Remove any default border
          outline: "none" // Remove any default outline
        }}
      >
        {/* Decorative Overlay Pattern */}
        <Box sx={{ 
          position: "absolute", 
          top: 0, 
          right: 0, 
          bottom: 0, 
          width: "50%", 
          background: "radial-gradient(circle at top right, rgba(89, 200, 47, 0.3), transparent 70%)",
          zIndex: 0,
          pointerEvents: "none"
        }}></Box>

        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Box>
            <Typography component="span" sx={{ 
              fontSize: { xs: "0.8rem", md: "1rem" }, 
              textTransform: "uppercase", 
              letterSpacing: "2px", 
              fontWeight: "700", 
              color: "#59c82f",
              display: "block",
              marginBottom: "12px"
            }}>
              Therapist Workspace
            </Typography>
            <Typography variant="h2" sx={{ 
              fontSize: { xs: "1.8rem", md: "2.5rem" }, 
              fontWeight: "900", 
              margin: 0, 
              color: "#ffffff", 
              lineHeight: "1.1" 
            }}>
              Welcome back, {therapistInfo?.user?.name || "Therapist"}
            </Typography>
            <Typography sx={{ 
              marginTop: "8px", 
              opacity: 0.9, 
              fontSize: { xs: "0.9rem", md: "1rem" }, 
              maxWidth: "600px" 
            }}>
              Manage your practice, track your growth, and provide the best care to your clients.
            </Typography>
          </Box>
        </Box>

        {/* Abstract Iconography Placeholder */}
        <Box sx={{ 
          position: "absolute", 
          right: "-40px", 
          bottom: "-40px", 
          opacity: 0.15, 
          fontSize: { xs: "10rem", md: "18rem" }, 
          transform: "rotate(-15deg)",
          pointerEvents: "none",
          zIndex: 0
        }}>
          <i className="fa-solid fa-hand-holding-heart"></i>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box 
        sx={{ 
          display: 'flex', 
          overflowX: { xs: 'auto', md: 'visible' }, 
          gap: 3, 
          pb: { xs: 2, md: 0 },
          px: { xs: 1, md: 0 },
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          position: "relative",
          zIndex: 1
        }}
      >
        {stats.map((stat, index) => (
          <Box 
            key={index} 
            sx={{ 
              minWidth: { xs: '300px', sm: '260px', md: 'auto' },
              flex: { md: 1 }
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "24px",
                background: "#ffffff",
                position: 'relative',
                overflow: 'hidden',
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                },
                "&::before": {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '120px',
                  height: '120px',
                  background: `radial-gradient(circle at top right, ${stat.bgColor}, transparent 70%)`,
                  zIndex: 0
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "20px",
                    background: stat.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: "#64748b", fontWeight: 700, mb: 0.5, letterSpacing: '0.5px', fontSize: '1.15rem' }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#1e293b", letterSpacing: '-1px', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>

      <style>{`
        .floating-shape {
          position: absolute;
          z-index: 0;
          animation: float 10s infinite ease-in-out;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -30px); }
        }
      `}</style>
    </div>
  );
}

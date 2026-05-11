import React from "react";
import useTherapistStore from "../../../store/therapistStore";
import { Grid, Paper, Box, Typography, useMediaQuery } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function DashboardSections({ pageData }) {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { therapistInfo } = useTherapistStore();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  const stats = [
    {
      label: "Total Earnings",
      value: `₹${(pageData?.total_earnings || 0).toLocaleString("en-IN")}`,
      icon: <AccountBalanceWalletIcon />,
      color: "#2ecc71",
      bg: "#f0fdf4",
      trend: "+12%",
    },
    {
      label: "Upcoming",
      value: pageData?.upcoming_sessions_count || "0",
      icon: <CalendarMonthIcon />,
      color: "#0ea5e9",
      bg: "#f0f9ff",
    },
    {
      label: "Pending Bills",
      value: pageData?.pending_invoices_count || "0",
      icon: <DescriptionIcon />,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
    {
      label: "Inquiries",
      value: pageData?.new_inquiries_count || "0",
      icon: <PersonAddIcon />,
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* Compact Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1b5e20 0%, #228756 55%, #2ecc71 100%)",
          borderRadius: "20px",
          p: { xs: "22px 20px", md: "26px 36px" },
          mb: 2.5,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -50, right: 100, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, position: "relative", zIndex: 1 }}>
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", mb: 0.8 }}>
              Therapist Workspace
            </Typography>
            <Typography sx={{ color: "#fff", fontSize: { xs: "20px", md: "26px" }, fontWeight: 800, lineHeight: 1.2 }}>
              Hello, {therapistInfo?.user?.name?.split(" ")[0] || "Therapist"}!
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", mt: 0.5, fontWeight: 500 }}>
              Ready to make a difference today?
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: "none", sm: "block" },
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              borderRadius: "14px",
              px: 2.5,
              py: 1.5,
              border: "1px solid rgba(255,255,255,0.15)",
              textAlign: "right",
            }}
          >
            <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              Today
            </Typography>
            <Typography sx={{ color: "#fff", fontSize: "13px", fontWeight: 700, mt: 0.3 }}>
              {today}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={isMobile ? 1.2 : 2}>
        {stats.map((stat, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: "12px 14px", md: "18px 22px" },
                borderRadius: { xs: "14px", md: "16px" },
                border: "1.5px solid #f1f5f9",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.2, md: 2 },
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: stat.color + "55",
                  boxShadow: `0 6px 20px ${stat.color}12`,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 34, md: 46 },
                  height: { xs: 34, md: 46 },
                  borderRadius: { xs: "9px", md: "11px" },
                  background: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {React.cloneElement(stat.icon, {
                  sx: { fontSize: { xs: 16, md: 22 }, color: stat.color },
                })}
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    color: "#94a3b8",
                    fontSize: { xs: "9px", md: "11px" },
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    lineHeight: 1,
                    mb: 0.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#1e293b",
                    fontSize: { xs: "15px", md: "24px" },
                    lineHeight: 1,
                    letterSpacing: "-0.5px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {stat.value}
                </Typography>
                {stat.trend && (
                  <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.2, mt: 0.3 }}>
                    <TrendingUpIcon sx={{ fontSize: 11, color: "#2ecc71" }} />
                    <Typography sx={{ fontSize: "10px", color: "#2ecc71", fontWeight: 700 }}>
                      {stat.trend}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

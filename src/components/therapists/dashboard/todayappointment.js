import React from "react";
import { defaultProfile } from "../../../utils/url";
import { Box, Typography, Button, Avatar, Chip, Paper } from "@mui/material";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function TodayAppointment({ data }) {
  const appointments = data || [];

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "15px", color: "#1e293b" }}>
          Today's Sessions
        </Typography>
        <Chip
          label={`${appointments.length} session${appointments.length !== 1 ? "s" : ""}`}
          size="small"
          sx={{ background: "#f0fdf4", color: "#2ecc71", fontWeight: 700, fontSize: "10px", height: 20, borderRadius: "6px" }}
        />
      </Box>

      <Paper elevation={0} sx={{ borderRadius: "16px", border: "1.5px solid #f1f5f9", overflow: "hidden", background: "#fff" }}>
        {appointments.length > 0 ? (
          appointments.map((appt, i) => (
            <Box
              key={appt.id}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2.5,
                py: 1.8,
                gap: 2,
                borderBottom: i < appointments.length - 1 ? "1px solid #f8fafc" : "none",
                transition: "background 0.15s",
                "&:hover": { background: "#fafafa" },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#2ecc71",
                  flexShrink: 0,
                  boxShadow: "0 0 0 3px #f0fdf4",
                }}
              />
              <Avatar
                src={appt.imgSrc || defaultProfile}
                alt={appt.name}
                sx={{ width: 40, height: 40, borderRadius: "10px", flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#1e293b",
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {appt.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.3 }}>
                  <AccessTimeIcon sx={{ fontSize: 10, color: "#94a3b8" }} />
                  <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                    {appt.date}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={appt.badge || "Online"}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "10px",
                  fontWeight: 700,
                  borderRadius: "5px",
                  background: appt.badge === "Offline" ? "#f1f5f9" : "#f0fdf4",
                  color: appt.badge === "Offline" ? "#64748b" : "#2ecc71",
                  flexShrink: 0,
                  display: { xs: "none", sm: "flex" },
                }}
              />
              <Button
                variant="contained"
                size="small"
                sx={{
                  background: "linear-gradient(135deg, #228756, #1b6843)",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "11px",
                  fontWeight: 700,
                  px: { xs: 1.2, sm: 1.5 },
                  py: 0.6,
                  flexShrink: 0,
                  boxShadow: "none",
                  minWidth: "auto",
                  "&:hover": { background: "linear-gradient(135deg, #1b6843, #155235)", boxShadow: "0 4px 10px rgba(34,135,86,0.3)" },
                }}
              >
                <VideoCallIcon sx={{ fontSize: 16 }} />
              </Button>
            </Box>
          ))
        ) : (
          <Box sx={{ p: 3.5, textAlign: "center" }}>
            <Typography sx={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>
              No sessions scheduled for today
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

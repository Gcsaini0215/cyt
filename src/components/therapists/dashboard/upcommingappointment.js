import React from "react";
import "./upcommingappointment.css";
import { defaultProfile } from "../../../utils/url";
import { Box, Typography, Button, Avatar, Chip, Paper, Tooltip, IconButton } from "@mui/material";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import ChatIcon from "@mui/icons-material/Chat";
import InfoIcon from "@mui/icons-material/Info";

export default function UpcomingAppointment({ data }) {
  const appointments = data || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: { xs: 'max-content', sm: '100%' } }}>
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <Paper
            elevation={0}
            key={appointment.id}
            sx={{
              p: 3,
              borderRadius: "24px",
              background: "#ffffff",
              border: "1px solid #f1f5f9",
              display: "flex",
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: "stretch",
              justifyContent: "space-between",
              transition: "all 0.3s ease",
              minWidth: { xs: '320px', sm: '100%' },
              "&:hover": {
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                borderColor: "#e2e8f0",
                transform: 'scale(1.01)'
              }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, width: { xs: '100%', sm: 'auto' } }}>
              <Avatar
                src={appointment.imgSrc || defaultProfile}
                alt={appointment.name}
                sx={{ width: 64, height: 64, borderRadius: "18px", boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                  {appointment.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip 
                    label={`#${appointment.id}`} 
                    size="small" 
                    sx={{ height: 20, fontSize: '10px', fontWeight: 800, bgcolor: '#f1f5f9', color: '#64748b' }} 
                  />
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                  <Typography variant="body2" sx={{ color: "#228756", fontWeight: 700 }}>
                    {appointment.date}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: { xs: 1.5, sm: 3 },
              flexDirection: { xs: 'row', sm: 'row' },
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 1.5, sm: 0 },
              justifyContent: { xs: 'space-between', sm: 'flex-end' }
            }}>
              <Box sx={{ 
                textAlign: 'right', 
                width: { xs: 'auto', sm: 'auto' },
                display: 'flex',
                justifyContent: { xs: 'center', sm: 'flex-end' }
              }}>
                <Chip 
                  label={appointment.badge || "Online"} 
                  size="small" 
                  sx={{ 
                    borderRadius: '6px', 
                    fontWeight: 600,
                    background: appointment.badge === "Offline" ? "#f1f5f9" : "#e8f5e9",
                    color: appointment.badge === "Offline" ? "#64748b" : "#228756",
                  }} 
                />
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                width: { xs: 'auto', sm: 'auto' },
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}>
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                  <Tooltip title="Patient Details">
                    <IconButton size="small" sx={{ color: '#64748b' }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Quick Chat">
                    <IconButton size="small" sx={{ color: '#64748b' }}>
                      <ChatIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<VideoCallIcon />}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #228756 0%, #1b6843 100%)",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: { xs: '12px', sm: '13px' },
                    px: { xs: 1.5, sm: 2 },
                    boxShadow: "0 4px 10px rgba(34, 135, 86, 0.2)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #1b6843 0%, #155235 100%)",
                    }
                  }}
                >
                  Join Session
                </Button>
              </Box>
            </Box>
          </Paper>
        ))
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "24px",
            background: "#f8fafc",
            border: "2px dashed #e2e8f0",
            textAlign: "center"
          }}
        >
          <Typography sx={{ color: "#64748b" }}>
            No upcoming sessions available
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

import React from "react";
import { Box, Typography, Paper, Button, Grid, Avatar } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Link from "next/link";

export default function QuickActions() {
  const actions = [
    { title: "Write Blog", icon: <EditIcon />, to: "/therapist-blogs", color: "#228756" },
    { title: "Create Event", icon: <AddBoxIcon />, to: "/workshops", color: "#1976d2" },
    { title: "New Coupon", icon: <ConfirmationNumberIcon />, to: "/coupons", color: "#ed6c02" },
    { title: "Update Slots", icon: <ScheduleIcon />, to: "/settings", color: "#9c27b0" },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: "24px",
        background: "#ffffff",
        border: "1px solid #f1f5f9",
        height: '100%',
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5 }}>
          Quick Actions
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 500 }}>
          Manage your practice tools
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {actions.map((action, index) => (
          <Grid item xs={6} key={index}>
            <Link href={action.to} style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  flexDirection: 'column',
                  gap: 2,
                  py: 4,
                  px: 2,
                  borderRadius: '24px',
                  borderColor: '#f1f5f9',
                  color: '#1e293b',
                  textTransform: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: '#f8fafc',
                    borderColor: action.color,
                    color: action.color,
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 20px ${action.color}15`
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: `${action.color}15`, 
                    color: action.color,
                    width: 60,
                    height: 60,
                    boxShadow: `0 4px 12px ${action.color}20`
                  }}
                >
                  {React.cloneElement(action.icon, { sx: { fontSize: 30 } })}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                  {action.title}
                </Typography>
              </Button>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import Link from "next/link";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function QuickActions() {
  const actions = [
    { title: "Create Event", desc: "Add a new workshop", icon: <AddBoxIcon />, to: "/workshops", color: "#0ea5e9" },
    { title: "Create Report", desc: "New session report", icon: <AssessmentIcon />, to: "/create-report", color: "#f59e0b" },
    { title: "Update Slots", desc: "Manage availability", icon: <ScheduleIcon />, to: "/settings", color: "#8b5cf6" },
    { title: "View Invoices", desc: "Billing & payments", icon: <ConfirmationNumberIcon />, to: "/clinic-patients", color: "#2ecc71" },
  ];

  return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: "1.5px solid #f1f5f9", background: "#fff", overflow: "hidden" }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "15px", color: "#1e293b" }}>Quick Actions</Typography>
        <Typography sx={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500, mt: 0.3 }}>
          Shortcuts to key features
        </Typography>
      </Box>

      {actions.map((action, i) => (
        <Link key={i} href={action.to} style={{ textDecoration: "none" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 3,
              py: 1.8,
              borderTop: "1px solid #f8fafc",
              cursor: "pointer",
              transition: "background 0.15s",
              "&:hover": { background: "#f8fafc" },
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: action.color + "15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {React.cloneElement(action.icon, { sx: { fontSize: 19, color: action.color } })}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#1e293b", lineHeight: 1.3 }}>
                {action.title}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                {action.desc}
              </Typography>
            </Box>
            <ChevronRightIcon sx={{ fontSize: 16, color: "#cbd5e1", flexShrink: 0 }} />
          </Box>
        </Link>
      ))}
    </Paper>
  );
}

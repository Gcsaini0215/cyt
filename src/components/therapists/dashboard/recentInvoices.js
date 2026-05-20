import React from "react";
import { Box, Typography, Paper, Chip, Avatar, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Link from "next/link";

function statusStyle(status) {
  const s = (status || "").toLowerCase();
  if (s === "success" || s === "completed" || s === "paid")
    return { bg: "#f0fdf4", color: "#16a34a", label: "Paid" };
  if (s === "pending" || s === "awaiting")
    return { bg: "#fffbeb", color: "#d97706", label: "Pending" };
  if (s === "failed" || s === "cancelled")
    return { bg: "#fef2f2", color: "#dc2626", label: "Failed" };
  return { bg: "#f0fdf4", color: "#16a34a", label: status || "Paid" };
}

function avatarColor(name) {
  const colors = ["#0ea5e9","#8b5cf6","#f59e0b","#228756","#f43f5e","#14b8a6"];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
}

export default function RecentInvoices({ data }) {
  const invoices = data || [];

  return (
    <Paper elevation={0} sx={{ borderRadius: "18px", border: "1.5px solid #f1f5f9", background: "#fff", overflow: "hidden" }}>
      {/* header */}
      <Box sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        px: { xs: "16px", md: "22px" }, py: { xs: "14px", md: "18px" },
        borderBottom: "1px solid #f8fafc",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "14px", color: "#1e293b" }}>Recent Invoices</Typography>
          <Chip label={invoices.length} size="small" sx={{ height: 18, fontSize: "10px", fontWeight: 700, background: "#f0fdf4", color: "#228756", borderRadius: "5px" }} />
        </Box>
        <Button component={Link} href="/clinic-patients"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
          sx={{ color: "#228756", fontWeight: 700, textTransform: "none", fontSize: "11px", px: 0, minWidth: 0 }}>
          View All
        </Button>
      </Box>

      {invoices.length > 0 ? (
        invoices.map((inv, i) => {
          const { bg, color, label } = statusStyle(inv.status);
          const ac = avatarColor(inv.client_name);
          return (
            <Box key={inv.id} sx={{
              display: "flex", alignItems: "center",
              px: { xs: "16px", md: "22px" }, py: { xs: "12px", md: "14px" },
              gap: { xs: 1.4, md: 2 },
              borderBottom: i < invoices.length - 1 ? "1px solid #f8fafc" : "none",
              "&:hover": { background: "#fafafa" },
              transition: "background 0.15s",
            }}>
              <Avatar sx={{
                width: { xs: 34, md: 38 }, height: { xs: 34, md: 38 },
                borderRadius: "10px", background: ac + "20",
                color: ac, fontSize: "13px", fontWeight: 800, flexShrink: 0,
              }}>
                {inv.client_name?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: "12px", md: "13px" }, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {inv.client_name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.2 }}>
                  <Typography sx={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>
                    #{inv.invoice_id}
                  </Typography>
                  <Box sx={{ width: 2, height: 2, borderRadius: "50%", background: "#e2e8f0" }} />
                  <Typography sx={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500 }}>
                    {inv.booking_date}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: "13px", md: "14px" }, color: "#1e293b", letterSpacing: "-0.3px" }}>
                  ₹{Number(inv.amount || 0).toLocaleString("en-IN")}
                </Typography>
                <Chip label={label} size="small" sx={{
                  mt: 0.4, height: 17, fontSize: "9px", fontWeight: 700,
                  borderRadius: "5px", background: bg, color,
                }} />
              </Box>
            </Box>
          );
        })
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 5, gap: 1 }}>
          <ReceiptLongIcon sx={{ fontSize: 36, color: "#e2e8f0" }} />
          <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 500 }}>No invoices yet</Typography>
        </Box>
      )}
    </Paper>
  );
}

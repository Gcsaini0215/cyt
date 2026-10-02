import React from "react";
import Link from "next/link";
import { Box, Typography, Skeleton } from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

// Same brand header as the therapist dashboard (deep green, gold accents,
// glass stat chips), with invoice totals instead of today's numbers.
const GOLD = "#f2c94c";
const inr = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const fmt = (d) => (d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "—");

function Stat({ icon: Icon, label, value, loading }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.16)", borderRadius: "12px", px: 1.5, py: 1.1, minWidth: 0 }}>
      <Box sx={{ width: 34, height: 34, borderRadius: "10px", background: "rgba(242,201,76,.16)", color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: ".6px", whiteSpace: "nowrap" }}>{label}</Typography>
        {loading
          ? <Skeleton variant="text" width={70} sx={{ bgcolor: "rgba(255,255,255,.15)", fontSize: 18 }} />
          : <Typography sx={{ fontSize: { xs: 15, md: 17 }, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</Typography>}
      </Box>
    </Box>
  );
}

export default function InvoicesHeader({ invoices = [], loading, since }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const total = invoices.reduce((s, r) => s + r.amount, 0);
  const month = invoices.filter((r) => r.booking_date && r.booking_date >= monthStart).reduce((s, r) => s + r.amount, 0);
  const last = invoices[0];

  return (
    <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
      <Box component="nav" aria-label="breadcrumb" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5, fontSize: 13, color: "#64748b", fontWeight: 600 }}>
        <Link href="/therapist-dashboard" style={{ color: "inherit", textDecoration: "none" }}>Dashboard</Link>
        <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
        <Box component="span" sx={{ color: "#166534" }}>Invoices</Box>
      </Box>

      <Box sx={{
        position: "relative", overflow: "hidden", borderRadius: "16px", color: "#fff",
        p: { xs: 2, sm: 2.5, md: 3 },
        background: "radial-gradient(120% 140% at 100% 0%, rgba(74,222,128,.22) 0%, transparent 55%), linear-gradient(135deg, #0f3d24 0%, #134e2b 55%, #17663a 100%)",
        boxShadow: "0 18px 40px -22px rgba(15,61,36,.55)",
      }}>
        <Box sx={{ position: "absolute", top: -70, right: -50, width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(255,255,255,.08)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, opacity: 0.55 }} />

        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1.5, mb: { xs: 2, md: 2.5 } }}>
          <Box sx={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ReceiptLongRoundedIcon sx={{ fontSize: 24, color: GOLD }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h1" sx={{ fontSize: { xs: 19, md: 24 }, fontWeight: 800, lineHeight: 1.2, m: 0, color: "#fff !important" }}>Invoices</Typography>
            <Typography sx={{ fontSize: { xs: 12, md: 13 }, color: "rgba(255,255,255,.7)", fontWeight: 600, mt: 0.25 }}>
              {since ? `Paid sessions since ${fmt(since)} · ` : "All paid sessions · "}download or print any invoice
            </Typography>
          </Box>
        </Box>

        <Box sx={{ position: "relative", display: "grid", gap: 1, gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" } }}>
          <Stat icon={AccountBalanceWalletRoundedIcon} label={since ? "Total since reset" : "Total invoiced"} value={inr(total)} loading={loading} />
          <Stat icon={CalendarMonthRoundedIcon} label="This month" value={inr(month)} loading={loading} />
          <Stat icon={ReceiptLongRoundedIcon} label="Invoices" value={invoices.length} loading={loading} />
          <Stat icon={ScheduleRoundedIcon} label={last ? `Last · ${(last.paid_on || last.booking_date)?.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}` : "Last payment"} value={last ? inr(last.amount) : "—"} loading={loading} />
        </Box>
      </Box>
    </Box>
  );
}

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import MainLayout from "../components/therapists/main-layout";
const PerformanceChart = dynamic(
  () => import("../components/therapists/dashboard/PerformanceChart"),
  { ssr: false, loading: () => <Box sx={{ height: 280, borderRadius: "20px", background: "#f8fafc", border: "1.5px solid #f1f5f9" }} /> }
);
import RecentInvoices from "../components/therapists/dashboard/recentInvoices";
import QuickActions from "../components/therapists/dashboard/QuickActions";
import {
  getBookings, GetMyWorkshopBooking, defaultProfile, imagePath,
} from "../utils/url";
import { fetchById } from "../utils/actions";
import useTherapistStore from "../store/therapistStore";
import Link from "next/link";
import {
  Box, Typography, Paper, Avatar, Button, Grid,
  Skeleton, IconButton, Tooltip,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RefreshIcon from "@mui/icons-material/Refresh";

/* ── helpers ─────────────────────────────────────────────── */
function getNum(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function fmtDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
function fmtTime(d) { return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }); }
function fmtShortDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }

function timeUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return "Starting now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `in ${Math.floor(h / 24)}d`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

/* ── CountUp hook ────────────────────────────────────────── */
function useCountUp(end, duration = 1400) {
  const [count, setCount] = React.useState(0);
  const raf = React.useRef(null);
  React.useEffect(() => {
    if (!end) { setCount(0); return; }
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(e * end));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setCount(end);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [end, duration]);
  return count;
}

/* ── Stat card ───────────────────────────────────────────── */
function StatCard({ icon, label, numericValue, isCurrency, color, bg, trend, trendUp, loading }) {
  const counted = useCountUp(loading ? 0 : (numericValue || 0));
  const display = loading ? null
    : isCurrency ? `₹${counted.toLocaleString("en-IN")}`
    : counted;

  return (
    <Paper elevation={0} sx={{
      borderRadius: "18px",
      border: "1.5px solid #f1f5f9",
      background: "#fff",
      height: "100%",
      overflow: "hidden",
      transition: "all 0.22s ease",
      position: "relative",
      "&:hover": { borderColor: color + "44", boxShadow: `0 8px 24px ${color}14`, transform: "translateY(-2px)" },
    }}>
      {/* top color bar */}
      <Box sx={{ height: "3px", background: color, borderRadius: "18px 18px 0 0" }} />
      <Box sx={{ p: { xs: "12px 14px 14px", md: "16px 20px 18px" }, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ color: "#94a3b8", fontSize: { xs: "9px", md: "10px" }, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px" }}>
            {label}
          </Typography>
          <Box sx={{ width: { xs: 30, md: 36 }, height: { xs: 30, md: 36 }, borderRadius: "9px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {React.cloneElement(icon, { sx: { fontSize: { xs: 15, md: 17 }, color } })}
          </Box>
        </Box>
        {loading
          ? <Skeleton width={72} height={32} sx={{ borderRadius: "8px" }} />
          : <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: { xs: "18px", md: "26px" }, lineHeight: 1, letterSpacing: "-0.5px" }}>
              {display}
            </Typography>
        }
        {trend && !loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            {trendUp !== false
              ? <TrendingUpIcon sx={{ fontSize: 11, color: "#2ecc71" }} />
              : <TrendingDownIcon sx={{ fontSize: 11, color: "#f87171" }} />}
            <Typography sx={{ fontSize: "10px", color: trendUp !== false ? "#2ecc71" : "#f87171", fontWeight: 700 }}>
              {trend}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

/* ── Next session card ───────────────────────────────────── */
function NextSessionCard({ session }) {
  const [countdown, setCountdown] = React.useState(() => session ? timeUntil(session.date) : "");
  React.useEffect(() => {
    if (!session) return;
    const iv = setInterval(() => setCountdown(timeUntil(session.date)), 60000);
    return () => clearInterval(iv);
  }, [session]);

  if (!session) return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: "1.5px solid #f1f5f9", background: "#fff", p: "20px 22px" }}>
      <Typography sx={{ fontWeight: 800, fontSize: "13px", color: "#1e293b", mb: 0.5 }}>Next Session</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 2, pb: 1 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: "12px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EventBusyIcon sx={{ fontSize: 22, color: "#e2e8f0" }} />
        </Box>
        <Typography sx={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>No upcoming sessions</Typography>
      </Box>
    </Paper>
  );

  const minsUntil = Math.floor((new Date(session.date) - new Date()) / 60000);
  const isImminent = minsUntil <= 30 && minsUntil >= 0;
  const accentColor = isImminent ? "#f59e0b" : "#228756";
  const accentBg = isImminent ? "#fffbeb" : "#f0fdf4";

  return (
    <Paper elevation={0} sx={{
      borderRadius: "20px",
      border: `1.5px solid ${isImminent ? "#fde68a" : "#dcfce7"}`,
      background: "#fff", overflow: "hidden",
    }}>
      {/* header strip */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.2, py: 1.3, background: accentBg, borderBottom: `1px solid ${isImminent ? "#fde68a" : "#dcfce7"}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: accentColor, boxShadow: `0 0 0 3px ${accentColor}30` }} />
          <Typography sx={{ fontWeight: 800, fontSize: "11.5px", color: isImminent ? "#92400e" : "#14532d", letterSpacing: "0.2px" }}>
            {isImminent ? "Starting Soon!" : "Next Session"}
          </Typography>
        </Box>
        <Box sx={{ background: accentColor, borderRadius: "7px", px: 1.2, py: 0.35 }}>
          <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#fff" }}>{countdown}</Typography>
        </Box>
      </Box>

      {/* body */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.8, px: 2.2, py: 1.8 }}>
        <Avatar src={session.imgSrc || defaultProfile} alt={session.name}
          sx={{ width: 50, height: 50, borderRadius: "14px", border: `2px solid ${accentBg}`, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "14.5px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
            {session.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.4 }}>
            <CalendarTodayIcon sx={{ fontSize: 10, color: "#94a3b8" }} />
            <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
              {fmtShortDate(session.date)} · {fmtTime(session.date)}
            </Typography>
          </Box>
        </Box>
        {session.badge !== "Offline" && (
          <Button variant="contained" size="small" startIcon={<VideoCallIcon sx={{ fontSize: 14 }} />}
            sx={{
              background: accentColor, borderRadius: "10px",
              textTransform: "none", fontSize: "11px", fontWeight: 700,
              px: 1.6, py: 0.8, flexShrink: 0, boxShadow: "none",
              "&:hover": { opacity: 0.88, boxShadow: "none" },
            }}>
            Join
          </Button>
        )}
      </Box>
    </Paper>
  );
}

/* ── Schedule list ───────────────────────────────────────── */
function ScheduleList({ title, sessions, max = 5, allHref }) {
  const visible = sessions.slice(0, max);
  const now = new Date();

  return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: "1.5px solid #f1f5f9", background: "#fff", overflow: "hidden" }}>
      {/* header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2.2, py: 1.8, borderBottom: "1px solid #f8fafc" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "13.5px", color: "#1e293b" }}>{title}</Typography>
          <Box sx={{ background: "#f0fdf4", borderRadius: "6px", px: 1, py: 0.2 }}>
            <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#228756" }}>{sessions.length}</Typography>
          </Box>
        </Box>
        {allHref && sessions.length > max && (
          <Link href={allHref} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 2, color: "#228756", fontSize: "12px", fontWeight: 700 }}>
            View all <ChevronRightIcon sx={{ fontSize: 14 }} />
          </Link>
        )}
      </Box>

      {visible.length > 0 ? visible.map((s, i) => {
        const sd = new Date(s.date);
        const isPast  = sd < now;
        const isToday = sd.toDateString() === now.toDateString();
        const isSoon  = !isPast && (sd - now) < 3600000;
        const borderColor = isPast ? "#e2e8f0" : isSoon ? "#f59e0b" : "#2ecc71";

        return (
          <Box key={s.id} sx={{
            display: "flex", alignItems: "center",
            px: 2.2, py: { xs: 1.4, md: 1.6 }, gap: 1.6,
            borderLeft: `3px solid ${borderColor}`,
            borderBottom: i < visible.length - 1 ? "1px solid #f8fafc" : "none",
            "&:hover": { background: "#fafcff" }, transition: "background 0.15s",
          }}>
            <Avatar src={s.imgSrc || defaultProfile} alt={s.name}
              sx={{ width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 }, borderRadius: "11px", flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "13px", md: "13.5px" }, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mt: 0.25 }}>
                <AccessTimeIcon sx={{ fontSize: 10, color: "#94a3b8" }} />
                <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                  {isToday ? fmtTime(s.date) : `${fmtShortDate(s.date)} · ${fmtTime(s.date)}`}
                </Typography>
                {isSoon && (
                  <Box sx={{ background: "#fffbeb", borderRadius: "5px", px: 0.8, py: 0.1 }}>
                    <Typography sx={{ fontSize: "9px", fontWeight: 800, color: "#d97706" }}>Soon</Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
              <Box sx={{
                background: s.badge === "Offline" ? "#f1f5f9" : "#f0fdf4",
                borderRadius: "7px", px: 1, py: 0.3,
                display: { xs: "none", sm: "flex" },
              }}>
                <Typography sx={{ fontSize: "9.5px", fontWeight: 800, color: s.badge === "Offline" ? "#64748b" : "#228756" }}>
                  {s.badge || "Online"}
                </Typography>
              </Box>
              {!isPast && s.badge !== "Offline" && (
                <IconButton size="small" sx={{
                  background: "linear-gradient(135deg,#228756,#1b6843)", color: "#fff",
                  width: 30, height: 30, borderRadius: "9px", "&:hover": { opacity: 0.88 },
                }}>
                  <VideoCallIcon sx={{ fontSize: 15 }} />
                </IconButton>
              )}
            </Box>
          </Box>
        );
      }) : (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <EventBusyIcon sx={{ fontSize: 30, color: "#e2e8f0", mb: 1 }} />
          <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>No sessions scheduled</Typography>
        </Box>
      )}
    </Paper>
  );
}

/* ── Profile completion ──────────────────────────────────── */
function ProfileCard({ checks, pct }) {
  const done = checks.filter(c => c.done).length;
  return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: "1.5px solid #f1f5f9", background: "#fff", overflow: "hidden" }}>
      <Box sx={{ px: "20px", pt: "18px", pb: pct < 100 ? "10px" : "20px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.2 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "13.5px", color: "#1e293b", lineHeight: 1.2 }}>Profile Setup</Typography>
            <Typography sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, mt: 0.3 }}>
              {done} of {checks.length} steps done
            </Typography>
          </Box>
          <Box sx={{ width: 42, height: 42, borderRadius: "50%", border: "3px solid #e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: "12px", color: pct === 100 ? "#2ecc71" : "#228756" }}>{pct}%</Typography>
          </Box>
        </Box>
        {/* segmented progress */}
        <Box sx={{ display: "flex", gap: "3px", mb: 1.8 }}>
          {checks.map((c, i) => (
            <Box key={i} sx={{ flex: 1, height: 5, borderRadius: 2, background: c.done ? "#228756" : "#f1f5f9", transition: "background 0.4s" }} />
          ))}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
          {checks.map((c, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {c.done
                ? <CheckCircleIcon sx={{ fontSize: 14, color: "#2ecc71", flexShrink: 0 }} />
                : <RadioButtonUncheckedIcon sx={{ fontSize: 14, color: "#cbd5e1", flexShrink: 0 }} />}
              <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: c.done ? "#94a3b8" : "#475569", textDecoration: c.done ? "line-through" : "none" }}>
                {c.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      {pct < 100 && (
        <Box sx={{ px: "16px", pb: "16px" }}>
          <Link href="/settings" style={{ textDecoration: "none" }}>
            <Box sx={{
              py: "10px", borderRadius: "12px",
              background: "linear-gradient(135deg,#1b5e20,#228756)",
              textAlign: "center", cursor: "pointer",
              "&:hover": { opacity: 0.9 }, transition: "opacity 0.2s",
            }}>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>Complete Profile →</Typography>
            </Box>
          </Link>
        </Box>
      )}
    </Paper>
  );
}

/* ── Quick links ─────────────────────────────────────────── */
function QuickLinks() {
  const links = [
    { label: "Sessions", icon: "feather-calendar",  to: "/appointments",    color: "#0ea5e9", bg: "#f0f9ff" },
    { label: "Invoices", icon: "feather-file-text", to: "/clinic-patients", color: "#228756", bg: "#f0fdf4" },
    { label: "Events",   icon: "feather-briefcase", to: "/workshops",       color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "Settings", icon: "feather-settings",  to: "/settings",        color: "#f59e0b", bg: "#fffbeb" },
  ];
  return (
    <Paper elevation={0} sx={{ borderRadius: "18px", border: "1.5px solid #f1f5f9", background: "#fff", p: { xs: "10px 8px", md: "14px 16px" } }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: { xs: 0.5, md: 1 } }}>
        {links.map(a => (
          <Link key={a.to} href={a.to} style={{ textDecoration: "none" }}>
            <Box sx={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8,
              py: { xs: 1.2, md: 1.5 }, borderRadius: "12px",
              "&:hover": { background: a.bg }, "&:active": { transform: "scale(0.96)" },
              transition: "all 0.15s", cursor: "pointer",
            }}>
              <Box sx={{ width: { xs: 38, md: 44 }, height: { xs: 38, md: 44 }, borderRadius: "12px", background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={a.icon} style={{ fontSize: 18, color: a.color }} />
              </Box>
              <Typography sx={{ fontSize: { xs: "10px", md: "11px" }, fontWeight: 700, color: "#64748b", textAlign: "center" }}>
                {a.label}
              </Typography>
            </Box>
          </Link>
        ))}
      </Box>
    </Paper>
  );
}

/* ── Sessions card (tabbed Today / Upcoming) ─────────────── */
function SessionsCard({ todaySessions, upcomingSessions }) {
  const [tab, setTab] = React.useState("today");
  const list = tab === "today" ? todaySessions : upcomingSessions;
  const now = new Date();
  return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: "1.5px solid #f1f5f9", background: "#fff", overflow: "hidden" }}>
      <Box sx={{ px: 2.2, pt: 1.8, borderBottom: "1px solid #f1f5f9" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "13.5px", color: "#1e293b" }}>Sessions</Typography>
          <Link href="/appointments" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 2, color: "#228756", fontSize: "12px", fontWeight: 700 }}>
            View all <ChevronRightIcon sx={{ fontSize: 14 }} />
          </Link>
        </Box>
        <Box sx={{ display: "flex" }}>
          {[["today", "Today", todaySessions.length], ["upcoming", "Upcoming", upcomingSessions.length]].map(([key, label, count]) => (
            <Box key={key} onClick={() => setTab(key)} sx={{
              cursor: "pointer", pb: 1.2, mr: 3,
              borderBottom: tab === key ? "2px solid #228756" : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: tab === key ? "#228756" : "#94a3b8" }}>{label}</Typography>
                {count > 0 && (
                  <Box sx={{ background: tab === key ? "#f0fdf4" : "#f8fafc", borderRadius: "20px", px: 0.9 }}>
                    <Typography sx={{ fontSize: "10px", fontWeight: 800, color: tab === key ? "#228756" : "#94a3b8" }}>{count}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      {list.length === 0 ? (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <EventBusyIcon sx={{ fontSize: 28, color: "#e2e8f0", mb: 1 }} />
          <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>
            {tab === "today" ? "No sessions today" : "No upcoming sessions"}
          </Typography>
        </Box>
      ) : list.slice(0, 6).map((s, i) => {
        const sd = new Date(s.date);
        const isPast = sd < now;
        const isToday = sd.toDateString() === now.toDateString();
        const isSoon = !isPast && (sd - now) < 3600000;
        const borderColor = isPast ? "#e2e8f0" : isSoon ? "#f59e0b" : "#22c55e";
        return (
          <Box key={s.id} sx={{
            display: "flex", alignItems: "center", px: 2.2, py: 1.4, gap: 1.5,
            borderLeft: `3px solid ${borderColor}`,
            borderBottom: i < Math.min(list.length, 6) - 1 ? "1px solid #f8fafc" : "none",
            "&:hover": { background: "#fafcff" }, transition: "background 0.15s",
          }}>
            <Avatar src={s.imgSrc || defaultProfile} alt={s.name}
              sx={{ width: 38, height: 38, borderRadius: "11px", flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.2 }}>
                <AccessTimeIcon sx={{ fontSize: 10, color: "#94a3b8" }} />
                <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                  {isToday ? fmtTime(s.date) : `${fmtShortDate(s.date)} · ${fmtTime(s.date)}`}
                </Typography>
                {isSoon && <Box sx={{ background: "#fffbeb", borderRadius: "5px", px: 0.7, py: 0.1 }}>
                  <Typography sx={{ fontSize: "9px", fontWeight: 800, color: "#d97706" }}>Soon</Typography>
                </Box>}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexShrink: 0 }}>
              <Box sx={{ background: s.badge === "Offline" ? "#f1f5f9" : "#f0fdf4", borderRadius: "7px", px: 1, py: 0.3, display: { xs: "none", sm: "flex" } }}>
                <Typography sx={{ fontSize: "9px", fontWeight: 800, color: s.badge === "Offline" ? "#64748b" : "#228756" }}>
                  {s.badge || "Online"}
                </Typography>
              </Box>
              {!isPast && s.badge !== "Offline" && (
                <IconButton size="small" sx={{ background: "#228756", color: "#fff", width: 28, height: 28, borderRadius: "8px", "&:hover": { opacity: 0.88, background: "#228756" } }}>
                  <VideoCallIcon sx={{ fontSize: 13 }} />
                </IconButton>
              )}
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function TherapistDashboard() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastRefreshed, setLastRefreshed] = React.useState(null);
  const [showProfileModal, setShowProfileModal] = React.useState(false);

  const [stats, setStats] = React.useState({ totalEarnings: 0, monthEarnings: 0, upcoming: 0, totalClients: 0 });
  const [weeklyData, setWeeklyData] = React.useState(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(now.getDate() - (6 - i));
      return { name: DAY_NAMES[d.getDay()], sessions: 0, revenue: 0 };
    });
  });
  const [monthlyData, setMonthlyData] = React.useState(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { name: MONTH_NAMES[d.getMonth()], sessions: 0, revenue: 0 };
    });
  });
  const [todaySessions, setTodaySessions]     = React.useState([]);
  const [upcomingSessions, setUpcomingSessions] = React.useState([]);
  const [nextSession, setNextSession] = React.useState(null);
  const [invoices, setInvoices] = React.useState([]);

  const { therapistInfo, fetchTherapistInfo, paymentStore } = useTherapistStore();

  const load = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      if (!therapistInfo?.user?.email) fetchTherapistInfo();

      const [bookingsRes, workshopRes] = await Promise.all([
        fetchById(getBookings),
        fetchById(GetMyWorkshopBooking),
      ]);

      const bookings  = bookingsRes?.status  ? (bookingsRes.data  || []) : [];
      const workshops = workshopRes?.status  ? (workshopRes.data  || []) : [];

      const now      = new Date();
      const todayStr = now.toDateString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      /* ── earnings ── */
      let totalEarnings = 0, monthEarnings = 0, lastMonthEarnings = 0;
      bookings.forEach(b => {
        const st = (b.status || "").toLowerCase();
        const ps = (b.transaction?.status?.name || "").toLowerCase();
        if (st === "completed" || ps === "success" || ps === "completed") {
          const amt = getNum(b.transaction?.amount || b.amount || b.fee);
          const bd  = new Date(b.booking_date);
          totalEarnings += amt;
          if (bd >= monthStart) monthEarnings += amt;
          else if (bd >= lastMonthStart) lastMonthEarnings += amt;
        }
      });
      workshops.forEach(w => {
        const s = (w.payment_status || "").toLowerCase();
        if (s === "success" || s === "completed") {
          const amt = getNum(w.amount);
          const wd  = new Date(w.created_at || w.date);
          totalEarnings += amt;
          if (wd >= monthStart) monthEarnings += amt;
          else if (wd >= lastMonthStart) lastMonthEarnings += amt;
        }
      });

      /* ── clients ── */
      const clientSet = new Set(bookings.map(b => b.client?._id || b.client_id).filter(Boolean));

      /* ── today & upcoming ── */
      const toMap = b => ({
        id: b._id,
        name: b.client?.name || "Unknown",
        date: b.booking_date,
        badge: b.format || "Online",
        imgSrc: b.client?.photo || b.client?.profile,
      });

      const todayList = bookings
        .filter(b => new Date(b.booking_date).toDateString() === todayStr && b.status !== "Cancelled")
        .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
        .map(toMap);

      const upcomingList = bookings
        .filter(b => b.status !== "Completed" && b.status !== "Cancelled" && new Date(b.booking_date) > now)
        .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
        .map(toMap);

      /* ── weekly chart — last 7 days ── */
      const weekMap = {};
      DAY_NAMES.forEach(d => { weekMap[d] = { name: d, sessions: 0, revenue: 0 }; });
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      bookings.forEach(b => {
        const d = new Date(b.booking_date);
        if (d >= weekStart) {
          const key = DAY_NAMES[d.getDay()];
          weekMap[key].sessions++;
          weekMap[key].revenue += getNum(b.transaction?.amount || b.amount);
        }
      });
      const weeklyChart = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now); d.setDate(now.getDate() - (6 - i));
        return weekMap[DAY_NAMES[d.getDay()]];
      });

      /* ── monthly chart — last 6 months ── */
      const monthlyMap = new Map();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthlyMap.set(key, { name: MONTH_NAMES[d.getMonth()], sessions: 0, revenue: 0 });
      }
      bookings.forEach(b => {
        const d = new Date(b.booking_date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthlyMap.has(key)) {
          const e = monthlyMap.get(key);
          e.sessions++;
          e.revenue += getNum(b.transaction?.amount || b.amount);
        }
      });

      /* ── recent invoices ── */
      const inv = bookings
        .filter(b => b.transaction?.amount)
        .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
        .slice(0, 6)
        .map(b => ({
          id: b._id,
          invoice_id: b.transaction?.transaction_id?.slice(-8) || b._id?.slice(-8),
          client_name: b.client?.name || "Unknown",
          booking_date: fmtDate(b.booking_date),
          amount: b.transaction?.amount,
          status: b.transaction?.status?.name || "Success",
        }));

      const monthGrowth = lastMonthEarnings > 0
        ? `${((monthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(0)}% vs last mo`
        : "This month";

      setStats({ totalEarnings: Math.round(totalEarnings), monthEarnings: Math.round(monthEarnings), upcoming: upcomingList.length, totalClients: clientSet.size, monthGrowth, monthGrowthUp: monthEarnings >= lastMonthEarnings });
      setTodaySessions(todayList);
      setUpcomingSessions(upcomingList);
      setNextSession(upcomingList[0] || null);
      setWeeklyData(weeklyChart);
      setMonthlyData(Array.from(monthlyMap.values()));
      setInvoices(inv);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [therapistInfo?.user?.email]);

  React.useEffect(() => { load(); }, []);

  /* auto-refresh every 60s */
  React.useEffect(() => {
    const iv = setInterval(() => load(true), 60000);
    return () => clearInterval(iv);
  }, [load]);

  const profileChecks = React.useMemo(() => {
    const t = therapistInfo;
    return [
      { label: "Basic info added",      done: !!(t?.user?.name && t?.user?.phone) },
      { label: "Profile photo uploaded", done: !!t?.user?.profile },
      { label: "Availability set",       done: (t?.availabilities?.length || 0) > 0 },
      { label: "Fee configured",         done: t?.fees?.some(f => f.formats?.some(fmt => fmt.fee)) },
      { label: "Payment details added",  done: !!(paymentStore?.ac_number || paymentStore?.upi) },
    ];
  }, [therapistInfo, paymentStore]);
  const completionPct = Math.round((profileChecks.filter(c => c.done).length / profileChecks.length) * 100);

  /* show profile modal once per session if incomplete */
  React.useEffect(() => {
    if (!loading && completionPct < 100 && !sessionStorage.getItem("profileModalDone")) {
      const t = setTimeout(() => setShowProfileModal(true), 600);
      return () => clearTimeout(t);
    }
  }, [loading, completionPct]);

  const closeProfileModal = (go) => {
    sessionStorage.setItem("profileModalDone", "1");
    setShowProfileModal(false);
    if (go) router.push("/settings");
  };

  const name    = therapistInfo?.user?.name?.split(" ")[0] || "Therapist";
  const today   = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const avatarSrc = therapistInfo?.user?.profile
    ? `${imagePath}/${therapistInfo.user.profile}`
    : defaultProfile;

  const statCards = [
    { icon: <AccountBalanceWalletIcon />, label: "Total Earnings",  numericValue: stats.totalEarnings, isCurrency: true,  color: "#2ecc71", bg: "#f0fdf4", trend: "Lifetime",        trendUp: true },
    { icon: <TrendingUpIcon />,           label: "This Month",      numericValue: stats.monthEarnings, isCurrency: true,  color: "#0ea5e9", bg: "#f0f9ff", trend: stats.monthGrowth, trendUp: stats.monthGrowthUp },
    { icon: <CalendarMonthIcon />,        label: "Upcoming Sessions",numericValue: stats.upcoming,     isCurrency: false, color: "#8b5cf6", bg: "#f5f3ff" },
    { icon: <PeopleIcon />,               label: "Total Clients",   numericValue: stats.totalClients,  isCurrency: false, color: "#f59e0b", bg: "#fffbeb" },
  ];

  return (
    <MainLayout>
      <Box sx={{ pt: 0.5, pb: 5 }}>

        {/* ── COMPACT HEADER ──────────────────────────────── */}
        <Box sx={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          mb: { xs: 2, md: 2.5 }, flexWrap: "wrap", gap: 1,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={avatarSrc}
              alt={name}
              sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, borderRadius: "12px", flexShrink: 0 }}
            />
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.1rem", md: "1.4rem" }, color: "#1e293b", lineHeight: 1.2 }}>
                Hello, {name}!
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500, mt: 0.2 }}>
                {loading ? "Loading..."
                  : todaySessions.length > 0
                    ? `${todaySessions.length} session${todaySessions.length > 1 ? "s" : ""} today`
                    : "No sessions today"} · {today}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {lastRefreshed && (
              <Typography sx={{ fontSize: "11px", color: "#cbd5e1", display: { xs: "none", sm: "block" } }}>
                Synced {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </Typography>
            )}
            <Tooltip title="Refresh">
              <IconButton onClick={() => load(true)} disabled={refreshing} size="small"
                sx={{
                  background: "#f1f5f9", color: "#64748b", borderRadius: "10px",
                  "&:hover": { background: "#e2e8f0" },
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
                }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── STAT CARDS ──────────────────────────────────── */}
        <Grid container spacing={{ xs: 1.2, md: 2 }} sx={{ mb: { xs: 1.5, md: 2.5 } }}>
          {statCards.map((s, i) => (
            <Grid item xs={6} md={3} key={i}>
              <StatCard {...s} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* ── BELOW STATS ─────────────────────────────────── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2.5 } }}>

          {/* Main grid: left (chart + sessions) | right sidebar */}
          <Grid container spacing={{ xs: 1.5, md: 2.5 }}>

            {/* ── LEFT COLUMN ── */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2.5 } }}>

                {/* Next session – mobile only (sits above chart) */}
                <Box sx={{ display: { xs: "block", lg: "none" } }}>
                  <NextSessionCard session={nextSession} />
                </Box>

                <PerformanceChart weeklyData={weeklyData} monthlyData={monthlyData} />

                <SessionsCard todaySessions={todaySessions} upcomingSessions={upcomingSessions} />

                {/* Profile – mobile only (sits after sessions) */}
                <Box sx={{ display: { xs: "block", lg: "none" } }}>
                  <ProfileCard checks={profileChecks} pct={completionPct} />
                </Box>
              </Box>
            </Grid>

            {/* ── RIGHT SIDEBAR (desktop only, sticky) ── */}
            <Grid item lg={4} sx={{ display: { xs: "none", lg: "block" } }}>
              <Box sx={{ position: "sticky", top: "72px", display: "flex", flexDirection: "column", gap: 2 }}>
                <NextSessionCard session={nextSession} />
                <ProfileCard checks={profileChecks} pct={completionPct} />
              </Box>
            </Grid>

          </Grid>
        </Box>
      </Box>

      {/* ── Profile complete modal ───────────────────────── */}
      {showProfileModal && (
        <>
          <style>{`
            @keyframes pmFade{from{opacity:0}to{opacity:1}}
            @keyframes pmUp{from{transform:translateY(30px) scale(.97);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
          `}</style>
          <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.55)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"pmFade .2s ease" }}
            onClick={() => closeProfileModal(false)}>
            <div style={{ background:"#fff",borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:400,boxShadow:"0 24px 64px rgba(0,0,0,.28)",animation:"pmUp .3s cubic-bezier(.34,1.56,.64,1)" }}
              onClick={e => e.stopPropagation()}>

              {/* Icon + title */}
              <div style={{ textAlign:"center",marginBottom:20 }}>
                <div style={{ width:64,height:64,borderRadius:"50%",background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:30 }}>👋</div>
                <div style={{ fontWeight:900,fontSize:20,color:"#1e293b",marginBottom:6 }}>Complete Your Profile</div>
                <div style={{ fontSize:13,color:"#64748b",fontWeight:500,lineHeight:1.5 }}>
                  Your profile is <strong style={{ color:"#228756" }}>{completionPct}%</strong> complete. Finish setup to start receiving clients.
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ background:"#f1f5f9",borderRadius:8,height:8,marginBottom:18,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${completionPct}%`,background:"linear-gradient(90deg,#228756,#4ade80)",borderRadius:8,transition:"width .6s ease" }} />
              </div>

              {/* Steps */}
              <div style={{ display:"flex",flexDirection:"column",gap:7,marginBottom:24 }}>
                {profileChecks.map((c, i) => (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:12,background:c.done?"#f0fdf4":"#f8fafc" }}>
                    {c.done
                      ? <CheckCircleIcon sx={{ fontSize:16,color:"#22c55e",flexShrink:0 }} />
                      : <RadioButtonUncheckedIcon sx={{ fontSize:16,color:"#cbd5e1",flexShrink:0 }} />}
                    <span style={{ fontSize:13,fontWeight:600,color:c.done?"#94a3b8":"#475569",textDecoration:c.done?"line-through":"none" }}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <button onClick={() => closeProfileModal(true)}
                style={{ width:"100%",padding:"13px",background:"linear-gradient(135deg,#228756,#1b6843)",color:"#fff",border:"none",borderRadius:14,fontSize:14,fontWeight:800,cursor:"pointer",marginBottom:10,fontFamily:"inherit" }}>
                Setup Profile Now
              </button>
              <button onClick={() => closeProfileModal(false)}
                style={{ width:"100%",padding:"11px",background:"transparent",color:"#94a3b8",border:"1.5px solid #f1f5f9",borderRadius:14,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
                Remind me later
              </button>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}

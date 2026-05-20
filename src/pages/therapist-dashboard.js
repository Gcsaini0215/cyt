import React from "react";
import MainLayout from "../components/therapists/main-layout";
import PerformanceChart from "../components/therapists/dashboard/PerformanceChart";
import RecentInvoices from "../components/therapists/dashboard/recentInvoices";
import QuickActions from "../components/therapists/dashboard/QuickActions";
import {
  getBookings, GetMyWorkshopBooking, defaultProfile,
} from "../utils/url";
import { fetchById } from "../utils/actions";
import useTherapistStore from "../store/therapistStore";
import Link from "next/link";
import {
  Box, Typography, Paper, Avatar, Chip, Button, Grid,
  useMediaQuery, Skeleton, IconButton, Tooltip,
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
import AddBoxIcon from "@mui/icons-material/AddBox";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

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
function StatCard({ icon, label, value, numericValue, isCurrency, color, bg, trend, trendUp, loading }) {
  const counted = useCountUp(loading ? 0 : (numericValue || 0));
  const display = loading ? null
    : isCurrency ? `₹${counted.toLocaleString("en-IN")}`
    : counted;

  return (
    <Paper elevation={0} sx={{
      p: { xs: "14px 12px", md: "20px" },
      borderRadius: "18px",
      border: "1.5px solid #f1f5f9",
      background: "#fff",
      height: "100%",
      display: "flex", alignItems: "center",
      gap: { xs: 1.2, md: 1.8 },
      transition: "all 0.22s ease",
      "&:hover": {
        borderColor: color + "55",
        boxShadow: `0 8px 28px ${color}12`,
        transform: "translateY(-2px)",
      },
    }}>
      <Box sx={{
        width: { xs: 38, md: 48 }, height: { xs: 38, md: 48 },
        borderRadius: "12px", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {React.cloneElement(icon, { sx: { fontSize: { xs: 18, md: 22 }, color } })}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{
          color: "#94a3b8", fontSize: { xs: "9px", md: "10px" }, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.6px", mb: 0.5,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {label}
        </Typography>
        {loading
          ? <Skeleton width={64} height={28} sx={{ borderRadius: "6px" }} />
          : <Typography sx={{ fontWeight: 900, color: "#1e293b", fontSize: { xs: "16px", md: "24px" }, lineHeight: 1, letterSpacing: "-0.5px" }}>
              {display}
            </Typography>
        }
        {trend && !loading && (
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.3, mt: 0.5 }}>
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
    <Paper elevation={0} sx={{ borderRadius: "18px", border: "1.5px solid #f1f5f9", p: "20px", background: "#fff" }}>
      <Typography sx={{ fontWeight: 800, fontSize: "13px", color: "#1e293b", mb: 1.5 }}>Next Session</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2.5, gap: 1 }}>
        <EventBusyIcon sx={{ fontSize: 36, color: "#e2e8f0" }} />
        <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>No upcoming sessions</Typography>
      </Box>
    </Paper>
  );

  const minsUntil = Math.floor((new Date(session.date) - new Date()) / 60000);
  const isImminent = minsUntil <= 30 && minsUntil >= 0;

  return (
    <Paper elevation={0} sx={{
      borderRadius: "18px",
      border: `1.5px solid ${isImminent ? "#fbbf24" : "#dcfce7"}`,
      background: isImminent ? "linear-gradient(135deg,#fffbeb,#fff)" : "linear-gradient(135deg,#f0fdf4,#fff)",
      overflow: "hidden",
    }}>
      <Box sx={{
        background: isImminent
          ? "linear-gradient(135deg,#92400e,#d97706)"
          : "linear-gradient(135deg,#1b5e20,#228756)",
        px: "18px", py: "10px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Typography sx={{ fontWeight: 800, fontSize: "11px", color: "#fff", letterSpacing: "0.3px" }}>
          {isImminent ? "Starting Soon!" : "Next Session"}
        </Typography>
        <Chip label={countdown} size="small" sx={{
          height: 20, fontSize: "10px", fontWeight: 700,
          background: "rgba(255,255,255,0.22)", color: "#fff", borderRadius: "6px",
        }} />
      </Box>
      <Box sx={{ p: "14px 18px", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar src={session.imgSrc || defaultProfile} alt={session.name}
          sx={{ width: 46, height: 46, borderRadius: "12px", border: "2px solid #dcfce7", flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "14px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
            <CalendarTodayIcon sx={{ fontSize: 10, color: "#94a3b8" }} />
            <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
              {fmtShortDate(session.date)} · {fmtTime(session.date)}
            </Typography>
          </Box>
          <Chip label={session.badge || "Online"} size="small" sx={{
            mt: 0.5, height: 17, fontSize: "9px", fontWeight: 700,
            borderRadius: "5px", background: "#f0fdf4", color: "#228756",
          }} />
        </Box>
        {session.badge !== "Offline" && (
          <Button variant="contained" size="small" startIcon={<VideoCallIcon sx={{ fontSize: 13 }} />}
            sx={{
              background: "linear-gradient(135deg,#228756,#1b6843)",
              borderRadius: "9px", textTransform: "none", fontSize: "10px", fontWeight: 700,
              px: 1.4, py: 0.6, flexShrink: 0, boxShadow: "none",
              "&:hover": { boxShadow: "0 4px 14px rgba(34,135,86,0.35)" },
            }}>
            Join
          </Button>
        )}
      </Box>
    </Paper>
  );
}

/* ── Schedule list ───────────────────────────────────────── */
function ScheduleList({ title, sessions, max = 5, allHref, compact = false }) {
  const visible = sessions.slice(0, max);
  const now = new Date();

  return (
    <Paper elevation={0} sx={{ borderRadius: "18px", border: "1.5px solid #f1f5f9", background: "#fff", overflow: "hidden" }}>
      <Box sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        px: { xs: 2, md: 2.5 }, py: { xs: 1.6, md: 2 },
        borderBottom: "1px solid #f8fafc",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "13px", color: "#1e293b" }}>{title}</Typography>
          <Chip label={sessions.length} size="small" sx={{
            height: 18, fontSize: "10px", fontWeight: 700,
            background: "#f0fdf4", color: "#228756", borderRadius: "5px",
          }} />
        </Box>
        {allHref && sessions.length > max && (
          <Button component={Link} href={allHref} size="small" endIcon={<ChevronRightIcon sx={{ fontSize: 13 }} />}
            sx={{ color: "#228756", fontWeight: 700, textTransform: "none", fontSize: "11px", px: 0, minWidth: 0 }}>
            All
          </Button>
        )}
      </Box>

      {visible.length > 0 ? visible.map((s, i) => {
        const sessionDate = new Date(s.date);
        const isPast = sessionDate < now;
        const isToday = sessionDate.toDateString() === now.toDateString();
        const isSoon = !isPast && (sessionDate - now) < 3600000;

        return (
          <Box key={s.id} sx={{
            display: "flex", alignItems: "center",
            px: { xs: 2, md: 2.5 }, py: compact ? 1.2 : 1.6,
            gap: { xs: 1.4, md: 2 },
            borderBottom: i < visible.length - 1 ? "1px solid #f8fafc" : "none",
            "&:hover": { background: "#fafafa" },
            transition: "background 0.15s",
          }}>
            <FiberManualRecordIcon sx={{
              fontSize: 8, flexShrink: 0,
              color: isPast ? "#94a3b8" : isSoon ? "#f59e0b" : "#2ecc71",
            }} />
            <Avatar src={s.imgSrc || defaultProfile} alt={s.name}
              sx={{ width: compact ? 32 : 36, height: compact ? 32 : 36, borderRadius: "9px", flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "12px", md: "13px" }, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
                <AccessTimeIcon sx={{ fontSize: 9, color: "#94a3b8" }} />
                <Typography sx={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>
                  {isToday ? fmtTime(s.date) : `${fmtShortDate(s.date)} · ${fmtTime(s.date)}`}
                </Typography>
                {isSoon && <Chip label="Soon" size="small" sx={{ height: 14, fontSize: "8px", fontWeight: 700, borderRadius: "4px", background: "#fffbeb", color: "#d97706", ml: 0.5 }} />}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexShrink: 0 }}>
              <Chip label={s.badge || "Online"} size="small" sx={{
                height: 17, fontSize: "9px", fontWeight: 700, borderRadius: "5px",
                background: s.badge === "Offline" ? "#f1f5f9" : "#f0fdf4",
                color: s.badge === "Offline" ? "#64748b" : "#228756",
                display: { xs: "none", sm: "flex" },
              }} />
              {!isPast && s.badge !== "Offline" && (
                <IconButton size="small" sx={{
                  background: "linear-gradient(135deg,#228756,#1b6843)", color: "#fff",
                  width: 28, height: 28, borderRadius: "8px",
                  "&:hover": { background: "#1b5e20" },
                }}>
                  <VideoCallIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>
          </Box>
        );
      }) : (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <EventBusyIcon sx={{ fontSize: 28, color: "#e2e8f0", mb: 1 }} />
          <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 500 }}>No sessions</Typography>
        </Box>
      )}
    </Paper>
  );
}

/* ── Profile completion ──────────────────────────────────── */
function ProfileCard({ checks, pct }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: "18px", border: "1.5px solid #f1f5f9", background: "#fff", overflow: "hidden" }}>
      <Box sx={{ px: "18px", pt: "18px", pb: "14px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "13px", color: "#1e293b" }}>Profile Setup</Typography>
          <Typography sx={{ fontWeight: 900, fontSize: "14px", color: pct === 100 ? "#2ecc71" : "#228756" }}>{pct}%</Typography>
        </Box>
        <Typography sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, mb: 1.5 }}>
          Complete profile to attract more clients
        </Typography>
        <Box sx={{ position: "relative", height: 5, borderRadius: 3, background: "#f1f5f9", overflow: "hidden", mb: 2 }}>
          <Box sx={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${pct}%`, borderRadius: 3,
            background: "linear-gradient(90deg,#1b5e20,#2ecc71)",
            transition: "width 0.6s ease",
          }} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9 }}>
          {checks.map((c, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {c.done
                ? <CheckCircleIcon sx={{ fontSize: 13, color: "#2ecc71", flexShrink: 0 }} />
                : <RadioButtonUncheckedIcon sx={{ fontSize: 13, color: "#cbd5e1", flexShrink: 0 }} />}
              <Typography sx={{ fontSize: "11px", fontWeight: 600, color: c.done ? "#94a3b8" : "#475569", textDecoration: c.done ? "line-through" : "none" }}>
                {c.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      {pct < 100 && (
        <Link href="/settings" style={{ textDecoration: "none" }}>
          <Box sx={{
            mx: "14px", mb: "14px", py: "9px", borderRadius: "10px",
            background: "linear-gradient(135deg,#228756,#2ecc71)",
            textAlign: "center", cursor: "pointer",
            "&:hover": { opacity: 0.9 }, transition: "opacity 0.2s",
          }}>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "11px" }}>Complete Profile →</Typography>
          </Box>
        </Link>
      )}
    </Paper>
  );
}

/* ── Mobile quick actions ────────────────────────────────── */
function MobileQuickActions() {
  const actions = [
    { title: "Workshop",  icon: <AddBoxIcon />,             to: "/workshops",       color: "#0ea5e9", bg: "#f0f9ff" },
    { title: "Report",    icon: <AssessmentIcon />,         to: "/create-report",   color: "#f59e0b", bg: "#fffbeb" },
    { title: "Slots",     icon: <ScheduleIcon />,           to: "/settings",        color: "#8b5cf6", bg: "#f5f3ff" },
    { title: "Invoices",  icon: <ConfirmationNumberIcon />, to: "/clinic-patients", color: "#2ecc71", bg: "#f0fdf4" },
  ];
  return (
    <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 0.5, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
      {actions.map((a, i) => (
        <Link key={i} href={a.to} style={{ textDecoration: "none", flexShrink: 0 }}>
          <Box sx={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 0.7,
            px: 2, py: 1.5, borderRadius: "14px", border: "1.5px solid #f1f5f9",
            background: "#fff", minWidth: 68,
            "&:active": { background: "#f8fafc" },
            transition: "all 0.15s",
          }}>
            <Box sx={{ width: 38, height: 38, borderRadius: "10px", background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {React.cloneElement(a.icon, { sx: { fontSize: 18, color: a.color } })}
            </Box>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#475569", textAlign: "center", lineHeight: 1.2 }}>
              {a.title}
            </Typography>
          </Box>
        </Link>
      ))}
    </Box>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function TherapistDashboard() {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastRefreshed, setLastRefreshed] = React.useState(null);

  const [stats, setStats] = React.useState({ totalEarnings: 0, monthEarnings: 0, upcoming: 0, totalClients: 0 });
  const [weeklyData, setWeeklyData]   = React.useState([]);
  const [monthlyData, setMonthlyData] = React.useState([]);
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

  const name  = therapistInfo?.user?.name?.split(" ")[0] || "Therapist";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const statCards = [
    { icon: <AccountBalanceWalletIcon />, label: "Total Earnings",  numericValue: stats.totalEarnings, isCurrency: true,  color: "#2ecc71", bg: "#f0fdf4", trend: "Lifetime",        trendUp: true },
    { icon: <TrendingUpIcon />,           label: "This Month",      numericValue: stats.monthEarnings, isCurrency: true,  color: "#0ea5e9", bg: "#f0f9ff", trend: stats.monthGrowth, trendUp: stats.monthGrowthUp },
    { icon: <CalendarMonthIcon />,        label: "Upcoming Sessions",numericValue: stats.upcoming,     isCurrency: false, color: "#8b5cf6", bg: "#f5f3ff" },
    { icon: <PeopleIcon />,               label: "Total Clients",   numericValue: stats.totalClients,  isCurrency: false, color: "#f59e0b", bg: "#fffbeb" },
  ];

  return (
    <MainLayout>
      <Box sx={{ pt: 0.5, pb: 5 }}>

        {/* ── GREETING BANNER ─────────────────────────────── */}
        <Box sx={{
          background: "linear-gradient(135deg, #1b5e20 0%, #228756 55%, #2ecc71 100%)",
          borderRadius: "22px", mb: 2.5,
          p: { xs: "20px 18px", md: "26px 36px" },
          position: "relative", overflow: "hidden",
        }}>
          {/* decorative orbs */}
          <Box sx={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", bottom: -60, right: 140, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", top: 20, right: 250, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2.5 } }}>
              <Avatar
                src={therapistInfo?.user?.profile || defaultProfile}
                alt={name}
                sx={{
                  width: { xs: 48, md: 60 }, height: { xs: 48, md: 60 },
                  borderRadius: "15px",
                  border: "2.5px solid rgba(255,255,255,0.3)",
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "9px", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", mb: 0.5 }}>
                  Therapist Workspace
                </Typography>
                <Typography sx={{ color: "#fff", fontSize: { xs: "20px", md: "26px" }, fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.3px" }}>
                  Hello, {name}!
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "12px", fontWeight: 500 }}>
                    {loading ? "Loading..." : todaySessions.length > 0
                      ? `${todaySessions.length} session${todaySessions.length > 1 ? "s" : ""} today`
                      : "No sessions scheduled today"}
                  </Typography>
                  {todaySessions.length > 0 && (
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#2ecc71", boxShadow: "0 0 0 3px rgba(46,204,113,0.3)" }} />
                  )}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ display: { xs: "none", sm: "block" }, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", borderRadius: "14px", px: 2.5, py: 1.5, border: "1px solid rgba(255,255,255,0.15)", textAlign: "right" }}>
                <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Today</Typography>
                <Typography sx={{ color: "#fff", fontSize: "12px", fontWeight: 700, mt: 0.2 }}>{today}</Typography>
                {lastRefreshed && (
                  <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "9px", mt: 0.3 }}>
                    Synced {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                  </Typography>
                )}
              </Box>
              <Tooltip title="Refresh dashboard">
                <IconButton onClick={() => load(true)} disabled={refreshing}
                  sx={{
                    background: "rgba(255,255,255,0.15)", color: "#fff",
                    width: 36, height: 36, borderRadius: "10px",
                    "&:hover": { background: "rgba(255,255,255,0.25)" },
                    animation: refreshing ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
                  }}>
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* ── STAT CARDS ──────────────────────────────────── */}
        <Grid container spacing={{ xs: 1.2, md: 2 }} sx={{ mb: 3 }}>
          {statCards.map((s, i) => (
            <Grid item xs={6} md={3} key={i}>
              <StatCard {...s} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* ── MAIN CONTENT ────────────────────────────────── */}
        {isMobile ? (
          /* ─── MOBILE ─── */
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <MobileQuickActions />
            <NextSessionCard session={nextSession} />
            <PerformanceChart weeklyData={weeklyData} monthlyData={monthlyData} />
            {todaySessions.length > 0 && (
              <ScheduleList title="Today's Schedule" sessions={todaySessions} allHref="/clinic-patients" compact />
            )}
            {upcomingSessions.length > 0 && (
              <ScheduleList title="Upcoming" sessions={upcomingSessions} max={4} allHref="/clinic-patients" compact />
            )}
            <RecentInvoices data={invoices} />
            <ProfileCard checks={profileChecks} pct={completionPct} />
          </Box>
        ) : (
          /* ─── DESKTOP ─── */
          <Grid container spacing={3}>
            {/* LEFT COLUMN */}
            <Grid item xs={12} lg={8}>
              <PerformanceChart weeklyData={weeklyData} monthlyData={monthlyData} />

              <Box sx={{ mt: 3 }}>
                <ScheduleList
                  title="Today's Schedule"
                  sessions={todaySessions}
                  allHref="/clinic-patients"
                  max={todaySessions.length}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <ScheduleList
                  title="Upcoming Sessions"
                  sessions={upcomingSessions}
                  max={6}
                  allHref="/clinic-patients"
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <RecentInvoices data={invoices} />
              </Box>
            </Grid>

            {/* RIGHT COLUMN — sticky */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: "sticky", top: "80px", display: "flex", flexDirection: "column", gap: 2.5 }}>
                <NextSessionCard session={nextSession} />
                <ProfileCard checks={profileChecks} pct={completionPct} />
                <QuickActions />
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </MainLayout>
  );
}

import React from "react";
import dynamic from "next/dynamic";
import MainLayout from "../components/therapists/main-layout";

const PerformanceChart = dynamic(
  () => import("../components/therapists/dashboard/PerformanceChart"),
  { ssr: false, loading: () => <div style={{ height: 280, borderRadius: 20, background: "#f8fafc", border: "1.5px solid #f1f5f9" }} /> }
);

import RecentInvoices from "../components/therapists/dashboard/recentInvoices";
import { getBookings, GetMyWorkshopBooking, defaultProfile, imagePath } from "../utils/url";
import { fetchById } from "../utils/actions";
import useTherapistStore from "../store/therapistStore";
import Link from "next/link";
import { Box, Typography, Paper, Avatar, Grid, Skeleton, IconButton, Tooltip } from "@mui/material";
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
import AssessmentIcon from "@mui/icons-material/Assessment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";

const QUICK_ACTIONS = [
  { label: "New Workshop",   icon: <AddBoxIcon />,             to: "/workshops",       color: "#60a5fa" },
  { label: "Create Report",  icon: <AssessmentIcon />,         to: "/create-report",   color: "#fbbf24" },
  { label: "Update Slots",   icon: <ScheduleIcon />,           to: "/settings",        color: "#c084fc" },
  { label: "Invoices",       icon: <ConfirmationNumberIcon />, to: "/clinic-patients", color: "#4ade80" },
];

/* ── helpers ──────────────────────────────────────────────── */
function getNum(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function fmtDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
function fmtTime(d) { return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }); }
function fmtShortDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }

function timeUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return "Now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h / 24)}d`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ── CountUp ──────────────────────────────────────────────── */
function useCountUp(end, duration = 1400) {
  const [count, setCount] = React.useState(0);
  const raf = React.useRef(null);
  React.useEffect(() => {
    if (!end) { setCount(0); return; }
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setCount(end);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [end, duration]);
  return count;
}

/* ── Stat card ────────────────────────────────────────────── */
function StatCard({ icon, label, numericValue, isCurrency, color, bg, gradient, trend, trendUp, loading }) {
  const counted = useCountUp(loading ? 0 : (numericValue || 0));
  const display = loading ? null : isCurrency ? `₹${counted.toLocaleString("en-IN")}` : counted;

  return (
    <Paper elevation={0} sx={{
      borderRadius: "20px", background: "#fff", border: "1.5px solid #f0f4f8",
      height: "100%", overflow: "hidden",
      transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
      "&:hover": { borderColor: color + "40", boxShadow: `0 10px 36px ${color}16`, transform: "translateY(-4px)" },
    }}>
      <Box sx={{ height: "3.5px", background: gradient || color }} />
      <Box sx={{ p: { xs: "14px 16px 16px", md: "18px 22px 20px" } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: { xs: 1.5, md: 2 } }}>
          <Box sx={{ width: { xs: 34, md: 42 }, height: { xs: 34, md: 42 }, borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {React.cloneElement(icon, { sx: { fontSize: { xs: 17, md: 21 }, color } })}
          </Box>
          {trend && !loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, background: trendUp !== false ? "#f0fdf4" : "#fef2f2", borderRadius: "8px", px: 0.9, py: 0.3 }}>
              {trendUp !== false ? <TrendingUpIcon sx={{ fontSize: 10, color: "#16a34a" }} /> : <TrendingDownIcon sx={{ fontSize: 10, color: "#dc2626" }} />}
              <Typography sx={{ fontSize: "9px", color: trendUp !== false ? "#16a34a" : "#dc2626", fontWeight: 700 }}>{trend}</Typography>
            </Box>
          )}
        </Box>
        {loading
          ? <Skeleton width={80} height={30} sx={{ borderRadius: "8px", mb: 0.6 }} />
          : <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: { xs: "22px", md: "30px" }, lineHeight: 1, letterSpacing: "-0.8px", mb: 0.7 }}>
              {display}
            </Typography>
        }
        <Typography sx={{ color: "#94a3b8", fontSize: { xs: "10px", md: "10.5px" }, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px" }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

/* ── Next Session card ────────────────────────────────────── */
function NextSessionCard({ session }) {
  const [countdown, setCountdown] = React.useState(() => session ? timeUntil(session.date) : "");
  React.useEffect(() => {
    if (!session) return;
    const iv = setInterval(() => setCountdown(timeUntil(session.date)), 60000);
    return () => clearInterval(iv);
  }, [session]);

  if (!session) return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: "1.5px solid #f0f4f8", background: "#fff", p: "22px" }}>
      <Typography sx={{ fontWeight: 800, fontSize: "13px", color: "#1e293b", mb: 2 }}>Next Session</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 1.5, gap: 1.5 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: "16px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EventBusyIcon sx={{ fontSize: 26, color: "#e2e8f0" }} />
        </Box>
        <Typography sx={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>No upcoming sessions</Typography>
      </Box>
    </Paper>
  );

  const minsUntil = Math.floor((new Date(session.date) - new Date()) / 60000);
  const isImminent = minsUntil <= 30 && minsUntil >= 0;
  const accent = isImminent ? "#f59e0b" : "#228756";
  const accentBg = isImminent ? "#fffbeb" : "#f0fdf4";
  const borderCol = isImminent ? "#fde68a" : "#dcfce7";

  return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: `1.5px solid ${borderCol}`, background: "#fff", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.2, py: 1.3, background: accentBg, borderBottom: `1px solid ${borderCol}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: accent, boxShadow: `0 0 0 3px ${accent}30` }} />
          <Typography sx={{ fontWeight: 800, fontSize: "11.5px", color: isImminent ? "#92400e" : "#14532d" }}>
            {isImminent ? "Starting Soon!" : "Next Session"}
          </Typography>
        </Box>
        <Box sx={{ background: accent, borderRadius: "7px", px: 1.2, py: 0.4 }}>
          <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#fff" }}>in {countdown}</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2.2, pt: 2.2, pb: session.badge !== "Offline" ? 0 : 2.2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={session.imgSrc || defaultProfile} alt={session.name}
            sx={{ width: 54, height: 54, borderRadius: "15px", flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "15px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 10, color: "#94a3b8" }} />
              <Typography sx={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
                {fmtShortDate(session.date)} · {fmtTime(session.date)}
              </Typography>
            </Box>
            <Box sx={{ mt: 0.9, display: "inline-flex", background: accentBg, borderRadius: "6px", px: 1, py: 0.3 }}>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, color: accent }}>{session.badge || "Online"}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {session.badge !== "Offline" && (
        <Box sx={{ px: 2.2, py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, background: accent, borderRadius: "12px", py: 1.3, cursor: "pointer", transition: "opacity 0.15s", "&:hover": { opacity: 0.88 } }}>
            <VideoCallIcon sx={{ fontSize: 16, color: "#fff" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 800, color: "#fff" }}>Join Session</Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

/* ── Sessions card ────────────────────────────────────────── */
function SessionsCard({ todaySessions, upcomingSessions }) {
  const [tab, setTab] = React.useState("today");
  const list = tab === "today" ? todaySessions : upcomingSessions;
  const now = new Date();

  return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: "1.5px solid #f0f4f8", background: "#fff", overflow: "hidden" }}>
      <Box sx={{ px: 2.5, pt: 2, borderBottom: "1px solid #f1f5f9" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "14px", color: "#1e293b" }}>Sessions</Typography>
          <Link href="/appointments" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 2, color: "#228756", fontSize: "12px", fontWeight: 700 }}>
            View all <ChevronRightIcon sx={{ fontSize: 14 }} />
          </Link>
        </Box>
        <Box sx={{ display: "flex" }}>
          {[["today", "Today", todaySessions.length], ["upcoming", "Upcoming", upcomingSessions.length]].map(([key, label, count]) => (
            <Box key={key} onClick={() => setTab(key)} sx={{ cursor: "pointer", pb: 1.2, mr: 3, borderBottom: tab === key ? "2.5px solid #228756" : "2.5px solid transparent", transition: "all 0.15s" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: tab === key ? "#228756" : "#94a3b8" }}>{label}</Typography>
                {count > 0 && (
                  <Box sx={{ background: tab === key ? "#f0fdf4" : "#f8fafc", borderRadius: "20px", px: 0.9, py: 0.1 }}>
                    <Typography sx={{ fontSize: "10px", fontWeight: 800, color: tab === key ? "#228756" : "#94a3b8" }}>{count}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {list.length === 0 ? (
        <Box sx={{ py: 5, textAlign: "center" }}>
          <EventBusyIcon sx={{ fontSize: 30, color: "#e2e8f0", mb: 1 }} />
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
            display: "flex", alignItems: "center",
            px: 2.5, py: { xs: 1.5, md: 1.8 }, gap: 1.5,
            borderLeft: `3.5px solid ${borderColor}`,
            borderBottom: i < Math.min(list.length, 6) - 1 ? "1px solid #f8fafc" : "none",
            "&:hover": { background: "#fafcff" }, transition: "background 0.15s",
          }}>
            <Avatar src={s.imgSrc || defaultProfile} alt={s.name}
              sx={{ width: { xs: 38, md: 42 }, height: { xs: 38, md: 42 }, borderRadius: "12px", flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "13px", md: "13.5px" }, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.25 }}>
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
  const [showWelcome,      setShowWelcome]      = React.useState(() => typeof window !== "undefined" && !localStorage.getItem("cyt_th_welcomed"));
  const [welcLeaving,      setWelcLeaving]      = React.useState(false);
  const [loading,          setLoading]          = React.useState(true);
  const [refreshing,       setRefreshing]       = React.useState(false);
  const [lastRefreshed,    setLastRefreshed]    = React.useState(null);
  const [stats,            setStats]            = React.useState({ totalEarnings: 0, monthEarnings: 0, upcoming: 0, totalClients: 0 });
  const [weeklyData,       setWeeklyData]       = React.useState(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(now.getDate() - (6 - i)); return { name: DAY_NAMES[d.getDay()], sessions: 0, revenue: 0 }; });
  });
  const [monthlyData,      setMonthlyData]      = React.useState(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1); return { name: MONTH_NAMES[d.getMonth()], sessions: 0, revenue: 0 }; });
  });
  const [todaySessions,    setTodaySessions]    = React.useState([]);
  const [upcomingSessions, setUpcomingSessions] = React.useState([]);
  const [nextSession,      setNextSession]      = React.useState(null);
  const [invoices,         setInvoices]         = React.useState([]);
  const [clockTime,        setClockTime]        = React.useState(() => new Date());

  React.useEffect(() => { const iv = setInterval(() => setClockTime(new Date()), 60000); return () => clearInterval(iv); }, []);

  const { therapistInfo, fetchTherapistInfo, paymentStore } = useTherapistStore();

  const load = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      if (!therapistInfo?.user?.email) fetchTherapistInfo();

      const [bookingsRes, workshopRes] = await Promise.all([
        fetchById(getBookings),
        fetchById(GetMyWorkshopBooking),
      ]);

      const bookings  = bookingsRes?.status ? (bookingsRes.data  || []) : [];
      const workshops = workshopRes?.status ? (workshopRes.data  || []) : [];

      const now            = new Date();
      const todayStr       = now.toDateString();
      const monthStart     = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      let totalEarnings = 0, monthEarnings = 0, lastMonthEarnings = 0;
      bookings.forEach(b => {
        const st = (b.status || "").toLowerCase();
        const ps = (b.transaction?.status?.name || "").toLowerCase();
        if (st === "completed" || ps === "success" || ps === "completed") {
          const amt = getNum(b.transaction?.amount || b.amount || b.fee);
          const bd  = new Date(b.booking_date);
          totalEarnings += amt;
          if (bd >= monthStart)          monthEarnings     += amt;
          else if (bd >= lastMonthStart) lastMonthEarnings += amt;
        }
      });
      workshops.forEach(w => {
        const s = (w.payment_status || "").toLowerCase();
        if (s === "success" || s === "completed") {
          const amt = getNum(w.amount);
          const wd  = new Date(w.created_at || w.date);
          totalEarnings += amt;
          if (wd >= monthStart)          monthEarnings     += amt;
          else if (wd >= lastMonthStart) lastMonthEarnings += amt;
        }
      });

      const clientSet = new Set(bookings.map(b => b.client?._id || b.client_id).filter(Boolean));

      const toMap = b => ({ id: b._id, name: b.client?.name || "Unknown", date: b.booking_date, badge: b.format || "Online", imgSrc: b.client?.photo || b.client?.profile });

      const todayList = bookings
        .filter(b => new Date(b.booking_date).toDateString() === todayStr && b.status !== "Cancelled")
        .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
        .map(toMap);

      const upcomingList = bookings
        .filter(b => b.status !== "Completed" && b.status !== "Cancelled" && new Date(b.booking_date) > now)
        .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
        .map(toMap);

      const weekMap = {};
      DAY_NAMES.forEach(d => { weekMap[d] = { name: d, sessions: 0, revenue: 0 }; });
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
      bookings.forEach(b => {
        const d = new Date(b.booking_date);
        if (d >= weekStart) { const key = DAY_NAMES[d.getDay()]; weekMap[key].sessions++; weekMap[key].revenue += getNum(b.transaction?.amount || b.amount); }
      });
      const weeklyChart = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(now.getDate() - (6 - i)); return weekMap[DAY_NAMES[d.getDay()]]; });

      const monthlyMap = new Map();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyMap.set(`${d.getFullYear()}-${d.getMonth()}`, { name: MONTH_NAMES[d.getMonth()], sessions: 0, revenue: 0 });
      }
      bookings.forEach(b => {
        const d = new Date(b.booking_date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthlyMap.has(key)) { const e = monthlyMap.get(key); e.sessions++; e.revenue += getNum(b.transaction?.amount || b.amount); }
      });

      const inv = bookings
        .filter(b => b.transaction?.amount)
        .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
        .slice(0, 6)
        .map(b => ({ id: b._id, invoice_id: b.transaction?.transaction_id?.slice(-8) || b._id?.slice(-8), client_name: b.client?.name || "Unknown", booking_date: fmtDate(b.booking_date), amount: b.transaction?.amount, status: b.transaction?.status?.name || "Success" }));

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
  React.useEffect(() => { const iv = setInterval(() => load(true), 60000); return () => clearInterval(iv); }, [load]);

  const dismissWelcome = React.useCallback(() => {
    setWelcLeaving(true);
    setTimeout(() => { localStorage.setItem("cyt_th_welcomed", "1"); setShowWelcome(false); setWelcLeaving(false); }, 500);
  }, []);

  React.useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(dismissWelcome, 4000);
    return () => clearTimeout(t);
  }, [showWelcome, dismissWelcome]);

  const profileChecks = React.useMemo(() => {
    const t = therapistInfo;
    return [
      { label: "Basic info added",       done: !!(t?.user?.name && t?.user?.phone) },
      { label: "Profile photo uploaded",  done: !!t?.user?.profile },
      { label: "Availability set",        done: (t?.availabilities?.length || 0) > 0 },
      { label: "Fee configured",          done: t?.fees?.some(f => f.formats?.some(fmt => fmt.fee)) },
      { label: "Payment details added",   done: !!(paymentStore?.ac_number || paymentStore?.upi) },
    ];
  }, [therapistInfo, paymentStore]);
  const completionPct = Math.round((profileChecks.filter(c => c.done).length / profileChecks.length) * 100);

  const name      = therapistInfo?.user?.name?.split(" ")[0] || "Therapist";
  const today     = clockTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" });
  const avatarSrc = therapistInfo?.user?.profile ? `${imagePath}/${therapistInfo.user.profile}` : defaultProfile;

  const [showStrip, setShowStrip] = React.useState(true);

  const hasChartData = !loading && (weeklyData.some(d => d.sessions > 0 || d.revenue > 0) || monthlyData.some(d => d.sessions > 0 || d.revenue > 0));
  const hasSessions  = !loading && (todaySessions.length > 0 || upcomingSessions.length > 0);
  const hasInvoices  = !loading && invoices.length > 0;
  const hasNextSess  = !loading && !!nextSession;

  const statCards = [
    { icon: <AccountBalanceWalletIcon />, label: "Total Earnings",    numericValue: stats.totalEarnings, isCurrency: true,  color: "#228756", bg: "#f0fdf4", gradient: "linear-gradient(90deg,#228756,#4ade80)", trend: "Lifetime",        trendUp: true },
    { icon: <TrendingUpIcon />,           label: "This Month",        numericValue: stats.monthEarnings, isCurrency: true,  color: "#0ea5e9", bg: "#f0f9ff", gradient: "linear-gradient(90deg,#0ea5e9,#38bdf8)", trend: stats.monthGrowth, trendUp: stats.monthGrowthUp },
    { icon: <CalendarMonthIcon />,        label: "Upcoming Sessions", numericValue: stats.upcoming,      isCurrency: false, color: "#8b5cf6", bg: "#f5f3ff", gradient: "linear-gradient(90deg,#8b5cf6,#c084fc)" },
    { icon: <PeopleIcon />,               label: "Total Clients",     numericValue: stats.totalClients,  isCurrency: false, color: "#f59e0b", bg: "#fffbeb", gradient: "linear-gradient(90deg,#f59e0b,#fcd34d)" },
  ];

  return (
    <MainLayout>
      <Box sx={{ pt: 0, pb: 6 }}>

        {/* ══ THIN PROFILE STRIP ════════════════════════════════ */}
        {!showStrip && (
          <Box onClick={() => setShowStrip(true)} sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 1.5, md: 2 }, cursor: "pointer", width: "fit-content", background: "#f8fafc", border: "1.5px solid #f0f4f8", borderRadius: "22px", px: 1.5, py: 0.6, transition: "all 0.15s", "&:hover": { background: "#f1f5f9" } }}>
            <Avatar src={avatarSrc} sx={{ width: 22, height: 22, borderRadius: "6px" }} />
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>{name}</Typography>
            <ExpandLessRoundedIcon sx={{ fontSize: 14, color: "#94a3b8", transform: "rotate(180deg)" }} />
          </Box>
        )}
        <Paper elevation={0} sx={{ borderRadius: "16px", border: "1.5px solid #f0f4f8", background: "#fff", mb: { xs: 1.5, md: 2 }, overflow: "hidden", display: showStrip ? "block" : "none" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 2, md: 2.5 }, py: { xs: 1.5, md: 1.8 }, gap: 2 }}>
            {/* Avatar + name + status */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2 }, minWidth: 0 }}>
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Avatar src={avatarSrc} alt={name}
                  sx={{ width: { xs: 42, md: 48 }, height: { xs: 42, md: 48 }, borderRadius: "13px" }} />
                <Box sx={{ position: "absolute", bottom: -1, right: -1, width: 11, height: 11, borderRadius: "50%", background: "#4ade80", border: "2px solid #fff" }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: { xs: "14px", md: "15.5px" }, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {name}
                </Typography>
                <Typography sx={{ fontSize: { xs: "11px", md: "11.5px" }, color: "#64748b", fontWeight: 500, mt: 0.25 }}>
                  {loading ? "Loading…"
                    : todaySessions.length > 0
                      ? `${todaySessions.length} appointment${todaySessions.length > 1 ? "s" : ""} today · ${upcomingSessions.length} upcoming`
                      : `No appointments today · ${upcomingSessions.length} upcoming`}
                </Typography>
                {!loading && completionPct < 100 && (
                  <Link href="/settings" style={{ textDecoration: "none" }}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.6, background: "#fff8ed", border: "1.5px solid #fde68a", borderRadius: "20px", px: 1.2, py: "2px", cursor: "pointer", "&:hover": { background: "#fef3c7" }, transition: "background 0.15s" }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#d97706", whiteSpace: "nowrap" }}>
                        Profile {completionPct}% complete
                      </Typography>
                    </Box>
                  </Link>
                )}
              </Box>
            </Box>

            {/* Time + refresh */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
              <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>
                  {clockTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}
                </Typography>
                <Typography sx={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500, mt: 0.1 }}>{today}</Typography>
              </Box>
              <Tooltip title="Notifications">
                <IconButton component={Link} href="/notifications" size="small"
                  sx={{ background: "#f8fafc", color: "#64748b", borderRadius: "10px", border: "1.5px solid #f0f4f8", p: "6px", "&:hover": { background: "#f0f9ff", color: "#0ea5e9", borderColor: "#bae6fd" } }}>
                  <NotificationsIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh dashboard">
                <IconButton onClick={() => load(true)} disabled={refreshing} size="small"
                  sx={{ background: "#f8fafc", color: "#64748b", borderRadius: "10px", border: "1.5px solid #f0f4f8", p: "6px", "&:hover": { background: "#f0fdf4", color: "#228756", borderColor: "#dcfce7" }, animation: refreshing ? "stripSpin 1s linear infinite" : "none", "@keyframes stripSpin": { to: { transform: "rotate(360deg)" } } }}>
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Minimize">
                <IconButton size="small" onClick={() => setShowStrip(false)}
                  sx={{ background: "#f8fafc", color: "#94a3b8", borderRadius: "10px", border: "1.5px solid #f0f4f8", p: "6px", "&:hover": { background: "#fef2f2", color: "#f87171", borderColor: "#fecaca" } }}>
                  <ExpandLessRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {lastRefreshed && (
            <Box sx={{ px: { xs: 2, md: 2.5 }, pb: 1.1, display: "flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: 500 }}>
                Updated {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </Typography>
            </Box>
          )}
        </Paper>


        {/* ══ STAT CARDS ════════════════════════════════════════ */}
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 2.5 } }}>
          {statCards.map((s, i) => (
            <Grid item xs={6} md={3} key={i}>
              <StatCard {...s} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* ══ MAIN CONTENT GRID ═════════════════════════════════ */}
        <Grid container spacing={{ xs: 2, md: 2.5 }}>

          {/* LEFT */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>
              {hasNextSess && (
                <Box sx={{ display: { xs: "block", lg: "none" } }}>
                  <NextSessionCard session={nextSession} />
                </Box>
              )}
              {hasChartData && <PerformanceChart weeklyData={weeklyData} monthlyData={monthlyData} />}
              {hasSessions  && <SessionsCard todaySessions={todaySessions} upcomingSessions={upcomingSessions} />}
              {hasInvoices  && <RecentInvoices data={invoices} />}
            </Box>
          </Grid>

          {/* RIGHT sticky — desktop */}
          {hasNextSess && (
            <Grid item lg={4} sx={{ display: { xs: "none", lg: "block" } }}>
              <Box sx={{ position: "sticky", top: "72px" }}>
                <NextSessionCard session={nextSession} />
              </Box>
            </Grid>
          )}

        </Grid>
      </Box>

      {/* ── TEST BUTTON ── */}
      <Box
        onClick={() => { localStorage.removeItem("cyt_th_welcomed"); setWelcLeaving(false); setShowWelcome(true); }}
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, background: "#1a6b3a", color: "#fff", borderRadius: "50px", px: 2.2, py: 1, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.22)", display: "flex", alignItems: "center", gap: 0.8, userSelect: "none", transition: "all 0.15s", "&:hover": { background: "#155c30", transform: "scale(1.04)" } }}>
        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>👋 Test Welcome</Typography>
      </Box>

      {/* ══ FIRST-TIME WELCOME OVERLAY ════════════════════════ */}
      {showWelcome && (
        <Box sx={{
          position: "fixed", inset: 0, zIndex: 9999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          animation: `${welcLeaving ? "wOut" : "wIn"} 0.5s ease forwards`,
          "@keyframes wIn":  { from: { opacity: 0 }, to: { opacity: 1 } },
          "@keyframes wOut": { from: { opacity: 1 }, to: { opacity: 0 } },
        }}>
          {/* Gradient bg */}
          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(140deg, #041610 0%, #0c3520 30%, #145e2e 65%, #1a7540 100%)" }} />
          {/* Dot grid */}
          <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          {/* Glows */}
          <Box sx={{ position: "absolute", top: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,222,128,0.13) 0%, transparent 65%)", pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", bottom: "10%", left: "5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,135,86,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />

          {/* Content */}
          <Box sx={{ position: "relative", textAlign: "center", px: { xs: 3, md: 6 }, maxWidth: 560 }}>

            {/* Brand */}
            <Box sx={{ animation: "wUp 0.5s ease 0.2s both", "@keyframes wUp": { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "none" } } }}>
              <Typography sx={{ fontSize: { xs: "10px", md: "11px" }, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "3px", textTransform: "uppercase", mb: { xs: 3, md: 4 } }}>
                Choose Your Therapist
              </Typography>
            </Box>

            {/* Welcome */}
            <Box sx={{ animation: "wUp 0.5s ease 0.5s both" }}>
              <Typography sx={{ fontSize: { xs: "1rem", md: "1.2rem" }, fontWeight: 400, color: "rgba(255,255,255,0.5)", mb: 0.5 }}>
                Welcome,
              </Typography>
            </Box>

            {/* Name — big */}
            <Box sx={{ animation: "wScale 0.65s cubic-bezier(.34,1.56,.64,1) 0.75s both", "@keyframes wScale": { from: { opacity: 0, transform: "scale(0.82)" }, to: { opacity: 1, transform: "scale(1)" } }, mb: { xs: 2, md: 2.5 } }}>
              <Typography sx={{ fontSize: { xs: "3rem", md: "4.5rem" }, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: { xs: "-1.5px", md: "-3px" } }}>
                {name}
              </Typography>
            </Box>

            {/* Online dot + subtitle */}
            <Box sx={{ animation: "wUp 0.5s ease 1.25s both", display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: { xs: 4, md: 5 } }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 0 4px rgba(74,222,128,0.22)", flexShrink: 0 }} />
              <Typography sx={{ fontSize: { xs: "13px", md: "14px" }, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                Your dashboard is ready
              </Typography>
            </Box>

            {/* CTA */}
            <Box sx={{ animation: "wUp 0.5s ease 1.55s both" }}>
              <Box onClick={dismissWelcome} sx={{
                display: "inline-flex", alignItems: "center", gap: 1.5,
                background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.22)",
                borderRadius: "50px", px: { xs: 3.5, md: 5 }, py: { xs: 1.5, md: 1.8 },
                cursor: "pointer", transition: "all 0.2s",
                "&:hover": { background: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.4)", transform: "scale(1.04)" },
              }}>
                <Typography sx={{ fontSize: { xs: "14px", md: "16px" }, fontWeight: 700, color: "#fff", letterSpacing: "0.2px" }}>
                  Enter Dashboard
                </Typography>
                <Typography sx={{ fontSize: { xs: "16px", md: "18px" }, color: "#4ade80" }}>→</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

    </MainLayout>
  );
}

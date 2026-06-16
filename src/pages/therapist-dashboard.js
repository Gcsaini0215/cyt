import React from "react";
import dynamic from "next/dynamic";
import MainLayout from "../components/therapists/main-layout";

const PerformanceChart = dynamic(
  () => import("../components/therapists/dashboard/PerformanceChart"),
  { ssr: false, loading: () => <div style={{ height: 280, borderRadius: 20, background: "#f8fafc", border: "1.5px solid #f1f5f9" }} /> }
);

import RecentInvoices from "../components/therapists/dashboard/recentInvoices";
import { getBookings, GetMyWorkshopBooking, GetDashboardDataUrl, defaultProfile, imagePath, getResourcesUrl } from "../utils/url";
import { fetchById } from "../utils/actions";
import useTherapistStore from "../store/therapistStore";
import Link from "next/link";
import { Box, Typography, Avatar, Grid, Skeleton, IconButton, Tooltip, LinearProgress } from "@mui/material";
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
import RefreshIcon from "@mui/icons-material/Refresh";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

// Safely parse any numeric value including Mongoose Decimal128 serialized as { $numberDecimal: "..." }
function getNum(v) {
  if (!v && v !== 0) return 0;
  if (typeof v === "number") return v;
  if (v.$numberDecimal !== undefined) return parseFloat(v.$numberDecimal) || 0;
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}
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

function useCountUp(end, duration = 1400) {
  const [count, setCount] = React.useState(0);
  const raf = React.useRef(null);
  React.useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (!end || end === 0) { setCount(0); return; }
    let start = 0;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * end));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setCount(end);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [end]);
  return count;
}

/* ── Stat Card (horizontal compact) ────────────────────────────── */
function StatCard({ icon, label, numericValue, isCurrency, color, bg, gradient, trend, trendUp, loading }) {
  const counted = useCountUp(loading ? 0 : (numericValue || 0));
  const display = loading ? null : isCurrency ? `₹${counted.toLocaleString("en-IN")}` : String(counted);

  return (
    <Box sx={{
      borderRadius: "16px", background: "#fff", border: "1.5px solid #f0f4f8",
      overflow: "hidden", minWidth: { xs: 148, sm: 168, md: 190 }, flex: "0 0 auto",
      transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
      "&:hover": { borderColor: color + "55", boxShadow: `0 8px 28px ${color}14`, transform: "translateY(-3px)" },
    }}>
      <Box sx={{ height: 3, background: gradient || color }} />
      <Box sx={{ p: "14px 16px 16px" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${color}20` }}>
            {React.cloneElement(icon, { sx: { fontSize: 17, color } })}
          </Box>
          {trend && !loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, background: trendUp !== false ? "#f0fdf4" : "#fef2f2", borderRadius: "6px", px: 0.8, py: 0.3, border: `1px solid ${trendUp !== false ? "#dcfce7" : "#fee2e2"}` }}>
              {trendUp !== false ? <TrendingUpIcon sx={{ fontSize: 9, color: "#16a34a" }} /> : <TrendingDownIcon sx={{ fontSize: 9, color: "#dc2626" }} />}
              <Typography sx={{ fontSize: "8.5px", color: trendUp !== false ? "#16a34a" : "#dc2626", fontWeight: 700 }}>{trend}</Typography>
            </Box>
          )}
        </Box>
        {loading
          ? <Skeleton width={72} height={26} sx={{ borderRadius: "6px", mb: 0.5 }} />
          : <Typography sx={{ fontWeight: 900, color: "#0a0f1e", fontSize: "20px", lineHeight: 1, letterSpacing: "-0.6px", mb: 0.4 }}>{display}</Typography>
        }
        <Typography sx={{ color: "#94a3b8", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</Typography>
      </Box>
    </Box>
  );
}

/* ── Profile Completion Card ─────────────────────────────────────── */
function ProfileCard({ checks, pct }) {
  if (pct === 100) return null;
  return (
    <Box sx={{ borderRadius: "18px", background: "linear-gradient(135deg,#fffbeb,#fef9ec)", border: "1.5px solid #fde68a", p: { xs: "16px 18px", md: "18px 22px" }, mb: { xs: 2, md: 2.5 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "13.5px", color: "#78350f" }}>Complete your profile</Typography>
          <Typography sx={{ fontSize: "11.5px", color: "#92400e", mt: 0.2 }}>Clients find you faster with a complete profile</Typography>
        </Box>
        <Box sx={{ textAlign: "center", flexShrink: 0 }}>
          <Typography sx={{ fontSize: "22px", fontWeight: 900, color: "#d97706", lineHeight: 1 }}>{pct}%</Typography>
          <Typography sx={{ fontSize: "9px", color: "#92400e", fontWeight: 700 }}>done</Typography>
        </Box>
      </Box>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, background: "#fde68a", mb: 1.5, "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg,#f59e0b,#fbbf24)", borderRadius: 3 } }} />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {checks.map((c, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {c.done
              ? <CheckCircleIcon sx={{ fontSize: 13, color: "#16a34a" }} />
              : <RadioButtonUncheckedIcon sx={{ fontSize: 13, color: "#d97706" }} />}
            <Typography sx={{ fontSize: "11px", fontWeight: 600, color: c.done ? "#64748b" : "#92400e", textDecoration: c.done ? "line-through" : "none" }}>{c.label}</Typography>
          </Box>
        ))}
      </Box>
      <Link href="/settings" style={{ textDecoration: "none" }}>
        <Box sx={{ mt: 1.5, display: "inline-flex", alignItems: "center", gap: 0.5, background: "#f59e0b", borderRadius: "9px", px: 1.5, py: 0.7, "&:hover": { opacity: 0.88 }, transition: "opacity .15s" }}>
          <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "#fff" }}>Complete Profile</Typography>
          <ArrowForwardIcon sx={{ fontSize: 13, color: "#fff" }} />
        </Box>
      </Link>
    </Box>
  );
}


/* ── Next Session card ───────────────────────────────────────────── */
function NextSessionCard({ session, loading }) {
  const [countdown, setCountdown] = React.useState(() => session ? timeUntil(session.date) : "");
  React.useEffect(() => {
    if (!session) return;
    const iv = setInterval(() => setCountdown(timeUntil(session.date)), 60000);
    return () => clearInterval(iv);
  }, [session]);

  if (loading) return (
    <Box sx={{ borderRadius: "18px", border: "1.5px solid #f0f4f8", background: "#fff", p: "18px 20px" }}>
      <Skeleton width={120} height={14} sx={{ mb: 1.5 }} />
      <Box sx={{ display: "flex", gap: 2 }}>
        <Skeleton variant="rectangular" width={54} height={54} sx={{ borderRadius: "15px" }} />
        <Box sx={{ flex: 1 }}><Skeleton width="60%" /><Skeleton width="40%" /></Box>
      </Box>
    </Box>
  );

  if (!session) return (
    <Box sx={{ borderRadius: "18px", border: "1.5px dashed #e2e8f0", background: "#fafcff", p: "22px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
      <EventBusyIcon sx={{ fontSize: 32, color: "#e2e8f0" }} />
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8" }}>No upcoming sessions</Typography>
        <Typography sx={{ fontSize: "11px", color: "#cbd5e1", mt: 0.3 }}>Sessions will appear here when booked</Typography>
      </Box>
    </Box>
  );

  const minsUntil = Math.floor((new Date(session.date) - new Date()) / 60000);
  const isImminent = minsUntil <= 30 && minsUntil >= 0;
  const accent = isImminent ? "#f59e0b" : "#228756";
  const accentBg = isImminent ? "#fffbeb" : "#f0fdf4";
  const borderCol = isImminent ? "#fde68a" : "#dcfce7";

  return (
    <Box sx={{ borderRadius: "18px", border: `1.5px solid ${borderCol}`, background: "#fff", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.2, py: 1.2, background: accentBg }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: accent, boxShadow: `0 0 0 3px ${accent}30`, animation: "pulse 1.8s ease infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } } }} />
          <Typography sx={{ fontWeight: 800, fontSize: "11px", color: isImminent ? "#92400e" : "#14532d" }}>
            {isImminent ? "Starting Soon!" : "Next Session"}
          </Typography>
        </Box>
        <Box sx={{ background: accent, borderRadius: "7px", px: 1.2, py: 0.35 }}>
          <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#fff" }}>in {countdown}</Typography>
        </Box>
      </Box>
      <Box sx={{ p: "16px 18px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: session.badge !== "Offline" ? 1.5 : 0 }}>
          <Avatar src={session.imgSrc || defaultProfile} sx={{ width: 50, height: 50, borderRadius: "14px", flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "14px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.4 }}>
              <CalendarTodayIcon sx={{ fontSize: 10, color: "#94a3b8" }} />
              <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{fmtShortDate(session.date)} · {fmtTime(session.date)}</Typography>
            </Box>
            <Box sx={{ mt: 0.7, display: "inline-flex", background: accentBg, borderRadius: "6px", px: 0.9, py: 0.2 }}>
              <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: accent }}>{session.badge || "Online"}</Typography>
            </Box>
          </Box>
        </Box>
        {session.badge !== "Offline" && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, background: accent, borderRadius: "12px", py: 1.2, cursor: "pointer", "&:hover": { opacity: 0.88 }, transition: "opacity .15s" }}>
            <VideoCallIcon sx={{ fontSize: 15, color: "#fff" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 800, color: "#fff" }}>Join Session</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ── Timeline Sessions ───────────────────────────────────────────── */
function SessionTimeline({ todaySessions, upcomingSessions }) {
  const [tab, setTab] = React.useState("today");
  const list = tab === "today" ? todaySessions : upcomingSessions;
  const now = new Date();

  return (
    <Box sx={{ borderRadius: "18px", border: "1.5px solid #f0f4f8", background: "#fff", overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ px: { xs: 2, md: 2.5 }, pt: 2, borderBottom: "1px solid #f1f5f9" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "14px", color: "#1e293b" }}>Sessions</Typography>
          <Link href="/appointments" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 2, color: "#228756", fontSize: "12px", fontWeight: 700 }}>
            View all <ChevronRightIcon sx={{ fontSize: 14 }} />
          </Link>
        </Box>
        <Box sx={{ display: "flex", gap: 0 }}>
          {[["today", "Today", todaySessions.length], ["upcoming", "Upcoming", upcomingSessions.length]].map(([key, label, count]) => (
            <Box key={key} onClick={() => setTab(key)} sx={{ cursor: "pointer", pb: 1.2, mr: 3, borderBottom: tab === key ? "2.5px solid #228756" : "2.5px solid transparent", transition: "all .15s" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: tab === key ? "#228756" : "#94a3b8" }}>{label}</Typography>
                {count > 0 && (
                  <Box sx={{ background: tab === key ? "#f0fdf4" : "#f8fafc", borderRadius: "20px", px: 0.9, minWidth: 18, textAlign: "center" }}>
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
          <EventBusyIcon sx={{ fontSize: 28, color: "#e2e8f0", mb: 0.8 }} />
          <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>
            {tab === "today" ? "No sessions today" : "No upcoming sessions"}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: "relative" }}>
          {list.slice(0, 6).map((s, i) => {
            const sd = new Date(s.date);
            const isPast = sd < now;
            const isSoon = !isPast && (sd - now) < 3600000;
            const dotColor = isPast ? "#e2e8f0" : isSoon ? "#f59e0b" : "#22c55e";
            return (
              <Box key={s.id} sx={{
                display: "flex", alignItems: "center", px: { xs: 2, md: 2.5 },
                py: { xs: 1.5, md: 1.8 }, gap: 1.8,
                borderBottom: i < Math.min(list.length, 6) - 1 ? "1px solid #f8fafc" : "none",
                "&:hover": { background: "#fafcff" }, transition: "background .15s",
              }}>
                {/* Timeline dot */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: dotColor, boxShadow: isPast ? "none" : `0 0 0 3px ${dotColor}28` }} />
                  {i < Math.min(list.length, 6) - 1 && <Box sx={{ width: 1.5, flex: 1, background: "#f1f5f9", mt: 0.5, minHeight: 20 }} />}
                </Box>
                <Avatar src={s.imgSrc || defaultProfile} sx={{ width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 }, borderRadius: "11px", flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
                    <AccessTimeIcon sx={{ fontSize: 10, color: "#94a3b8" }} />
                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                      {tab === "today" ? fmtTime(s.date) : `${fmtShortDate(s.date)} · ${fmtTime(s.date)}`}
                    </Typography>
                    {isSoon && <Box sx={{ background: "#fffbeb", borderRadius: "5px", px: 0.7 }}><Typography sx={{ fontSize: "9px", fontWeight: 800, color: "#d97706" }}>Soon</Typography></Box>}
                  </Box>
                </Box>
                <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box sx={{ background: s.badge === "Offline" ? "#f1f5f9" : "#f0fdf4", borderRadius: "7px", px: 0.9, py: 0.3, display: { xs: "none", sm: "flex" } }}>
                    <Typography sx={{ fontSize: "9px", fontWeight: 800, color: s.badge === "Offline" ? "#64748b" : "#228756" }}>{s.badge || "Online"}</Typography>
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
        </Box>
      )}
    </Box>
  );
}

/* ── Resource Library ────────────────────────────────────────────── */
const CAT_COLORS = { Mindfulness:"#0891b2",CBT:"#7c3aed",Anxiety:"#d97706",Depression:"#2563eb",Sleep:"#228756",Relationships:"#dc2626",Crisis:"#ef4444","Self-care":"#16a34a",General:"#64748b" };
const CAT_BG    = { Mindfulness:"#ecfeff",CBT:"#f5f3ff",Anxiety:"#fffbeb",Depression:"#eff6ff",Sleep:"#f0fdf4",Relationships:"#fef2f2",Crisis:"#fff5f5","Self-care":"#f0fdf4",General:"#f8fafc" };

function ResourceLibrary() {
  const [resources, setResources] = React.useState([]);
  const [loading,   setLoading]   = React.useState(true);
  const [catFilter, setCatFilter] = React.useState("All");
  const [viewPdf,   setViewPdf]   = React.useState(null);
  const [copied,    setCopied]    = React.useState(false);

  React.useEffect(() => {
    fetchById(getResourcesUrl).then(r => { if (r?.status) setResources(r.data||[]); }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (!loading && resources.length === 0) return null;

  const cats     = ["All", ...Array.from(new Set(resources.map(r => r.category)))];
  const filtered = catFilter === "All" ? resources : resources.filter(r => r.category === catFilter);
  const shareResource = r => { navigator.clipboard.writeText(r.url).then(()=>{ setCopied(r._id); setTimeout(()=>setCopied(false),2000); }); };

  return (
    <>
      <Box sx={{ borderRadius:"18px", border:"1.5px solid #f0f4f8", background:"#fff", overflow:"hidden", mt:{ xs:2, md:2.5 } }}>
        <Box sx={{ px:{ xs:2, md:2.5 }, pt:2.2, pb:2, borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:1 }}>
          <Box>
            <Typography sx={{ fontWeight:800, fontSize:"14px", color:"#1e293b", mb:0.3 }}>Resource Library</Typography>
            <Typography sx={{ fontSize:"11.5px", color:"#94a3b8" }}>Guides & worksheets — share with clients</Typography>
          </Box>
          {!loading && <Box sx={{ background:"#f0fdf4", border:"1px solid #dcfce7", borderRadius:"7px", px:1.2, py:0.4 }}><Typography sx={{ fontSize:"10px", fontWeight:800, color:"#228756" }}>{resources.length} RESOURCES</Typography></Box>}
        </Box>

        {!loading && cats.length > 1 && (
          <Box sx={{ px:{ xs:2, md:2.5 }, py:1.5, borderBottom:"1px solid #f8fafc", display:"flex", gap:1, flexWrap:"wrap" }}>
            {cats.map(cat => (
              <Box key={cat} onClick={() => setCatFilter(cat)} sx={{ cursor:"pointer", px:1.4, py:0.5, borderRadius:"20px", border:"1.5px solid", borderColor: catFilter===cat ? "#228756" : "#e2e8f0", background: catFilter===cat ? "#f0fdf4" : "#fff", transition:"all .15s" }}>
                <Typography sx={{ fontSize:"11.5px", fontWeight:700, color: catFilter===cat ? "#228756" : "#64748b" }}>{cat}</Typography>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ p:{ xs:2, md:2.5 } }}>
          {loading ? (
            <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", sm:"1fr 1fr", lg:"1fr 1fr 1fr" }, gap:1.5 }}>
              {[1,2,3].map(i=><Box key={i} sx={{ height:140, background:"#f8fafc", borderRadius:"14px" }} />)}
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ py:5, textAlign:"center" }}>
              <Typography sx={{ color:"#94a3b8", fontSize:"13px", fontWeight:600 }}>No resources yet</Typography>
            </Box>
          ) : (
            <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", sm:"1fr 1fr", lg:"1fr 1fr 1fr" }, gap:1.5 }}>
              {filtered.map(r => {
                const color = CAT_COLORS[r.category]||"#64748b";
                const bg    = CAT_BG[r.category]||"#f8fafc";
                return (
                  <Box key={r._id} onClick={() => setViewPdf({...r,color,bg})}
                    sx={{ border:"1.5px solid #f0f4f8", borderRadius:"14px", p:"16px", cursor:"pointer", transition:"all .18s", "&:hover":{ borderColor:color, boxShadow:`0 6px 22px ${color}16`, transform:"translateY(-2px)" } }}>
                    <Box sx={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", mb:1.2 }}>
                      <Box sx={{ width:42, height:42, borderRadius:"12px", background:bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Typography sx={{ fontSize:"19px" }}>{r.icon||"📄"}</Typography>
                      </Box>
                      <Box sx={{ background:bg, borderRadius:"7px", px:1, py:0.3 }}>
                        <Typography sx={{ fontSize:"9px", fontWeight:800, color }}>{(r.category||"General").toUpperCase()}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight:700, fontSize:"13px", color:"#1e293b", mb:0.5, lineHeight:1.3 }}>{r.title}</Typography>
                    <Typography sx={{ fontSize:"11.5px", color:"#64748b", lineHeight:1.6 }}>{r.description}</Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {viewPdf && (
        <Box onClick={() => setViewPdf(null)} sx={{ position:"fixed", inset:0, background:"rgba(2,6,23,0.75)", backdropFilter:"blur(6px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", p:{ xs:0, md:2 } }}>
          <Box onClick={e=>e.stopPropagation()} sx={{ background:"#fff", borderRadius:{ xs:0, md:"20px" }, width:"100%", maxWidth:960, height:{ xs:"100dvh", md:"90vh" }, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 32px 100px rgba(0,0,0,0.45)" }}>
            <Box sx={{ background:"linear-gradient(135deg,#0d2b1c 0%,#1a4f35 50%,#228756 100%)", px:2.5, py:1.8, display:"flex", alignItems:"center", gap:2, flexShrink:0 }}>
              <Box sx={{ display:"flex", alignItems:"center", gap:1.5, flex:1, minWidth:0 }}>
                <Box sx={{ width:36, height:36, borderRadius:"10px", background:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Typography sx={{ fontSize:"17px" }}>{viewPdf.icon||"📄"}</Typography>
                </Box>
                <Typography sx={{ fontWeight:800, fontSize:"13.5px", color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{viewPdf.title}</Typography>
              </Box>
              <Box sx={{ display:"flex", gap:1, alignItems:"center", flexShrink:0 }}>
                <Box onClick={() => shareResource(viewPdf)} sx={{ display:"flex", alignItems:"center", gap:0.6, background: copied===viewPdf._id?"rgba(74,222,128,0.2)":"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"9px", px:1.4, py:0.7, cursor:"pointer", transition:"all .15s" }}>
                  <Typography sx={{ fontSize:"11px", fontWeight:700, color: copied===viewPdf._id?"#86efac":"rgba(255,255,255,0.8)" }}>{copied===viewPdf._id?"✓ Copied":"🔗 Share"}</Typography>
                </Box>
                <Box component="a" href={viewPdf.url} target="_blank" rel="noopener noreferrer" sx={{ display:"flex", alignItems:"center", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"9px", px:1.4, py:0.7, textDecoration:"none" }}>
                  <Typography sx={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.8)" }}>↗ New Tab</Typography>
                </Box>
                <Box onClick={() => setViewPdf(null)} sx={{ width:32, height:32, borderRadius:"9px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", "&:hover":{ background:"rgba(220,38,38,0.3)" } }}>
                  <Typography sx={{ fontSize:"18px", color:"rgba(255,255,255,0.7)", lineHeight:1 }}>×</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ flex:1, minHeight:0, background:"#f1f5f9" }}>
              <embed src={`${viewPdf.url}#toolbar=1&navpanes=0`} type="application/pdf" style={{ width:"100%", height:"100%", border:"none" }} />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════ */
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function TherapistDashboard() {
  const [showWelcome,      setShowWelcome]      = React.useState(() => typeof window !== "undefined" && !localStorage.getItem("cyt_th_welcomed"));
  const [welcLeaving,      setWelcLeaving]      = React.useState(false);
  const [loading,          setLoading]          = React.useState(true);
  const [refreshing,       setRefreshing]       = React.useState(false);
  const [lastRefreshed,    setLastRefreshed]    = React.useState(null);
  const [stats,            setStats]            = React.useState({ totalEarnings:0, monthEarnings:0, upcoming:0, totalClients:0, todayRevenue:0, pendingCount:0, completedCount:0, completionRate:0 });
  const [weeklyData,       setWeeklyData]       = React.useState(() => {
    const now = new Date();
    return Array.from({length:7},(_,i)=>{ const d=new Date(now); d.setDate(now.getDate()-(6-i)); return {name:DAY_NAMES[d.getDay()],sessions:0,revenue:0}; });
  });
  const [monthlyData,      setMonthlyData]      = React.useState(() => {
    const now = new Date();
    return Array.from({length:6},(_,i)=>{ const d=new Date(now.getFullYear(),now.getMonth()-(5-i),1); return {name:MONTH_NAMES[d.getMonth()],sessions:0,revenue:0}; });
  });
  const [todaySessions,    setTodaySessions]    = React.useState([]);
  const [upcomingSessions, setUpcomingSessions] = React.useState([]);
  const [nextSession,      setNextSession]      = React.useState(null);
  const [invoices,         setInvoices]         = React.useState([]);
  const [clockTime,        setClockTime]        = React.useState(() => new Date());

  React.useEffect(() => { const iv = setInterval(() => setClockTime(new Date()), 60000); return () => clearInterval(iv); }, []);

  const { therapistInfo, paymentStore } = useTherapistStore();

  const load = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      // fetchTherapistInfo is handled by Providers.js + top-nav — do NOT call here (causes race condition)
      const [bookingsRes, workshopRes, dashRes] = await Promise.all([
        fetchById(getBookings),
        fetchById(GetMyWorkshopBooking),
        fetchById(GetDashboardDataUrl),
      ]);
      const bookings  = bookingsRes?.status  ? (bookingsRes.data||[])  : [];
      const workshops = workshopRes?.status  ? (workshopRes.data||[])  : [];
      const dashData  = dashRes?.status      ? (dashRes.data||{})      : {};

      const now = new Date();
      const todayStr = now.toDateString();
      const monthStart     = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth()-1, 1);

      // Use dashboard aggregate for total revenue + clients (correct Decimal128 handling server-side)
      const totalEarnings = getNum(dashData.revenue);
      const totalClients  = Number(dashData.client) || 0;

      let monthEarnings=0, lastMonthEarnings=0, todayRevenue=0;
      let completedCount=0, pendingCount=0;

      bookings.forEach(b => {
        const bStatus = b.status || "New";
        const bd = new Date(b.booking_date);
        const amt = getNum(b.transaction?.amount);

        if (bd >= monthStart) monthEarnings += amt;
        else if (bd >= lastMonthStart) lastMonthEarnings += amt;
        if (bd.toDateString() === todayStr) todayRevenue += amt;

        if (bStatus === "Completed") completedCount++;
        else if (bStatus === "New" || bStatus === "Started") pendingCount++;
      });

      workshops.forEach(w => {
        const amt = getNum(w.transaction?.amount || w.amount);
        const wd  = new Date(w.createdAt || w.created_at || w.date);
        if (wd >= monthStart) monthEarnings += amt;
        else if (wd >= lastMonthStart) lastMonthEarnings += amt;
        if (wd.toDateString() === todayStr) todayRevenue += amt;
      });

      const totalBk = bookings.filter(b => b.status !== "Cancelled").length;
      const completionRate = totalBk > 0 ? Math.round((completedCount / totalBk) * 100) : 0;

      const toMap = b => ({ id:b._id, name:b.client?.name||"Unknown", date:b.booking_date, badge:b.format||"Online", imgSrc:b.client?.photo||b.client?.profile });

      const todayList    = bookings.filter(b=>new Date(b.booking_date).toDateString()===todayStr&&b.status!=="Cancelled").sort((a,b)=>new Date(a.booking_date)-new Date(b.booking_date)).map(toMap);
      const upcomingList = bookings.filter(b=>b.status!=="Completed"&&b.status!=="Cancelled"&&new Date(b.booking_date)>now).sort((a,b)=>new Date(a.booking_date)-new Date(b.booking_date)).map(toMap);

      const weekMap = {};
      DAY_NAMES.forEach(d=>{ weekMap[d]={name:d,sessions:0,revenue:0}; });
      const weekStart = new Date(now); weekStart.setDate(now.getDate()-6); weekStart.setHours(0,0,0,0);
      bookings.forEach(b=>{ const d=new Date(b.booking_date); if(d>=weekStart){const k=DAY_NAMES[d.getDay()];weekMap[k].sessions++;weekMap[k].revenue+=getNum(b.transaction?.amount||b.amount);} });
      const weeklyChart = Array.from({length:7},(_,i)=>{ const d=new Date(now); d.setDate(now.getDate()-(6-i)); return weekMap[DAY_NAMES[d.getDay()]]; });

      const monthlyMap = new Map();
      for (let i=5;i>=0;i--) { const d=new Date(now.getFullYear(),now.getMonth()-i,1); monthlyMap.set(`${d.getFullYear()}-${d.getMonth()}`,{name:MONTH_NAMES[d.getMonth()],sessions:0,revenue:0}); }
      bookings.forEach(b=>{ const d=new Date(b.booking_date),key=`${d.getFullYear()}-${d.getMonth()}`; if(monthlyMap.has(key)){const e=monthlyMap.get(key);e.sessions++;e.revenue+=getNum(b.transaction?.amount||b.amount);} });

      const inv = bookings.filter(b=>b.transaction?.amount).sort((a,b)=>new Date(b.booking_date)-new Date(a.booking_date)).slice(0,6)
        .map(b=>({id:b._id,invoice_id:b.transaction?.transaction_id?.slice(-8)||b._id?.slice(-8),client_name:b.client?.name||"Unknown",booking_date:fmtDate(b.booking_date),amount:b.transaction?.amount,status:b.transaction?.status?.name||"Success"}));

      const monthGrowth = lastMonthEarnings > 0
        ? `${((monthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(0)}% vs last mo`
        : null;
      setStats({
        totalEarnings:   Math.round(totalEarnings),
        monthEarnings:   Math.round(monthEarnings),
        upcoming:        upcomingList.length,
        totalClients,
        monthGrowth,
        monthGrowthUp:   monthEarnings >= lastMonthEarnings,
        todayRevenue:    Math.round(todayRevenue),
        pendingCount,
        completedCount,
        completionRate,
      });
      setTodaySessions(todayList);
      setUpcomingSessions(upcomingList);
      setNextSession(upcomingList[0]||null);
      setWeeklyData(weeklyChart);
      setMonthlyData(Array.from(monthlyMap.values()));
      setInvoices(inv);
      setLastRefreshed(new Date());
    } catch(e) { console.error("Dashboard error:",e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  React.useEffect(() => { load(); }, []);
  React.useEffect(() => { const iv = setInterval(()=>load(true), 60000); return ()=>clearInterval(iv); }, [load]);

  const dismissWelcome = React.useCallback(() => {
    setWelcLeaving(true);
    setTimeout(()=>{ localStorage.setItem("cyt_th_welcomed","1"); setShowWelcome(false); setWelcLeaving(false); },500);
  }, []);
  React.useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(dismissWelcome, 4000);
    return ()=>clearTimeout(t);
  }, [showWelcome, dismissWelcome]);

  const profileChecks = React.useMemo(() => {
    const t = therapistInfo;
    return [
      { label:"Basic info",         done:!!(t?.user?.name&&t?.user?.phone) },
      { label:"Profile photo",      done:!!t?.user?.profile },
      { label:"Availability set",   done:(t?.availabilities?.length||0)>0 },
      { label:"Fee configured",     done:t?.fees?.some(f=>f.formats?.some(fmt=>fmt.fee)) },
      { label:"Payment details",    done:!!(paymentStore?.ac_number||paymentStore?.upi) },
    ];
  }, [therapistInfo, paymentStore]);
  const completionPct = Math.round((profileChecks.filter(c=>c.done).length/profileChecks.length)*100);

  const name      = therapistInfo?.user?.name?.split(" ")[0] || "Therapist";
  const today     = clockTime.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",timeZone:"Asia/Kolkata"});
  const avatarSrc = therapistInfo?.user?.profile ? `${imagePath}/${therapistInfo.user.profile}` : defaultProfile;
  const istHour   = parseInt(clockTime.toLocaleString("en-US",{hour:"numeric",hour12:false,timeZone:"Asia/Kolkata"}));
  const greeting  = istHour<12 ? "Good morning" : istHour<17 ? "Good afternoon" : "Good evening";

  const hasChartData = !loading&&(weeklyData.some(d=>d.sessions>0||d.revenue>0)||monthlyData.some(d=>d.sessions>0||d.revenue>0));
  const hasSessions  = !loading&&(todaySessions.length>0||upcomingSessions.length>0);
  const hasInvoices  = !loading&&invoices.length>0;

  const statCards = [
    { icon:<AccountBalanceWalletIcon/>, label:"Total Earnings",    numericValue:stats.totalEarnings,  isCurrency:true,  color:"#228756", bg:"#f0fdf4", gradient:"linear-gradient(90deg,#228756,#4ade80)" },
    { icon:<TrendingUpIcon/>,           label:"This Month",        numericValue:stats.monthEarnings,  isCurrency:true,  color:"#0ea5e9", bg:"#f0f9ff", gradient:"linear-gradient(90deg,#0ea5e9,#38bdf8)", trend:stats.monthGrowth, trendUp:stats.monthGrowthUp },
    { icon:<CalendarMonthIcon/>,        label:"Upcoming",          numericValue:stats.upcoming,       isCurrency:false, color:"#8b5cf6", bg:"#f5f3ff", gradient:"linear-gradient(90deg,#8b5cf6,#c084fc)" },
    { icon:<PeopleIcon/>,               label:"Total Clients",     numericValue:stats.totalClients,   isCurrency:false, color:"#f59e0b", bg:"#fffbeb", gradient:"linear-gradient(90deg,#f59e0b,#fcd34d)" },
    { icon:<CurrencyRupeeIcon/>,        label:"Today's Revenue",   numericValue:stats.todayRevenue,   isCurrency:true,  color:"#10b981", bg:"#ecfdf5", gradient:"linear-gradient(90deg,#10b981,#34d399)" },
    { icon:<TaskAltIcon/>,              label:"Sessions Done",     numericValue:stats.completedCount, isCurrency:false, color:"#6366f1", bg:"#eef2ff", gradient:"linear-gradient(90deg,#6366f1,#a5b4fc)", trend:stats.completionRate>0?`${stats.completionRate}% done`:undefined, trendUp:true },
  ];

  return (
    <MainLayout>
      <Box sx={{ pt:0, pb:6 }}>

        {/* ══ HERO ═══════════════════════════════════════════════ */}
        <Box sx={{ background:"linear-gradient(135deg,#071c10 0%,#0e2e1a 35%,#1a5c38 70%,#228756 100%)", borderRadius:"22px", mb:{ xs:2, md:2.5 }, p:{ xs:"20px 18px", md:"26px 30px" }, position:"relative", overflow:"hidden" }}>
          <Box sx={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
          <Box sx={{ position:"absolute", bottom:-40, left:20, width:160, height:160, borderRadius:"50%", background:"rgba(74,222,128,0.06)", pointerEvents:"none" }} />

          <Box sx={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"space-between", gap:2 }}>
            {/* Avatar + greeting */}
            <Box sx={{ display:"flex", alignItems:"center", gap:{ xs:1.5, md:2.2 } }}>
              <Box sx={{ position:"relative", flexShrink:0 }}>
                <Box sx={{ width:{ xs:54, md:68 }, height:{ xs:54, md:68 }, borderRadius:"16px", p:"2px", background:"linear-gradient(135deg,#4ade80,#16a34a)" }}>
                  <Avatar src={avatarSrc} sx={{ width:"100%", height:"100%", borderRadius:"14px" }} />
                </Box>
                <Box sx={{ position:"absolute", bottom:-2, right:-2, width:12, height:12, borderRadius:"50%", background:"#4ade80", border:"2.5px solid #0e2e1a", boxShadow:"0 0 8px rgba(74,222,128,0.7)" }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize:{ xs:"10px", md:"11px" }, color:"rgba(255,255,255,0.4)", fontWeight:500, mb:0.2 }}>{greeting},</Typography>
                <Typography sx={{ fontSize:{ xs:"22px", md:"30px" }, fontWeight:900, color:"#fff", lineHeight:1.05, letterSpacing:"-0.6px" }}>{name}</Typography>
                <Box sx={{ display:"flex", alignItems:"center", gap:0.6, mt:0.7 }}>
                  <Box sx={{ width:5, height:5, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 5px rgba(74,222,128,0.8)" }} />
                  <Typography sx={{ fontSize:"10.5px", color:"rgba(255,255,255,0.4)", fontWeight:500 }}>{today}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Clock + actions */}
            <Box sx={{ display:"flex", alignItems:"center", gap:1, flexShrink:0 }}>
              <Box sx={{ textAlign:"right", display:{ xs:"none", sm:"block" }, mr:0.5 }}>
                <Typography sx={{ fontSize:{ xs:"18px", md:"22px" }, fontWeight:800, color:"#fff", lineHeight:1, letterSpacing:"-0.5px" }}>
                  {clockTime.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true,timeZone:"Asia/Kolkata"})}
                </Typography>
                {lastRefreshed && (
                  <Typography sx={{ fontSize:"9.5px", color:"rgba(255,255,255,0.28)", mt:0.3 }}>
                    Updated {lastRefreshed.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true})}
                  </Typography>
                )}
              </Box>
              <Tooltip title="Notifications">
                <IconButton component={Link} href="/notifications" size="small"
                  sx={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.15)", p:"7px", "&:hover":{ background:"rgba(255,255,255,0.2)", color:"#fff" } }}>
                  <NotificationsIcon sx={{ fontSize:16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={() => load(true)} disabled={refreshing} size="small"
                  sx={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.15)", p:"7px", "&:hover":{ background:"rgba(255,255,255,0.2)", color:"#fff" }, animation:refreshing?"spin 1s linear infinite":"none", "@keyframes spin":{ to:{ transform:"rotate(360deg)" } } }}>
                  <RefreshIcon sx={{ fontSize:16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Today's summary pills */}
          {!loading && (todaySessions.length > 0 || stats.upcoming > 0) && (
            <Box sx={{ position:"relative", display:"flex", gap:1.5, mt:2, flexWrap:"wrap" }}>
              {todaySessions.length>0 && (
                <Box sx={{ display:"flex", alignItems:"center", gap:0.6, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.25)", borderRadius:"20px", px:1.4, py:0.5 }}>
                  <CalendarTodayIcon sx={{ fontSize:11, color:"#4ade80" }} />
                  <Typography sx={{ fontSize:"11px", fontWeight:700, color:"#4ade80" }}>{todaySessions.length} session{todaySessions.length!==1?"s":""} today</Typography>
                </Box>
              )}
              {stats.upcoming>0 && (
                <Box sx={{ display:"flex", alignItems:"center", gap:0.6, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"20px", px:1.4, py:0.5 }}>
                  <CalendarMonthIcon sx={{ fontSize:11, color:"rgba(255,255,255,0.6)" }} />
                  <Typography sx={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.6)" }}>{stats.upcoming} upcoming</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* ══ STAT CARDS — horizontal scroll row ════════════════ */}
        <Box sx={{
          display: "flex", gap: { xs: 1.5, md: 2 }, mb: { xs: 2, md: 2.5 },
          overflowX: "auto", pb: 0.5,
          "&::-webkit-scrollbar": { height: 3 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#e2e8f0", borderRadius: 2 },
          scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent",
        }}>
          {statCards.map((s, i) => (
            <StatCard key={i} {...s} loading={loading} />
          ))}
        </Box>

        {/* ══ PENDING SESSIONS ALERT ════════════════════════════ */}
        {!loading && stats.pendingCount > 0 && (
          <Box sx={{ display:"flex", gap:{ xs:1.5, md:2 }, mb:{ xs:2, md:2.5 } }}>
            <Box sx={{ flex:1, borderRadius:"16px", background:"linear-gradient(135deg,#fff7ed,#ffedd5)", border:"1.5px solid #fed7aa", p:"14px 18px", display:"flex", alignItems:"center", gap:2 }}>
              <Box sx={{ width:44, height:44, borderRadius:"12px", background:"#f97316", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <HourglassTopIcon sx={{ fontSize:20, color:"#fff" }} />
              </Box>
              <Box sx={{ flex:1 }}>
                <Typography sx={{ fontWeight:900, fontSize:"22px", color:"#9a3412", lineHeight:1, letterSpacing:"-0.5px" }}>{stats.pendingCount} session{stats.pendingCount!==1?"s":""} pending</Typography>
                <Typography sx={{ fontSize:"11.5px", color:"#c2410c", fontWeight:600, mt:0.3 }}>Awaiting completion · mark them done after the session</Typography>
              </Box>
              <Link href="/appointments" style={{ textDecoration:"none", flexShrink:0 }}>
                <Box sx={{ background:"#f97316", borderRadius:"10px", px:1.5, py:0.8 }}>
                  <Typography sx={{ fontSize:"11.5px", fontWeight:700, color:"#fff" }}>View →</Typography>
                </Box>
              </Link>
            </Box>
          </Box>
        )}

        {/* ══ PROFILE COMPLETION ════════════════════════════════ */}
        {!loading && <ProfileCard checks={profileChecks} pct={completionPct} />}

        {/* ══ MAIN GRID ════════════════════════════════════════ */}
        <Grid container spacing={{ xs:2, md:2.5 }}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ display:"flex", flexDirection:"column", gap:{ xs:2, md:2.5 } }}>
              {/* Next session — mobile only */}
              <Box sx={{ display:{ xs:"block", lg:"none" } }}>
                <NextSessionCard session={nextSession} loading={loading} />
              </Box>
              {hasChartData && <PerformanceChart weeklyData={weeklyData} monthlyData={monthlyData} />}
              {(hasSessions||loading) && <SessionTimeline todaySessions={todaySessions} upcomingSessions={upcomingSessions} />}
              {hasInvoices  && <RecentInvoices data={invoices} />}
            </Box>
          </Grid>

          {/* Right sticky — desktop */}
          <Grid item lg={4} sx={{ display:{ xs:"none", lg:"block" } }}>
            <Box sx={{ position:"sticky", top:"72px", display:"flex", flexDirection:"column", gap:2 }}>
              <NextSessionCard session={nextSession} loading={loading} />
            </Box>
          </Grid>
        </Grid>

        {/* ══ RESOURCE LIBRARY ════════════════════════════════ */}
        <ResourceLibrary />

        {/* ══ FOOTER ══════════════════════════════════════════ */}
        <Box sx={{ mt:{ xs:6, md:8 }, pt:3, borderTop:"1px solid #f0f4f8", display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
          <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
            <Box sx={{ width:26, height:26, borderRadius:"8px", background:"linear-gradient(135deg,#1a6b3a,#228756)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Typography sx={{ fontSize:"9.5px", fontWeight:900, color:"#fff", letterSpacing:"0.5px" }}>CYT</Typography>
            </Box>
            <Typography sx={{ fontSize:"12px", fontWeight:700, color:"#0f172a" }}>Choose Your Therapist</Typography>
          </Box>
          <Typography sx={{ fontSize:"10px", color:"#94a3b8" }}>© {new Date().getFullYear()} chooseyourtherapist.in · All rights reserved</Typography>
        </Box>

      </Box>

      {/* ══ WELCOME OVERLAY ══════════════════════════════════ */}
      {showWelcome && (
        <Box sx={{ position:"fixed", inset:0, zIndex:9999, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", animation:`${welcLeaving?"wOut":"wIn"} 0.5s ease forwards`, "@keyframes wIn":{ from:{opacity:0}, to:{opacity:1} }, "@keyframes wOut":{ from:{opacity:1}, to:{opacity:0} } }}>
          <Box sx={{ position:"absolute", inset:0, background:"linear-gradient(140deg,#041610 0%,#0c3520 30%,#145e2e 65%,#1a7540 100%)" }} />
          <Box sx={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize:"22px 22px" }} />
          <Box sx={{ position:"absolute", top:"10%", right:"10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(74,222,128,0.13) 0%,transparent 65%)", pointerEvents:"none" }} />
          <Box sx={{ position:"relative", textAlign:"center", px:{ xs:3, md:6 }, maxWidth:560 }}>
            <Box sx={{ animation:"wUp 0.5s ease 0.2s both", "@keyframes wUp":{ from:{opacity:0,transform:"translateY(14px)"}, to:{opacity:1,transform:"none"} } }}>
              <Typography sx={{ fontSize:{ xs:"10px", md:"11px" }, fontWeight:800, color:"rgba(255,255,255,0.3)", letterSpacing:"3px", textTransform:"uppercase", mb:{ xs:3, md:4 } }}>Choose Your Therapist</Typography>
            </Box>
            <Box sx={{ animation:"wUp 0.5s ease 0.5s both" }}>
              <Typography sx={{ fontSize:{ xs:"1rem", md:"1.2rem" }, fontWeight:400, color:"rgba(255,255,255,0.45)", mb:0.5 }}>Welcome,</Typography>
            </Box>
            <Box sx={{ animation:"wScale 0.65s cubic-bezier(.34,1.56,.64,1) 0.75s both", "@keyframes wScale":{ from:{opacity:0,transform:"scale(0.82)"}, to:{opacity:1,transform:"scale(1)"} }, mb:{ xs:2, md:2.5 } }}>
              <Typography sx={{ fontSize:{ xs:"3rem", md:"4.5rem" }, fontWeight:900, color:"#fff", lineHeight:1, letterSpacing:{ xs:"-1.5px", md:"-3px" } }}>{name}</Typography>
            </Box>
            <Box sx={{ animation:"wUp 0.5s ease 1.25s both", display:"flex", alignItems:"center", justifyContent:"center", gap:1, mb:{ xs:4, md:5 } }}>
              <Box sx={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 0 4px rgba(74,222,128,0.22)" }} />
              <Typography sx={{ fontSize:{ xs:"13px", md:"14px" }, color:"rgba(255,255,255,0.45)", fontWeight:500 }}>Your dashboard is ready</Typography>
            </Box>
            <Box sx={{ animation:"wUp 0.5s ease 1.55s both" }}>
              <Box onClick={dismissWelcome} sx={{ display:"inline-flex", alignItems:"center", gap:1.5, background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.22)", borderRadius:"50px", px:{ xs:3.5, md:5 }, py:{ xs:1.5, md:1.8 }, cursor:"pointer", transition:"all .2s", "&:hover":{ background:"rgba(255,255,255,0.2)", transform:"scale(1.04)" } }}>
                <Typography sx={{ fontSize:{ xs:"14px", md:"16px" }, fontWeight:700, color:"#fff" }}>Enter Dashboard</Typography>
                <Typography sx={{ fontSize:{ xs:"16px", md:"18px" }, color:"#4ade80" }}>→</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </MainLayout>
  );
}

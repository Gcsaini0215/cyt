import React from "react";
import MainLayout from "../components/therapists/main-layout";
import { getBookings, GetMyWorkshopBooking, GetDashboardDataUrl, defaultProfile, imagePath, GetMyReviewsUrl } from "../utils/url";
import { fetchById } from "../utils/actions";
import useTherapistStore from "../store/therapistStore";
import Link from "next/link";
import { Box, Typography, Avatar, Skeleton } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

// Safely parse any numeric value including Mongoose Decimal128 serialized as { $numberDecimal: "..." }
function getNum(v) {
  if (!v && v !== 0) return 0;
  if (typeof v === "number") return v;
  if (v.$numberDecimal !== undefined) return parseFloat(v.$numberDecimal) || 0;
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}
function toStrList(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(i => (i?.label || i?.value || String(i)).trim()).filter(Boolean);
  return String(v).split(",").map(i => i.trim()).filter(Boolean);
}
function toStr(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v.map(i => i?.label || i?.value || String(i)).filter(Boolean).join(", ");
  if (typeof v === "object") return v.label || v.value || "";
  return String(v);
}
function fmtDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone:"Asia/Kolkata" }); }
function fmtTime(d) { return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone:"Asia/Kolkata" }); }
function fmtShortDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone:"Asia/Kolkata" }); }

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

/* ── Stat Card (academic) ────────────────────────────── */
function StatCard({ icon, label, numericValue, isCurrency, color, bg, loading, trend, trendUp }) {
  const counted = useCountUp(loading ? 0 : (numericValue || 0));
  const display = loading ? null : isCurrency ? `₹${counted.toLocaleString("en-IN")}` : String(counted);

  return (
    <Box sx={{
      borderRadius: "8px", background: "#fff", border: "1px solid #eef1ee",
      overflow: "hidden", flex: "1 1 0", minWidth: { xs: "calc(50% - 6px)", sm: 170 },
      boxShadow: "0 1px 2px rgba(15,23,42,.05), 0 10px 24px rgba(15,23,42,.07)",
      transition: "transform .2s ease, box-shadow .2s ease",
      "&:hover": { boxShadow: `0 4px 8px rgba(15,23,42,.06), 0 18px 34px ${color}26`, transform: "translateY(-3px)" },
    }}>
      <Box sx={{ height: 3, background: color }} />
      <Box sx={{ p: { xs: "12px 14px 14px", md: "14px 16px 16px" } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: "6px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 8px ${color}30, inset 0 1px 0 rgba(255,255,255,.5)` }}>
            {React.cloneElement(icon, { sx: { fontSize: 16, color } })}
          </Box>
          {trend && !loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, background: trendUp !== false ? "#f0fdf4" : "#fef2f2", borderRadius: "4px", px: 0.8, py: 0.3, border: `1px solid ${trendUp !== false ? "#bbf7d0" : "#fecaca"}` }}>
              {trendUp !== false ? <TrendingUpIcon sx={{ fontSize: 9, color: "#16a34a" }} /> : <TrendingDownIcon sx={{ fontSize: 9, color: "#dc2626" }} />}
              <Typography sx={{ fontSize: "8.5px", color: trendUp !== false ? "#16a34a" : "#dc2626", fontWeight: 700 }}>{trend}</Typography>
            </Box>
          )}
        </Box>
        {loading
          ? <Skeleton width={72} height={26} sx={{ borderRadius: "4px", mb: 0.5 }} />
          : <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "19px", lineHeight: 1, letterSpacing: "-0.4px", mb: 0.5 }}>{display}</Typography>
        }
        <Typography sx={{ color: "#52667f", fontSize: "9.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</Typography>
      </Box>
    </Box>
  );
}

/* ── Section head (academic numbered label) ─────────────────────── */
function SectionHead({ num, title, sub, right }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2, flexWrap: "wrap" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box sx={{ width: 22, height: 22, borderRadius: "4px", background: "#166534", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{num}</Box>
        <Box>
          <Typography sx={{ fontSize: { xs: "12.5px", md: "13.5px" }, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</Typography>
          {sub && <Typography sx={{ fontSize: "11px", color: "#94a3b8", mt: 0.2 }}>{sub}</Typography>}
        </Box>
      </Box>
      {right}
    </Box>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════ */
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function TherapistDashboard() {
  const [showWelcome,      setShowWelcome]      = React.useState(false);
  React.useEffect(() => { if (!localStorage.getItem("cyt_th_welcomed")) setShowWelcome(true); }, []);
  const [welcLeaving,      setWelcLeaving]      = React.useState(false);
  const [loading,          setLoading]          = React.useState(true);
  const [refreshing,       setRefreshing]       = React.useState(false);
  const [lastRefreshed,    setLastRefreshed]    = React.useState(null);
  const [stats,            setStats]            = React.useState({ totalEarnings:0, monthEarnings:0, upcoming:0, totalClients:0, todayClients:0, todayRevenue:0, pendingCount:0, completedCount:0, completionRate:0 });
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
  const [recentBookings,   setRecentBookings]   = React.useState([]);
  const [myReviews,        setMyReviews]        = React.useState([]);
  const [clockTime,        setClockTime]        = React.useState(null);

  React.useEffect(() => { setClockTime(new Date()); const iv = setInterval(() => setClockTime(new Date()), 60000); return () => clearInterval(iv); }, []);

  const { therapistInfo, paymentStore, setInfo } = useTherapistStore();

  const load = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      // fetchTherapistInfo is handled by Providers.js + top-nav — do NOT call here (causes race condition)
      const [bookingsRes, workshopRes, dashRes, reviewsRes] = await Promise.allSettled([
        fetchById(getBookings),
        fetchById(GetMyWorkshopBooking),
        fetchById(GetDashboardDataUrl),
        fetchById(GetMyReviewsUrl),
      ]);
      const bookingsData = bookingsRes.status === "fulfilled" ? bookingsRes.value : {};
      const workshopData = workshopRes.status === "fulfilled" ? workshopRes.value : {};
      const dashResData  = dashRes.status    === "fulfilled" ? dashRes.value    : {};
      const reviewsData  = reviewsRes.status === "fulfilled" ? reviewsRes.value : {};
      setMyReviews(reviewsData?.status ? (reviewsData.data || []) : []);
      const bookings  = bookingsData?.status  ? (bookingsData.data||[])  : [];
      const workshops = workshopData?.status  ? (workshopData.data||[])  : [];
      const dashData  = dashResData?.status   ? (dashResData.data||{})   : {};

      const now = new Date();
      const todayStr = new Date(now.toLocaleString("en-US", { timeZone:"Asia/Kolkata" })).toDateString();
      const monthStart     = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth()-1, 1);

      // Use dashboard aggregate for total revenue + clients (correct Decimal128 handling server-side)
      const totalEarnings = getNum(dashData.revenue);
      const totalClients  = Number(dashData.client) || 0;

      let monthEarnings=0, lastMonthEarnings=0, todayRevenue=0;
      let completedCount=0, pendingCount=0;
      const todayClientIds = new Set();

      bookings.forEach(b => {
        const bStatus = b.status || "New";
        const bd = new Date(b.booking_date);
        const amt = getNum(b.amount || b.transaction?.amount);

        if (bd >= monthStart) monthEarnings += amt;
        else if (bd >= lastMonthStart) lastMonthEarnings += amt;
        if (bd.toDateString() === todayStr) {
          todayRevenue += amt;
          if (b.client?._id) todayClientIds.add(b.client._id.toString());
        }

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

      const todayList    = bookings.filter(b=>new Date(new Date(b.booking_date).toLocaleString("en-US",{timeZone:"Asia/Kolkata"})).toDateString()===todayStr&&b.status!=="Cancelled").sort((a,b)=>new Date(a.booking_date)-new Date(b.booking_date)).map(toMap);
      // Include all pending/active bookings (New or Started) regardless of booking_date being past
      const upcomingList = bookings.filter(b=>b.status!=="Completed"&&b.status!=="Cancelled").sort((a,b)=>new Date(a.booking_date)-new Date(b.booking_date)).map(toMap);

      const weekMap = {};
      DAY_NAMES.forEach(d=>{ weekMap[d]={name:d,sessions:0,revenue:0}; });
      const weekStart = new Date(now); weekStart.setDate(now.getDate()-6); weekStart.setHours(0,0,0,0);
      bookings.forEach(b=>{ const d=new Date(b.booking_date); if(d>=weekStart){const k=DAY_NAMES[d.getDay()];weekMap[k].sessions++;weekMap[k].revenue+=getNum(b.transaction?.amount||b.amount);} });
      const weeklyChart = Array.from({length:7},(_,i)=>{ const d=new Date(now); d.setDate(now.getDate()-(6-i)); return weekMap[DAY_NAMES[d.getDay()]]; });

      const monthlyMap = new Map();
      for (let i=5;i>=0;i--) { const d=new Date(now.getFullYear(),now.getMonth()-i,1); monthlyMap.set(`${d.getFullYear()}-${d.getMonth()}`,{name:MONTH_NAMES[d.getMonth()],sessions:0,revenue:0}); }
      bookings.forEach(b=>{ const d=new Date(b.booking_date),key=`${d.getFullYear()}-${d.getMonth()}`; if(monthlyMap.has(key)){const e=monthlyMap.get(key);e.sessions++;e.revenue+=getNum(b.transaction?.amount||b.amount);} });

      const inv = bookings.filter(b=>b.transaction?.amount||b.amount).sort((a,b)=>new Date(b.booking_date)-new Date(a.booking_date)).slice(0,6)
        .map(b=>({id:b._id,invoice_id:b.transaction?.transaction_id?.slice(-8)||b._id?.slice(-8),client_name:b.client?.name||"Unknown",booking_date:fmtDate(b.booking_date),amount:b.transaction?.amount||b.amount,status:b.transaction?.status?.name||"Success"}));

      const monthGrowth = lastMonthEarnings > 0
        ? `${((monthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(0)}% vs last mo`
        : null;
      setStats({
        totalEarnings:   Math.round(totalEarnings),
        monthEarnings:   Math.round(monthEarnings),
        upcoming:        upcomingList.length,
        totalClients,
        todayClients:    todayClientIds.size,
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
      // Recent bookings for right panel: latest 8, most recent first
      const recent = [...bookings]
        .sort((a,b) => new Date(b.booking_date)-new Date(a.booking_date))
        .slice(0,8);
      setRecentBookings(recent);
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
  const today     = clockTime ? clockTime.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",timeZone:"Asia/Kolkata"}) : "";
  const avatarSrc = therapistInfo?.user?.profile ? `${imagePath}/${therapistInfo.user.profile}` : defaultProfile;

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

        {/* ══ LETTERHEAD — academic banner ════════ */}
        <div style={{ background:"#fff", border:"1px solid #dbe3df", borderRadius:10, marginBottom:24, overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#0f3d24,#175c37)", borderBottom:"3px solid #d4af37", position:"relative", padding:"22px 20px 20px" }}>
            <div style={{ position:"absolute", top:-40, right:-20, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-30, left:60, width:100, height:100, borderRadius:"50%", background:"rgba(212,175,55,0.08)", pointerEvents:"none" }} />

            {/* Clock + date — top-right */}
            <div style={{ position:"absolute", top:16, right:20, textAlign:"right" }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", fontWeight:600, whiteSpace:"nowrap" }}>{today}</div>
              <div style={{ fontSize:15, fontWeight:800, color:"#fff", lineHeight:1.2 }}>
                {clockTime ? clockTime.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true,timeZone:"Asia/Kolkata"}) : ""}
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
              <div style={{ position:"relative", width:64, height:64, flexShrink:0 }}>
                <img
                  src={avatarSrc}
                  alt={name}
                  style={{ width:64, height:64, borderRadius:8, objectFit:"cover", border:"3px solid rgba(212,175,55,0.65)", display:"block" }}
                  onError={e=>{e.target.src=defaultProfile;}}
                />
                <div style={{ position:"absolute", bottom:-2, right:-2, width:13, height:13, borderRadius:"50%", background:"#4ade80", border:"2.5px solid #0f3d24" }} />
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:19, fontWeight:800, color:"#fff", lineHeight:1.2, marginBottom:3 }}>
                  {therapistInfo?.user?.name || name}
                </div>
                <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.8)", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:8 }}>
                  {therapistInfo?.profile_type || "Therapist"} · Choose Your Therapist
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:"5px 14px" }}>
                  {[
                    therapistInfo?.qualification && { icon:"feather-award",    text: toStr(therapistInfo.qualification) },
                    therapistInfo?.year_of_exp   && { icon:"feather-briefcase",text: `${toStr(therapistInfo.year_of_exp)} yrs exp` },
                    therapistInfo?.state         && { icon:"feather-map-pin",  text: toStr(therapistInfo.state) },
                    { icon:"feather-check-circle", text: `${stats.completedCount} sessions done` },
                  ].filter(Boolean).map((chip, i) => (
                    <span key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"rgba(255,255,255,0.78)", fontWeight:600 }}>
                      <i className={chip.icon} style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}></i>
                      {chip.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Public profile link — inline in the banner */}
            <div style={{ marginTop:16, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.14)", position:"relative", display:"flex", alignItems:"center", justifyContent:"flex-end", flexWrap:"wrap", gap:10 }}>
              {therapistInfo?._id && (
                <Link href={`/view-profile/${therapistInfo._id}`} target="_blank">
                  <div style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11.5, fontWeight:700, color:"#d4af37", cursor:"pointer" }}>
                    View Public Profile
                    <i className="feather-external-link" style={{ fontSize:11 }}></i>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ══ 01 · OVERVIEW ════════════════════════════════════ */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <SectionHead num="01" title="Overview" sub="Your practice at a glance" />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1, sm: 1.5 } }}>
            {statCards.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
          </Box>
        </Box>

        {/* ══ 02 · CLIENT REVIEWS ═══════════════════════════════ */}
        {myReviews.length > 0 && (
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            <SectionHead num="02" title="Client Reviews" sub="What clients are saying" right={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#b8952e" }}>
                  {(myReviews.reduce((s,r)=>s+r.rating,0)/myReviews.length).toFixed(1)}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>({myReviews.length})</Typography>
              </Box>
            } />
            <div style={{ background:"#fff", border:"1px solid #dbe3df", borderRadius:8, overflow:"hidden" }}>
              <div style={{ padding:"4px 0" }}>
                {myReviews.slice(0,3).map((r,i) => (
                  <div key={r._id||i} style={{ padding:"12px 16px", borderBottom: i < Math.min(myReviews.length,3)-1 ? "1px solid #f8faf9":"none" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>{r.name || "Client"}</span>
                      <div style={{ display:"flex", gap:2 }}>
                        {[1,2,3,4,5].map(s => (
                          <i key={s} className="feather-star" style={{ fontSize:11, color: s<=r.rating?"#d4af37":"#e2e8f0" }}></i>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:"#475569", lineHeight:1.5, textAlign:"justify" }}>{r.description}</div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                    </div>
                  </div>
                ))}
              </div>
              {myReviews.length > 3 && (
                <div style={{ padding:"10px 16px", borderTop:"1px solid #eef2f0", textAlign:"center" }}>
                  <Link href="/therapists/reviews">
                    <span style={{ fontSize:12, fontWeight:700, color:"#166534", cursor:"pointer" }}>View All Reviews →</span>
                  </Link>
                </div>
              )}
            </div>
          </Box>
        )}

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
              <Box sx={{ width:8, height:8, borderRadius:"50%", background:"#d4af37", boxShadow:"0 0 0 4px rgba(212,175,55,0.22)" }} />
              <Typography sx={{ fontSize:{ xs:"13px", md:"14px" }, color:"rgba(255,255,255,0.45)", fontWeight:500 }}>Your dashboard is ready</Typography>
            </Box>
            <Box sx={{ animation:"wUp 0.5s ease 1.55s both" }}>
              <Box onClick={dismissWelcome} sx={{ display:"inline-flex", alignItems:"center", gap:1.5, background:"rgba(212,175,55,0.14)", border:"1.5px solid rgba(212,175,55,0.4)", borderRadius:"6px", px:{ xs:3.5, md:5 }, py:{ xs:1.5, md:1.8 }, cursor:"pointer", transition:"all .2s", "&:hover":{ background:"rgba(212,175,55,0.22)", transform:"scale(1.04)" } }}>
                <Typography sx={{ fontSize:{ xs:"14px", md:"16px" }, fontWeight:700, color:"#fff" }}>Enter Dashboard</Typography>
                <Typography sx={{ fontSize:{ xs:"16px", md:"18px" }, color:"#d4af37" }}>→</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </MainLayout>
  );
}

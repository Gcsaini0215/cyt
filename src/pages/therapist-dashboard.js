import React from "react";
import Link from "next/link";
import MainLayout from "../components/therapists/main-layout";
import {
  getBookings,
  GetMyWorkshopBooking,
  GetDashboardDataUrl,
  defaultProfile,
  imagePath,
  GetMyReviewsUrl,
} from "../utils/url";
import { fetchById } from "../utils/actions";
import useTherapistStore from "../store/therapistStore";
import PerformanceChart from "../components/therapists/dashboard/PerformanceChart";
import { Box, Typography, Avatar, Skeleton, CircularProgress } from "@mui/material";

import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";

/* ══════════════════════════════════════════════════════════════════
   DESIGN TOKENS — one green system, tweak here to restyle everything
════════════════════════════════════════════════════════════════════ */
const UI = {
  page: "#f8faf9",
  text: "#0f172a",
  muted: "#5b6b7c",
  faint: "#94a3b8",
  line: "#eef2f0",
  cardBorder: "1px solid #e4ece7",
  cardRadius: 10,
  cardShadow: "0 1px 2px rgba(15,23,42,.04), 0 10px 26px rgba(15,23,42,.06)",
  green: {
    d900: "#0f3d24",
    d800: "#134e2b",
    main: "#166534",
    mid: "#1f9d57",
    bright: "#22c55e",
    light: "#4ade80",
    bg: "#f0fdf4",
    tint: "#e7f6ec",
  },
  gold: "#b8860b",
  goldBg: "#fffbeb",
  danger: "#dc2626",
};

/* ── data helpers ─────────────────────────────────────────────── */
function getNum(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "object" && v.$numberDecimal !== undefined)
    return parseFloat(v.$numberDecimal) || 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}
function toStr(v) {
  if (!v) return "";
  if (Array.isArray(v))
    return v.map((i) => i?.label || i?.value || String(i)).filter(Boolean).join(", ");
  if (typeof v === "object") return v.label || v.value || "";
  return String(v);
}
const inr = (v) => "₹" + Math.round(getNum(v)).toLocaleString("en-IN");

function safeDate(d) {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}
function fmtDate(d) {
  const dt = safeDate(d);
  return dt
    ? dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
    : "—";
}
function fmtTime(d) {
  const dt = safeDate(d);
  return dt
    ? dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })
    : "—";
}
function fmtShortDate(d) {
  const dt = safeDate(d);
  return dt ? dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "—";
}
function timeUntil(dateStr) {
  const dt = safeDate(dateStr);
  if (!dt) return "";
  const diff = dt - new Date();
  if (diff <= 0) return "Now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h / 24)}d`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ── animated count-up (respects reduced-motion) ─────────────── */
function useCountUp(end, duration = 1200) {
  const [count, setCount] = React.useState(0);
  const raf = React.useRef(null);
  React.useEffect(() => {
    cancelAnimationFrame(raf.current);
    const target = Number.isFinite(end) ? end : 0;
    if (!target) {
      setCount(0);
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCount(target);
      return;
    }
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setCount(target);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [end, duration]);
  return count;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ══════════════════════════════════════════════════════════════════
   REUSABLE PIECES
════════════════════════════════════════════════════════════════════ */

/** Card shell — every dashboard widget sits in one of these. */
function DashCard({ icon: Icon, title, sub, action, disablePad = false, children, sx }) {
  return (
    <Box
      sx={{
        background: "#fff",
        border: UI.cardBorder,
        borderRadius: `${UI.cardRadius}px`,
        boxShadow: UI.cardShadow,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      {title && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            px: { xs: 1.75, md: 2.25 },
            py: 1.5,
            borderBottom: `1px solid ${UI.line}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.15, minWidth: 0 }}>
            {Icon && (
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "8px",
                  background: UI.green.bg,
                  color: UI.green.main,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 17 }} />
              </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: "12px", md: "12.5px" },
                  fontWeight: 800,
                  color: UI.text,
                  textTransform: "uppercase",
                  letterSpacing: ".4px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </Typography>
              {sub && (
                <Typography sx={{ fontSize: "10.5px", color: UI.faint, mt: 0.1 }}>{sub}</Typography>
              )}
            </Box>
          </Box>
          {action}
        </Box>
      )}
      <Box sx={{ p: disablePad ? 0 : { xs: 1.5, md: 2 }, flex: 1 }}>{children}</Box>
    </Box>
  );
}

/** "View all →" link used in card headers. */
function CardLink({ href, label = "View all" }) {
  return (
    <Link href={href} style={{ textDecoration: "none", flexShrink: 0 }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.4,
          fontSize: "11px",
          fontWeight: 800,
          color: UI.green.main,
          "&:hover": { color: UI.green.d800 },
        }}
      >
        {label}
        <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
      </Box>
    </Link>
  );
}

/** KPI stat card. */
function StatCard({ icon: Icon, label, value, isCurrency, accent = UI.green.main, accentBg = UI.green.bg, loading, trend, trendUp }) {
  const counted = useCountUp(loading ? 0 : getNum(value));
  const display = loading ? null : isCurrency ? `₹${counted.toLocaleString("en-IN")}` : String(counted);

  return (
    <Box
      sx={{
        borderRadius: `${UI.cardRadius}px`,
        background: "#fff",
        border: UI.cardBorder,
        overflow: "hidden",
        boxShadow: UI.cardShadow,
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: `0 6px 12px rgba(15,23,42,.06), 0 20px 38px ${accent}22` },
      }}
    >
      <Box sx={{ height: 3, background: accent }} />
      <Box sx={{ p: { xs: "12px 13px 13px", md: "14px 16px 15px" } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              background: accentBg,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon sx={{ fontSize: 17, color: accent }} />
          </Box>
          {trend && !loading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                background: trendUp !== false ? UI.green.bg : "#fef2f2",
                border: `1px solid ${trendUp !== false ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: "5px",
                px: 0.7,
                py: 0.3,
              }}
            >
              {trendUp !== false ? (
                <TrendingUpRoundedIcon sx={{ fontSize: 10, color: "#16a34a" }} />
              ) : (
                <TrendingDownRoundedIcon sx={{ fontSize: 10, color: UI.danger }} />
              )}
              <Typography sx={{ fontSize: "8.5px", fontWeight: 800, color: trendUp !== false ? "#16a34a" : UI.danger }}>
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        {loading ? (
          <Skeleton width={72} height={24} sx={{ borderRadius: "4px", mb: 0.5 }} />
        ) : (
          <Typography
            sx={{
              fontWeight: 800,
              color: UI.text,
              fontSize: { xs: "17px", md: "19px" },
              lineHeight: 1,
              letterSpacing: "-0.4px",
              mb: 0.5,
            }}
          >
            {display}
          </Typography>
        )}
        <Typography sx={{ color: UI.muted, fontSize: "9.5px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

/** One session row — used for the upcoming list. */
function SessionRow({ s, last }) {
  const until = timeUntil(s.date);
  const soon = until && until !== "Now" && /^\d+m$/.test(until);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1.25, md: 1.75 },
        px: { xs: 1.75, md: 2.25 },
        py: 1.5,
        borderBottom: last ? "none" : `1px solid ${UI.line}`,
        transition: "background .15s",
        "&:hover": { background: "#fafcfb" },
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          flexShrink: 0,
          background: until === "Now" || soon ? UI.green.bright : "#cbd5e1",
          boxShadow: until === "Now" || soon ? `0 0 0 3px ${UI.green.bg}` : "none",
        }}
      />
      <Avatar
        src={s.imgSrc || defaultProfile}
        alt={s.name}
        sx={{ width: { xs: 34, md: 38 }, height: { xs: 34, md: 38 }, borderRadius: "9px", flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: "12.5px", md: "13px" },
            color: UI.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {s.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
          <ScheduleRoundedIcon sx={{ fontSize: 11, color: UI.faint }} />
          <Typography sx={{ fontSize: "11px", color: UI.muted, fontWeight: 600 }}>
            {fmtShortDate(s.date)} · {fmtTime(s.date)}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          fontSize: "9.5px",
          fontWeight: 800,
          borderRadius: "5px",
          px: 0.8,
          py: 0.35,
          flexShrink: 0,
          background: s.badge === "Offline" ? "#f1f5f9" : UI.green.bg,
          color: s.badge === "Offline" ? "#64748b" : UI.green.main,
        }}
      >
        {s.badge || "Online"}
      </Box>
      {until && (
        <Box
          sx={{
            fontSize: "10px",
            fontWeight: 800,
            color: soon || until === "Now" ? UI.green.main : UI.faint,
            minWidth: 34,
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          {until}
        </Box>
      )}
    </Box>
  );
}

/** Empty-state block for lists. */
function EmptyState({ icon: Icon, text }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, py: 5 }}>
      <Icon sx={{ fontSize: 34, color: "#d7e3dc" }} />
      <Typography sx={{ color: UI.faint, fontSize: "12px", fontWeight: 600 }}>{text}</Typography>
    </Box>
  );
}

/** Profile-strength ring + checklist. */
function ProfileStrength({ pct, checks }) {
  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: "center" }}>
      <Box sx={{ position: "relative", width: 92, height: 92, flexShrink: 0 }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={92}
          thickness={4}
          sx={{ color: UI.green.tint, position: "absolute", left: 0 }}
        />
        <CircularProgress
          variant="determinate"
          value={pct}
          size={92}
          thickness={4}
          sx={{ color: UI.green.mid, position: "absolute", left: 0, "& .MuiCircularProgress-circle": { strokeLinecap: "round" } }}
        />
        <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <Typography sx={{ fontSize: "20px", fontWeight: 800, color: UI.green.d800, lineHeight: 1 }}>{pct}%</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, width: "100%" }}>
        {checks.map((c) => (
          <Box key={c.label} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
            {c.done ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 16, color: UI.green.mid }} />
            ) : (
              <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 16, color: "#cbd5e1" }} />
            )}
            <Typography
              sx={{ fontSize: "12px", fontWeight: 600, color: c.done ? UI.muted : UI.text, flex: 1 }}
            >
              {c.label}
            </Typography>
            {!c.done && (
              <Link href="/settings" style={{ textDecoration: "none" }}>
                <Typography sx={{ fontSize: "10.5px", fontWeight: 800, color: UI.green.main }}>Add</Typography>
              </Link>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Reviews summary + a couple of recent ones. */
function ReviewsBlock({ reviews }) {
  if (!reviews.length) return <EmptyState icon={RateReviewRoundedIcon} text="No reviews yet" />;
  const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Typography sx={{ fontSize: "30px", fontWeight: 800, color: UI.green.d800, lineHeight: 1 }}>
          {avg.toFixed(1)}
        </Typography>
        <Box>
          <Box sx={{ display: "flex", gap: 0.1 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <StarRateRoundedIcon
                key={i}
                sx={{ fontSize: 15, color: i <= Math.round(avg) ? UI.gold : "#e2e8f0" }}
              />
            ))}
          </Box>
          <Typography sx={{ fontSize: "11px", color: UI.faint, fontWeight: 600, mt: 0.2 }}>
            {reviews.length} review{reviews.length > 1 ? "s" : ""}
          </Typography>
        </Box>
      </Box>
      {reviews.slice(0, 2).map((r, i) => (
        <Box key={r._id || i} sx={{ pt: 1.25, borderTop: `1px solid ${UI.line}` }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: UI.text }}>{r.name || "Client"}</Typography>
            <Box sx={{ display: "flex", gap: 0.1 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <StarRateRoundedIcon key={s} sx={{ fontSize: 12, color: s <= r.rating ? UI.gold : "#e2e8f0" }} />
              ))}
            </Box>
          </Box>
          <Typography
            sx={{
              fontSize: "11.5px",
              color: UI.muted,
              lineHeight: 1.5,
              mt: 0.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {r.description}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/** Next-session hero strip. */
function NextSessionStrip({ session }) {
  if (!session) return null;
  const until = timeUntil(session.date);
  return (
    <Box
      sx={{
        borderRadius: `${UI.cardRadius}px`,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${UI.green.d900}, ${UI.green.d800} 60%, #17663a)`,
        boxShadow: UI.cardShadow,
        display: "flex",
        alignItems: "center",
        gap: { xs: 1.5, md: 2 },
        p: { xs: 1.75, md: 2.25 },
        flexWrap: "wrap",
      }}
    >
      <Avatar
        src={session.imgSrc || defaultProfile}
        alt={session.name}
        sx={{ width: 46, height: 46, borderRadius: "10px", border: "2px solid rgba(255,255,255,.25)", flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, minWidth: 140 }}>
        <Typography sx={{ fontSize: "9.5px", fontWeight: 800, letterSpacing: "1px", color: "rgba(255,255,255,.55)", textTransform: "uppercase" }}>
          Next session
        </Typography>
        <Typography sx={{ fontSize: { xs: "14px", md: "15px" }, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>
          {session.name}
        </Typography>
        <Typography sx={{ fontSize: "11.5px", color: "rgba(255,255,255,.7)", fontWeight: 600, mt: 0.2 }}>
          {fmtShortDate(session.date)} · {fmtTime(session.date)}
        </Typography>
      </Box>
      {until && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            background: "rgba(255,255,255,.12)",
            border: "1px solid rgba(255,255,255,.18)",
            borderRadius: "999px",
            px: 1.4,
            py: 0.6,
            flexShrink: 0,
          }}
        >
          <BoltRoundedIcon sx={{ fontSize: 13, color: UI.green.light }} />
          <Typography sx={{ fontSize: "11.5px", fontWeight: 800, color: "#fff" }}>
            {until === "Now" ? "Now" : `in ${until}`}
          </Typography>
        </Box>
      )}
      <Link href="/appointments" style={{ textDecoration: "none", flexShrink: 0 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.6,
            background: "#fff",
            color: UI.green.d800,
            fontSize: "11.5px",
            fontWeight: 800,
            borderRadius: "8px",
            px: 1.6,
            py: 0.9,
            "&:hover": { background: UI.green.bg },
          }}
        >
          <VideocamRoundedIcon sx={{ fontSize: 15 }} />
          Join
        </Box>
      </Link>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════
   WELCOME OVERLAY (first visit)
════════════════════════════════════════════════════════════════════ */
function WelcomeOverlay({ name, leaving, onDismiss }) {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: `${leaving ? "wOut" : "wIn"} 0.5s ease forwards`,
        "@keyframes wIn": { from: { opacity: 0 }, to: { opacity: 1 } },
        "@keyframes wOut": { from: { opacity: 1 }, to: { opacity: 0 } },
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, background: `linear-gradient(140deg,#041610 0%,#0c3520 30%,#145e2e 65%,#1a7540 100%)` }} />
      <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
      <Box sx={{ position: "relative", textAlign: "center", px: { xs: 3, md: 6 }, maxWidth: 560 }}>
        <Typography sx={{ fontSize: { xs: "10px", md: "11px" }, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "3px", textTransform: "uppercase", mb: { xs: 3, md: 4 }, animation: "wUp 0.5s ease 0.2s both", "@keyframes wUp": { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "none" } } }}>
          Choose Your Therapist
        </Typography>
        <Typography sx={{ fontSize: { xs: "1rem", md: "1.2rem" }, fontWeight: 400, color: "rgba(255,255,255,0.45)", mb: 0.5, animation: "wUp 0.5s ease 0.5s both" }}>
          Welcome,
        </Typography>
        <Typography sx={{ fontSize: { xs: "3rem", md: "4.5rem" }, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: { xs: "-1.5px", md: "-3px" }, mb: { xs: 2, md: 2.5 }, animation: "wScale 0.65s cubic-bezier(.34,1.56,.64,1) 0.75s both", "@keyframes wScale": { from: { opacity: 0, transform: "scale(0.82)" }, to: { opacity: 1, transform: "scale(1)" } } }}>
          {name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: { xs: 4, md: 5 }, animation: "wUp 0.5s ease 1.25s both" }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#d4af37", boxShadow: "0 0 0 4px rgba(212,175,55,0.22)" }} />
          <Typography sx={{ fontSize: { xs: "13px", md: "14px" }, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
            Your dashboard is ready
          </Typography>
        </Box>
        <Box onClick={onDismiss} sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, background: "rgba(212,175,55,0.14)", border: "1.5px solid rgba(212,175,55,0.4)", borderRadius: "8px", px: { xs: 3.5, md: 5 }, py: { xs: 1.5, md: 1.8 }, cursor: "pointer", transition: "all .2s", animation: "wUp 0.5s ease 1.55s both", "&:hover": { background: "rgba(212,175,55,0.22)", transform: "scale(1.04)" } }}>
          <Typography sx={{ fontSize: { xs: "14px", md: "16px" }, fontWeight: 700, color: "#fff" }}>Enter Dashboard</Typography>
          <Typography sx={{ fontSize: { xs: "16px", md: "18px" }, color: "#d4af37" }}>→</Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════ */
export default function TherapistDashboard() {
  const [mounted, setMounted] = React.useState(false);
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [welcLeaving, setWelcLeaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastRefreshed, setLastRefreshed] = React.useState(null);
  const [clockTime, setClockTime] = React.useState(null);

  const [stats, setStats] = React.useState({
    totalEarnings: 0, monthEarnings: 0, upcoming: 0, totalClients: 0,
    todayClients: 0, todayRevenue: 0, pendingCount: 0, completedCount: 0,
    completionRate: 0, monthGrowth: null, monthGrowthUp: true,
  });
  const [weeklyData, setWeeklyData] = React.useState([]);
  const [monthlyData, setMonthlyData] = React.useState([]);
  const [upcomingSessions, setUpcomingSessions] = React.useState([]);
  const [nextSession, setNextSession] = React.useState(null);
  const [invoices, setInvoices] = React.useState([]);
  const [myReviews, setMyReviews] = React.useState([]);

  const { therapistInfo, paymentStore } = useTherapistStore();

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && !localStorage.getItem("cyt_th_welcomed")) setShowWelcome(true);
    setClockTime(new Date());
    const iv = setInterval(() => setClockTime(new Date()), 60000);
    return () => clearInterval(iv);
  }, []);

  const load = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [bookingsRes, workshopRes, dashRes, reviewsRes] = await Promise.allSettled([
        fetchById(getBookings),
        fetchById(GetMyWorkshopBooking),
        fetchById(GetDashboardDataUrl),
        fetchById(GetMyReviewsUrl),
      ]);
      const bookingsData = bookingsRes.status === "fulfilled" ? bookingsRes.value : {};
      const workshopData = workshopRes.status === "fulfilled" ? workshopRes.value : {};
      const dashResData = dashRes.status === "fulfilled" ? dashRes.value : {};
      const reviewsData = reviewsRes.status === "fulfilled" ? reviewsRes.value : {};

      setMyReviews(reviewsData?.status ? reviewsData.data || [] : []);
      const bookings = bookingsData?.status ? bookingsData.data || [] : [];
      const workshops = workshopData?.status ? workshopData.data || [] : [];
      const dashData = dashResData?.status ? dashResData.data || {} : {};

      const now = new Date();
      const todayStr = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).toDateString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const totalEarnings = getNum(dashData.revenue);
      const totalClients = Number(dashData.client) || 0;

      let monthEarnings = 0, lastMonthEarnings = 0, todayRevenue = 0;
      let completedCount = 0, pendingCount = 0;
      const todayClientIds = new Set();

      bookings.forEach((b) => {
        const bStatus = b.status || "New";
        const bd = safeDate(b.booking_date);
        const amt = getNum(b.amount || b.transaction?.amount);
        if (bd) {
          if (bd >= monthStart) monthEarnings += amt;
          else if (bd >= lastMonthStart) lastMonthEarnings += amt;
          if (bd.toDateString() === todayStr) {
            todayRevenue += amt;
            if (b.client?._id) todayClientIds.add(b.client._id.toString());
          }
        }
        if (bStatus === "Completed") completedCount++;
        else if (bStatus === "New" || bStatus === "Started") pendingCount++;
      });

      workshops.forEach((w) => {
        const amt = getNum(w.transaction?.amount || w.amount);
        const wd = safeDate(w.createdAt || w.created_at || w.date);
        if (wd) {
          if (wd >= monthStart) monthEarnings += amt;
          else if (wd >= lastMonthStart) lastMonthEarnings += amt;
          if (wd.toDateString() === todayStr) todayRevenue += amt;
        }
      });

      const totalBk = bookings.filter((b) => b.status !== "Cancelled").length;
      const completionRate = totalBk > 0 ? Math.round((completedCount / totalBk) * 100) : 0;

      const toMap = (b) => ({
        id: b._id,
        name: b.client?.name || "Unknown",
        date: b.booking_date,
        badge: b.format || b.mode || "Online",
        imgSrc: b.client?.photo || b.client?.profile,
      });

      const upcomingList = bookings
        .filter((b) => b.status !== "Completed" && b.status !== "Cancelled")
        .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
        .map(toMap);

      // weekly (last 7 days)
      const weekMap = {};
      DAY_NAMES.forEach((d) => (weekMap[d] = { name: d, sessions: 0, revenue: 0 }));
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      bookings.forEach((b) => {
        const d = safeDate(b.booking_date);
        if (d && d >= weekStart) {
          const k = DAY_NAMES[d.getDay()];
          weekMap[k].sessions++;
          weekMap[k].revenue += getNum(b.transaction?.amount || b.amount);
        }
      });
      const weeklyChart = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        return weekMap[DAY_NAMES[d.getDay()]];
      });

      // monthly (last 6 months)
      const monthlyMap = new Map();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyMap.set(`${d.getFullYear()}-${d.getMonth()}`, { name: MONTH_NAMES[d.getMonth()], sessions: 0, revenue: 0 });
      }
      bookings.forEach((b) => {
        const d = safeDate(b.booking_date);
        if (!d) return;
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthlyMap.has(key)) {
          const e = monthlyMap.get(key);
          e.sessions++;
          e.revenue += getNum(b.transaction?.amount || b.amount);
        }
      });

      const inv = bookings
        .filter((b) => b.transaction?.amount || b.amount)
        .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
        .slice(0, 6)
        .map((b) => ({
          id: b._id,
          invoice_id: b.transaction?.transaction_id?.slice(-8) || b._id?.slice(-8),
          client_name: b.client?.name || "Unknown",
          booking_date: fmtDate(b.booking_date),
          amount: b.transaction?.amount || b.amount,
          status: b.transaction?.status?.name || "Success",
        }));

      let monthGrowth = null;
      if (lastMonthEarnings > 0) {
        const pct = Math.round(((monthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100);
        monthGrowth = `${pct > 0 ? "+" : ""}${Math.abs(pct) > 999 ? (pct > 0 ? ">999" : "<-999") : pct}%`;
      }

      setStats({
        totalEarnings: Math.round(totalEarnings),
        monthEarnings: Math.round(monthEarnings),
        upcoming: upcomingList.length,
        totalClients,
        todayClients: todayClientIds.size,
        todayRevenue: Math.round(todayRevenue),
        pendingCount,
        completedCount,
        completionRate,
        monthGrowth,
        monthGrowthUp: monthEarnings >= lastMonthEarnings,
      });
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
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);
  React.useEffect(() => {
    const iv = setInterval(() => load(true), 60000);
    return () => clearInterval(iv);
  }, [load]);

  const dismissWelcome = React.useCallback(() => {
    setWelcLeaving(true);
    setTimeout(() => {
      try { localStorage.setItem("cyt_th_welcomed", "1"); } catch (e) {}
      setShowWelcome(false);
      setWelcLeaving(false);
    }, 500);
  }, []);
  React.useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(dismissWelcome, 4000);
    return () => clearTimeout(t);
  }, [showWelcome, dismissWelcome]);

  const profileChecks = React.useMemo(() => {
    const t = therapistInfo;
    return [
      { label: "Basic info", done: !!(t?.user?.name && t?.user?.phone) },
      { label: "Profile photo", done: !!t?.user?.profile },
      { label: "Availability set", done: (t?.availabilities?.length || 0) > 0 },
      { label: "Fee configured", done: t?.fees?.some((f) => f.formats?.some((fmt) => fmt.fee)) },
      { label: "Payment details", done: !!(paymentStore?.ac_number || paymentStore?.upi) },
    ];
  }, [therapistInfo, paymentStore]);
  const completionPct = Math.round((profileChecks.filter((c) => c.done).length / profileChecks.length) * 100);

  const firstName = therapistInfo?.user?.name?.split(" ")[0] || "Therapist";
  const todayLabel = clockTime
    ? clockTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })
    : "";
  const clockLabel = clockTime
    ? clockTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })
    : "";
  const avatarSrc = therapistInfo?.user?.profile ? `${imagePath}/${therapistInfo.user.profile}` : defaultProfile;

  const bannerChips = [
    therapistInfo?.qualification && { icon: "feather-award", text: toStr(therapistInfo.qualification) },
    therapistInfo?.year_of_exp && { icon: "feather-briefcase", text: `${toStr(therapistInfo.year_of_exp)} yrs exp` },
    therapistInfo?.state && { icon: "feather-map-pin", text: toStr(therapistInfo.state) },
    { icon: "feather-check-circle", text: `${stats.completedCount} sessions done` },
  ].filter(Boolean);

  const statCards = [
    { icon: AccountBalanceWalletRoundedIcon, label: "Total Earnings", value: stats.totalEarnings, isCurrency: true, accent: "#166534", accentBg: "#f0fdf4" },
    { icon: TrendingUpRoundedIcon, label: "This Month", value: stats.monthEarnings, isCurrency: true, accent: "#0f766e", accentBg: "#f0fdfa", trend: stats.monthGrowth, trendUp: stats.monthGrowthUp },
    { icon: EventRepeatRoundedIcon, label: "Upcoming", value: stats.upcoming, accent: "#15803d", accentBg: "#f0fdf4" },
    { icon: GroupsRoundedIcon, label: "Total Clients", value: stats.totalClients, accent: "#b8860b", accentBg: "#fffbeb" },
    { icon: PaymentsRoundedIcon, label: "Today's Revenue", value: stats.todayRevenue, isCurrency: true, accent: "#059669", accentBg: "#ecfdf5" },
    { icon: TaskAltRoundedIcon, label: "Sessions Done", value: stats.completedCount, accent: "#166534", accentBg: "#f0fdf4", trend: stats.completionRate > 0 ? `${stats.completionRate}%` : undefined, trendUp: true },
  ];

  return (
    <MainLayout>
      {showWelcome && <WelcomeOverlay name={firstName} leaving={welcLeaving} onDismiss={dismissWelcome} />}

      <Box sx={{ pb: 6 }}>
        {/* ══ LETTERHEAD ═══════════════════════════════════════ */}
        <Box
          sx={{
            background: "#fff",
            border: UI.cardBorder,
            borderRadius: `${UI.cardRadius}px`,
            mb: { xs: 2, md: 3 },
            overflow: "hidden",
            boxShadow: UI.cardShadow,
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg,${UI.green.d900},${UI.green.d800})`,
              borderBottom: "3px solid #d4af37",
              position: "relative",
              p: { xs: "18px 16px", md: "22px 24px 20px" },
            }}
          >
            <Box sx={{ position: "absolute", top: -40, right: -20, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

            {/* clock — hidden on xs to avoid crowding */}
            <Box sx={{ position: "absolute", top: 14, right: 20, textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap" }}>{todayLabel}</Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{clockLabel}</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2 }, flexWrap: "wrap" }}>
              <Box sx={{ position: "relative", width: { xs: 54, md: 64 }, height: { xs: 54, md: 64 }, flexShrink: 0 }}>
                <Box
                  component="img"
                  src={avatarSrc}
                  alt={firstName}
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultProfile; }}
                  sx={{ width: "100%", height: "100%", borderRadius: "8px", objectFit: "cover", border: "3px solid rgba(212,175,55,0.65)", display: "block" }}
                />
                <Box sx={{ position: "absolute", bottom: -2, right: -2, width: 13, height: 13, borderRadius: "50%", background: UI.green.light, border: `2.5px solid ${UI.green.d900}` }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: { xs: 16, md: 19 }, fontWeight: 800, color: "#fff", lineHeight: 1.2, mb: 0.4 }}>
                  {therapistInfo?.user?.name || firstName}
                </Typography>
                <Typography sx={{ fontSize: { xs: 10.5, md: 12 }, fontWeight: 600, color: "rgba(255,255,255,0.78)", textTransform: "uppercase", letterSpacing: "0.4px", mb: 1 }}>
                  {therapistInfo?.profile_type || "Therapist"} · Choose Your Therapist
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px 14px" }}>
                  {bannerChips.map((chip, i) => (
                    <Box key={i} component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 11, color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>
                      <i className={chip.icon} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }} />
                      {chip.text}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 1.75, pt: 1.25, borderTop: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {refreshing ? (
                  <CircularProgress size={11} sx={{ color: "rgba(255,255,255,0.6)" }} />
                ) : (
                  <RefreshRoundedIcon
                    onClick={() => load(true)}
                    sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)", cursor: "pointer", "&:hover": { color: "#fff" } }}
                  />
                )}
                <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                  {lastRefreshed ? `Updated ${lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}` : "Loading…"}
                </Typography>
              </Box>
              {therapistInfo?._id && (
                <Link href={`/view-profile/${therapistInfo._id}`} target="_blank" style={{ textDecoration: "none" }}>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, fontSize: 11.5, fontWeight: 800, color: "#d4af37" }}>
                    View Public Profile
                    <OpenInNewRoundedIcon sx={{ fontSize: 12 }} />
                  </Box>
                </Link>
              )}
            </Box>
          </Box>
        </Box>

        {/* ══ KPI ROW ══════════════════════════════════════════ */}
        <Box
          sx={{
            display: "grid",
            gap: { xs: 1, sm: 1.25, md: 1.5 },
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              lg: "repeat(6, 1fr)",
            },
            mb: { xs: 1.5, md: 2 },
          }}
        >
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} loading={loading} />
          ))}
        </Box>

        {/* ══ MAIN GRID ════════════════════════════════════════ */}
        <Box
          sx={{
            display: "grid",
            gap: { xs: 1.5, md: 2 },
            alignItems: "start",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1fr) 320px",
              lg: "minmax(0, 1fr) 372px",
            },
          }}
        >
          {/* ── main column ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2 }, minWidth: 0 }}>
            {!loading && <NextSessionStrip session={nextSession} />}

            <DashCard icon={InsightsRoundedIcon} title="Performance" sub="Revenue & sessions trend" disablePad>
              {mounted ? (
                <PerformanceChart weeklyData={weeklyData} monthlyData={monthlyData} />
              ) : (
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="rounded" height={220} />
                </Box>
              )}
            </DashCard>

            <DashCard
              icon={EventAvailableRoundedIcon}
              title="Upcoming Sessions"
              sub={`${upcomingSessions.length} scheduled`}
              action={<CardLink href="/appointments" />}
              disablePad
            >
              {loading ? (
                <Box sx={{ p: 2 }}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "center", py: 1 }}>
                      <Skeleton variant="circular" width={36} height={36} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="45%" />
                        <Skeleton width="30%" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : upcomingSessions.length ? (
                upcomingSessions.slice(0, 6).map((s, i, arr) => (
                  <SessionRow key={s.id} s={s} last={i === arr.length - 1} />
                ))
              ) : (
                <EmptyState icon={EventAvailableRoundedIcon} text="No upcoming sessions" />
              )}
            </DashCard>
          </Box>

          {/* ── side column ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2 }, minWidth: 0 }}>
            <DashCard icon={WorkspacePremiumRoundedIcon} title="Profile Strength" sub={completionPct < 100 ? "Finish to rank higher" : "All set"}>
              <ProfileStrength pct={completionPct} checks={profileChecks} />
            </DashCard>

            <DashCard
              icon={StarRateRoundedIcon}
              title="Client Reviews"
              action={myReviews.length > 3 ? <CardLink href="/therapists/reviews" /> : null}
            >
              <ReviewsBlock reviews={myReviews} />
            </DashCard>

            <DashCard
              icon={PaymentsRoundedIcon}
              title="Recent Invoices"
              sub={`${invoices.length} shown`}
              action={<CardLink href="/therapists/invoices" />}
              disablePad
            >
              {loading ? (
                <Box sx={{ p: 2 }}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={38} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : invoices.length ? (
                invoices.map((inv, i, arr) => (
                  <Box
                    key={inv.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: { xs: 1.75, md: 2.25 },
                      py: 1.35,
                      borderBottom: i === arr.length - 1 ? "none" : `1px solid ${UI.line}`,
                    }}
                  >
                    <Avatar sx={{ width: 34, height: 34, borderRadius: "9px", background: UI.green.bg, color: UI.green.main, fontSize: "13px", fontWeight: 800, flexShrink: 0 }}>
                      {inv.client_name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: UI.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {inv.client_name}
                      </Typography>
                      <Typography sx={{ fontSize: "10px", color: UI.faint, fontWeight: 600 }}>
                        #{inv.invoice_id} · {inv.booking_date}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 800, color: UI.text, flexShrink: 0 }}>
                      {inr(inv.amount)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <EmptyState icon={PaymentsRoundedIcon} text="No invoices yet" />
              )}
            </DashCard>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
}

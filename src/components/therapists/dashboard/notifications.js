import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@mui/material";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { fetchById } from "../../../utils/actions";
import { getBookings, GetMyReviewsUrl } from "../../../utils/url";
import useTherapistStore from "../../../store/therapistStore";

/**
 * Therapist notifications — built live from the therapist's own bookings,
 * payments, sessions and reviews (there is no separate notifications table).
 * "Read" is a per-device timestamp in localStorage.
 */
const SEEN_KEY = "cyt_th_notif_seen_at";
const GOLD = "#f2c94c";
const PAGE = 30;

const TYPES = {
  booking:   { label: "Bookings", icon: EventAvailableRoundedIcon, fg: "#1d4ed8", bg: "#eff6ff" },
  payment:   { label: "Payments", icon: PaymentsRoundedIcon,      fg: "#166534", bg: "#e7f6ec" },
  session:   { label: "Sessions", icon: TaskAltRoundedIcon,        fg: "#0f766e", bg: "#e6f6f4" },
  started:   { label: "Sessions", icon: PlayCircleRoundedIcon,     fg: "#0f766e", bg: "#e6f6f4" },
  cancelled: { label: "Bookings", icon: EventBusyRoundedIcon,      fg: "#b91c1c", bg: "#fef2f2" },
  review:    { label: "Reviews",  icon: StarRateRoundedIcon,       fg: "#b45309", bg: "#fffbeb" },
};
const FILTERS = [
  { key: "all", label: "All" },
  { key: "Bookings", label: "Bookings" },
  { key: "Payments", label: "Payments" },
  { key: "Sessions", label: "Sessions" },
  { key: "Reviews", label: "Reviews" },
];

const safe = (d) => { const t = d ? new Date(d) : null; return t && !isNaN(t.getTime()) ? t : null; };
// Bookings have no createdAt; a Mongo ObjectId carries its creation second.
const idTime = (id) => (typeof id === "string" && /^[a-f0-9]{24}$/i.test(id) ? new Date(parseInt(id.slice(0, 8), 16) * 1000) : null);
const num = (v) => { const n = parseFloat(v?.$numberDecimal ?? v); return Number.isFinite(n) ? n : 0; };
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const fmtWhen = (d) => d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
const istDay = (d) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

function ago(d, now) {
  const s = Math.max(0, Math.round((now - d) / 1000));
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

function buildFeed(bookings, reviews) {
  const items = [];
  for (const b of bookings) {
    const who = b.client?.name || b.cname || "A client";
    const when = safe(b.booking_date);
    const whenTxt = when ? fmtWhen(when) : "";
    const svc = b.service || "a session";
    const created = idTime(b._id);
    const tx = b.transaction || {};
    const paidAt = safe(tx.createdAt);
    const amt = num(tx.amount ?? b.amount);

    if (created) items.push({ id: `bk-${b._id}`, type: "booking", at: created, href: "/appointments",
      title: <><b>{who}</b> booked {svc}</>, sub: `${whenTxt}${b.format ? ` · ${b.format}` : ""}${!paidAt && amt ? ` · ${inr(amt)}` : ""}` });
    if (paidAt && /success|paid|completed/i.test(tx.status?.name || "")) items.push({ id: `pay-${b._id}`, type: "payment", at: paidAt, href: "/therapists/invoices",
      title: <>Payment of <b>{inr(amt)}</b> received from <b>{who}</b></>, sub: `${tx.payment_method ? `${tx.payment_method} · ` : ""}for session on ${whenTxt}` });
    const started = safe(b.session_started_at);
    if (started && b.status !== "Completed") items.push({ id: `st-${b._id}`, type: "started", at: started, href: "/appointments",
      title: <>Session with <b>{who}</b> started</>, sub: svc });
    const done = safe(b.session_completed_at);
    if (done) items.push({ id: `dn-${b._id}`, type: "session", at: done, href: "/case-history",
      title: <>Session with <b>{who}</b> completed</>, sub: "Add session notes while it's fresh" });
    if (/cancel/i.test(b.status || "") && created) items.push({ id: `cx-${b._id}`, type: "cancelled", at: created, href: "/appointments",
      title: <>Booking by <b>{who}</b> was cancelled</>, sub: whenTxt });
  }
  for (const r of reviews) {
    const at = safe(r.createdAt) || idTime(r._id);
    if (!at) continue;
    items.push({ id: `rv-${r._id}`, type: "review", at, href: "/therapists/reviews",
      title: <><b>{r.name || "A client"}</b> left a {r.rating}★ review</>, sub: r.description ? `“${String(r.description).slice(0, 90)}${String(r.description).length > 90 ? "…" : ""}”` : "" });
  }
  return items.sort((a, b) => b.at - a.at);
}

const styles = `
  .nt-hero{position:relative;overflow:hidden;border-radius:16px;color:#fff;padding:22px 24px;margin-bottom:16px;
    background:radial-gradient(120% 140% at 100% 0%,rgba(74,222,128,.22) 0%,transparent 55%),linear-gradient(135deg,#0f3d24 0%,#134e2b 55%,#17663a 100%);box-shadow:0 18px 40px -22px rgba(15,61,36,.55);}
  .nt-hero:after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,transparent,${GOLD},transparent);opacity:.55;}
  .nt-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
  .nt-ic{width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;color:${GOLD};flex-shrink:0;}
  .nt-h1{font-size:24px;font-weight:800;line-height:1.2;margin:0;color:#fff!important;}
  .nt-sub{font-size:13px;color:rgba(255,255,255,.7);font-weight:600;margin-top:2px;}
  .nt-hbtns{margin-left:auto;display:flex;gap:8px;}
  .nt-hbtn{display:inline-flex;align-items:center;gap:6px;height:36px;border-radius:10px;padding:0 13px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.09);color:#fff;}
  .nt-hbtn.primary{background:#fff;color:#0f3d24;border-color:#fff;}
  .nt-hbtn:disabled{opacity:.5;cursor:default;}
  .nt-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:18px;}
  .nt-stat{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:10px 14px;}
  .nt-stat small{display:block;font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:rgba(255,255,255,.55);}
  .nt-stat b{font-size:18px;font-weight:800;}

  .nt-action{display:flex;align-items:center;gap:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px 14px;margin-bottom:12px;color:#78350f;text-decoration:none;}
  .nt-action:hover{border-color:#f59e0b;color:#78350f;}
  .nt-action b{display:block;font-size:13.5px;}
  .nt-action span{font-size:12px;}

  .nt-up{background:#fff;border:1px solid #e4ece7;border-radius:12px;padding:12px 14px;margin-bottom:12px;}
  .nt-up-h{font-size:10.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#8a978f;margin-bottom:8px;}
  .nt-up-row{display:flex;align-items:center;gap:10px;padding:6px 0;color:#14251b;text-decoration:none;font-size:13px;}
  .nt-up-row:hover{color:#166534;}
  .nt-up-time{margin-left:auto;font-weight:800;color:#166534;font-size:12.5px;white-space:nowrap;}

  .nt-tabs{display:flex;gap:4px;background:#f1f5f3;border-radius:10px;padding:3px;margin-bottom:12px;overflow-x:auto;scrollbar-width:none;width:fit-content;max-width:100%;}
  .nt-tabs::-webkit-scrollbar{display:none;}
  .nt-tab{border:0;background:none;border-radius:8px;padding:7px 14px;font-size:12.5px;font-weight:700;color:#5b6b62;cursor:pointer;white-space:nowrap;font-family:inherit;}
  .nt-tab.on{background:#fff;color:#0f3d24;box-shadow:0 1px 3px rgba(15,23,42,.12);}
  .nt-tab i{font-style:normal;margin-left:6px;font-size:11px;background:#e2e8e4;border-radius:999px;padding:1px 7px;}
  .nt-tab.on i{background:#e7f6ec;color:#166534;}

  .nt-card{background:#fff;border:1px solid #e4ece7;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,.04),0 10px 26px rgba(15,23,42,.05);}
  .nt-grp{font-size:10.5px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:#8a978f;padding:12px 16px 6px;background:#fafcfb;border-bottom:1px solid #f0f3f1;}
  .nt-item{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border-bottom:1px solid #f0f3f1;text-decoration:none;color:#14251b;transition:background .12s;position:relative;}
  .nt-item:last-child{border-bottom:0;}
  .nt-item:hover{background:#f8fbf9;color:#14251b;}
  .nt-item.unread{background:#f6fbf8;}
  .nt-item.unread:before{content:"";position:absolute;left:0;top:10px;bottom:10px;width:3px;border-radius:0 3px 3px 0;background:#22c55e;}
  .nt-dot{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .nt-dot svg{font-size:20px;}
  .nt-main{flex:1;min-width:0;}
  .nt-title{font-size:13.5px;line-height:1.45;}
  .nt-title b{font-weight:800;}
  .nt-meta{font-size:12px;color:#6b7a71;margin-top:2px;overflow:hidden;text-overflow:ellipsis;}
  .nt-ago{font-size:11.5px;color:#8a978f;font-weight:600;white-space:nowrap;margin-left:8px;}
  .nt-new{display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-left:6px;vertical-align:middle;}
  .nt-more{display:block;width:100%;border:0;border-top:1px solid #f0f3f1;background:#fafcfb;padding:12px;font-size:13px;font-weight:800;color:#166534;cursor:pointer;font-family:inherit;}
  .nt-empty{padding:48px 20px;text-align:center;color:#5b6b62;}
  .nt-empty h3{font-size:16px;font-weight:800;color:#0f172a;margin:10px 0 4px;}
  @media (max-width:600px){
    .nt-hero{padding:16px;} .nt-h1{font-size:20px;} .nt-hbtns{margin-left:0;width:100%;} .nt-hbtn{flex:1;justify-content:center;}
    .nt-stat{padding:8px 10px;} .nt-stat b{font-size:16px;} .nt-item{padding:12px;} .nt-ago{display:none;}
  }
`;

export default function Notification() {
  const { therapistInfo } = useTherapistStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(PAGE);
  const [seenAt, setSeenAt] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async (isRefresh) => {
    if (isRefresh) setRefreshing(true);
    const [bRes, rRes] = await Promise.allSettled([fetchById(getBookings), fetchById(GetMyReviewsUrl)]);
    setBookings(bRes.status === "fulfilled" && bRes.value?.status ? bRes.value.data || [] : []);
    setReviews(rRes.status === "fulfilled" && rRes.value?.status ? rRes.value.data || [] : []);
    setNow(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    try { setSeenAt(Number(localStorage.getItem(SEEN_KEY)) || 0); } catch (e) {}
    load(false);
    const iv = setInterval(() => { if (!document.hidden) load(true); }, 60000);
    return () => clearInterval(iv);
  }, [load]);

  const feed = useMemo(() => buildFeed(bookings, reviews), [bookings, reviews]);
  const counts = useMemo(() => {
    const c = { all: feed.length };
    feed.forEach((i) => { const k = TYPES[i.type].label; c[k] = (c[k] || 0) + 1; });
    return c;
  }, [feed]);
  const shown = filter === "all" ? feed : feed.filter((i) => TYPES[i.type].label === filter);
  const unread = feed.filter((i) => i.at.getTime() > seenAt).length;
  const today = istDay(now);
  const todayCount = feed.filter((i) => istDay(i.at) === today).length;
  const weekCount = feed.filter((i) => now - i.at < 7 * 864e5).length;

  // Sessions in the next 24h — a "coming up" strip above the feed.
  const upcoming = useMemo(() => bookings
    .filter((b) => !/completed|cancel/i.test(b.status || ""))
    .map((b) => ({ b, at: safe(b.booking_date) }))
    .filter(({ at }) => at && at - now > -60 * 60 * 1000 && at - now < 864e5)
    .sort((x, y) => x.at - y.at), [bookings, now]);

  const noAvailability = therapistInfo && (therapistInfo.availabilities?.length || 0) === 0;

  const markAllRead = () => {
    const t = Date.now();
    try { localStorage.setItem(SEEN_KEY, String(t)); } catch (e) {}
    setSeenAt(t);
  };

  const groups = [];
  shown.slice(0, limit).forEach((i) => {
    const d = istDay(i.at);
    const yest = istDay(new Date(now.getTime() - 864e5));
    const label = d === today ? "Today" : d === yest ? "Yesterday" : now - i.at < 7 * 864e5 ? "This week" : "Earlier";
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(i); else groups.push({ label, items: [i] });
  });

  return (
    <div style={{ paddingBottom: 40 }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="nt-hero">
        <div className="nt-top">
          <div className="nt-ic"><NotificationsActiveRoundedIcon /></div>
          <div>
            <h1 className="nt-h1">Notifications</h1>
            <div className="nt-sub">Bookings, payments, sessions and reviews — updated live</div>
          </div>
          <div className="nt-hbtns">
            <button type="button" className="nt-hbtn" onClick={() => load(true)} disabled={refreshing}>
              <RefreshRoundedIcon sx={{ fontSize: 17 }} /> {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button type="button" className="nt-hbtn primary" onClick={markAllRead} disabled={!unread}>
              <DoneAllRoundedIcon sx={{ fontSize: 17 }} /> Mark all read
            </button>
          </div>
        </div>
        <div className="nt-stats">
          <div className="nt-stat"><small>Unread</small><b>{loading ? "—" : unread}</b></div>
          <div className="nt-stat"><small>Today</small><b>{loading ? "—" : todayCount}</b></div>
          <div className="nt-stat"><small>This week</small><b>{loading ? "—" : weekCount}</b></div>
        </div>
      </section>

      {noAvailability && (
        <Link href="/my-schedule?tab=availability" className="nt-action">
          <WarningAmberRoundedIcon />
          <div style={{ flex: 1 }}><b>Your availability isn't set</b><span>Clients can't book you until you add your weekly slots.</span></div>
          <ChevronRightRoundedIcon />
        </Link>
      )}

      {!loading && upcoming.length > 0 && (
        <div className="nt-up">
          <div className="nt-up-h">Coming up in the next 24 hours</div>
          {upcoming.slice(0, 4).map(({ b, at }) => (
            <Link key={b._id} href="/appointments" className="nt-up-row">
              <ScheduleRoundedIcon sx={{ fontSize: 18, color: "#166534" }} />
              <span><b>{b.client?.name || "Client"}</b> · {b.service || "Session"} · {b.format || "Online"}</span>
              <span className="nt-up-time">{at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="nt-tabs" role="tablist" aria-label="Filter notifications">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} className={`nt-tab${filter === f.key ? " on" : ""}`} onClick={() => { setFilter(f.key); setLimit(PAGE); }}>
            {f.label}{!loading && <i>{counts[f.key] || 0}</i>}
          </button>
        ))}
      </div>

      <div className="nt-card">
        {loading ? (
          <div style={{ padding: 16, display: "grid", gap: 16 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Skeleton variant="rounded" width={38} height={38} />
                <div style={{ flex: 1 }}><Skeleton width="60%" /><Skeleton width="35%" /></div>
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="nt-empty">
            <NotificationsActiveRoundedIcon sx={{ fontSize: 40, color: "#166534" }} />
            <h3>{feed.length ? "Nothing here" : "No notifications yet"}</h3>
            <p style={{ margin: 0, fontSize: 13 }}>{feed.length ? "Try another filter." : "New bookings, payments and reviews will show up here."}</p>
          </div>
        ) : (
          <>
            {groups.map((g) => (
              <div key={g.label}>
                <div className="nt-grp">{g.label}</div>
                {g.items.map((i) => {
                  const t = TYPES[i.type];
                  const Icon = t.icon;
                  const isNew = i.at.getTime() > seenAt;
                  return (
                    <Link key={i.id} href={i.href} className={`nt-item${isNew ? " unread" : ""}`}>
                      <div className="nt-dot" style={{ background: t.bg, color: t.fg }}><Icon /></div>
                      <div className="nt-main">
                        <div className="nt-title">{i.title}{isNew && <span className="nt-new" aria-label="unread" />}</div>
                        {i.sub && <div className="nt-meta">{i.sub}</div>}
                      </div>
                      <span className="nt-ago">{ago(i.at, now)}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
            {shown.length > limit && (
              <button type="button" className="nt-more" onClick={() => setLimit((l) => l + PAGE)}>
                Show more ({shown.length - limit} older)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

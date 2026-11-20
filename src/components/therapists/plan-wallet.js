import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import { fetchById, postData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import PvcCard, { cardNo } from "../global/pvc-card";

/* Therapist wallet (2026-11-20): the listing package they hold with CYT — how many days are left (counting down),
   what they paid, a warning when CYT gave it free (it can be switched off any time), Add / renew from the
   package options only, and a box to send a subscription concern to the CYT team (admin → Therapist comms).
   Data: GET /therapist/my-plans (shared, cached for a minute). */

let cache = { at: 0, data: null, p: null };
export const loadPlans = (force) => {
  if (!force && cache.data && Date.now() - cache.at < 60000) return Promise.resolve(cache.data);
  if (!cache.p || force) {
    cache.p = fetchById(`${apiUrl}/therapist/my-plans`)
      .then((r) => { cache = { at: Date.now(), data: r?.status ? r.data : null, p: null }; return cache.data; })
      .catch(() => { cache.p = null; return cache.data; });
  }
  return cache.p;
};
export function usePlans() {
  const [d, setD] = useState(cache.data);
  useEffect(() => { let alive = true; loadPlans(false).then((x) => alive && setD(x)); return () => { alive = false; }; }, []);
  return d;
}

const TERM_DAYS = { "1_month": 30, "3_month": 90, "6_month": 180, annual: 365 };
const day = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const termOf = (L) => {
  if (L?.from && L?.till) return Math.max(1, Math.round((new Date(L.till) - new Date(L.from)) / 864e5));
  return TERM_DAYS[L?.plan] || 30;
};

// top bar: "💳 214d" — opens the wallet on the Subscriptions page
export function PlanChip() {
  const d = usePlans();
  const L = d?.listing;
  if (!L) return null;
  const soon = L.active && L.daysLeft <= 15;
  return (
    <Link href="/my-plans#wallet" className={`tn-wallet${!L.active ? " off" : soon ? " soon" : ""}`} title="My wallet — subscription" aria-label={L.active ? `Subscription: ${L.daysLeft} days left` : "No active subscription"}>
      <AccountBalanceWalletRoundedIcon /><b>{L.active ? `${L.daysLeft}d` : "Renew"}</b>
    </Link>
  );
}

// the wallet card at the top of /my-plans
export function PlanWallet({ data, onRenew, me = null }) {
  const L = data?.listing;
  const [handle, setHandle] = useState("");
  const tid = me?._id || "";
  useEffect(() => {
    if (!tid) return;
    fetch(`/api/my-link?id=${tid}`).then((r) => r.json()).then((j) => { if (j?.status && j.data?.handle) setHandle(j.data.handle); }).catch(() => {});
  }, [tid]);
  const since = (() => { const d = data?.totals?.since || L?.from; return d ? String(new Date(d).getFullYear()) : ""; })();
  if (!L) return null;
  const free = L.plan === "free";
  const total = termOf(L);
  const used = L.active ? Math.max(0, Math.min(100, Math.round(((total - L.daysLeft) / total) * 100))) : 100;
  return (
    <section id="wallet" className={`pw${L.active ? "" : " off"}${free ? " free" : ""}`} aria-label="Wallet">
      <style>{PW_CSS}</style>
      <PvcCard label="CYT Pro" kind="Pro member" kindSub="✓ Verified Therapist" number={cardNo(me?._id || me?.user?._id)}
        name={me?.user?.name || ""} sub={me?.profile_type || ""} thruLabel="Member since" thru={since}
        back={{ qr: handle ? `/api/my-qr/${handle}.png` : "", link: handle ? `https://www.chooseyourtherapist.in/t/${handle}` : "", memberId: `CYT-PRO-${cardNo(me?._id || me?.user?._id).slice(-4)}` }} />
      <div className="pw-panel">
        {L.active ? (
          <>
            <p className="pw-sub">{free ? "Free plan given by CYT" : `${L.planLabel || "Plan"}${L.amount ? ` · ${inr(L.amount)} paid` : ""}`} · valid till {day(L.till)}</p>
            <div className="pw-bar" aria-label={`${used}% of the plan used`}><i style={{ width: `${used}%` }} /></div>
            <div className="pw-ends"><span>Started {day(L.from)}</span><span>{L.daysLeft <= 15 ? "Ending soon" : `${100 - used}% left`}</span></div>
          </>
        ) : (
          <p className="pw-sub">{L.till ? `Your ${L.planLabel || "plan"} ended on ${day(L.till)}` : "You don't have a package yet"}</p>
        )}
        {free && L.active && (
          <p className="pw-warn" role="note">⚠️ This free plan was activated by the CYT team. <b>It can be turned off at any time</b> — take a paid package to keep your profile live for sure.</p>
        )}
        <button type="button" className="pw-btn" onClick={onRenew}>{L.active && !free ? "Add more time" : "Choose a package"}</button>
        <small className="pw-fine">Pick from the CYT packages — time you add starts after your current plan ends.</small>
      </div>
    </section>
  );
}

// a concern about the subscription → admin (Therapist comms → Help)
export function PlanConcern() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const [past, setPast] = useState([]);
  const load = () => fetchById(`${apiUrl}/therapist-comms/feedback`).then((r) => setPast((r?.data || []).filter((x) => x.kind === "subscription").slice(0, 5))).catch(() => {});
  useEffect(() => { load(); }, []);
  const send = async () => {
    setBusy(true); setNote(null);
    try {
      const r = await postData(`${apiUrl}/therapist-comms/feedback`, { kind: "subscription", message: msg.trim(), page: "/my-plans" });
      if (r?.status) { setMsg(""); setNote({ ok: true, t: "Sent — the CYT team will get back to you here." }); load(); }
      else setNote({ ok: false, t: r?.message || "Couldn't send — try again." });
    } catch (e) { setNote({ ok: false, t: e?.response?.data?.message || "Couldn't send — try again." }); }
    setBusy(false);
  };
  return (
    <section className="pt-card pw-concern">
      <style>{PW_CSS}</style>
      <h2>A concern about your subscription?</h2>
      <p>Payment didn&apos;t show up, wrong dates, want to change your plan — tell us and the CYT team will reply here.</p>
      <textarea rows={3} maxLength={3000} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Write your concern…" />
      <div className="pw-c-row">
        {note && <span className={note.ok ? "ok" : "err"}>{note.t}</span>}
        <button type="button" className="pw-btn sm" disabled={busy || msg.trim().length < 5} onClick={send}>{busy ? "Sending…" : "Send to CYT"}</button>
      </div>
      {past.length > 0 && (
        <ul className="pw-past">
          {past.map((x) => (
            <li key={x._id}>
              <div><b>{x.message.length > 120 ? `${x.message.slice(0, 120)}…` : x.message}</b><small>{day(x.createdAt)}</small></div>
              <span className={`pw-st ${x.status}`}>{x.status === "resolved" ? "Resolved" : "Open"}</span>
              {x.reply && <p className="pw-reply"><b>CYT:</b> {x.reply}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const PW_CSS = `
.pw { margin-bottom: 16px; display: grid; grid-template-columns: minmax(0, 440px) minmax(0, 1fr); gap: 16px; align-items: center; }
.pw .pvc { margin: 0; }
.pw-panel { background: #fff; border-radius: 22px; padding: 18px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
.pw-sub { margin: 0 0 12px; font-size: 14.5px; color: #334155; font-weight: 600; }
.pw-bar { height: 8px; border-radius: 999px; background: #e8eeeb; overflow: hidden; }
.pw-bar i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #0f766e, #d4a24c); }
.pw.free .pw-bar i { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.pw-ends { display: flex; justify-content: space-between; margin-top: 6px; font-size: 12.5px; color: #64748b; }
.pw-warn { margin: 14px 0 0; padding: 10px 12px; border-radius: 14px; background: #fff1e0; color: #7c3d06; font-size: 13.5px; line-height: 1.5; }
.pw-btn { margin-top: 14px; height: 46px; padding: 0 22px; border: 0; border-radius: 14px; background: #0f5132; color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; }
.pw-btn:hover { background: #0b4f4a; }
.pw.free .pw-btn, .pw.off .pw-btn { background: #d4a24c; color: #3b2604; }
.pw-btn.sm { margin-top: 0; height: 42px; background: #14532d; color: #fff; }
.pw-btn:disabled { opacity: .55; cursor: default; }
.pw-fine { display: block; margin-top: 8px; font-size: 12px; color: #94a3b8; }
@media (max-width: 860px) { .pw { grid-template-columns: minmax(0, 1fr); } .pw .pvc { display: flex; justify-content: center; } }
.pw-concern h2 { margin: 0 0 4px; font-size: 18px; font-weight: 800; }
.pw-concern > p { margin: 0 0 12px; font-size: 14px; color: #64748b; }
.pw-concern textarea { width: 100%; box-sizing: border-box; border: 1px solid #dfe7e4; border-radius: 14px; padding: 12px; font: inherit; font-size: 15px; resize: vertical; background: #fbfdfc; }
.pw-concern textarea:focus { outline: none; border-color: #15803d; box-shadow: 0 0 0 3px rgba(21,128,61,.12); }
.pw-c-row { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 10px; flex-wrap: wrap; }
.pw-c-row .ok { color: #15803d; font-size: 13.5px; font-weight: 700; } .pw-c-row .err { color: #b42318; font-size: 13.5px; font-weight: 700; }
.pw-past { list-style: none; margin: 14px 0 0; padding: 0; }
.pw-past li { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px 12px; padding: 12px 0; border-top: 1px solid #eef2f0; }
.pw-past li > div { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pw-past b { font-size: 14px; font-weight: 600; color: #1c1c1e; } .pw-past small { font-size: 12px; color: #94a3b8; }
.pw-st { flex: none; font-size: 11.5px; font-weight: 800; padding: 3px 9px; border-radius: 999px; background: #fff1e0; color: #b45309; }
.pw-st.resolved { background: #e3f4e9; color: #15803d; }
.pw-reply { width: 100%; margin: 0; padding: 10px 12px; border-radius: 12px; background: #f3f7f5; font-size: 13.5px; color: #334155; }
`;

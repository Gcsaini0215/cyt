import React from "react";
import Link from "next/link";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ClientShell from "../../components/client/client-shell";
import { useWallet, inr, hasWallet } from "../../components/client/wallet";
import { bookPath } from "../../utils/therapist-slug";
import { imagePath } from "../../utils/url";
import PvcCard, { cardNo } from "../../components/global/pvc-card";
import useUserStore from "../../store/userStore";

/* Client → Wallet (2026-11-20): the balance of the session packs they bought, what each completed session took,
   sessions booked from a pack (still in the balance until done), expired packs and CYT Noida clinic packages. */

const TZ = "Asia/Kolkata";
const day = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TZ }) : "");
const photoOf = (p) => (!p || /pngegg|default/i.test(p) ? "" : /^(https?:|data:)/.test(p) ? p : `${imagePath}/${p}`);

function Pack({ p }) {
  const seg = (n, cls) => Array.from({ length: n }, (_, i) => <i key={cls + i} className={cls} />);
  const photo = photoOf(p.therapist.photo);
  return (
    <article className={`wl-pack${p.expired ? " exp" : ""}`}>
      <div className="wl-pack-h">
        <span className="wl-av">{photo ? <img src={photo} alt="" /> : (p.therapist.name || "T").slice(0, 1)}</span>
        <div>
          <b>{p.therapist.name}</b>
          <small>{p.size}-session pack{p.discount_pct ? ` · ${p.discount_pct}% off` : ""}{p.service ? ` · ${p.service}` : ""}</small>
        </div>
        <span className="wl-pack-bal"><b>{inr(p.balance)}</b><small>of {inr(p.total)}</small></span>
      </div>
      <div className="wl-seg" aria-label={`${p.completed} done, ${p.booked} booked, ${p.unbooked} to book`}>
        {seg(p.completed, "done")}{seg(p.booked, "booked")}{seg(Math.max(0, p.size - p.completed - p.booked), "left")}
      </div>
      <div className="wl-pack-f">
        <span><i className="done" /> {p.completed} done</span>
        <span><i className="booked" /> {p.booked} booked</span>
        <span><i className="left" /> {p.unbooked} to book</span>
        <em>{p.expired ? `Expired ${day(p.expires_at)}` : `Valid till ${day(p.expires_at)}`}</em>
      </div>
      {!p.expired && p.unbooked > 0 && <Link href={bookPath(p.therapist)} className="wl-btn">Book your next session</Link>}
    </article>
  );
}

export default function WalletPage() {
  const w = useWallet();
  const { userInfo } = useUserStore();
  const active = (w?.packs || []).filter((p) => !p.expired);
  const lastValid = active.map((p) => p.expires_at).sort().pop();
  const thru = lastValid ? new Date(lastValid).toLocaleDateString("en-IN", { month: "2-digit", year: "2-digit", timeZone: TZ }) : "";
  const expired = (w?.packs || []).filter((p) => p.expired);
  return (
    <ClientShell title="Wallet">
      <style>{CSS}</style>
      <div className="wl">
        <PvcCard label="CYT Wallet" kind="Wallet" kindSub="Prepaid sessions" balance={w ? inr(w.balance) : "…"}
          name={userInfo?.name || ""} number={cardNo(userInfo?._id)} thruLabel="Valid thru" thru={thru}>
          <p className="wl-under">{!w ? "Loading your wallet…" : w.reserved > 0 ? `${inr(w.reserved)} of this is for sessions you've already booked` : hasWallet(w) ? "Ready for your next session" : "No balance yet — buy a session pack when you book"}</p>
        </PvcCard>

        {w && !hasWallet(w) && (
          <section className="wl-box wl-empty">
            <h2>Your wallet is empty</h2>
            <p>When you book a session, you can take a pack of sessions with the same psychologist and save up to 10%. The pack&apos;s money shows here, and each session you complete is taken from it.</p>
            <Link href="/client/find" className="wl-btn">Find a psychologist</Link>
          </section>
        )}

        {active.length > 0 && <section><h2 className="wl-h">Session packs</h2>{active.map((p) => <Pack key={p._id} p={p} />)}</section>}

        {(w?.clinic || []).length > 0 && (
          <section>
            <h2 className="wl-h">CYT Noida clinic</h2>
            {w.clinic.map((c) => (
              <article key={c._id} className="wl-pack">
                <div className="wl-pack-h">
                  <span className="wl-av clinic"><StorefrontRoundedIcon /></span>
                  <div><b>{c.name}</b><small>In-person sessions at the Noida clinic</small></div>
                  <span className="wl-pack-bal"><b>{c.left}</b><small>of {c.total} left</small></span>
                </div>
                <div className="wl-seg">{Array.from({ length: c.total }, (_, i) => <i key={i} className={i < c.used ? "done" : "left"} />)}</div>
              </article>
            ))}
          </section>
        )}

        {expired.length > 0 && <section><h2 className="wl-h">Expired packs</h2>{expired.map((p) => <Pack key={p._id} p={p} />)}</section>}

        {(w?.history || []).length > 0 && (
          <section className="wl-box">
            <h2 className="wl-h in">Activity</h2>
            <ul className="wl-hist">
              {w.history.map((h, i) => (
                <li key={i} className={h.kind}>
                  <span className="wl-hist-ic" aria-hidden="true">{h.kind === "credit" ? "+" : h.kind === "debit" ? "−" : "⌛"}</span>
                  <span className="wl-hist-t"><b>{h.label}</b><small>{day(h.at)}{h.sub ? ` · ${h.sub}` : ""}</small></span>
                  <span className="wl-hist-a">{h.kind === "credit" ? "+" : h.kind === "debit" ? "−" : ""}{inr(h.amount)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="wl-box wl-how">
          <h2 className="wl-h in">How your wallet works</h2>
          <ul>
            <li><b>Buy a pack</b> of sessions with your psychologist when you book — it&apos;s cheaper than paying one by one.</li>
            <li><b>Book from the pack</b> any time before it expires — nothing more to pay.</li>
            <li><b>Each completed session</b> is taken from your balance. Booked sessions stay in it until they&apos;re done.</li>
            <li>Packs are valid for a set time (usually 90 days) and unused sessions aren&apos;t refunded — <Link href="/contact-us">talk to us</Link> if you need more time.</li>
          </ul>
        </section>
      </div>
    </ClientShell>
  );
}

const CSS = `
.wl { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
.wl-card { position: relative; overflow: hidden; border-radius: 26px; padding: 22px 22px 20px; color: #fff; background: linear-gradient(135deg, #1e7a4c 0%, #14532d 55%, #0b3320 100%); box-shadow: 0 22px 40px -26px rgba(11,52,30,.95); }
.wl-card-top { display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.85); }
.wl-card-top span { display: inline-flex; align-items: center; gap: 8px; } .wl-card-top svg { color: #ecc77d; }
.wl-card-top em { font-style: normal; font-weight: 700; letter-spacing: 0; text-transform: none; color: rgba(255,255,255,.7); }
.wl-bal { display: block; margin: 18px 0 4px; font-size: clamp(38px, 7vw, 52px); font-weight: 800; letter-spacing: -.03em; }
.wl-card p { margin: 0; font-size: 14px; color: rgba(255,255,255,.8); }
.wl-card-glow { position: absolute; right: -60px; top: -60px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(236,199,125,.45), transparent 70%); pointer-events: none; }
.wl .pvc { display: flex; flex-direction: column; align-items: center; }
.wl-under { margin: 10px 0 0; font-size: 14px; color: #475569; text-align: center; }
.wl-h { margin: 6px 4px 10px; font-size: 13px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #6b7c73; }
.wl-h.in { margin: 0 0 12px; }
.wl-box { background: #fff; border-radius: 22px; padding: 18px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
.wl-empty h2 { margin: 0 0 6px; font-size: 19px; font-weight: 800; color: #1c1c1e; }
.wl-empty p { margin: 0 0 14px; font-size: 14.5px; line-height: 1.55; color: #4b5563; }
.wl-pack { background: #fff; border-radius: 22px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
.wl-pack.exp { opacity: .7; }
.wl-pack-h { display: flex; align-items: center; gap: 12px; }
.wl-pack-h > div { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.wl-pack-h b { font-size: 16px; font-weight: 800; color: #1c1c1e; }
.wl-pack-h small { font-size: 12.5px; color: #6b7280; }
.wl-av { flex: none; width: 44px; height: 44px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; background: #e3f4e9; color: #14532d; font-weight: 800; }
.wl-av img { width: 100%; height: 100%; object-fit: cover; }
.wl-av.clinic { border-radius: 13px; background: linear-gradient(160deg, #ffc65a, #f07b12); color: #fff; }
.wl-pack-bal { flex: none; text-align: right; display: flex; flex-direction: column; }
.wl-pack-bal b { font-size: 19px; color: #14532d; } .wl-pack-bal small { font-size: 12px; color: #6b7280; }
.wl-seg { display: flex; gap: 5px; margin: 14px 0 10px; }
.wl-seg i { flex: 1; height: 9px; border-radius: 999px; background: #e8eeeb; }
.wl-seg i.done { background: #16a34a; } .wl-seg i.booked { background: #f59e0b; }
.wl-pack-f { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; font-size: 12.5px; color: #4b5563; }
.wl-pack-f span { display: inline-flex; align-items: center; gap: 5px; }
.wl-pack-f i { width: 9px; height: 9px; border-radius: 50%; background: #e8eeeb; } .wl-pack-f i.done { background: #16a34a; } .wl-pack-f i.booked { background: #f59e0b; }
.wl-pack-f em { margin-left: auto; font-style: normal; font-weight: 700; color: #6b7280; }
.wl-btn { display: inline-flex; align-items: center; justify-content: center; height: 42px; padding: 0 18px; margin-top: 12px; border-radius: 12px; background: #14532d; color: #fff !important; font-size: 14px; font-weight: 800; text-decoration: none !important; }
.wl-hist { list-style: none; margin: 0; padding: 0; }
.wl-hist li { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-top: 1px solid #eef2f0; }
.wl-hist li:first-child { border-top: 0; }
.wl-hist-ic { flex: none; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; background: #f1f5f3; color: #475569; }
.wl-hist li.credit .wl-hist-ic { background: #e3f4e9; color: #15803d; } .wl-hist li.debit .wl-hist-ic { background: #fff1e0; color: #c2410c; }
.wl-hist-t { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.wl-hist-t b { font-size: 14.5px; font-weight: 700; color: #1c1c1e; } .wl-hist-t small { font-size: 12.5px; color: #6b7280; }
.wl-hist-a { flex: none; font-weight: 800; font-size: 15px; color: #1c1c1e; }
.wl-hist li.credit .wl-hist-a { color: #15803d; } .wl-hist li.expired .wl-hist-a { color: #94a3b8; text-decoration: line-through; }
.wl-how ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; }
.wl-how li { font-size: 14px; line-height: 1.55; color: #374151; }
.wl-how a { color: #15803d; font-weight: 700; }
@media (max-width: 640px) { .wl-card { padding: 18px; border-radius: 22px; } .wl-pack-f em { margin-left: 0; width: 100%; } }
`;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MainLayout from "../components/therapists/main-layout";
import { PT_CSS } from "../components/therapists/portal-ui";
import { usePager, Pager } from "../components/therapists/pager";
import PackageModal from "../components/therapist/package-modal";
import useTherapistStore from "../store/therapistStore";
import { fetchById } from "../utils/actions";
import { apiUrl } from "../utils/url";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

/* Therapist → Subscriptions: everything the therapist pays CYT for — the listing package, the Clinical
   Assessments add-on and the Coupons upgrade — current status, and the full history from the start
   (payments and free grants by CYT). Data: GET /therapist/my-plans. */

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const day = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
const ago = (d) => { const n = Math.floor((Date.now() - new Date(d)) / 864e5); return n <= 0 ? "today" : `${n} day${n === 1 ? "" : "s"} ago`; };
const PRODUCTS = {
  listing: { label: "Listing package", Icon: StorefrontRoundedIcon },
  assessments: { label: "Clinical Assessments", Icon: FactCheckRoundedIcon },
  coupons: { label: "Coupons", Icon: LocalOfferRoundedIcon },
};
const FILTERS = [["all", "All"], ["listing", "Listing"], ["assessments", "Assessments"], ["coupons", "Coupons"]];

// ring = share of the term still left
function Ring({ days, total, soon }) {
  const p = Math.max(0, Math.min(100, Math.round((days / (total || 1)) * 100)));
  return (
    <span className={`mp-ring${soon ? " soon" : ""}`} style={{ "--p": `${p}%` }} aria-hidden="true">
      <span><b>{days}</b><small>days</small></span>
    </span>
  );
}

function PlanCard({ id, status, tone, children, note, action }) {
  const { label, Icon } = PRODUCTS[id];
  return (
    <section className={`mp-card ${tone}`}>
      <div className="mp-card-h">
        <span className="mp-ic" aria-hidden="true"><Icon /></span>
        <h2>{label}</h2>
        <span className={`mp-chip ${tone}`}>{status}</span>
      </div>
      <div className="mp-body">{children}</div>
      {note && <p className="mp-note">{note}</p>}
      <div className="mp-act">{action}</div>
    </section>
  );
}

export default function MyPlans() {
  const me = useTherapistStore((s) => s.therapistInfo);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [renew, setRenew] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetchById(`${apiUrl}/therapist/my-plans`);
      if (r?.status) { setData(r.data); setError(""); } else setError(r?.message || "Couldn't load your plans.");
    } catch (e) { setError("Couldn't load your plans — please refresh in a moment."); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const history = useMemo(() => (data?.history || []).filter((h) => filter === "all" || h.product === filter), [data, filter]);
  const pg = usePager(history, 10);
  const L = data?.listing, A = data?.assessments, C = data?.coupons;
  const activeCount = data ? [L?.active, A?.active, C?.active].filter(Boolean).length : 0;

  const listingCard = !L ? null : L.active ? (
    <PlanCard id="listing" status={L.live ? "Active · live" : "Active"} tone={L.daysLeft <= 15 ? "soon" : "ok"}
      note={L.daysLeft <= 15 ? "Renew before it ends so your profile stays live." : null}
      action={<button type="button" className="mp-btn" onClick={() => setRenew(true)}>Renew</button>}>
      <Ring days={L.daysLeft} total={(L.plan === "annual" ? 12 : L.plan === "6_month" ? 6 : L.plan === "3_month" ? 3 : 1) * 30} soon={L.daysLeft <= 15} />
      <div className="mp-txt"><b>{L.planLabel || "Plan"}{L.amount ? ` · ${inr(L.amount)}` : ""}</b><span>Valid till {day(L.till)}</span></div>
    </PlanCard>
  ) : (
    <PlanCard id="listing" status={L.till ? "Expired" : "Not bought"} tone={L.till ? "bad" : "off"}
      note={L.till ? `Ended ${day(L.till)} (${ago(L.till)}).` : "A listing package puts your profile on Choose Your Therapist."}
      action={<button type="button" className="mp-btn gold" onClick={() => setRenew(true)}>{L.till ? "Renew now" : "Choose a package"}</button>}>
      <div className="mp-txt"><b>{L.planLabel ? `Last plan: ${L.planLabel}` : "No package yet"}</b><span>{L.live ? "Your profile is still live (free listing)" : "Profile not live"}</span></div>
    </PlanCard>
  );

  const assessCard = !A ? null : A.active ? (
    <PlanCard id="assessments" status={A.source === "free" ? "Active · free" : "Active"} tone={A.daysLeft <= 15 ? "soon" : "ok"}
      note={A.step !== "active" ? "Finish your details and consent so clients can book assessments with you." : null}
      action={<Link href="/therapist-questionnaires?buy=1" className="mp-btn">Manage</Link>}>
      <Ring days={A.daysLeft} total={(A.termMonths || 6) * 30} soon={A.daysLeft <= 15} />
      <div className="mp-txt"><b>6-month add-on</b><span>Valid till {day(A.till)}</span></div>
    </PlanCard>
  ) : (
    <PlanCard id="assessments" status={A.till ? "Expired" : "Not active"} tone={A.till ? "bad" : "off"}
      note="Let clients book standard assessments with you and get automatic reports."
      action={<Link href="/therapist-questionnaires?buy=1" className="mp-btn gold">{A.till ? "Renew" : "✦ Upgrade"}</Link>}>
      <div className="mp-txt"><b>{A.till ? `Ended ${day(A.till)}` : "Not bought yet"}</b><span>6 months per purchase</span></div>
    </PlanCard>
  );

  const couponsCard = !C ? null : C.active ? (
    <PlanCard id="coupons" status={C.source === "free" ? "Unlocked · free" : "Unlocked"} tone="ok"
      action={<Link href="/coupons" className="mp-btn">Open Coupons</Link>}>
      <span className="mp-inf" aria-hidden="true">∞</span>
      <div className="mp-txt"><b>Lifetime</b><span>{C.at ? `Since ${day(C.at)}` : "No renewal needed"}</span></div>
    </PlanCard>
  ) : (
    <PlanCard id="coupons" status={C.source === "revoked" ? "Turned off" : "Locked"} tone="off"
      note="Create offers that show on your profile next to Book a Session."
      action={<Link href="/coupons" className="mp-btn gold">✦ Unlock</Link>}>
      <div className="mp-txt"><b>One-time upgrade</b><span>Yours for life once unlocked</span></div>
    </PlanCard>
  );

  return (
    <MainLayout>
      <Head><title>Subscriptions | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + MP_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Subscriptions</h1>
            <p>Everything you pay CYT for — your listing package and upgrades — with the full history from the start.</p>
          </div>
        </div>

        {error && <div className="pt-err">{error}</div>}

        <div className="pt-stats">
          <div className="pt-stat"><small>Active plans</small><b>{data ? `${activeCount} of 3` : "—"}</b><span>Listing, Assessments, Coupons</span></div>
          <div className="pt-stat"><small>Paid to CYT · all time</small><b>{data ? inr(data.totals.paid) : "—"}</b><span>{data?.totals.count ? `${data.totals.count} record${data.totals.count === 1 ? "" : "s"}` : "No payments yet"}</span></div>
          <div className="pt-stat"><small>With CYT since</small><b>{data?.totals.since ? day(data.totals.since) : "—"}</b><span>First plan</span></div>
        </div>

        <div className="mp-grid">
          {data ? <>{listingCard}{assessCard}{couponsCard}</> : [1, 2, 3].map((i) => <div key={i} className="pt-skel" style={{ height: 190 }} />)}
        </div>

        <div className="pt-card">
          <div className="pt-card-h">
            <h2>History</h2>
            <div className="mp-filters">
              {FILTERS.map(([k, l]) => <button key={k} type="button" className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}</button>)}
            </div>
          </div>
          {!data ? [1, 2, 3].map((i) => <div key={i} className="pt-skel" />) : history.length ? (
            <>
              <ul className="mp-hist">
                {pg.items.map((h, i) => {
                  const { Icon } = PRODUCTS[h.product] || PRODUCTS.listing;
                  return (
                    <li key={`${h.at}-${i}`}>
                      <span className={`mp-hic ${h.product}`} aria-hidden="true"><Icon /></span>
                      <div className="mp-hmain">
                        <b>{h.label}</b>
                        <span>{day(h.at)}{h.till ? ` · ${day(h.from)} – ${day(h.till)}` : ""}{h.paymentId ? ` · ${h.paymentId}` : ""}</span>
                      </div>
                      <div className="mp-hamt">
                        <b>{h.kind === "free" ? "Free" : inr(h.amount)}</b>
                        <span className={`pt-chip ${h.kind === "free" ? "warn" : "ok"}`}>{h.kind === "free" ? "Given by CYT" : "Paid"}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Pager pg={pg} noun="records" scrollTo={false} />
            </>
          ) : (
            <div className="pt-empty"><b>Nothing here yet</b>When you buy a package or an upgrade, it shows up here with the date and payment ID.</div>
          )}
        </div>
      </div>

      {renew && <PackageModal initialEmail={me?.user?.email || ""} onClose={() => { setRenew(false); load(); }} />}
    </MainLayout>
  );
}

const MP_CSS = `
.mp-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 14px; }
.mp-card { display: flex; flex-direction: column; background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 16px; min-width: 0; }
.mp-card.ok { background: linear-gradient(160deg, #f2faf3, #fff 60%); border-color: #cfe8d8; }
.mp-card.soon { background: linear-gradient(160deg, #fffbeb, #fff 60%); border-color: #fde68a; }
.mp-card.bad { background: linear-gradient(160deg, #fff5f5, #fff 60%); border-color: #fecaca; }
.mp-card-h { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.mp-card-h h2 { flex: 1; min-width: 0; font-family: inherit; font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; }
.mp-ic { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: #e7f6ec; color: #166534; flex-shrink: 0; }
.mp-ic svg { font-size: 20px; }
.mp-chip { font-size: 11.5px; font-weight: 800; border-radius: 999px; padding: 3px 10px; white-space: nowrap; }
.mp-chip.ok { background: #dcfce7; color: #166534; } .mp-chip.soon { background: #fef3c7; color: #92400e; }
.mp-chip.bad { background: #fee2e2; color: #991b1b; } .mp-chip.off { background: #f1f5f9; color: #475569; }
.mp-body { display: flex; align-items: center; gap: 12px; flex: 1; }
.mp-txt { min-width: 0; } .mp-txt b { display: block; font-size: 15px; font-weight: 800; color: #0f172a; } .mp-txt span { display: block; font-size: 12.5px; color: #64748b; margin-top: 2px; }
.mp-ring { --p: 50%; width: 54px; height: 54px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; background: conic-gradient(#16a34a var(--p), #dfeee5 0); }
.mp-ring > span { width: 42px; height: 42px; border-radius: 50%; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; }
.mp-ring b { font-size: 14px; font-weight: 900; color: #14532d; } .mp-ring small { font-size: 8.5px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 1px; }
.mp-ring.soon { background: conic-gradient(#d97706 var(--p), #fde9c4 0); } .mp-ring.soon b { color: #b45309; }
.mp-inf { width: 54px; height: 54px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; font-size: 28px; font-weight: 900; color: #a37a16; background: linear-gradient(145deg, #fff8e6, #fbefcc); box-shadow: inset 0 0 0 2px #ecd49a; }
.mp-note { font-size: 12.5px; color: #64748b; margin: 12px 0 0; line-height: 1.45; }
.mp-act { margin-top: 14px; }
.mp-btn { display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 18px; border-radius: 10px; border: 1.5px solid #166534; background: #fff; color: #166534 !important; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; text-decoration: none !important; transition: background .15s; }
.mp-btn:hover { background: #ecfdf3; }
.mp-btn.gold { border: 0; color: #fff !important; background: linear-gradient(135deg, #8a6312, #d4a12f); box-shadow: 0 6px 14px -8px rgba(176,134,30,.8); }
.mp-btn.gold:hover { filter: brightness(1.07); }
.mp-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.mp-filters button { border: 1px solid #dfe7e2; background: #fff; border-radius: 999px; padding: 5px 12px; font: inherit; font-size: 12.5px; font-weight: 700; color: #334155; cursor: pointer; }
.mp-filters button.on { background: #14532d; border-color: #14532d; color: #fff; }
.mp-hist { list-style: none; margin: 0; padding: 0; }
.mp-hist li { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid #eef2f0; margin: 0; }
.mp-hist li:first-child { border-top: 0; padding-top: 2px; }
.mp-hic { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; background: #e7f6ec; color: #166534; }
.mp-hic.coupons, .mp-hic.assessments { background: #fdf3d4; color: #a37a16; }
.mp-hic svg { font-size: 19px; }
.mp-hmain { flex: 1; min-width: 0; } .mp-hmain b { display: block; font-size: 14px; color: #0f172a; }
.mp-hmain span { display: block; font-size: 12.5px; color: #64748b; margin-top: 2px; overflow-wrap: anywhere; }
.mp-hamt { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.mp-hamt b { font-size: 15px; font-weight: 800; color: #0f172a; font-variant-numeric: tabular-nums; }
@media (max-width: 1100px) { .mp-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 767px) { .mp-grid { grid-template-columns: 1fr; } .pt-card-h { flex-wrap: wrap; } }
`;

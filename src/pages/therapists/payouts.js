import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MainLayout from "../../components/therapists/main-layout";
import { PT_CSS } from "../../components/therapists/portal-ui";
import { usePager, Pager } from "../../components/therapists/pager";
import { fetchById } from "../../utils/actions";
import { commsPayoutsUrl, getAccountDetailsUrl } from "../../utils/url";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const day = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
const shortDay = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "");
const mask = (v) => (v && v.length > 4 ? `•••• ${v.slice(-4)}` : v || "");
const METHOD = { bank: "Bank transfer", upi: "UPI", other: "Other" };

export default function Payouts() {
  const [data, setData] = useState(null);
  const [acct, setAcct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const [p, a] = await Promise.allSettled([fetchById(commsPayoutsUrl), fetchById(getAccountDetailsUrl)]);
      if (!alive) return;
      if (p.status === "fulfilled" && p.value?.status) setData(p.value.data);
      else { setData({ payouts: [], totals: {} }); setError("Couldn't load your payouts — please refresh in a moment."); }
      setAcct(a.status === "fulfilled" && a.value?.data ? a.value.data : {});
    })();
    return () => { alive = false; };
  }, []);

  const t = data?.totals || {};
  const list = data?.payouts || [];
  const pg = usePager(list, 10);
  const hasBank = !!acct?.ac_number, hasUpi = !!acct?.upi;

  return (
    <MainLayout>
      <Head><title>Payouts | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + PO_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Payouts</h1>
            <p>Money the CYT accounts team has sent you for your sessions, with reference numbers.</p>
          </div>
          <Link href="/therapists/help?kind=question" className="pt-btn outline">Question about a payout?</Link>
        </div>

        {error && <div className="pt-err">{error}</div>}

        <div className="pt-stats">
          <div className="pt-stat"><small>Paid out · all time</small><b>{data ? inr(t.paid) : "—"}</b><span>{t.lastPaidAt ? `Last payout ${day(t.lastPaidAt)}` : "No payouts yet"}</span></div>
          <div className="pt-stat"><small>This financial year</small><b>{data ? inr(t.thisYear) : "—"}</b><span>Since 1 April</span></div>
          <div className="pt-stat"><small>Being processed</small><b>{data ? inr(t.pending) : "—"}</b><span>Recorded, not yet sent</span></div>
        </div>

        <div className="po-grid">
          <div className="pt-card">
            <div className="pt-card-h"><h2>Payout history</h2><span className="pt-chip mut">{list.length}</span></div>
            {!data ? [1, 2, 3].map((i) => <div key={i} className="pt-skel" />) : list.length ? (
              <>
              <ul className="po-list">
                {pg.items.map((p) => (
                  <li key={p._id}>
                    <div className="po-amt">
                      <b>{inr(p.amount)}</b>
                      <span className={`pt-chip ${p.status === "paid" ? "ok" : "warn"}`}>{p.status === "paid" ? "Paid" : "Processing"}</span>
                    </div>
                    <div className="po-meta">
                      <span>{p.status === "paid" ? `Sent ${day(p.paidAt || p.createdAt)}` : `Recorded ${day(p.createdAt)}`}</span>
                      {p.periodFrom && p.periodTo && <span>For {shortDay(p.periodFrom)} – {day(p.periodTo)}</span>}
                      {p.sessions > 0 && <span>{p.sessions} session{p.sessions === 1 ? "" : "s"}</span>}
                      <span>{METHOD[p.method] || "Bank transfer"}</span>
                      {p.reference && <span className="po-ref">Ref {p.reference}</span>}
                    </div>
                    {p.note && <p className="po-note">{p.note}</p>}
                  </li>
                ))}
              </ul>
              <Pager pg={pg} noun="payouts" scrollTo={false} />
              </>
            ) : (
              <div className="pt-empty">
                <b>No payouts recorded yet</b>
                When the accounts team sends you a payout, it appears here with the amount, the sessions it covers and the bank / UPI reference.
              </div>
            )}
          </div>

          <div>
            <div className="pt-card">
              <div className="pt-card-h"><h2>Where we pay you</h2><Link href="/settings?tab=payments">Change</Link></div>
              {!acct ? <div className="pt-skel" /> : hasBank || hasUpi ? (
                <div className="po-acct">
                  {hasBank && (
                    <div><AccountBalanceRoundedIcon /><span><b>{acct.ac_name || "Bank account"}</b><small>A/c {mask(acct.ac_number)} · {acct.ifsc}</small></span></div>
                  )}
                  {hasUpi && (
                    <div><QrCode2RoundedIcon /><span><b>UPI</b><small>{acct.upi}</small></span></div>
                  )}
                </div>
              ) : (
                <div className="po-missing">
                  <b>Add your bank or UPI details</b>
                  <p>We need these to send your payouts.</p>
                  <Link href="/settings?tab=payments" className="pt-btn primary">Add payout details</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const PO_CSS = `
.po-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 14px; align-items: start; }
.po-list { list-style: none; margin: 0; padding: 0; }
.po-list li { padding: 12px 0; border-top: 1px solid #eef2f0; margin: 0; }
.po-list li:first-child { border-top: 0; padding-top: 0; }
.po-amt { display: flex; align-items: center; gap: 10px; }
.po-amt b { font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums; }
.po-meta { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12.5px; color: #64748b; margin-top: 4px; }
.po-ref { font-variant-numeric: tabular-nums; color: #334155; font-weight: 600; }
.po-note { font-size: 12.5px; color: #475569; margin: 6px 0 0; background: #f8faf9; border-radius: 8px; padding: 6px 10px; line-height: 1.5; }
.po-acct { display: grid; gap: 10px; }
.po-acct > div { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border-radius: 12px; background: #f6f8f7; }
.po-acct svg { color: #166534; font-size: 22px; flex-shrink: 0; }
.po-acct b { display: block; font-size: 13.5px; }
.po-acct small { display: block; font-size: 12.5px; color: #64748b; font-variant-numeric: tabular-nums; }
.po-missing { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 12px; }
.po-missing b { font-size: 14px; color: #92400e; } .po-missing p { font-size: 12.5px; color: #92400e; margin: 2px 0 10px; }
@media (max-width: 1023px) { .po-grid { grid-template-columns: 1fr; } }
`;

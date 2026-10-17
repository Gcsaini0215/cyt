import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { TEST_BY_KEY } from "../self-assessment/tests";

/* Clinical assessments booked with a session, for the therapist portal (home, appointments,
   invoices): which test, where it stands, and a link to the report once the client has answered. */

let cache = { at: 0, map: null, pending: null };
const listeners = new Set();

async function loadMap(force) {
  if (!force && cache.map && Date.now() - cache.at < 60000) return cache.map;
  if (!cache.pending) {
    cache.pending = fetchById(`${apiUrl}/assessment-requests/therapist`)
      .then((r) => {
        const map = {};
        (r?.data || []).forEach((x) => { if (x.booking) (map[String(x.booking)] = map[String(x.booking)] || []).push(x); });
        cache = { at: Date.now(), map, pending: null };
        listeners.forEach((fn) => fn(map));
        return map;
      })
      .catch(() => { cache.pending = null; return cache.map || {}; });
  }
  return cache.pending;
}

// bookingId -> [assessment requests]; shared by every card on the page (one request)
export function useAssessmentMap() {
  const [map, setMap] = useState(cache.map || {});
  useEffect(() => {
    listeners.add(setMap);
    loadMap().then(setMap);
    return () => listeners.delete(setMap);
  }, []);
  return map;
}

export const shortOf = (tool) => TEST_BY_KEY[tool]?.short || String(tool || "").toUpperCase();
const STATE = { sent: ["Waiting for client", "wait"], done: ["Report ready", "ready"], released: ["Released", "done"] };

// one line per booked assessment: what it is, its state, the report link
export function bookingAssessments(b, map) {
  const list = Array.isArray(b?.assessments) ? b.assessments : [];
  const reqs = (map && b?._id && map[String(b._id)]) || [];
  return list.map((a) => {
    const r = reqs.find((x) => x.tool === a.tool);
    const [label, tone] = r ? STATE[r.status] || ["Booked", "wait"] : ["Booked", "wait"];
    return { tool: a.tool, short: shortOf(a.tool), fee: Number(a.fee) || 0, label, tone, reportId: r && r.status !== "sent" ? r._id : null, flag: !!r?.flag, level: r?.level || "" };
  });
}

// money split for invoices: the session part and each assessment line
export function sessionSplit(b, total) {
  const lines = (Array.isArray(b?.assessments) ? b.assessments : []).map((a) => ({ short: shortOf(a.tool), fee: Number(a.fee) || 0 }));
  const assess = lines.reduce((n, l) => n + l.fee, 0);
  return { lines, assess, session: Math.max(0, (Number(total) || 0) - assess) };
}

export function AssessmentChips({ b, map, compact = false }) {
  const items = bookingAssessments(b, map);
  if (!items.length) return null;
  return (
    <span className={`bax${compact ? " compact" : ""}`} onClick={(e) => e.stopPropagation()}>
      <style dangerouslySetInnerHTML={{ __html: BAX_CSS }} />
      {items.map((x) => (x.reportId
        ? <Link key={x.tool} href={`/assessment-report/${x.reportId}`} className={`bax-chip ${x.tone}`} title={x.level || x.label}>📋 {x.short} · {x.label}{x.flag ? " ⚠" : ""}</Link>
        : <span key={x.tool} className={`bax-chip ${x.tone}`}>📋 {x.short} · {x.label}</span>))}
    </span>
  );
}

const BAX_CSS = `
.bax { display: inline-flex; flex-wrap: wrap; gap: 6px; }
.bax-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; border-radius: 999px; padding: 3px 10px; border: 1px solid transparent; text-decoration: none !important; white-space: nowrap; }
.bax-chip.wait { background: #fff7e6; color: #92400e !important; border-color: #f6d9a2; }
.bax-chip.ready { background: #e7f6ec; color: #166534 !important; border-color: #b7e2c6; }
.bax-chip.done { background: #f1f5f9; color: #334155 !important; border-color: #e2e8f0; }
a.bax-chip:hover { filter: brightness(.97); text-decoration: underline !important; }
.bax.compact .bax-chip { font-size: 11px; padding: 2px 8px; }
`;

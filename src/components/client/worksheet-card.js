import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";

/* My Space: a worksheet from your therapist that's waiting (new / in progress / just reviewed). Hidden when there's none. */
export default function WorksheetCard() {
  const [w, setW] = useState(null);
  useEffect(() => {
    fetchById(`${apiUrl}/my-worksheets`).then((r) => {
      const rows = r?.status ? r.data : [];
      const open = rows.filter((x) => x.status === "assigned" || x.status === "draft");
      const fb = rows.find((x) => x.status === "reviewed" && x.reviewedAt && Date.now() - new Date(x.reviewedAt) < 14 * 864e5);
      setW(open.length ? { kind: "todo", n: open.length, x: open[0] } : fb ? { kind: "fb", x: fb } : null);
    }).catch(() => {});
  }, []);
  if (!w) return null;
  const by = w.x.therapist?.name || "your therapist";
  return (
    <Link href={w.n > 1 ? "/client/worksheets" : `/client/worksheets/${w.x._id}`} className="wsc">
      <style>{CSS}</style>
      <span className="wsc-ic" aria-hidden="true"><i>A</i><i>B</i><i>C</i><i>D</i></span>
      <span className="wsc-t">
        <b>{w.kind === "fb" ? `${by} reviewed your worksheet` : w.x.status === "assigned" ? `${by} sent you a worksheet` : "Finish your worksheet"}</b>
        <small>{w.kind === "fb" ? "Read their feedback" : `${w.x.title}${w.n > 1 ? ` · ${w.n} waiting` : ""} — fill it here, no download`}</small>
      </span>
      <span className="wsc-go">{w.kind === "fb" ? "Read" : w.x.status === "assigned" ? "Start" : "Continue"} →</span>
    </Link>
  );
}

const CSS = `
.wsc { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 18px; background: #fff; border: 1.5px solid #d5e8dc; text-decoration: none !important; color: #0f1f17; box-shadow: 0 12px 26px -22px rgba(20,83,45,.6); }
.wsc:hover { border-color: #15803d; }
.wsc-ic { flex: none; display: grid; grid-template-columns: 1fr 1fr; gap: 3px; width: 44px; height: 44px; }
.wsc-ic i { display: grid; place-items: center; border-radius: 6px; font-style: normal; font-size: 11px; font-weight: 900; color: #fff; }
.wsc-ic i:nth-child(1) { background: #2563eb; } .wsc-ic i:nth-child(2) { background: #7c3aed; } .wsc-ic i:nth-child(3) { background: #ea580c; } .wsc-ic i:nth-child(4) { background: #16a34a; }
.wsc-t { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.wsc-t b { font-size: 15px; }
.wsc-t small { font-size: 12.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wsc-go { flex: none; font-size: 13.5px; font-weight: 800; color: #15803d; }
`;

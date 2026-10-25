import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles } from "../../utils/url";
import { pickRelated } from "../../utils/related-therapists";

/* Under a self-check result: three listed therapists who work with that concern, with
   View / Book links, so the next step is one tap away. */

export default function SuggestedTherapists({ keywords, label }) {
  const [list, setList] = useState(null);
  const m = keywords ? { keywords, label } : null;

  useEffect(() => {
    if (!m) return;
    fetchData(getTherapistProfiles)
      .then((r) => setList(pickRelated(r?.data || [], { keywords: m.keywords, limit: 3 })))
      .catch(() => setList([]));
  }, [label]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!m || (list && !list.length)) return null;

  return (
    <div className="sgt">
      <style dangerouslySetInnerHTML={{ __html: SGT_CSS }} />
      <div className="sgt-h">
        <b>Therapists who work with {m.label}</b>
        <Link href="/view-all-therapist">See all →</Link>
      </div>
      {!list ? <div className="sgt-skel" /> : (
        <div className="sgt-grid">
          {list.map((t) => (
            <div key={t.id} className="sgt-card">
              <div className="sgt-top">
                <span className="sgt-av">{t.photo ? <img src={t.photo} alt={t.name} /> : t.name.charAt(0)}</span>
                <div className="sgt-who">
                  <b>{t.name}</b>
                  <span>{t.type}{t.city ? ` · ${t.city}` : ""}</span>
                  {t.rating && <span className="sgt-rt">★ {t.rating.avg.toFixed(1)} ({t.rating.count})</span>}
                </div>
              </div>
              {t.tags.length > 0 && <div className="sgt-tags">{t.tags.map((x) => <span key={x}>{x}</span>)}</div>}
              <div className="sgt-foot">
                <span className="sgt-fee">{t.fee ? `From ₹${t.fee.toLocaleString("en-IN")}` : ""}</span>
                <Link href={t.href} className="sgt-btn ghost">View</Link>
                <Link href={t.href.replace("/view-profile/", "/book/")} className="sgt-btn">Book</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SGT_CSS = `
.sgt { margin: 4px 0 18px; }
.sgt-h { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.sgt-h b { font-size: 15px; font-weight: 800; color: #0f172a; }
.sgt-h a { font-size: 13px; font-weight: 700; color: #166534 !important; text-decoration: none !important; white-space: nowrap; }
.sgt-skel { height: 150px; border-radius: 14px; background: #f1f5f4; }
.sgt-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.sgt-card { border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 10px; background: #fff; min-width: 0; }
.sgt-top { display: flex; gap: 10px; align-items: center; min-width: 0; }
.sgt-av { width: 46px; height: 46px; border-radius: 13px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-weight: 800; flex-shrink: 0; overflow: hidden; }
.sgt-av img { width: 100%; height: 100%; object-fit: cover; }
.sgt-who { min-width: 0; }
.sgt-who b { display: block; font-size: 14px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sgt-who span { display: block; font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sgt-who .sgt-rt { color: #b45309; font-weight: 700; }
.sgt-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.sgt-tags span { font-size: 11px; font-weight: 600; color: #166534; background: #f0faf3; border-radius: 999px; padding: 3px 8px; }
.sgt-foot { display: flex; align-items: center; gap: 6px; margin-top: auto; }
.sgt-fee { flex: 1; font-size: 12.5px; font-weight: 700; color: #0f172a; }
.sgt-btn { height: 34px; padding: 0 14px; border-radius: 9px; display: inline-flex; align-items: center; font-size: 13px; font-weight: 800; background: #228756; color: #fff !important; text-decoration: none !important; }
.sgt-btn.ghost { background: #fff; color: #228756 !important; border: 1px solid #b7dcc4; }
@media (max-width: 760px) { .sgt-grid { grid-template-columns: 1fr; } }
`;

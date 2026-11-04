import React, { useEffect, useState } from "react";
import { apiUrl } from "../../utils/url";
import { fetchById } from "../../utils/actions";
import { dayLabel, shareText, waShare } from "./festival-ui";

/* My Space: free sessions from a festival "book 1, get 1" offer that are still to be booked —
   the client's own (use or gift) and ones gifted to them. */
export default function FestivalGiftCards() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    fetchById(`${apiUrl}/festival-gifts/mine`).then((r) => setRows(r?.status ? (r.data || []).filter((g) => !g.redeemed && !g.expired) : [])).catch(() => {});
  }, []);
  if (!rows.length) return null;
  return (
    <section className="fgc-wrap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {rows.map((g) => {
        const gifted = !g.forSelf && g.recipientName;
        const by = dayLabel(g.validTill, { day: "numeric", month: "short" });
        return (
          <div key={g.code} className="fgc">
            <div className="fgc-ic">🎁</div>
            <div className="fgc-body">
              <b>{g.role === "received" ? `${(g.from || "Someone").split(" ")[0]} gifted you a free session` : gifted ? `Your free session — gifted to ${g.recipientName.split(" ")[0]}` : "Your free Diwali session"}</b>
              <span>{g.role === "received" || !gifted ? `With a counselling psychologist · in-person or online · book by ${by}` : `They haven't booked it yet · link works till ${by}`}</span>
              <div className="fgc-acts">
                {(g.role === "received" || !gifted) && <a className="fgc-btn" href={`/festival-therapy/gift/${g.code}`}>Book it</a>}
                {g.role === "bought" && (
                  <a className="fgc-btn ghost" href={waShare(shareText({ link: g.link, toName: gifted ? g.recipientName : "", fromName: gifted ? g.from : "", validTill: g.validTill }))} target="_blank" rel="noopener noreferrer">
                    {gifted ? "Send link again" : "Gift it on WhatsApp"}
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

const CSS = `
.fgc-wrap { display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
.fgc { display:flex; gap:12px; align-items:flex-start; background:linear-gradient(120deg,#7a1426,#9b2238); color:#fbf3e6; border-radius:16px; padding:14px 16px; }
.fgc-ic { font-size:26px; line-height:1; }
.fgc-body { display:flex; flex-direction:column; gap:3px; min-width:0; }
.fgc-body b { font-size:15.5px; color:#fff; }
.fgc-body span { font-size:13px; color:#f6e1c0; }
.fgc-acts { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
.fgc-btn { background:#f2b43c; color:#5e0f1d; font-weight:800; font-size:13.5px; border-radius:999px; padding:7px 16px; text-decoration:none; }
.fgc-btn.ghost { background:transparent; color:#fff; border:1.5px solid rgba(255,255,255,.6); }
`;

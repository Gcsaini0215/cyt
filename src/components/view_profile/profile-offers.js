import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchData } from "../../utils/actions";
import { PublicCouponsUrl } from "../../utils/url";
import { copyText, offerLabel } from "../global/coupon-ui";

/* The therapist's live coupons inside the profile header: a small offer card above "Book a Session"
   (desktop) or a slim line under the details (phone). "Book with offer" opens the booking page with
   ?coupon=CODE, which is applied on the summary step. */

export function useProfileOffers(id) {
  const [offers, setOffers] = useState([]);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setOffers([]);
    fetchData(`${PublicCouponsUrl}/${id}`).then((r) => {
      if (alive && r?.status) setOffers(r.data || []);
    }).catch(() => {});
    return () => { alive = false; };
  }, [id]);
  return offers;
}

export function OfferChip({ offers, bookHref, compact = false, wide = false, onBook }) {
  const [copied, setCopied] = useState(false);
  if (!offers?.length) return null;
  const c = offers[0];
  const href = `${bookHref}?coupon=${encodeURIComponent(c.code)}`;
  const more = offers.length - 1;
  const copy = async () => { if (await copyText(c.code)) { setCopied(true); setTimeout(() => setCopied(false), 1800); } };

  return (
    <div className={`ofc${compact ? " ofc-m" : " ofc-col"}${wide ? " ofc-w" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: OFC_CSS }} />
      {compact ? (
        <>
          <span className="ofc-shine" aria-hidden="true" />
          <span className="ofc-ic" aria-hidden="true">%</span>
          <span className="ofc-t"><b>{offerLabel(c)}</b>{wide && c.title ? ` · ${c.title}` : ""} <span className="ofc-nw"><span className="ofc-dot">· </span>code<button type="button" className="ofc-code" onClick={copy} title="Copy code"><span key={copied ? "y" : "n"} className={copied ? "ofc-pop" : undefined}>{copied ? "Copied ✓" : c.code}</span></button></span>{wide && more > 0 ? <small className="ofc-more-i"> · +{more} more</small> : null}</span>
          <Link href={href} className="ofc-go">Use offer <span className="ofc-arr" aria-hidden="true">→</span></Link>
        </>
      ) : (
        <>
          <span className="ofc-shine" aria-hidden="true" />
          <div className="ofc-c-top">
            <span className="ofc-ic" aria-hidden="true">%</span>
            <div><small className="ofc-kicker">✓ Auto-applied offer{more > 0 ? ` · +${more}` : ""}</small><b className="ofc-off">{offerLabel(c)}</b></div>
          </div>
          <button type="button" className="ofc-codebox" onClick={copy} title="Copy code">
            <span className="mono">{c.code}</span>
            <em key={copied ? "y" : "n"} className={copied ? "ofc-pop" : undefined}>{copied ? "Copied ✓" : "Copy"}</em>
          </button>
          {onBook
            ? <button type="button" className="ofc-book" onClick={onBook}>Book a Session <span className="ofc-arr" aria-hidden="true">→</span></button>
            : <Link href={href} className="ofc-book">Book a Session <span className="ofc-arr" aria-hidden="true">→</span></Link>}
        </>
      )}
    </div>
  );
}

const OFC_CSS = `
.ofc { background: #fffaeb; border: 1px dashed #d9a93a; border-radius: 6px; padding: 10px 12px; font-family: inherit; text-align: left; }
.ofc-top { display: flex; align-items: center; gap: 6px; min-width: 0; }
.ofc-tag { flex-shrink: 0; font-size: 10px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; background: #d9a93a; color: #3b2a05; border-radius: 3px; padding: 2px 6px; }
.ofc-title { font-size: 11.5px; color: #7c5a12; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ofc-off { display: block; font-size: 17px; font-weight: 800; color: #14532d; margin-top: 5px; line-height: 1.2; }
.ofc-off small { font-size: 12px; font-weight: 600; color: #4b5d52; }
.ofc-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 7px; padding-top: 7px; border-top: 1px dashed #ead39a; }
.ofc .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; font-weight: 800; letter-spacing: 1px; color: #0f172a; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ofc-copy { flex-shrink: 0; border: 1px solid #d9a93a; background: #fff; color: #7c5a12; border-radius: 4px; padding: 3px 9px; font-size: 11.5px; font-weight: 700; cursor: pointer; font-family: inherit; }
.ofc-copy:hover { background: #fdf3d7; }
.ofc-go { display: block; margin-top: 8px; font-size: 12.5px; font-weight: 800; color: #14532d !important; text-decoration: none !important; }
.ofc-go:hover { text-decoration: underline !important; }
.ofc-more { display: block; margin-top: 6px; font-size: 11px; color: #8a6d2b; text-align: center; }
/* ticket card in the desktop action column (where Chat / Waitlist were) */
/* compact on purpose: it takes the place of Chat Now + Join Waitlist without making the header card taller.
   "Book a Session" opens the booking page with this code (header.js handleClick). */
.ofc-col { position: relative; overflow: hidden; isolation: isolate; padding: 8px 10px; border: 1px dashed #c9971f; border-radius: 10px;
  background: linear-gradient(150deg, #fff9e6 0%, #fdeec4 60%, #fbe3a6 100%); box-shadow: 0 4px 14px -6px rgba(201,151,31,.4);
  animation: ofcIn .5s cubic-bezier(.2,.8,.2,1) both; }
.ofc-col::before, .ofc-col::after { content: ""; position: absolute; top: 40px; margin-top: 0; width: 14px; height: 14px; border-radius: 50%; background: #fff; box-shadow: inset 0 0 0 1px rgba(201,151,31,.55); z-index: 2; }
.ofc-col::before { left: -7px; } .ofc-col::after { right: -7px; }
.ofc-col > :not(.ofc-shine) { position: relative; z-index: 1; }
.ofc-c-top { display: flex; align-items: center; gap: 10px; }
.ofc-c-top > div { min-width: 0; }
.ofc-kicker { display: block; font-size: 10.5px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #8a6312; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ofc-col .ofc-off { margin: 0; font-size: 20px; font-weight: 900; color: #14532d; letter-spacing: -.2px; line-height: 1.15; }
.ofc-col .ofc-title { display: block; margin: 8px 0 0; padding-top: 8px; border-top: 1px dashed #e3c77a; font-size: 12px; color: #6b5317; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ofc-col .ofc-ic { flex-basis: 30px; height: 30px; font-size: 13px; }
.ofc-col .ofc-kicker { color: #15803d; letter-spacing: .3px; }
.ofc-codebox { width: 100%; margin-top: 6px; display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 4px 8px 4px 10px;
  background: rgba(255,255,255,.85); border: 1px dashed #b8913a; border-radius: 7px; cursor: pointer; font-family: inherit; transition: background .15s; }
.ofc-codebox:hover { background: #fff; }
.ofc-codebox .mono { font-size: 14px; letter-spacing: 1.4px; }
.ofc-codebox em { font-style: normal; font-size: 11.5px; font-weight: 800; color: #8a6312; flex-shrink: 0; }
.ofc-codebox em.ofc-pop { color: #15803d; }
.ofc-book { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 8px; height: 42px; border: 0; border-radius: 6px; cursor: pointer;
  background: linear-gradient(135deg, #1a6b3a, #0f3d24); color: #fff !important; font-family: inherit; font-size: 14px; font-weight: 800; letter-spacing: .2px;
  text-decoration: none !important; box-shadow: 0 6px 14px -6px rgba(15,61,36,.6); transition: filter .15s; }
.ofc-book:hover { filter: brightness(1.12); }
.ofc-book:hover .ofc-arr { transform: translateX(3px); }
@media (prefers-reduced-motion: reduce) { .ofc-col { animation: none !important; } }
/* one-line ticket (phone + desktop header) */
.ofc-m { position: relative; flex-basis: 100%; display: flex; align-items: center; gap: 10px; padding: 7px 10px 7px 12px; margin-top: 10px;
  background: linear-gradient(105deg, #fff9e6 0%, #fdeec4 55%, #fbe3a6 100%); border: 1px dashed #c9971f; border-radius: 10px;
  box-shadow: 0 2px 10px rgba(201, 151, 31, .18); overflow: hidden; isolation: isolate;
  animation: ofcIn .5s cubic-bezier(.2,.8,.2,1) both; transition: transform .18s ease, box-shadow .18s ease; }
.ofc-m:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(201, 151, 31, .28); }
/* ticket notches cut into both ends */
.ofc-m::before, .ofc-m::after { content: ""; position: absolute; top: 50%; width: 12px; height: 12px; margin-top: -6px; border-radius: 50%; background: #fff; box-shadow: inset 0 0 0 1px rgba(201,151,31,.55); z-index: 2; }
.ofc-m::before { left: -6px; } .ofc-m::after { right: -6px; }
.ofc-nw { white-space: nowrap; }
.ofc-m:not(.ofc-w) .ofc-dot { display: none; } /* phone: the code sits on its own line */
.ofc-m:not(.ofc-w) .ofc-nw { display: block; margin-top: 2px; }
/* light sweeping across every few seconds */
.ofc-shine { position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.75) 45%, transparent 60%); background-size: 250% 100%; background-position: 150% 0;
  animation: ofcShine 4.5s ease-in-out 1s infinite; }
.ofc-m > :not(.ofc-shine) { position: relative; z-index: 1; }
.ofc-ic { flex: 0 0 28px; height: 28px; border-radius: 8px; background: linear-gradient(145deg, #f2c94c, #c98f1c); color: #fff; display: grid; place-items: center;
  font-weight: 900; font-size: 14px; text-shadow: 0 1px 1px rgba(120,80,0,.35); box-shadow: inset 0 1px 0 rgba(255,255,255,.5), 0 2px 6px rgba(201,143,28,.35);
  animation: ofcWiggle 4.5s ease-in-out 1.6s infinite; }
.ofc-m .ofc-t { flex: 1; min-width: 0; font-size: 12.5px; color: #4a3d1c; line-height: 1.35; }
.ofc-m .ofc-t b { color: #14532d; font-weight: 900; letter-spacing: .2px; }
.ofc-code { border: 1px dashed #b8913a; background: rgba(255,255,255,.75); border-radius: 5px; padding: 1px 6px; margin-left: 2px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px; font-weight: 800; letter-spacing: .8px; color: #0f172a; cursor: pointer; transition: background .15s; }
.ofc-code:hover { background: #fff; }
.ofc-pop { display: inline-block; color: #15803d; animation: ofcPop .35s ease-out; }
.ofc-m .ofc-go { flex-shrink: 0; margin: 0; display: inline-flex; align-items: center; gap: 4px; background: #14532d; color: #fff !important; border-radius: 999px; padding: 5px 12px;
  font-size: 12px; font-weight: 800; white-space: nowrap; text-decoration: none !important; box-shadow: 0 2px 6px rgba(20,83,45,.3); transition: background .15s; }
.ofc-m .ofc-go:hover { background: #0f3d24; text-decoration: none !important; }
.ofc-arr { display: inline-block; transition: transform .18s ease; }
.ofc-m .ofc-go:hover .ofc-arr { transform: translateX(3px); }
.ofc-w { display: inline-flex; max-width: 100%; margin-top: 14px; padding: 7px 10px 7px 14px; }
.ofc-w .ofc-t { font-size: 13px; }
.ofc-w .ofc-go { margin-left: 8px; }
.ofc-more-i { font-size: 12px; color: #8a6d2b; }
@keyframes ofcIn { from { opacity: 0; transform: translateY(6px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes ofcShine { 0% { background-position: 150% 0; } 45%, 100% { background-position: -60% 0; } }
@keyframes ofcWiggle { 0%, 82%, 100% { transform: rotate(0); } 86% { transform: rotate(-12deg) scale(1.08); } 90% { transform: rotate(10deg) scale(1.08); } 94% { transform: rotate(-5deg); } }
@keyframes ofcPop { 0% { transform: scale(.7); opacity: 0; } 70% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .ofc-m, .ofc-shine, .ofc-ic, .ofc-pop { animation: none !important; } .ofc-m:hover { transform: none; } }
`;

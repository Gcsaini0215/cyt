import React, { useEffect, useRef, useState } from "react";
import { invoiceNumber, toAmount } from "../../utils/invoice-template";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

/* A session receipt styled like a ticket: just the session details and what was paid — no
   letterhead. Used by the client portal and the therapist portal (which passes `therapist`).
   ReceiptModal is the same ticket for any payment (e.g. the therapist's Clinical Assessments add-on):
   pass d = { brand, topLabel, topName, topSub, rows: [{ l, v, wide }], paid, saved, receiptNo, paymentId }.

   - On screen it fits the device (compact two-column layout on phones).
   - Print / PDF always use a fixed, wide copy rendered off-screen, so the file looks the same
     from any device. The PDF is made as soon as the popup opens: browsers only allow
     navigator.share() straight after a tap, so Share must not wait for the PDF. */

const TZ = "Asia/Kolkata";
const day = (d) => new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const time = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ }).toUpperCase();
// when the booking was made: the payment time, else the time inside the booking's ObjectId
const bookedAt = (b) => {
  const t = b.transaction?.createdAt && new Date(b.transaction.createdAt);
  if (t && !isNaN(t)) return t;
  const id = String(b._id || "");
  return /^[a-f0-9]{24}$/i.test(id) ? new Date(parseInt(id.slice(0, 8), 16) * 1000) : null;
};
const modeOf = (b) => {
  const s = `${b.session_type || ""} ${b.format || ""}`.toLowerCase();
  if (/person|offline|clinic/.test(s)) return "In-person";
  if (/audio|voice|call/.test(s) && !/video/.test(s)) return "Voice call";
  return "Video call";
};
const SCALE = 3; // PDF sharpness (3× the on-screen pixels)

function Ticket({ d, render = false, innerRef }) {
  return (
    <div className={`tk ${render ? "tk-render" : "tk-view"}`} ref={innerRef} aria-hidden={render || undefined}>
      <div className="tk-main">
        <div className="tk-brand">
          <span><img src="/cyt-emblem.png" alt="" width="20" height="20" /> {d.brand || "Session receipt"}</span>
          <small>Choose Your Therapist</small>
        </div>
        <div className="tk-who">
          <span className="l">{d.topLabel}</span>
          <b>{d.topName}</b>
          {d.topSub && <em>{d.topSub}</em>}
        </div>
        <div className="tk-rows">
          {d.rows.map((r) => <div key={r.l} className={`tk-row${r.wide ? " wide" : ""}`}><span className="l">{r.l}</span><b>{r.v}</b></div>)}
        </div>
      </div>

      <div className="tk-cut" aria-hidden="true" />

      <div className="tk-stub">
        <div className="tk-amtbox">
          <span className="l">Amount paid</span>
          <b className="tk-amt">{d.paid}</b>
          {d.saved && <em className="tk-save">{d.saved}</em>}
        </div>
        <span className="tk-paid">Paid</span>
        <div className="tk-nos">
          <div className="tk-no"><span className="l">Receipt no.</span><b>{d.receiptNo}</b></div>
          {d.paymentId && <div className="tk-no"><span className="l">Payment ID</span><b>{d.paymentId}</b></div>}
        </div>
        <div className="tk-web">www.chooseyourtherapist.in</div>
      </div>
    </div>
  );
}

export default function SessionTicket({ b, therapist: me = null, onClose }) {

  const tx = b.transaction || {};
  const paid = toAmount(tx.amount ?? b.amount);
  const fee = Math.max(toAmount(b.amount), paid);
  const receiptNo = invoiceNumber(b);
  const booked = bookedAt(b);
  const fileName = `Session-${receiptNo}.pdf`;
  const inr = (n) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  // the therapist portal passes its own profile; the client portal uses the booking's
  const therapistName = me?.user?.name || b.therapist?.user?.name || "Therapist";
  const therapistType = me?.profile_type || b.therapist?.profile_type || "";
  const clientName = b.client?.name || "Client";
  const sessionFor = /other/i.test(b.whom || "") ? (b.cname || b.relation_with_client || "") : "";
  const isTherapist = !!me; // whoever is looking gets their own name on top
  const SHORT = { phq9: "PHQ-9", gad7: "GAD-7", dass21: "DASS-21", k10: "K10", pcl5: "PCL-5", phq15: "PHQ-15", audit: "AUDIT", asrs: "ASRS", epds: "EPDS", cbi: "CBI", rses: "RSES", bigfive: "IPIP-50" };
  const assessList = (Array.isArray(b.assessments) ? b.assessments : []).map((a) => ({ k: SHORT[a.tool] || a.tool, fee: Number(a.fee) || 0 }));
  const assessTotal = assessList.reduce((n, a) => n + a.fee, 0);
  const d = {
    assess: assessList.map((a) => ({ k: a.k, v: inr(a.fee) })),
    sessionFee: inr(Math.max(0, paid - assessTotal)),
    therapist: therapistName,
    topLabel: isTherapist ? "Therapist" : "Client",
    topName: isTherapist ? therapistName : clientName,
    topSub: isTherapist ? therapistType : "",
    otherLabel: isTherapist ? "Client" : "Therapist",
    otherName: isTherapist ? clientName : `${therapistName}${therapistType ? ` · ${therapistType}` : ""}`,
    sessionFor,
    date: day(b.booking_date),
    time: `${time(b.booking_date)} IST`,
    mode: modeOf(b),
    service: b.service || "Therapy session",
    paidVia: tx.payment_method || "",
    booked: booked ? `${day(booked)}, ${time(booked)}` : "",
    paid: inr(paid),
    saved: fee > paid ? `Fee ${inr(fee)} · saved ${inr(fee - paid)}` : "",
    receiptNo,
    paymentId: tx.transaction_id ? String(tx.transaction_id) : "",
  };
  d.rows = [
    { l: "Session date", v: d.date },
    { l: "Session time", v: d.time },
    { l: "Mode", v: d.mode },
    { l: "Service", v: d.service },
    { l: d.otherLabel, v: d.otherName },
    ...(d.sessionFor ? [{ l: "Session for", v: d.sessionFor }] : []),
    ...(d.assess.length ? [{ l: "Session fee", v: d.sessionFee }] : []),
    ...d.assess.map((x) => ({ l: `${x.k} assessment`, v: x.v })),
    ...(d.paidVia ? [{ l: "Paid via", v: d.paidVia }] : []),
    ...(d.booked ? [{ l: "Booked on", v: d.booked, wide: true }] : []),
  ];
  return <ReceiptModal d={d} fileName={fileName} title="Session receipt" shareText={`Session with ${d.therapist} — ${d.date}`} onClose={onClose} />;
}

// the ticket in a popup, with Print / Download / Share PDF
export function ReceiptModal({ d, fileName, title = "Receipt", shareText = "", onClose }) {
  const renderRef = useRef(null);
  const [pdf, setPdf] = useState(null); // Blob, made when the popup opens
  const [pdfErr, setPdfErr] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // make the PDF from the wide off-screen copy as soon as the popup opens
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
        const el = renderRef.current;
        const img = el?.querySelector("img");
        if (img && !img.complete) await new Promise((r) => { img.onload = r; img.onerror = r; });
        const canvas = await html2canvas(el, { scale: SCALE, backgroundColor: "#ffffff", useCORS: true, logging: false });
        const w = canvas.width / SCALE, h = canvas.height / SCALE, m = 24;
        const doc = new jsPDF({ orientation: "landscape", unit: "px", format: [w + m * 2, h + m * 2], hotfixes: ["px_scaling"], compress: true });
        doc.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", m, m, w, h, undefined, "FAST");
        if (alive) setPdf(doc.output("blob"));
      } catch (e) {
        if (alive) setPdfErr(true);
      }
    })();
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveFile = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const download = () => { setMsg(""); if (pdf) saveFile(pdf); };

  // called straight from the tap, with the PDF already made
  const share = () => {
    setMsg("");
    if (!pdf) return;
    const file = new File([pdf], fileName, { type: "application/pdf" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title, text: shareText })
        .catch((e) => { if (e?.name !== "AbortError") { saveFile(pdf); setMsg("Couldn't open sharing — the PDF was downloaded instead."); } });
    } else {
      saveFile(pdf);
      setMsg("Sharing files isn't supported in this browser — the PDF was downloaded instead.");
    }
  };

  // print the page itself with only the wide receipt visible (works on phones too)
  const print = () => {
    setMsg("");
    const root = document.createElement("div");
    root.className = "tk-print-root";
    root.appendChild(renderRef.current.cloneNode(true));
    document.body.appendChild(root);
    document.body.classList.add("tk-printing");
    const done = () => { document.body.classList.remove("tk-printing"); root.remove(); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    setTimeout(() => { window.print(); setTimeout(done, 2000); }, 80);
  };

  const ready = !!pdf;
  return (
    <div className="tk-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style dangerouslySetInnerHTML={{ __html: TK_CSS + TK_UI_CSS }} />
      <div className="tk-modal" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="tk-x" onClick={onClose} aria-label="Close"><CloseRoundedIcon /></button>
        <Ticket d={d} />
        <div className="tk-acts">
          <button type="button" className="tk-btn" onClick={print}><PrintRoundedIcon /> Print</button>
          <button type="button" className="tk-btn" onClick={download} disabled={!ready}><FileDownloadRoundedIcon /> {ready ? "Download" : "Preparing…"}</button>
          <button type="button" className="tk-btn primary" onClick={share} disabled={!ready}><IosShareRoundedIcon /> {ready ? "Share PDF" : "Preparing…"}</button>
        </div>
        {(msg || pdfErr) && <p className="tk-msg">{msg || "Couldn't make the PDF here — please use Print and choose \"Save as PDF\"."}</p>}
      </div>
      {/* wide copy for the PDF and for printing (kept off-screen) */}
      <div className="tk-offscreen"><Ticket d={d} render innerRef={renderRef} /></div>
    </div>
  );
}

// the receipt (wide layout = PDF / print; .tk-view adapts on phones)
const TK_CSS = `
.tk { display: flex; width: 100%; max-width: 640px; margin: 0 auto; color: #1f2937; font-family: Inter, "Segoe UI", Arial, sans-serif;
  background: #fff; border: 1px solid #d9dee3; border-radius: 10px; box-shadow: 0 1px 2px rgba(15,23,42,.06), 0 10px 24px -14px rgba(15,23,42,.25); }
.tk-render { width: 680px; max-width: none; box-shadow: none; }
.tk * { box-sizing: border-box; }
.tk-main { flex: 1; min-width: 0; padding: 20px 22px; }
.tk-brand { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
.tk-brand > span { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #111827; }
.tk-brand img { display: block; }
.tk-brand small { font-size: 10.5px; color: #6b7280; font-weight: 600; letter-spacing: .3px; }
.tk span.l { display: block; font-size: 10px; font-weight: 600; letter-spacing: .9px; text-transform: uppercase; color: #6b7280; }
.tk b { display: block; font-weight: 700; color: #111827; }
.tk-who { margin-top: 14px; }
.tk-who b { font-size: 18px; margin-top: 2px; }
.tk-who em { display: block; font-style: normal; font-size: 12.5px; color: #4b5563; margin-top: 1px; }
.tk-rows { margin-top: 14px; border-top: 1px solid #e5e7eb; }
.tk-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 8px 0; border-bottom: 1px dotted #d1d5db; }
.tk-row span.l { flex-shrink: 0; }
.tk-row b { font-size: 13.5px; text-align: right; overflow-wrap: anywhere; }
.tk-cut { width: 20px; flex-shrink: 0; position: relative;
  background-image: linear-gradient(#c4cad1 55%, transparent 0); background-size: 1.5px 10px; background-repeat: repeat-y; background-position: center; }
.tk-cut::before, .tk-cut::after { content: ""; position: absolute; left: 50%; width: 20px; height: 20px; margin-left: -10px; border-radius: 50%; background: #eceef0; border: 1px solid #d9dee3; }
.tk-cut::before { top: -11px; border-top-color: transparent; } .tk-cut::after { bottom: -11px; border-bottom-color: transparent; }
.tk-render .tk-cut::before, .tk-render .tk-cut::after { background: #fff; }
.tk-stub { width: 200px; flex-shrink: 0; padding: 20px 18px; display: flex; flex-direction: column; gap: 10px; }
.tk-paid { align-self: flex-start; font-size: 11px !important; font-weight: 800 !important; letter-spacing: 2px !important; color: #15803d !important; border: 1.5px solid #15803d; border-radius: 4px; padding: 2px 8px; transform: rotate(-4deg); text-transform: uppercase; }
.tk-amt { font-size: 26px; line-height: 1.1; letter-spacing: -.3px; margin-top: 2px; }
.tk-save { display: block; font-style: normal; font-size: 11.5px; color: #4b5563; margin-top: 4px; }
.tk-nos { display: flex; flex-direction: column; gap: 10px; }
.tk-no b { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; font-size: 11.5px; font-weight: 600; overflow-wrap: anywhere; margin-top: 2px; }
.tk-web { margin-top: auto; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 10.5px; color: #6b7280; }

/* phones: one compact card — details in two columns, amount + PAID on one line */
@media (max-width: 560px) {
  .tk-view { flex-direction: column; }
  .tk-view .tk-main { padding: 14px 16px 10px; }
  .tk-view .tk-brand { padding-bottom: 10px; }
  .tk-view .tk-brand small { display: none; }
  .tk-view .tk-who { margin-top: 10px; }
  .tk-view .tk-who b { font-size: 16px; }
  .tk-view .tk-rows { display: grid; grid-template-columns: 1fr 1fr; column-gap: 14px; margin-top: 10px; }
  .tk-view .tk-row { flex-direction: column; align-items: flex-start; gap: 1px; padding: 6px 0; }
  .tk-view .tk-row.wide { grid-column: 1 / -1; }
  .tk-view .tk-row b { font-size: 12.5px; text-align: left; }
  .tk-view .tk-cut { width: auto; height: 18px; background-image: linear-gradient(90deg, #c4cad1 55%, transparent 0); background-size: 10px 1.5px; background-repeat: repeat-x; }
  .tk-view .tk-cut::before, .tk-view .tk-cut::after { top: 50%; margin: -10px 0 0; }
  .tk-view .tk-cut::before { left: -11px; border-top-color: #d9dee3; border-left-color: transparent; }
  .tk-view .tk-cut::after { right: -11px; left: auto; bottom: auto; border-bottom-color: #d9dee3; border-right-color: transparent; }
  .tk-view .tk-stub { width: auto; padding: 10px 16px 14px; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px 12px; }
  .tk-view .tk-paid { align-self: center; }
  .tk-view .tk-amt { font-size: 22px; }
  .tk-view .tk-nos { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb; }
  .tk-view .tk-no b { font-size: 10.5px; }
  .tk-view .tk-web { display: none; }
}
`;

// the popup around it, plus print rules
const TK_UI_CSS = `
.tk-overlay { position: fixed; inset: 0; z-index: 1500; background: rgba(15,23,42,.55); display: flex; align-items: flex-start; justify-content: center; padding: 16px; overflow-y: auto; }
.tk-modal { position: relative; margin: auto; width: 100%; max-width: 680px; background: #eceef0; border-radius: 22px; padding: 48px 18px 18px; }
.tk-x { position: absolute; top: 8px; right: 8px; width: 34px; height: 34px; border-radius: 10px; border: 0; background: #fff; color: #334155; display: grid; place-items: center; cursor: pointer; z-index: 2; }
.tk-acts { display: flex; gap: 8px; margin-top: 16px; }
.tk-btn { flex: 1; min-width: 0; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 44px; padding: 0 8px; border-radius: 10px; border: 1px solid #d1d5db; background: #fff; color: #111827; font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit; white-space: nowrap; }
.tk-btn svg { font-size: 19px; flex-shrink: 0; }
.tk-btn.primary { background: #111827; color: #fff; border-color: #111827; }
.tk-btn:disabled { opacity: .6; cursor: default; }
.tk-msg { margin: 10px 0 0; font-size: 12.5px; color: #92400e; font-weight: 600; text-align: center; }
.tk-offscreen { position: fixed; left: -10000px; top: 0; pointer-events: none; }
@media (max-width: 560px) {
  .tk-overlay { padding: 10px; }
  .tk-modal { padding: 44px 10px 10px; border-radius: 18px; }
  .tk-x { top: 6px; right: 6px; }
  .tk-acts { gap: 6px; margin-top: 10px; }
  .tk-btn { height: 42px; font-size: 13px; gap: 4px; }
  .tk-btn svg { font-size: 17px; }
}
.tk-print-root { display: none; }
@media print {
  @page { size: A4 portrait; margin: 14mm; }
  body.tk-printing > *:not(.tk-print-root) { display: none !important; }
  body.tk-printing .tk-print-root { display: block; }
  body.tk-printing .tk-print-root .tk { width: 100%; max-width: 182mm; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

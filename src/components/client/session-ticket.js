import React, { useEffect, useRef, useState } from "react";
import { invoiceNumber, toAmount } from "../../utils/invoice-template";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

/* The client's receipt for one session, styled like a ticket: just the session details and
   what was paid — no letterhead. Print prints only the ticket; Share / Download make a PDF. */

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

export default function SessionTicket({ b, therapist: me = null, onClose }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tx = b.transaction || {};
  const paid = toAmount(tx.amount ?? b.amount);
  const ticketNo = invoiceNumber(b);
  // the therapist portal passes its own profile; the client portal uses the booking's
  const therapist = me?.user?.name || b.therapist?.user?.name || "Your therapist";
  const therapistType = me?.profile_type || b.therapist?.profile_type || "";
  const forOther = /other/i.test(b.whom || "") ? (b.cname || b.relation_with_client || "Someone else") : "";
  const fileName = `Session-${ticketNo}.pdf`;
  const booked = bookedAt(b);
  const fee = Math.max(toAmount(b.amount), paid);

  const makePdf = async () => {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
    const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const w = canvas.width / 2, h = canvas.height / 2; // CSS px
    const pdf = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "px", format: [w + 32, h + 32], hotfixes: ["px_scaling"] });
    pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, w + 32, h + 32, "F");
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.9), "JPEG", 16, 16, w, h); // JPEG keeps the file ~10x smaller than PNG
    return pdf.output("blob");
  };

  const download = async () => {
    setBusy("download"); setMsg("");
    try {
      const url = URL.createObjectURL(await makePdf());
      const a = document.createElement("a"); a.href = url; a.download = fileName; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) { setMsg("Couldn't make the PDF — please try Print instead"); }
    setBusy("");
  };

  const share = async () => {
    setBusy("share"); setMsg("");
    try {
      const file = new File([await makePdf()], fileName, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Session receipt", text: `Session with ${therapist} — ${day(b.booking_date)}` });
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a"); a.href = url; a.download = fileName; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        setMsg("Sharing isn't supported here — the PDF was downloaded instead.");
      }
    } catch (e) {
      if (e?.name !== "AbortError") setMsg("Couldn't share the PDF — try Download instead");
    }
    setBusy("");
  };

  // print just the ticket: copy it into a hidden frame with its own styles
  const print = () => {
    const f = document.createElement("iframe");
    f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(f);
    const d = f.contentWindow.document;
    d.open();
    d.write(`<!doctype html><html><head><meta charset="utf-8"><title>${ticketNo}</title><base href="${window.location.origin}/">
      <style>@page{size:A4 portrait;margin:18mm}body{margin:0;font-family:Inter,"Segoe UI",Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}${TK_CSS}.tk{box-shadow:none}.tk-cut::before,.tk-cut::after{background:#fff}</style>
      </head><body>${ref.current.outerHTML}</body></html>`);
    d.close();
    const go = () => { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 1500); };
    const img = d.querySelector("img");
    if (img && !img.complete) { img.onload = go; img.onerror = go; } else setTimeout(go, 150);
  };

  return (
    <div className="tk-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style dangerouslySetInnerHTML={{ __html: TK_CSS + TK_UI_CSS }} />
      <div className="tk-modal" role="dialog" aria-modal="true" aria-label="Session receipt">
        <button type="button" className="tk-x" onClick={onClose} aria-label="Close"><CloseRoundedIcon /></button>

        <div className="tk" ref={ref}>
          <div className="tk-main">
            <div className="tk-brand">
              <span><img src="/cyt-emblem.png" alt="" width="20" height="20" /> Session receipt</span>
              <small>Choose Your Therapist</small>
            </div>
            <div className="tk-who">
              <span className="l">Therapist</span>
              <b>{therapist}</b>
              {therapistType && <em>{therapistType}</em>}
            </div>
            <div className="tk-rows">
              <div className="tk-row"><span className="l">Session date</span><b>{day(b.booking_date)}</b></div>
              <div className="tk-row"><span className="l">Session time</span><b>{time(b.booking_date)} IST</b></div>
              <div className="tk-row"><span className="l">Mode</span><b>{modeOf(b)}</b></div>
              <div className="tk-row"><span className="l">Service</span><b>{b.service || "Therapy session"}</b></div>
              <div className="tk-row"><span className="l">Client</span><b>{forOther || b.client?.name || "Myself"}</b></div>
              {booked && <div className="tk-row"><span className="l">Booked on</span><b>{day(booked)}, {time(booked)}</b></div>}
              {tx.payment_method && <div className="tk-row"><span className="l">Paid via</span><b>{tx.payment_method}</b></div>}
            </div>
          </div>

          <div className="tk-cut" aria-hidden="true" />

          <div className="tk-stub">
            <span className="l">Amount paid</span>
            <b className="tk-amt">₹{paid.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</b>
            {fee > paid && <em className="tk-save">Fee ₹{fee.toLocaleString("en-IN")} · saved ₹{(fee - paid).toLocaleString("en-IN")}</em>}
            <span className="tk-paid">Paid</span>
            <div className="tk-no"><span className="l">Receipt no.</span><b>{ticketNo}</b></div>
            {tx.transaction_id && <div className="tk-no"><span className="l">Payment ID</span><b>{String(tx.transaction_id)}</b></div>}
            <div className="tk-web">www.chooseyourtherapist.in</div>
          </div>
        </div>

        <div className="tk-acts">
          <button type="button" className="tk-btn" onClick={print}><PrintRoundedIcon /> Print</button>
          <button type="button" className="tk-btn" onClick={download} disabled={!!busy}><FileDownloadRoundedIcon /> {busy === "download" ? "Making PDF…" : "Download PDF"}</button>
          <button type="button" className="tk-btn primary" onClick={share} disabled={!!busy}><IosShareRoundedIcon /> {busy === "share" ? "Making PDF…" : "Share PDF"}</button>
        </div>
        {msg && <p className="tk-msg">{msg}</p>}
      </div>
    </div>
  );
}

// the ticket itself (also copied into the print frame)
const TK_CSS = `
.tk { display: flex; width: 100%; max-width: 640px; margin: 0 auto; color: #1f2937; font-family: Inter, "Segoe UI", Arial, sans-serif;
  background: #fff; border: 1px solid #d9dee3; border-radius: 10px; box-shadow: 0 1px 2px rgba(15,23,42,.06), 0 10px 24px -14px rgba(15,23,42,.25); }
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
.tk-stub { width: 200px; flex-shrink: 0; padding: 20px 18px; display: flex; flex-direction: column; gap: 10px; }
.tk-paid { align-self: flex-start; font-size: 11px !important; font-weight: 800 !important; letter-spacing: 2px !important; color: #15803d !important; border: 1.5px solid #15803d; border-radius: 4px; padding: 2px 8px; transform: rotate(-4deg); text-transform: uppercase; }
.tk-amt { font-size: 26px; line-height: 1.1; letter-spacing: -.3px; margin-top: -4px; }
.tk-save { font-style: normal; font-size: 11.5px; color: #4b5563; }
.tk-no b { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; font-size: 11.5px; font-weight: 600; overflow-wrap: anywhere; margin-top: 2px; }
.tk-web { margin-top: auto; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 10.5px; color: #6b7280; }
@media (max-width: 560px) {
  .tk { flex-direction: column; }
  .tk-cut { width: auto; height: 20px; background-image: linear-gradient(90deg, #c4cad1 55%, transparent 0); background-size: 10px 1.5px; background-repeat: repeat-x; }
  .tk-cut::before, .tk-cut::after { top: 50%; margin: -10px 0 0; }
  .tk-cut::before { left: -11px; border-top-color: #d9dee3; border-left-color: transparent; }
  .tk-cut::after { right: -11px; left: auto; bottom: auto; border-bottom-color: #d9dee3; border-right-color: transparent; }
  .tk-stub { width: auto; }
}
`;

// the popup around it
const TK_UI_CSS = `
.tk-overlay { position: fixed; inset: 0; z-index: 1500; background: rgba(15,23,42,.55); display: flex; align-items: flex-start; justify-content: center; padding: 16px; overflow-y: auto; }
.tk-modal { position: relative; margin: auto; width: 100%; max-width: 680px; background: #eceef0; border-radius: 22px; padding: 48px 18px 18px; }
.tk-x { position: absolute; top: 8px; right: 8px; width: 34px; height: 34px; border-radius: 10px; border: 0; background: #fff; color: #334155; display: grid; place-items: center; cursor: pointer; z-index: 2; }
.tk-acts { display: flex; gap: 8px; margin-top: 18px; flex-wrap: wrap; }
.tk-btn { flex: 1; min-width: 130px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 44px; border-radius: 10px; border: 1px solid #d1d5db; background: #fff; color: #111827; font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit; }
.tk-btn svg { font-size: 19px; }
.tk-btn.primary { background: #111827; color: #fff; border-color: #111827; }
.tk-btn:disabled { opacity: .65; cursor: default; }
.tk-msg { margin: 10px 0 0; font-size: 12.5px; color: #92400e; font-weight: 600; text-align: center; }
`;

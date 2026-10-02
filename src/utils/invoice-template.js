// Shared A4 invoice / payment receipt for therapist session bookings — used by
// the Appointments modal and the Invoices page (Print and Download PDF both
// open the browser print dialog; "Save as PDF" there gives the PDF).
//
// The invoice is issued by the THERAPIST (their name, location, phone,
// email) for a session booked through Choose Your Therapist — CYT appears as
// the platform/brand only, never as the seller's address. Only facts we hold
// are printed: no GSTIN or tax lines.

const PLATFORM = {
  name: "Choose Your Therapist",
  tagline: "Verified psychologists · Online & in-person therapy",
  web: "www.chooseyourtherapist.in",
  hfrId: "IN0510005384",
};

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const num = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "object" && v.$numberDecimal !== undefined) return parseFloat(v.$numberDecimal) || 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const inr = (n) => "₹" + num(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d, opts) => {
  const dt = d ? new Date(d) : null;
  return dt && !isNaN(dt.getTime())
    ? dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata", ...opts })
    : "—";
};
const fmtTime = (d) => {
  const dt = d ? new Date(d) : null;
  return dt && !isNaN(dt.getTime())
    ? dt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })
    : "—";
};

// Indian-system amount in words, e.g. 1200 -> "One Thousand Two Hundred Rupees Only"
function amountInWords(amount) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (n) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? " " + ones[n % 10] : ""}`);
  const three = (n) => `${n >= 100 ? ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " : "") : ""}${n % 100 ? two(n % 100) : ""}`;
  let n = Math.floor(num(amount));
  const paise = Math.round((num(amount) - n) * 100);
  if (n === 0 && paise === 0) return "Zero Rupees Only";
  const parts = [];
  const crore = Math.floor(n / 1e7); n %= 1e7;
  const lakh = Math.floor(n / 1e5); n %= 1e5;
  const thousand = Math.floor(n / 1e3); n %= 1e3;
  if (crore) parts.push(`${three(crore)} Crore`);
  if (lakh) parts.push(`${two(lakh)} Lakh`);
  if (thousand) parts.push(`${two(thousand)} Thousand`);
  if (n) parts.push(three(n));
  return `${parts.join(" ")} Rupees${paise ? ` and ${two(paise)} Paise` : ""} Only`;
}

/** Stable invoice number, e.g. CYT-102026-HZMY6T (month+year of payment + last 6 of txn id). */
export function invoiceNumber(booking) {
  const b = booking || {};
  const tx = b.transaction || {};
  return `CYT-${fmtDate(tx.createdAt || b.booking_date, { year: "numeric", month: "2-digit", day: undefined }).replace(/[^0-9]/g, "")}-${(tx.transaction_id || b._id || "").toString().slice(-6).toUpperCase()}`;
}

export const toAmount = num;

/**
 * @param {object} booking  booking as returned by /get-bookings (client + transaction populated)
 * @param {object} [therapist]  therapist store info ({ user: { name }, qualification, profile_type })
 */
export function buildInvoiceHtml(booking, therapist) {
  const b = booking || {};
  const tx = b.transaction || {};
  const client = b.client || {};
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.chooseyourtherapist.in";

  const paid = num(tx.amount ?? b.amount);
  const fee = Math.max(num(b.amount), paid);
  const discount = Math.max(0, fee - paid);
  const statusName = (tx.status?.name || b.payment_status || "").toString();
  const isPaid = /success|paid|completed/i.test(statusName) || (!!tx.transaction_id && !/fail|pending/i.test(statusName));
  const invoiceNo = invoiceNumber(b);
  const tUser = therapist?.user || b.therapist?.user || {};
  const therapistName = tUser.name || "";
  const tPhone = tUser.phone || "";
  const tEmail = tUser.email || "";
  const tPlace = [therapist?.office_city, therapist?.office_state || therapist?.state, therapist?.office_pincode].filter(Boolean).join(", ");
  const qual = therapist?.qualification
    ? (Array.isArray(therapist.qualification) ? therapist.qualification.map((q) => q?.label || q?.value || q).join(", ") : therapist.qualification?.label || therapist.qualification)
    : therapist?.profile_type || "";
  const description = [b.service || "Therapy Session", b.session_type].filter(Boolean).join(" — ");
  const mode = b.format || "Online";
  const whom = b.whom && b.whom !== "Whom" ? b.whom : "";

  return `<!doctype html>
<html><head><meta charset="utf-8">
<title>Invoice ${esc(invoiceNo)} — ${esc(client.name || "Client")}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: #e9ecea; }
  body { font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif; color: #14251b; font-size: 12.5px; }
  .page { position: relative; width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; display: flex; flex-direction: column; overflow: hidden; }
  @media screen { .page { margin: 16px auto; box-shadow: 0 10px 40px rgba(0,0,0,.12); } }

  .wm { position: absolute; left: 50%; top: 52%; width: 125mm; transform: translate(-50%, -50%); opacity: .045; pointer-events: none; z-index: 0; }
  .page > *:not(.wm):not(.stamp) { position: relative; z-index: 1; }

  .band { background: linear-gradient(135deg, #0f3d24 0%, #134e2b 60%, #17663a 100%); color: #fff; padding: 14mm 16mm 11mm; display: flex; justify-content: space-between; align-items: flex-start; gap: 10mm; }
  .band-logo { background: #fff; border-radius: 10px; padding: 7px 12px; display: inline-flex; }
  .band-logo img { height: 34px; display: block; }
  .co { margin-top: 10px; font-size: 10.5px; line-height: 1.6; color: rgba(255,255,255,.78); max-width: 92mm; }
  .co b { color: #fff; font-size: 13px; }
  .co .issued { display: block; font-size: 9px; letter-spacing: 1.4px; text-transform: uppercase; color: #f2c94c; font-weight: 700; margin-bottom: 2px; }
  .co .via { color: rgba(255,255,255,.6); font-size: 10px; }
  .doc { text-align: right; }
  .doc h1 { margin: 0; font-size: 26px; letter-spacing: 3px; font-weight: 800; }
  .doc .sub { font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase; color: #f2c94c; font-weight: 700; margin-top: 2px; }
  .doc table { margin: 12px 0 0 auto; border-collapse: collapse; font-size: 11px; }
  .doc td { padding: 2px 0 2px 14px; }
  .doc td:first-child { color: rgba(255,255,255,.6); text-align: right; }
  .doc td:last-child { font-weight: 700; text-align: right; }
  .gold { height: 3px; background: linear-gradient(90deg, #c9962c, #f2c94c, #c9962c); }

  .content { padding: 9mm 16mm 0; flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 7mm; }
  .parties { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6mm; }
  .party { border: 1px solid #e3e9e5; border-top: 3px solid #0f3d24; border-radius: 10px; padding: 13px 15px 14px; background: rgba(255,255,255,.88); }
  .lbl { font-size: 9px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #8a978f; margin: 0 0 6px; }
  .party .nm { font-size: 13.5px; font-weight: 800; margin: 0 0 3px; }
  .party .ln { font-size: 11px; color: #4b5c52; line-height: 1.55; margin: 0; word-break: break-word; }

  table.items { width: 100%; border-collapse: collapse; }
  table.items thead th { background: #0f3d24; color: #fff; font-size: 9.5px; letter-spacing: 1px; text-transform: uppercase; font-weight: 700; padding: 9px 10px; text-align: left; }
  table.items thead th:first-child { border-radius: 8px 0 0 8px; }
  table.items thead th:last-child { border-radius: 0 8px 8px 0; text-align: right; }
  table.items td { padding: 14px 10px; border-bottom: 1px solid #edf1ee; vertical-align: top; }
  table.items td.r, table.items th.r { text-align: right; }
  .it-name { font-weight: 800; font-size: 12.5px; }
  .it-meta { color: #5b6b62; font-size: 10.5px; margin-top: 3px; line-height: 1.5; }

  .sumrow { display: grid; grid-template-columns: 1.15fr 1fr; gap: 8mm; align-items: start; }
  .words { border-left: 3px solid #c9962c; background: #fbf8ef; padding: 10px 14px; border-radius: 0 8px 8px 0; }
  .words p { margin: 0; font-weight: 700; font-size: 11.5px; line-height: 1.5; }
  .pay { margin-top: 5mm; border: 1px solid #e3e9e5; border-radius: 10px; padding: 12px 14px; }
  .pay table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .pay td { padding: 3px 0; }
  .pay td:first-child { color: #6b7a71; width: 42%; }
  .pay td:last-child { font-weight: 700; word-break: break-all; }
  .totals { border: 1px solid #e3e9e5; border-radius: 10px; overflow: hidden; }
  .totals table { width: 100%; border-collapse: collapse; }
  .totals td { padding: 9px 14px; font-size: 12px; }
  .totals td:last-child { text-align: right; font-weight: 700; }
  .totals tr + tr td { border-top: 1px solid #edf1ee; }
  .totals .grand td { background: #0f3d24; color: #fff; font-size: 15px; font-weight: 800; }
  .totals .bal td { color: #166534; }

  .stamp { position: absolute; right: 16mm; top: 47mm; transform: rotate(-14deg); border: 3px solid ${isPaid ? "#16a34a" : "#d97706"}; color: ${isPaid ? "#16a34a" : "#d97706"}; font-weight: 800; font-size: 18px; letter-spacing: 4px; padding: 3px 14px; border-radius: 8px; opacity: .6; z-index: 2; background: rgba(255,255,255,.6); }

  .notes { display: grid; grid-template-columns: 1.25fr 1fr 0.95fr; gap: 6mm; align-items: stretch; }
  .card { border: 1px solid #e3e9e5; border-radius: 10px; padding: 12px 14px; background: rgba(255,255,255,.88); }
  .help p { margin: 0 0 4px; font-size: 10.5px; color: #4b5c52; line-height: 1.5; }
  .help b { color: #14251b; }
  .notes ul { margin: 0; padding-left: 16px; color: #4b5c52; font-size: 10.5px; line-height: 1.65; }
  .sign { text-align: center; font-size: 10px; color: #4b5c52; display: flex; flex-direction: column; justify-content: flex-end; }
  .sign .line { border-top: 1px solid #b9c4bd; margin: 0 8mm 6px; padding-top: 6px; font-weight: 700; color: #14251b; }

  .foot { margin-top: 7mm; background: #f4f7f5; border-top: 1px solid #e3e9e5; padding: 8px 16mm 9px; display: flex; justify-content: space-between; align-items: center; gap: 6mm; font-size: 9.5px; color: #5b6b62; }
  .regs { display: flex; gap: 6px; flex-wrap: wrap; }
  .reg { border: 1px solid #d7e0da; background: #fff; border-radius: 999px; padding: 3px 9px; font-weight: 700; color: #14251b; }
  .reg b { color: #a8862a; }
  .thanks { text-align: center; padding: 6px 0 0; font-size: 10px; color: #8a978f; }
  @media print { html, body { background: #fff; } .page { margin: 0; box-shadow: none; } }
</style></head>
<body>
<div class="page">
  <img class="wm" src="${origin}/favicon.png" alt="">

  <div class="band">
    <div>
      <span class="band-logo"><img src="${origin}/logo.png" alt="Choose Your Therapist"></span>
      <div class="co">
        <span class="issued">Issued by</span>
        <b>${esc(therapistName || "Your therapist")}</b>${qual ? ` · ${esc(qual)}` : ""}
        ${tPlace ? `<br>${esc(tPlace)}` : ""}
        ${tPhone || tEmail ? `<br>${[tPhone, tEmail].filter(Boolean).map(esc).join(" · ")}` : ""}
        <br><span class="via">Services via ${esc(PLATFORM.name)} · ${esc(PLATFORM.web)}</span>
      </div>
    </div>
    <div class="doc">
      <h1>INVOICE</h1>
      <div class="sub">Payment receipt</div>
      <table>
        <tr><td>Invoice no.</td><td>${esc(invoiceNo)}</td></tr>
        <tr><td>Invoice date</td><td>${esc(fmtDate(tx.createdAt || b.booking_date))}</td></tr>
        <tr><td>Booking ID</td><td>#${esc((b._id || "").toString().slice(-8).toUpperCase())}</td></tr>
      </table>
    </div>
  </div>
  <div class="gold"></div>

  <div class="stamp">${isPaid ? "PAID" : esc((statusName || "PENDING").toUpperCase())}</div>

  <div class="content">
    <div class="parties">
      <div class="party">
        <p class="lbl">Billed to</p>
        <p class="nm">${esc(client.name || b.cname || "Client")}</p>
        ${client.phone ? `<p class="ln">${esc(client.phone)}</p>` : ""}
        ${client.email ? `<p class="ln">${esc(client.email)}</p>` : ""}
        ${whom ? `<p class="ln">Session for: ${esc(whom)}</p>` : ""}
      </div>
      <div class="party">
        <p class="lbl">Booked via</p>
        <p class="nm">${esc(PLATFORM.name)}</p>
        <p class="ln">Online booking · #${esc((b._id || "").toString().slice(-8).toUpperCase())}</p>
        <p class="ln">${esc(PLATFORM.web)}</p>
      </div>
      <div class="party">
        <p class="lbl">Session details</p>
        <p class="nm">${esc(fmtDate(b.booking_date, { weekday: "short" }))}</p>
        <p class="ln">${esc(fmtTime(b.booking_date))} IST · ${esc(mode)}</p>
        <p class="ln">${mode.toLowerCase().includes("person") ? esc(tPlace || "In-person session") : "Secure video / audio session"}</p>
      </div>
    </div>

    <table class="items">
      <thead><tr><th style="width:6%">#</th><th>Description</th><th style="width:16%">Session date</th><th class="r" style="width:8%">Qty</th><th class="r" style="width:16%">Rate</th><th class="r" style="width:16%">Amount</th></tr></thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><div class="it-name">${esc(description)}</div><div class="it-meta">${esc(mode)} session${therapistName ? ` with ${esc(therapistName)}` : ""} · 50–60 min<br>Booking #${esc((b._id || "").toString().slice(-8).toUpperCase())}</div></td>
          <td>${esc(fmtDate(b.booking_date))}<div class="it-meta">${esc(fmtTime(b.booking_date))}</div></td>
          <td class="r">1</td>
          <td class="r">${inr(fee)}</td>
          <td class="r"><b>${inr(fee)}</b></td>
        </tr>
      </tbody>
    </table>

    <div class="sumrow">
      <div>
        <div class="words"><p class="lbl" style="margin-bottom:3px">Amount in words</p><p>${esc(amountInWords(paid))}</p></div>
        <div class="pay">
          <p class="lbl">Payment details</p>
          <table>
            <tr><td>Status</td><td style="color:${isPaid ? "#166534" : "#b45309"}">${esc(isPaid ? "Paid" : statusName || "Pending")}</td></tr>
            ${tx.payment_method ? `<tr><td>Method</td><td>${esc(tx.payment_method)}</td></tr>` : ""}
            ${tx.transaction_id ? `<tr><td>Transaction ID</td><td>${esc(tx.transaction_id)}</td></tr>` : ""}
            ${tx.createdAt ? `<tr><td>Paid on</td><td>${esc(fmtDate(tx.createdAt))}, ${esc(fmtTime(tx.createdAt))}</td></tr>` : ""}
          </table>
        </div>
      </div>
      <div class="totals">
        <table>
          <tr><td>Session fee</td><td>${inr(fee)}</td></tr>
          ${discount > 0 ? `<tr><td>Discount</td><td>− ${inr(discount)}</td></tr>` : ""}
          <tr class="grand"><td>Total</td><td>${inr(paid)}</td></tr>
          <tr><td>Amount paid</td><td>${inr(isPaid ? paid : 0)}</td></tr>
          <tr class="bal"><td>Balance due</td><td>${inr(isPaid ? 0 : paid)}</td></tr>
        </table>
      </div>
    </div>

    <div class="notes">
      <div class="card">
        <p class="lbl">Notes</p>
        <ul>
          <li>Sessions are confidential; this invoice contains no clinical information.</li>
          <li>Rescheduling and cancellation as per the policy at ${esc(PLATFORM.web)}/cancellation-policy.</li>
          <li>Please quote the invoice number in any billing query.</li>
        </ul>
      </div>
      <div class="card help">
        <p class="lbl">Contact</p>
        <p><b>${esc(therapistName || "Therapist")}</b></p>
        ${tPhone ? `<p><b>Phone:</b> <span style="white-space:nowrap">${esc(tPhone)}</span></p>` : ""}
        ${tEmail ? `<p><b>Email:</b> ${esc(tEmail)}</p>` : ""}
        <p><b>Bookings:</b> ${esc(PLATFORM.web)}</p>
      </div>
      <div class="card sign">
        <div class="line">${esc(therapistName || "Therapist")}</div>
        Computer-generated invoice<br>no signature required
      </div>
    </div>
  </div>

  <div class="foot">
    <div class="regs">
      <span class="reg">Platform: <b>${esc(PLATFORM.name)}</b></span>
      <span class="reg">HFR ID <b>${esc(PLATFORM.hfrId)}</b> · ABDM, NHA</span>
      <span class="reg">MCA Registered LLP</span>
    </div>
    <div>${esc(PLATFORM.web)}</div>
  </div>
  <div class="thanks" style="padding-bottom:6px">Booked through ${esc(PLATFORM.name)} — ${esc(PLATFORM.tagline)}</div>
</div>
</body></html>`;
}

/** Print an invoice via a hidden iframe, waiting for logo/watermark/fonts first. */
export function printInvoice(booking, therapist) {
  if (typeof document === "undefined") return;
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(buildInvoiceHtml(booking, therapist));
  doc.close();

  const go = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } finally {
      setTimeout(() => iframe.remove(), 1500);
    }
  };
  const imgs = Array.from(doc.images || []);
  const waits = imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = r; })));
  const fonts = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
  Promise.race([Promise.all([...waits, fonts]), new Promise((r) => setTimeout(r, 2500))]).then(go);
}

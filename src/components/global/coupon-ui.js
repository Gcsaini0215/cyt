/* Shared bits for therapist coupons: the therapist's Coupons page and the client-facing Offers section on the profile /
   booking page show the same "ticket". */

export const offerLabel = (c) =>
  c?.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${Number(c?.discount_value || 0).toLocaleString("en-IN")} OFF`;

export const tillLabel = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "";

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // older browsers / http: fall back to a hidden textarea
    try {
      const t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(t);
      return ok;
    } catch (e2) { return false; }
  }
};

export const CouponTicket = ({ c, compact = false, children }) => (
  <div className={`cpt${compact ? " sm" : ""}`}>
    <div className="cpt-l"><b>{offerLabel(c)}</b><small>{c?.title || "on your session"}</small></div>
    <div className="cpt-r">
      <span className="cpt-code">{c?.code || "CODE"}</span>
      {c?.valid_until && <small>Valid till {tillLabel(c.valid_until)}{c.left ? ` · only ${c.left} left` : ""}</small>}
      {children}
    </div>
  </div>
);

export const COUPON_TICKET_CSS = `
.cpt { display: flex; align-items: stretch; border-radius: 14px; overflow: hidden; background: #fff; border: 1.5px dashed #9fd5b3; min-width: 0; }
.cpt-l { flex: 0 0 38%; background: linear-gradient(150deg, #166534, #0f3d24); color: #fff; padding: 14px 12px; display: flex; flex-direction: column; justify-content: center; position: relative; }
.cpt-l::after { content: ""; position: absolute; right: -8px; top: 50%; width: 16px; height: 16px; margin-top: -8px; border-radius: 50%; background: #fff; }
.cpt-l b { font-size: 22px; font-weight: 800; letter-spacing: -.3px; line-height: 1.1; }
.cpt-l small { font-size: 12px; opacity: .85; margin-top: 4px; line-height: 1.35; }
.cpt-r { flex: 1; min-width: 0; padding: 12px 14px 12px 18px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.cpt-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 18px; font-weight: 800; letter-spacing: 1.5px; color: #0f172a; word-break: break-all; }
.cpt-r small { font-size: 12px; color: #64748b; }
.cpt.sm .cpt-l b { font-size: 18px; } .cpt.sm .cpt-code { font-size: 15.5px; }
`;

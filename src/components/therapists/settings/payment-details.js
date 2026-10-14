import React, { useEffect, useRef, useState } from "react";
import { getAccountDetailsUrl, updateAccountDetailsUrl } from "../../../utils/url";
import { fetchById, postData } from "../../../utils/actions";
import useTherapistStore from "../../../store/therapistStore";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { Section, Field, SaveBar, scrollToFirstError } from "./settings-ui";

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_RE = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-]{1,64}$/;
const mask = (v) => (v && v.length > 4 ? `•••• ${v.slice(-4)}` : v || "");
const FIELDS = ["ac_name", "ac_number", "ifsc", "upi"];
const pick = (o) => Object.fromEntries(FIELDS.map((k) => [k, (o?.[k] ?? "").toString()]));

export default function PaymentDetails({ onDirty }) {
  const { paymentStore, setPaymentStore, setMultiplePaymentStore } = useTherapistStore();
  const [base, setBase] = useState(null); // last saved details
  const [method, setMethod] = useState("bank");
  const [confirmNo, setConfirmNo] = useState("");
  const [showNo, setShowNo] = useState(false);
  const [bank, setBank] = useState({ state: "", text: "" }); // IFSC lookup result
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const lookupRef = useRef("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchById(getAccountDetailsUrl);
        const data = res?.data && Object.keys(res.data).length ? res.data : {};
        if (!alive) return;
        setMultiplePaymentStore(pick(data));
        setBase(pick(data));
        if (!data.ac_number && data.upi) setMethod("upi");
      } catch (err) {
        if (!alive) return;
        setBase(pick(useTherapistStore.getState().paymentStore));
        setError("Couldn't load your saved details — refresh to try again");
      }
      if (alive) setPageLoading(false);
    })();
    return () => { alive = false; };
  }, [setMultiplePaymentStore]);

  const cur = pick(paymentStore);
  const acChanged = !!base && cur.ac_number !== base.ac_number;
  const dirty = !!base && (FIELDS.some((k) => cur[k] !== base[k]) || (acChanged && confirmNo !== ""));
  useEffect(() => { onDirty && onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => { if (dirty) setSuccess(""); }, [dirty]);

  // bank name from IFSC (public Razorpay IFSC API)
  useEffect(() => {
    const code = cur.ifsc.trim().toUpperCase();
    if (!IFSC_RE.test(code)) { setBank({ state: "", text: "" }); return; }
    lookupRef.current = code;
    setBank({ state: "loading", text: "Checking IFSC…" });
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`https://ifsc.razorpay.com/${code}`);
        if (lookupRef.current !== code) return;
        if (r.status === 404) { setBank({ state: "bad", text: "IFSC not found — please re-check" }); return; }
        const j = await r.json();
        setBank({ state: "ok", text: [j.BANK, j.BRANCH].filter(Boolean).join(" · ") });
      } catch {
        if (lookupRef.current === code) setBank({ state: "", text: "" });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [cur.ifsc]);

  const set = (k, v) => {
    setPaymentStore(k, v);
    if (fieldErrors[k]) setFieldErrors((p) => ({ ...p, [k]: "" }));
    setError("");
  };

  const discard = () => {
    if (!base) return;
    setMultiplePaymentStore(base);
    setConfirmNo("");
    setFieldErrors({});
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    const e = {};
    const hasBank = cur.ac_name || cur.ac_number || cur.ifsc;
    if (method === "bank" || hasBank) {
      if (cur.ac_name.trim().length < 3) e.ac_name = "Enter the name exactly as on your bank account";
      if (!/^\d{9,18}$/.test(cur.ac_number.trim())) e.ac_number = "Account number should be 9–18 digits";
      else if (acChanged && confirmNo.trim() !== cur.ac_number.trim()) e.confirm = "Account numbers don't match";
      if (!IFSC_RE.test(cur.ifsc.trim().toUpperCase())) e.ifsc = "IFSC is 11 characters, e.g. HDFC0001234";
    }
    if (method === "upi" || cur.upi) {
      if (!UPI_RE.test(cur.upi.trim())) e.upi = "Enter a valid UPI ID, e.g. name@okaxis";
    }
    if (Object.keys(e).length) {
      // fields of the other method stay hidden — switch to where the error is
      if (method === "upi" && (e.ac_name || e.ac_number || e.ifsc || e.confirm) && !e.upi) setMethod("bank");
      if (method === "bank" && e.upi && !(e.ac_name || e.ac_number || e.ifsc || e.confirm)) setMethod("upi");
      setFieldErrors(e);
      setError("Please fix the highlighted fields");
      scrollToFirstError();
      return;
    }
    const reqData = { ac_name: cur.ac_name.trim(), ac_number: cur.ac_number.trim(), ifsc: cur.ifsc.trim().toUpperCase(), upi: cur.upi.trim() };
    setSaving(true);
    try {
      const response = await postData(updateAccountDetailsUrl, reqData);
      if (response.status) {
        setMultiplePaymentStore(reqData);
        setBase(reqData);
        setConfirmNo("");
        setShowNo(false);
        setSuccess(response.message || "Payment details saved");
        setTimeout(() => setSuccess(""), 3500);
      } else {
        setError(response.message || "Something went wrong — please try again");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't save — check your connection and try again");
    }
    setSaving(false);
  };

  if (pageLoading) {
    return <div className="stg-sec" style={{ height: 260, background: "linear-gradient(90deg,#eef2f0,#f7f9f8,#eef2f0)" }} />;
  }

  const savedBank = base?.ac_number ? `${base.ac_name || "Bank account"} · A/c ${mask(base.ac_number)} · ${base.ifsc}` : "";
  const savedUpi = base?.upi || "";

  return (
    <div>
      {(savedBank || savedUpi) && (
        <div className="stg-saved">
          <VerifiedRoundedIcon />
          <div style={{ minWidth: 0 }}>
            <b>Payouts are set up</b>
            {savedBank && <small>{savedBank}</small>}
            {savedUpi && <small>UPI · {savedUpi}</small>}
          </div>
        </div>
      )}

      <Section title="How should we pay you?" sub="Session earnings are sent here. Your details are only used for payouts.">
        <div className="stg-cards two" role="radiogroup" aria-label="Payout method">
          {[
            { id: "bank", Icon: AccountBalanceRoundedIcon, t: "Bank account", s: savedBank ? "Saved" : "NEFT / IMPS transfer" },
            { id: "upi", Icon: QrCode2RoundedIcon, t: "UPI ID", s: savedUpi ? "Saved" : "Instant payout to UPI" },
          ].map(({ id, Icon, t, s }) => (
            <button type="button" key={id} role="radio" aria-checked={method === id} className={`stg-card${method === id ? " on" : ""}`} onClick={() => setMethod(id)}>
              <span className="stg-card-ic"><Icon /></span>
              <span><b>{t}</b><small>{s}</small></span>
              <span className="stg-card-tick" aria-hidden="true" />
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          {method === "bank" ? (
            <div className="stg-grid">
              <Field label="Account holder name" htmlFor="pd-name" error={fieldErrors.ac_name} full>
                <input id="pd-name" type="text" autoComplete="name" placeholder="As printed on your passbook" value={cur.ac_name} onChange={(e) => set("ac_name", e.target.value)} />
              </Field>
              <Field label="Account number" htmlFor="pd-no" error={fieldErrors.ac_number}>
                <div className="stg-inputwrap">
                  <input id="pd-no" type="text" inputMode="numeric" autoComplete="off" placeholder="9–18 digits"
                    style={showNo ? { paddingRight: 44 } : { paddingRight: 44, WebkitTextSecurity: "disc" }}
                    value={cur.ac_number} onChange={(e) => set("ac_number", e.target.value.replace(/\D/g, ""))} />
                  <button type="button" className="stg-eye" onClick={() => setShowNo((v) => !v)} aria-label={showNo ? "Hide account number" : "Show account number"}>
                    {showNo ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                  </button>
                </div>
              </Field>
              {acChanged ? (
                <Field label="Confirm account number" htmlFor="pd-no2" error={fieldErrors.confirm}>
                  <input id="pd-no2" type="text" inputMode="numeric" autoComplete="off" placeholder="Type it again"
                    value={confirmNo} onPaste={(e) => e.preventDefault()}
                    onChange={(e) => { setConfirmNo(e.target.value.replace(/\D/g, "")); if (fieldErrors.confirm) setFieldErrors((p) => ({ ...p, confirm: "" })); }} />
                </Field>
              ) : <div className="stg-field" aria-hidden="true" />}
              <Field label="IFSC code" htmlFor="pd-ifsc" error={fieldErrors.ifsc}
                hint={bank.text ? <span className={`stg-bank${bank.state === "bad" ? " bad" : ""}`}>{bank.text}</span> : "11 characters, e.g. HDFC0001234"}>
                <input id="pd-ifsc" type="text" autoCapitalize="characters" autoComplete="off" maxLength={11} placeholder="HDFC0001234"
                  value={cur.ifsc} onChange={(e) => set("ifsc", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
              </Field>
            </div>
          ) : (
            <div className="stg-grid">
              <Field label="UPI ID" htmlFor="pd-upi" error={fieldErrors.upi} hint="The UPI ID linked to your bank, e.g. name@okaxis">
                <input id="pd-upi" type="text" autoCapitalize="none" autoComplete="off" placeholder="name@okaxis" value={cur.upi} onChange={(e) => set("upi", e.target.value.trim())} />
              </Field>
            </div>
          )}
        </div>

        <div className="stg-tip" style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <LockRoundedIcon style={{ fontSize: 17, color: "#166534", marginTop: 1 }} />
          <span>Only Choose Your Therapist&apos;s accounts team can see these details. We&apos;ll never ask for your PIN or OTP.</span>
        </div>
      </Section>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSubmit} onDiscard={discard} error={error} success={success} label="Save details" />
    </div>
  );
}

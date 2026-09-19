import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import Script from "next/script";
import { apiUrl } from "../utils/url";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STEP_LABELS = ["You", "Session", "Payment"];
const MATRIX_DAYS = 10;

function dateLabel(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return { value: dateStr, weekday: WEEKDAY_SHORT[dt.getDay()], day: dt.getDate(), month: MONTH_SHORT[dt.getMonth()] };
}

function slotStartMinutes(label) {
  const [time, ampm] = label.split(" - ")[0].split(" ");
  let [h, m] = time.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function priceFieldFor(sessionMode, format) {
  const fmt = format === "home-visit" ? "homevisit" : format === "online" ? "online" : "inperson";
  const mode = sessionMode === "couple" ? "couple" : "individual";
  return `${mode}_${fmt}`;
}

function waitForRazorpay(timeout = 12000) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve();
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (typeof window !== "undefined" && window.Razorpay) {
        clearInterval(iv);
        resolve();
      } else if (Date.now() - t0 > timeout) {
        clearInterval(iv);
        reject(new Error("Payment library failed to load. Please check your connection and retry."));
      }
    }, 150);
  });
}

// Fetches an open-days x time-slots matrix for a given booking type in one
// call — the server already limits to future, notice-window-safe slots.
// Shared by the full-page New/Follow-up slot picker and the Reschedule tab.
async function fetchSlotsMatrix(type) {
  const res = await fetch(`${apiUrl}/noida-appointments/slots-matrix?type=${type}`);
  const json = await res.json();
  const all = json?.status ? (json.data || []) : [];
  const dates = Array.from(new Set(all.map(s => s.date))).sort().slice(0, MATRIX_DAYS);
  const dateSet = new Set(dates);
  const times = Array.from(new Set(all.filter(s => dateSet.has(s.date)).map(s => s.slot)))
    .sort((a, b) => slotStartMinutes(a) - slotStartMinutes(b));
  const grid = {};
  all.forEach(s => { if (dateSet.has(s.date)) grid[`${s.date}|${s.slot}`] = s.booked ? "taken" : "open"; });
  return { dates, times, grid };
}

// Reusable date x time availability table — an open cell is a clickable
// button, booked/not-opened cells are inert. `selected` (optional
// {date, slot}) highlights the currently-picked cell.
function SlotsTable({ matrix, loading, selected }) {
  if (loading) return <div className="na-fullslots-empty">Loading…</div>;
  if (!matrix.dates.length) return <div className="na-fullslots-empty">No slots are open right now — please WhatsApp us and we'll set one up.</div>;
  return (
    <div className="na-fullslots-scroll">
      <table className="na-fullslots-table">
        <thead>
          <tr>
            <th></th>
            {matrix.dates.map(d => {
              const lbl = dateLabel(d);
              return <th key={d}>{lbl.weekday}<br />{lbl.day} {lbl.month}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {matrix.times.map(t => (
            <tr key={t}>
              <td className="na-time-col">{t.split(" - ")[0]}</td>
              {matrix.dates.map(d => {
                const state = matrix.grid[`${d}|${t}`];
                const isSelected = selected && selected.date === d && selected.slot === t;
                if (state === "open") {
                  return (
                    <td key={d}>
                      <button
                        type="button"
                        className={`na-slotcell open ${isSelected ? "selected" : ""}`}
                        title={isSelected ? `Selected — ${t}` : `Book ${t}`}
                        onClick={() => matrix.onPick(d, t)}
                      >
                        {isSelected ? "✓" : ""}
                      </button>
                    </td>
                  );
                }
                const label = state === "taken" ? "Booked" : "Not opened";
                return (
                  <td key={d}>
                    <span className={`na-slotcell ${state || "closed"}`} title={label}>
                      {state === "taken" ? "–" : "–"}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function NoidaAppointment() {
  const [bookingType, setBookingType] = useState("new"); // "new" | "followup" | "reschedule"
  const [phase, setPhase] = useState("slots"); // "identify" | "slots" | "form" — meaningful for new/followup
  const [step, setStep] = useState(1);

  // ── Pricing + packages, fetched once ─────────────────────────────────
  const [pricing, setPricing] = useState(null);
  useEffect(() => {
    fetch(`${apiUrl}/noida-appointments/pricing`)
      .then(r => r.json())
      .then(data => setPricing(data?.status ? data.data : null))
      .catch(() => setPricing(null));
  }, []);

  // ── Full-page available-slots table — the primary view for New/Follow-up.
  // Clicking an open cell picks that date+slot and moves straight into the
  // booking form, so there's no separate "pick a date/time" step later.
  const [slotsMatrix, setSlotsMatrix] = useState({ dates: [], times: [], grid: {} });
  const [slotsMatrixLoading, setSlotsMatrixLoading] = useState(true);

  const loadSlotsMatrix = useCallback(async (type) => {
    if (type !== "new" && type !== "followup") return;
    setSlotsMatrixLoading(true);
    try {
      setSlotsMatrix(await fetchSlotsMatrix(type));
    } catch {
      setSlotsMatrix({ dates: [], times: [], grid: {} });
    } finally {
      setSlotsMatrixLoading(false);
    }
  }, []);

  useEffect(() => { loadSlotsMatrix(bookingType); }, [bookingType, loadSlotsMatrix]);

  const [sessionMode, setSessionMode] = useState("individual"); // "individual" | "couple" | "package"
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [format, setFormat] = useState("in-person"); // "in-person" | "online" | "home-visit"
  const [address, setAddress] = useState("");

  const selectedPackage = (pricing?.packages || []).find(p => p._id === selectedPackageId);
  const baseAmount = sessionMode === "package"
    ? (selectedPackage?.price ?? 0)
    : (pricing?.[priceFieldFor(sessionMode, format)] ?? 0);
  const platformFee = pricing?.platformFee ?? 20;
  const totalAmount = baseAmount + platformFee;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const handlePickSlot = (date, slot) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setPhase("form");
    // Follow-up already collected phone/name during the identify phase —
    // jump straight to Session. New Client hasn't, so start at You.
    setStep(bookingType === "followup" ? 2 : 1);
    setError("");
    setStatus(null);
  };

  // ── Follow-up phone lookup ───────────────────────────────────────────
  const [lookupStatus, setLookupStatus] = useState(null); // null | "checking" | "found" | "not-found"
  const [foundName, setFoundName] = useState("");
  const [manualOverride, setManualOverride] = useState(false); // "not you? enter manually"
  const [credit, setCredit] = useState(null); // { available, sessionsRemaining, packageName } | null

  const runLookup = useCallback(async (phone) => {
    if (!/^\d{10}$/.test(phone)) { setLookupStatus(null); setCredit(null); return; }
    setLookupStatus("checking");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/lookup?phone=${phone}`);
      const data = await res.json();
      setCredit(data?.data?.credit?.available ? data.data.credit : null);
      if (data?.status && data.data?.found) {
        setFoundName(data.data.name || "");
        setLookupStatus("found");
      } else {
        setLookupStatus("not-found");
      }
    } catch {
      setLookupStatus("not-found");
      setCredit(null);
    }
  }, []);

  const usingCredit = bookingType === "followup" && !!credit;

  // ── Reschedule tab — compact single-screen flow: phone → nearest
  // upcoming booking → pick new date/time from the same slots table.
  const [reschedulePhone, setReschedulePhone] = useState("");
  const [rescheduleStatus, setRescheduleStatus] = useState(null); // null | "checking" | "found" | "not-found"
  const [rescheduleInfo, setRescheduleInfo] = useState(null); // { name, date, slot, type }
  const [rescheduleMatrix, setRescheduleMatrix] = useState({ dates: [], times: [], grid: {} });
  const [rescheduleMatrixLoading, setRescheduleMatrixLoading] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleDone, setRescheduleDone] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  const runRescheduleLookup = useCallback(async (phone) => {
    if (!/^\d{10}$/.test(phone)) { setRescheduleStatus(null); setRescheduleInfo(null); return; }
    setRescheduleStatus("checking");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/upcoming?phone=${phone}`);
      const data = await res.json();
      if (data?.status && data.data?.found) {
        setRescheduleInfo(data.data);
        setRescheduleStatus("found");
      } else {
        setRescheduleInfo(null);
        setRescheduleStatus("not-found");
      }
    } catch {
      setRescheduleStatus("not-found");
      setRescheduleInfo(null);
    }
  }, []);

  const handleReschedulePhoneChange = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 10);
    setReschedulePhone(digits);
    setRescheduleDate(""); setRescheduleSlot(""); setRescheduleError("");
    if (digits.length === 10) runRescheduleLookup(digits);
    else { setRescheduleStatus(null); setRescheduleInfo(null); }
  };

  useEffect(() => {
    if (!rescheduleInfo) { setRescheduleMatrix({ dates: [], times: [], grid: {} }); return; }
    setRescheduleMatrixLoading(true);
    setRescheduleDate(""); setRescheduleSlot("");
    fetchSlotsMatrix(rescheduleInfo.type)
      .then(setRescheduleMatrix)
      .catch(() => setRescheduleMatrix({ dates: [], times: [], grid: {} }))
      .finally(() => setRescheduleMatrixLoading(false));
  }, [rescheduleInfo]);

  const handleReschedulePickSlot = (date, slot) => {
    setRescheduleDate(date);
    setRescheduleSlot(slot);
    setRescheduleError("");
  };

  const rescheduleDateLabel = rescheduleDate ? dateLabel(rescheduleDate) : null;

  const submitReschedule = async () => {
    setRescheduleError("");
    if (!rescheduleDate || !rescheduleSlot) { setRescheduleError("Please select a date and time."); return; }
    setRescheduleSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: reschedulePhone, newDate: rescheduleDate, newSlot: rescheduleSlot }),
      });
      const data = await res.json();
      if (data.status) setRescheduleDone(true);
      else setRescheduleError(data.message || "Could not reschedule. Please try again.");
    } catch {
      setRescheduleError("Could not reschedule. Please try again.");
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  // ── Form ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", concern: "" });
  const [status, setStatus] = useState(null); // null | "loading" | "success"
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null); // null | "razorpay" | "qr"

  // Dynamic Razorpay UPI QR — polled server-side confirmation, never a
  // client-reported "I paid". See createNoidaQrOrder / getNoidaQrStatus.
  const [qrData, setQrData] = useState(null); // { qrCodeId, qrImageUrl, amount, expiresAt }
  const [qrLoading, setQrLoading] = useState(false);
  const [qrState, setQrState] = useState(null); // null | "waiting" | "expired"
  const qrPollRef = useRef(null);

  const stopQrPoll = () => {
    if (qrPollRef.current) { clearInterval(qrPollRef.current); qrPollRef.current = null; }
  };
  useEffect(() => () => stopQrPoll(), []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePhoneChange = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 10);
    set("phone", digits);
    setManualOverride(false);
    if (digits.length === 10 && bookingType === "followup") runLookup(digits);
    else { setLookupStatus(null); setCredit(null); }
  };

  const switchTab = (type) => {
    stopQrPoll();
    setBookingType(type);
    setPhase(type === "followup" ? "identify" : "slots");
    setStep(1);
    setStatus(null);
    setError("");
    setLookupStatus(null);
    setManualOverride(false);
    setCredit(null);
    setForm({ name: "", age: "", phone: "", email: "", concern: "" });
    setPaymentMethod(null);
    setQrData(null);
    setQrState(null);
    setSelectedDate(""); setSelectedSlot("");
    setReschedulePhone(""); setRescheduleStatus(null); setRescheduleInfo(null);
    setRescheduleDate(""); setRescheduleSlot(""); setRescheduleDone(false); setRescheduleError("");
  };

  const needsFullDetails = bookingType === "new" || lookupStatus === "not-found" || manualOverride;
  const effectiveName = bookingType === "followup" && lookupStatus === "found" && !manualOverride ? foundName : form.name;

  const goToStep2 = () => {
    setError("");
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number."); return;
    }
    if (!effectiveName?.trim()) { setError("Name is required."); return; }
    setStep(2);
  };
  // Follow-up's identify phase — same validation as goToStep2, but moves
  // to the slots table instead of a wizard step.
  const goToIdentifySlots = () => {
    setError("");
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number."); return;
    }
    if (!effectiveName?.trim()) { setError("Name is required."); return; }
    setPhase("slots");
  };
  const goToPayment = () => {
    setError("");
    if (!usingCredit) {
      if (sessionMode === "package" && !selectedPackageId) { setError("Please choose a package."); return; }
      if (format === "home-visit" && !address.trim()) { setError("Please add your address for the home visit."); return; }
    }
    setStep(3);
  };

  const buildPayload = () => ({
    name: effectiveName.trim(),
    age: form.age.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    concern: form.concern.trim(),
    date: selectedDate, slot: selectedSlot, type: bookingType,
    sessionMode, format,
    address: format === "home-visit" ? address.trim() : "",
    packageId: sessionMode === "package" ? selectedPackageId : undefined,
  });

  const finalizeBooking = async (paymentExtra = {}) => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), ...paymentExtra }),
      });
      const data = await res.json();
      if (data.status) {
        setStatus("success");
      } else if (paymentExtra.razorpay_payment_id) {
        setError(`${data.message || "Booking failed after payment."} Please WhatsApp us with payment ID ${paymentExtra.razorpay_payment_id} and we'll sort it out.`);
        setStatus(null);
      } else if (paymentExtra.qr_code_id) {
        setError(`${data.message || "Booking failed after payment."} Please WhatsApp us with QR reference ${paymentExtra.qr_code_id} and we'll sort it out.`);
        setStatus(null);
      } else {
        setError(data.message || "Booking failed. Please try again.");
        setStatus(null);
      }
    } catch {
      if (paymentExtra.razorpay_payment_id || paymentExtra.qr_code_id) {
        setError("Payment succeeded but we couldn't save the booking. Please WhatsApp us and we'll sort it out.");
      } else {
        setError("Could not save the booking. Please try again.");
      }
      setStatus(null);
    }
  };

  const handleConfirmCredit = () => finalizeBooking();

  const handleRazorpay = async () => {
    stopQrPoll();
    setPaymentMethod("razorpay");
    setStatus("loading");
    setError("");
    try {
      const orderRes = await fetch(`${apiUrl}/noida-appointments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionMode, format,
          packageId: sessionMode === "package" ? selectedPackageId : undefined,
          address: format === "home-visit" ? address.trim() : undefined,
          type: bookingType, phone: form.phone.trim(),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.status) {
        setError(orderData.message || "Could not start payment. Please try again.");
        setStatus(null);
        return;
      }

      await waitForRazorpay();

      const rzp = new window.Razorpay({
        key: orderData.data.keyId,
        amount: Math.round(orderData.data.amount * 100),
        currency: "INR",
        order_id: orderData.data.orderId,
        name: "Choose Your Therapist",
        description: "Noida Center Appointment",
        handler: (response) => finalizeBooking({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
        prefill: { name: effectiveName, email: form.email, contact: form.phone },
        theme: { color: "#1a6b3a" },
        modal: {
          ondismiss: () => {
            setStatus(null);
            setError("Payment was cancelled. You can try again whenever you're ready.");
          },
        },
      });
      rzp.on("payment.failed", () => {
        setStatus(null);
        setError("Payment failed. Please try again or use a different payment method.");
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Could not start payment. Please try again.");
      setStatus(null);
    }
  };

  const pollQrStatus = async (qrCodeId) => {
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/qr-status/${qrCodeId}`);
      const data = await res.json();
      if (!data?.status) return;
      if (data.data.paid) {
        stopQrPoll();
        if (data.data.alreadyUsed) {
          setQrState("expired");
          setError("This payment has already been used for a booking. Please generate a new QR code.");
          return;
        }
        setQrState("paid");
        await finalizeBooking({ qr_code_id: qrCodeId });
      } else if (data.data.expired) {
        stopQrPoll();
        setQrState("expired");
      }
    } catch {
      // transient network error while polling — just try again next tick
    }
  };

  const handleShowQr = async () => {
    stopQrPoll();
    setPaymentMethod("qr");
    setQrLoading(true);
    setQrData(null);
    setQrState(null);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/create-qr-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionMode, format,
          packageId: sessionMode === "package" ? selectedPackageId : undefined,
          address: format === "home-visit" ? address.trim() : undefined,
          type: bookingType, phone: form.phone.trim(),
        }),
      });
      const data = await res.json();
      if (!data.status) { setError(data.message || "Could not generate QR code. Please try again."); return; }
      if (data.data.freeSession) { await finalizeBooking(); return; }
      setQrData(data.data);
      setQrState("waiting");
      qrPollRef.current = setInterval(() => pollQrStatus(data.data.qrCodeId), 3000);
    } catch {
      setError("Could not generate QR code. Please try again.");
    } finally {
      setQrLoading(false);
    }
  };

  const pickedDateLabel = selectedDate ? dateLabel(selectedDate) : null;
  const formatLabel = format === "home-visit" ? "Home Visit" : format === "online" ? "Online" : "In-person";
  const modeLabel = sessionMode === "package" ? (selectedPackage?.name || "Package") : sessionMode === "couple" ? "Couple" : "Individual";

  return (
    <>
      <Head>
        <title>Book an In-Person Appointment — Noida Therapy Center | Choose Your Therapist</title>
        <meta name="description" content="Book your in-person therapy session at our Noida (Sector 51) center. Pick a date and time that works for you — instantly confirmed." />
        <link rel="canonical" href="https://chooseyourtherapist.in/noida-appointment" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Book an In-Person Appointment — Noida Therapy Center" />
        <meta property="og:description" content="Pick a date and time for your in-person session at our Noida center — instantly confirmed." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <style dangerouslySetInnerHTML={{ __html: `
        .na-page { font-family: 'Inter', sans-serif; background: #f4f6f5; min-height: 100vh; }

        .na-topbar { max-width: 1100px; margin: 0 auto; padding: 18px 20px 4px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .na-topbar-tabs { display: flex; gap: 6px; background: #fff; border-radius: 12px; padding: 5px; box-shadow: 0 4px 16px rgba(15,61,34,.08); }
        .na-topbar-tab { border: none; background: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 800; color: #64748b; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .na-topbar-tab.active { background: #1a6b3a; color: #fff; }
        .na-topbar-brand { font-size: 11px; font-weight: 300; letter-spacing: 1.5px; text-transform: uppercase; color: #a3aca6; }

        .na-centerwrap { max-width: 1100px; margin: 0 auto; padding: 20px 20px 60px; }
        .na-card-inner { max-width: 560px; margin: 0 auto; }
        .na-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14); padding: 28px 24px 32px; }

        .na-picked-banner { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 12px; padding: 10px 14px; font-size: 13px; font-weight: 700; margin-bottom: 18px; }
        .na-picked-change { background: none; border: none; color: #1a6b3a; font-size: 12px; font-weight: 800; text-decoration: underline; cursor: pointer; flex-shrink: 0; }

        .na-fullslots-wrap { max-width: 1100px; margin: 0 auto; padding: 20px 20px 60px; }
        .na-fullslots-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14); padding: 26px 26px 22px; }
        .na-fullslots-title { font-size: 16px; font-weight: 800; color: #0f172a; }
        .na-fullslots-sub { font-size: 12.5px; color: #94a3b8; margin-top: 3px; margin-bottom: 18px; }
        .na-fullslots-scroll { overflow-x: auto; }
        .na-fullslots-table { width: 100%; border-collapse: collapse; }
        .na-fullslots-table th { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; padding: 6px 5px 10px; text-align: center; white-space: nowrap; line-height: 1.4; }
        .na-fullslots-table td { padding: 3px; text-align: center; }
        .na-fullslots-table td.na-time-col { text-align: left; font-size: 12.5px; font-weight: 700; color: #334155; white-space: nowrap; padding-right: 14px; }
        .na-slotcell { display: flex; align-items: center; justify-content: center; width: 100%; min-width: 68px; height: 34px; border-radius: 9px; border: 1.5px solid transparent; font-size: 13px; font-weight: 800; cursor: default; box-sizing: border-box; font-family: inherit; }
        button.na-slotcell.open { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; cursor: pointer; transition: all .15s; }
        button.na-slotcell.open:hover { background: #1a6b3a; border-color: #1a6b3a; color: #fff; transform: translateY(-1px); }
        button.na-slotcell.open.selected { background: #1a6b3a; border-color: #1a6b3a; color: #fff; box-shadow: 0 0 0 3px rgba(26,107,58,.2); }
        button.na-slotcell.open.selected:hover { transform: none; }
        .na-slotcell.taken { background: #fef2f2; border-color: #fecaca; color: #fca5a5; }
        .na-slotcell.closed { background: #f8fafc; color: #e2e8f0; }
        .na-fullslots-legend { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 18px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
        .na-fullslots-legend span { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: #64748b; font-weight: 600; }
        .na-fullslots-legend i { display: inline-block; width: 11px; height: 11px; border-radius: 3px; }
        .na-fullslots-empty { font-size: 13px; color: #94a3b8; padding: 40px 0; text-align: center; }

        .na-steps { display: flex; align-items: center; gap: 6px; margin-bottom: 22px; }
        .na-step-dot { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .na-step-circle { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; border: 2px solid #e2e8f0; color: #94a3b8; background: #fff; transition: all .2s; }
        .na-step-dot.done .na-step-circle { background: #1a6b3a; border-color: #1a6b3a; color: #fff; }
        .na-step-dot.active .na-step-circle { border-color: #1a6b3a; color: #1a6b3a; }
        .na-step-label { font-size: 10.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; }
        .na-step-dot.active .na-step-label, .na-step-dot.done .na-step-label { color: #1a6b3a; }
        .na-step-line { flex: 1.4; height: 2px; background: #e2e8f0; margin-top: -22px; }
        .na-step-line.done { background: #1a6b3a; }

        .na-section-label { font-size: 11.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px; }

        .na-pill-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .na-pill { flex: 1; min-width: 90px; padding: 10px 8px; border-radius: 10px; text-align: center; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; transition: all .15s; font-size: 12.5px; font-weight: 700; color: #334155; }
        .na-pill:hover { border-color: #94a3b8; }
        .na-pill.active { background: #f0fdf4; border-color: #1a6b3a; color: #15803d; }
        .na-pill-price { display: block; font-size: 10.5px; font-weight: 600; color: #94a3b8; margin-top: 2px; }
        .na-pill.active .na-pill-price { color: #15803d; }

        .na-pkg-card-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .na-pkg-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; transition: all .15s; }
        .na-pkg-card:hover { border-color: #94a3b8; }
        .na-pkg-card.active { background: #f0fdf4; border-color: #1a6b3a; }
        .na-pkg-card-name { font-size: 13px; font-weight: 700; color: #0f172a; }
        .na-pkg-card-meta { font-size: 11.5px; color: #94a3b8; margin-top: 2px; }
        .na-pkg-card-price { font-size: 14px; font-weight: 800; color: #1a6b3a; }

        .na-inp { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 11px 13px; font-size: 14px; color: #0f172a; outline: none; background: #f8fafc; box-sizing: border-box; font-family: inherit; transition: border-color .15s; }
        .na-inp:focus { border-color: #1a6b3a; background: #fff; }
        .na-textarea { resize: vertical; min-height: 70px; line-height: 1.6; }
        .na-lbl { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 6px; }
        .na-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        @media (max-width: 480px) { .na-row { grid-template-columns: 1fr; } }

        .na-btn-row { display: flex; gap: 10px; margin-top: 10px; }
        .na-btn-back { flex: 0 0 auto; padding: 15px 20px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; color: #475569; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .15s; }
        .na-btn-back:hover { border-color: #94a3b8; }
        .na-submit { display: block; width: 100%; flex: 1; padding: 15px 0; border: none; border-radius: 12px; background: linear-gradient(135deg, #166534, #1a6b3a); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; transition: all .2s; box-shadow: 0 6px 18px rgba(22,101,52,.28); }
        .na-submit:disabled { opacity: .6; cursor: not-allowed; }
        .na-pay-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
        .na-pay-btn { flex: 1; min-width: 160px; padding: 15px 10px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; color: #1a6b3a; font-size: 14px; font-weight: 800; cursor: pointer; transition: all .15s; }
        .na-pay-btn:hover:not(:disabled) { border-color: #1a6b3a; background: #f0fdf4; }
        .na-pay-btn:disabled { opacity: .6; cursor: not-allowed; }

        .na-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; margin-bottom: 16px; }

        .na-lookup-box { border-radius: 12px; padding: 12px 14px; margin-bottom: 18px; font-size: 13px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .na-lookup-checking { background: #f8fafc; color: #64748b; }
        .na-lookup-found { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-weight: 700; }
        .na-lookup-notfound { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
        .na-lookup-link { background: none; border: none; color: inherit; text-decoration: underline; font-size: 12px; font-weight: 700; cursor: pointer; padding: 0; flex-shrink: 0; }

        .na-review { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; font-size: 13.5px; color: #334155; line-height: 2; margin-bottom: 20px; }
        .na-review strong { color: #0f172a; }
        .na-price-breakdown { border-top: 1px dashed #cbd5e1; margin-top: 8px; padding-top: 8px; }
        .na-price-total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #1a6b3a; margin-top: 4px; }

        .na-qr-box { text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-top: 12px; }
        .na-qr-box img { width: 200px; height: 200px; }

        .na-success { text-align: center; padding: 20px 4px; }
        .na-success-icon { width: 72px; height: 72px; border-radius: 50%; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 34px; }
        .na-success h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
        .na-success p { font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 20px; }
        .na-summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; text-align: left; font-size: 13.5px; color: #334155; line-height: 2; }
        .na-address-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 18px; text-align: left; margin-top: 12px; }
        .na-address-title { font-size: 12.5px; font-weight: 800; color: #166534; margin-bottom: 6px; }
        .na-address-text { font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 10px; }
        .na-address-link { font-size: 12.5px; font-weight: 700; color: #1a6b3a; text-decoration: none; }
        .na-address-link:hover { text-decoration: underline; }
      ` }} />

      <div className="na-page">
        <div className="na-topbar">
          <div className="na-topbar-tabs">
            <button type="button" className={`na-topbar-tab ${bookingType === "new" ? "active" : ""}`} onClick={() => switchTab("new")}>New Client</button>
            <button type="button" className={`na-topbar-tab ${bookingType === "followup" ? "active" : ""}`} onClick={() => switchTab("followup")}>Follow-up</button>
            <button type="button" className={`na-topbar-tab ${bookingType === "reschedule" ? "active" : ""}`} onClick={() => switchTab("reschedule")}>Reschedule</button>
          </div>
          <div className="na-topbar-brand">Choose Your Therapist LLP | NOIDA</div>
        </div>

        {bookingType === "reschedule" ? (
          <div className="na-centerwrap">
            <div className="na-card">
              <div className="na-card-inner">
                {rescheduleDone ? (
                  <div className="na-success">
                    <div className="na-success-icon">✓</div>
                    <h2>All set!</h2>
                    <p>Your appointment has been moved to the new time. We've sent a confirmation to your email if you gave us one.</p>
                    <div className="na-summary">
                      <div><strong>New Date:</strong> {rescheduleDateLabel ? `${rescheduleDateLabel.weekday}, ${rescheduleDateLabel.day} ${rescheduleDateLabel.month}` : rescheduleDate}</div>
                      <div><strong>New Time:</strong> {rescheduleSlot}</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: rescheduleStatus ? 10 : 14 }}>
                      <div>
                        <label className="na-lbl">Phone Number *</label>
                        <input className="na-inp" value={reschedulePhone} onChange={e => handleReschedulePhoneChange(e.target.value)} placeholder="10-digit mobile you booked with" type="tel" inputMode="numeric" maxLength={10} />
                      </div>
                    </div>

                    {rescheduleStatus === "checking" && <div className="na-lookup-box na-lookup-checking">Checking…</div>}
                    {rescheduleStatus === "not-found" && (
                      <div className="na-lookup-box na-lookup-notfound">No upcoming appointment found for this number — check it, or WhatsApp us for help.</div>
                    )}
                    {rescheduleStatus === "found" && rescheduleInfo && (
                      <>
                        <div className="na-lookup-box na-lookup-found">
                          <span>📅 Currently: {rescheduleInfo.date} at {rescheduleInfo.slot}</span>
                        </div>

                        <div className="na-section-label">Pick a new date &amp; time</div>
                        <SlotsTable matrix={{ ...rescheduleMatrix, onPick: handleReschedulePickSlot }} loading={rescheduleMatrixLoading} selected={rescheduleDate && rescheduleSlot ? { date: rescheduleDate, slot: rescheduleSlot } : null} />
                        {rescheduleDate && rescheduleSlot && (
                          <div className="na-lookup-box na-lookup-found" style={{ marginTop: 14, marginBottom: 0 }}>
                            <span>New time: {rescheduleDateLabel.weekday}, {rescheduleDateLabel.day} {rescheduleDateLabel.month} · {rescheduleSlot}</span>
                          </div>
                        )}
                      </>
                    )}

                    {rescheduleError && <div className="na-error" style={{ marginTop: 12 }}>⚠️ {rescheduleError}</div>}

                    {rescheduleStatus === "found" && (
                      <button type="button" className="na-submit" style={{ marginTop: 10 }} disabled={rescheduleSubmitting || !rescheduleSlot} onClick={submitReschedule}>
                        {rescheduleSubmitting ? "Rescheduling…" : "Confirm New Time"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : phase === "identify" ? (
          <div className="na-centerwrap">
            <div className="na-card">
              <div className="na-card-inner">
                <div className="na-section-label" style={{ marginBottom: 16 }}>Let's find you first</div>
                <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: lookupStatus ? 10 : 14 }}>
                  <div>
                    <label className="na-lbl">Phone Number *</label>
                    <input className="na-inp" value={form.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="10-digit mobile you booked with before" type="tel" inputMode="numeric" maxLength={10} />
                  </div>
                </div>
                {lookupStatus === "checking" && <div className="na-lookup-box na-lookup-checking">Checking…</div>}
                {lookupStatus === "found" && !manualOverride && (
                  <div className="na-lookup-box na-lookup-found">
                    <span>
                      👋 Welcome back, {foundName}!
                      {usingCredit && ` You have ${credit.sessionsRemaining} session(s) left${credit.packageName ? ` on ${credit.packageName}` : ""} — no payment needed.`}
                    </span>
                    <button type="button" className="na-lookup-link" onClick={() => setManualOverride(true)}>Not you?</button>
                  </div>
                )}
                {(lookupStatus === "not-found" || (lookupStatus === "found" && manualOverride)) && (
                  <div className="na-lookup-box na-lookup-notfound">
                    {lookupStatus === "not-found" ? "New here — please add your details below." : "No problem, please add your details below."}
                  </div>
                )}
                {needsFullDetails && form.phone.length === 10 && (
                  <div className="na-row">
                    <div>
                      <label className="na-lbl">Full Name *</label>
                      <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" />
                    </div>
                    <div>
                      <label className="na-lbl">Age</label>
                      <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                    </div>
                  </div>
                )}
                {form.phone.length === 10 && (
                  <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional, for confirmation)</span></label>
                      <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                    </div>
                  </div>
                )}
                {form.phone.length === 10 && (
                  <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                      <textarea className="na-inp na-textarea" rows={2} value={form.concern} onChange={e => set("concern", e.target.value)} placeholder="Briefly describe what you're going through…" />
                    </div>
                  </div>
                )}

                {error && <div className="na-error">⚠️ {error}</div>}
                <button type="button" className="na-submit" onClick={goToIdentifySlots}>Continue →</button>
              </div>
            </div>
          </div>
        ) : phase === "slots" ? (
          <div className="na-fullslots-wrap">
            <div className="na-fullslots-card">
              <div className="na-fullslots-title">Pick an open slot to start booking</div>
              <div className="na-fullslots-sub">{bookingType === "followup" ? "Follow-up" : "New client"} availability — next {MATRIX_DAYS} open days</div>

              <SlotsTable matrix={{ ...slotsMatrix, onPick: handlePickSlot }} loading={slotsMatrixLoading} selected={selectedDate && selectedSlot ? { date: selectedDate, slot: selectedSlot } : null} />

              <div className="na-fullslots-legend">
                <span><i style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }} /> Open — tap to book</span>
                <span><i style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }} /> Booked</span>
                <span><i style={{ background: "#f8fafc" }} /> Not opened</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="na-centerwrap">
            <div className="na-card">
              <div className="na-card-inner">
                {status === "success" ? (
                  <div className="na-success">
                    <div className="na-success-icon">✓</div>
                    <h2>You're all set, {(effectiveName || "there").split(" ")[0]}!</h2>
                    <p>Your appointment at our Noida center is confirmed. We'll see you there — please arrive 10 minutes early.</p>
                    <div className="na-summary">
                      <div><strong>Date:</strong> {pickedDateLabel ? `${pickedDateLabel.weekday}, ${pickedDateLabel.day} ${pickedDateLabel.month}` : selectedDate}</div>
                      <div><strong>Time:</strong> {selectedSlot}</div>
                      <div><strong>Session:</strong> {modeLabel} · {formatLabel}</div>
                      {usingCredit ? (
                        <div><strong>Payment:</strong> Package session used ({credit.sessionsRemaining - 1} remaining)</div>
                      ) : (
                        <div><strong>Amount Paid:</strong> ₹{totalAmount}</div>
                      )}
                      {form.email && <div><strong>Confirmation sent to:</strong> {form.email}</div>}
                    </div>

                    {format !== "online" && (
                      <div className="na-address-box">
                        <div className="na-address-title">📍 Our Noida Center</div>
                        <div className="na-address-text">Choose Your Therapist LLP<br />Sector 51, Noida, Uttar Pradesh, India</div>
                        <a
                          href="https://www.google.com/maps/search/?api=1&query=Choose+Your+Therapist+LLP+Sector+51+Noida"
                          target="_blank" rel="noopener noreferrer" className="na-address-link"
                        >
                          Get Directions →
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="na-picked-banner">
                      <span>📅 {pickedDateLabel ? `${pickedDateLabel.weekday}, ${pickedDateLabel.day} ${pickedDateLabel.month}` : selectedDate} · {selectedSlot}</span>
                      <button type="button" className="na-picked-change" onClick={() => { stopQrPoll(); setPhase("slots"); }}>Change</button>
                    </div>

                    <div className="na-steps">
                      {STEP_LABELS.map((label, i) => {
                        const n = i + 1;
                        const state = n < step ? "done" : n === step ? "active" : "";
                        return (
                          <React.Fragment key={label}>
                            <div className={`na-step-dot ${state}`}>
                              <div className="na-step-circle">{n < step ? "✓" : n}</div>
                              <div className="na-step-label">{label}</div>
                            </div>
                            {i < STEP_LABELS.length - 1 && <div className={`na-step-line ${n < step ? "done" : ""}`} />}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {step === 1 && (
                      <>
                        {bookingType === "followup" ? (
                          <>
                            <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: lookupStatus ? 10 : 14 }}>
                              <div>
                                <label className="na-lbl">Phone Number *</label>
                                <input className="na-inp" value={form.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="10-digit mobile you booked with before" type="tel" inputMode="numeric" maxLength={10} />
                              </div>
                            </div>
                            {lookupStatus === "checking" && <div className="na-lookup-box na-lookup-checking">Checking…</div>}
                            {lookupStatus === "found" && !manualOverride && (
                              <div className="na-lookup-box na-lookup-found">
                                <span>👋 Welcome back, {foundName}!{usingCredit && ` You have ${credit.sessionsRemaining} session(s) left${credit.packageName ? ` on ${credit.packageName}` : ""} — no payment needed.`}</span>
                                <button type="button" className="na-lookup-link" onClick={() => setManualOverride(true)}>Not you?</button>
                              </div>
                            )}
                            {(lookupStatus === "not-found" || (lookupStatus === "found" && manualOverride)) && (
                              <div className="na-lookup-box na-lookup-notfound">New here — please add your details below.</div>
                            )}
                            {needsFullDetails && form.phone.length === 10 && (
                              <div className="na-row">
                                <div>
                                  <label className="na-lbl">Full Name *</label>
                                  <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" />
                                </div>
                                <div>
                                  <label className="na-lbl">Age</label>
                                  <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                                </div>
                              </div>
                            )}
                            {form.phone.length === 10 && (
                              <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                                <div>
                                  <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                                  <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="na-row">
                              <div>
                                <label className="na-lbl">Full Name *</label>
                                <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" />
                              </div>
                              <div>
                                <label className="na-lbl">Age</label>
                                <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                              </div>
                            </div>
                            <div className="na-row">
                              <div>
                                <label className="na-lbl">Phone Number *</label>
                                <input className="na-inp" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" type="tel" inputMode="numeric" maxLength={10} />
                              </div>
                              <div>
                                <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                                <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" />
                              </div>
                            </div>
                          </>
                        )}

                        {(bookingType === "new" || form.phone.length === 10) && (
                          <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                            <div>
                              <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8" }}>(optional)</span></label>
                              <textarea className="na-inp na-textarea" rows={2} value={form.concern} onChange={e => set("concern", e.target.value)} placeholder="Briefly describe what you're going through…" />
                            </div>
                          </div>
                        )}

                        {error && <div className="na-error">⚠️ {error}</div>}
                        <button type="button" className="na-submit" onClick={goToStep2}>Continue →</button>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        {usingCredit ? (
                          <div className="na-lookup-box na-lookup-found" style={{ marginBottom: 18 }}>
                            <span>🎟️ Using 1 of your {credit.sessionsRemaining} remaining session(s){credit.packageName ? ` on ${credit.packageName}` : ""} — no payment for this booking.</span>
                          </div>
                        ) : (
                          <>
                            <div className="na-section-label">Choose Format (50–60 min session)</div>
                            <div className="na-pill-row">
                              <div className={`na-pill ${sessionMode === "individual" ? "active" : ""}`} onClick={() => setSessionMode("individual")}>
                                Individual
                                <span className="na-pill-price">₹{pricing?.[priceFieldFor("individual", format)] ?? "—"}</span>
                              </div>
                              <div className={`na-pill ${sessionMode === "couple" ? "active" : ""}`} onClick={() => setSessionMode("couple")}>
                                Couple
                                <span className="na-pill-price">₹{pricing?.[priceFieldFor("couple", format)] ?? "—"}</span>
                              </div>
                              {(pricing?.packages || []).length > 0 && (
                                <div className={`na-pill ${sessionMode === "package" ? "active" : ""}`} onClick={() => setSessionMode("package")}>
                                  Package
                                  <span className="na-pill-price">{pricing.packages.length} available</span>
                                </div>
                              )}
                            </div>

                            {sessionMode === "package" && (
                              <div className="na-pkg-card-row">
                                {(pricing?.packages || []).map(pkg => (
                                  <div
                                    key={pkg._id}
                                    className={`na-pkg-card ${selectedPackageId === pkg._id ? "active" : ""}`}
                                    onClick={() => setSelectedPackageId(pkg._id)}
                                  >
                                    <div>
                                      <div className="na-pkg-card-name">{pkg.name}</div>
                                      <div className="na-pkg-card-meta">{pkg.sessionsCount} sessions</div>
                                    </div>
                                    <div className="na-pkg-card-price">₹{pkg.price}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        <div className="na-section-label">Mode</div>
                        <div className="na-pill-row">
                          <div className={`na-pill ${format === "in-person" ? "active" : ""}`} onClick={() => setFormat("in-person")}>In-person</div>
                          <div className={`na-pill ${format === "online" ? "active" : ""}`} onClick={() => setFormat("online")}>Online</div>
                          <div className={`na-pill ${format === "home-visit" ? "active" : ""}`} onClick={() => setFormat("home-visit")}>Home Visit</div>
                        </div>

                        {format === "home-visit" && (
                          <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                            <div>
                              <label className="na-lbl">Address in Noida *</label>
                              <textarea className="na-inp na-textarea" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Flat / House no., Street, Sector, Landmark…" />
                            </div>
                          </div>
                        )}

                        {error && <div className="na-error">⚠️ {error}</div>}
                        <div className="na-btn-row">
                          <button type="button" className="na-btn-back" onClick={() => bookingType === "followup" ? setPhase("slots") : setStep(1)}>Back</button>
                          <button type="button" className="na-submit" onClick={goToPayment}>Continue →</button>
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <div className="na-section-label">Review &amp; pay</div>
                        <div className="na-review">
                          <div><strong>Name:</strong> {effectiveName || "—"}</div>
                          <div><strong>Phone:</strong> {form.phone}</div>
                          <div><strong>Session:</strong> {modeLabel} · {formatLabel}</div>
                          {format === "home-visit" && <div><strong>Address:</strong> {address}</div>}
                          <div><strong>Date:</strong> {pickedDateLabel ? `${pickedDateLabel.weekday}, ${pickedDateLabel.day} ${pickedDateLabel.month}` : selectedDate}</div>
                          <div><strong>Time:</strong> {selectedSlot}</div>
                          {form.concern && <div><strong>Concern:</strong> {form.concern}</div>}
                          {usingCredit ? (
                            <div className="na-price-breakdown">
                              <div>Package session: <strong>1 of {credit.sessionsRemaining} remaining</strong></div>
                              <div className="na-price-total"><span>Amount due</span><span>₹0</span></div>
                            </div>
                          ) : (
                            <div className="na-price-breakdown">
                              <div>{modeLabel === "Package" ? selectedPackage?.name : `${modeLabel} session`}: ₹{baseAmount}</div>
                              <div>Platform fee: ₹{platformFee}</div>
                              <div className="na-price-total"><span>Total</span><span>₹{totalAmount}</span></div>
                            </div>
                          )}
                        </div>

                        {error && <div className="na-error">⚠️ {error}</div>}

                        {usingCredit ? (
                          <div className="na-btn-row">
                            <button type="button" className="na-btn-back" onClick={() => setStep(2)}>Back</button>
                            <button type="button" className="na-submit" disabled={status === "loading"} onClick={handleConfirmCredit}>
                              {status === "loading" ? "Booking…" : "Confirm Booking"}
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="na-pay-row">
                              <button type="button" className="na-pay-btn" disabled={status === "loading"} onClick={handleRazorpay}>
                                {status === "loading" && paymentMethod === "razorpay" ? "Opening…" : "Pay with Razorpay"}
                              </button>
                              <button type="button" className="na-pay-btn" disabled={status === "loading" || qrLoading} onClick={handleShowQr}>
                                {qrLoading ? "Generating…" : "Scan UPI QR"}
                              </button>
                            </div>

                            {paymentMethod === "qr" && (qrLoading || qrState) && (
                              <div className="na-qr-box">
                                {qrLoading ? (
                                  <div style={{ fontSize: 13, color: "#64748b" }}>Generating QR…</div>
                                ) : qrState === "expired" ? (
                                  <>
                                    <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 700, marginBottom: 10 }}>This QR code has expired.</div>
                                    <button type="button" className="na-submit" onClick={handleShowQr}>Generate New QR</button>
                                  </>
                                ) : qrData ? (
                                  <>
                                    <img src={qrData.qrImageUrl} alt="Scan to pay" />
                                    <div style={{ fontSize: 12.5, color: "#64748b", margin: "10px 0" }}>
                                      Scan with any UPI app to pay ₹{qrData.amount}. This confirms automatically once paid — please don't close this page.
                                    </div>
                                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
                                      {status === "loading" ? "Payment received — confirming your booking…" : "Waiting for payment…"}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            )}

                            <div className="na-btn-row">
                              <button type="button" className="na-btn-back" onClick={() => { stopQrPoll(); setStep(2); }}>Back</button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

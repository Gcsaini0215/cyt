import React, { useEffect, useCallback } from "react";
import ProfileCheckoutCard from "./profile-checkout-card";
import Head from "next/head";
import { getFormatsByServiceId, getServices } from "../../utils/helpers";
import { useMediaQueryClient } from "../../hooks/useMediaQueryClient";

import FormMessage from "../global/form-message";
import { postData } from "../../utils/actions";
import { ApplyCouponUrl, BookTherapistUrl, verifyOtpUrl, imagePath } from "../../utils/url";
import { useRouter } from "next/router";
import FormProgressBar from "../global/form-progressbar";
import useUserStore from "../../store/userStore";
import { getToken } from "../../utils/jwt";

export default function TherapistCheckout({ profile }) {
  const isMobile = useMediaQueryClient("sm");
  const { userInfo } = useUserStore();
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [couponError, setCouponError] = React.useState("");
  const [otpError, setOtpError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState("");
  const [services, setServices] = React.useState([]);
  const [selectedService, setSelectedService] = React.useState({});
  const [selectedFormat, setSelectedFormat] = React.useState({});
  const [sessionFormats, setSessionFormats] = React.useState([]);
  const [other, setOther] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [bookingId, setBookingId] = React.useState();

  const [info, setInfo] = React.useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    format: "",
    whom: "Self",
    cname: "",
    relation_with_client: "",
    notes: "",
    age: "",
    amount: 0,
    therapist: "",
    is_logged_in: false,
    user_id: "",
  });

  const [amountInfo, setAmountInfo] = React.useState({
    coupon: "",
    amount: 0,
    tax: 0,
    subtotal: 0,
    discount: 0,
    discount_type: "",
    discount_value: 0,
    afterdiscount: 0
  });

  const handleChange = (name, value) => {
    if (name === "name" || name === "notes") {
      setInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
    } else if (name === "service") {
      const selectedService = services.find((service) => service.service === value);
      if (selectedService) {
        setSessionFormats(selectedService.formats);
        setInfo((prevInfo) => ({ ...prevInfo, service: value, format: selectedService.formats[0].format }));
        setAmountInfo((prev) => ({
          ...prev,
          amount: selectedService.formats[0].price,
          afterdiscount: selectedService.formats[0].price
        }));
      }
    } else if (name === "format") {
      const selectedFormat = sessionFormats.find((format) => format.format === value);
      if (selectedFormat && Object.keys(selectedFormat).length > 0) {
        setInfo((prevInfo) => ({ ...prevInfo, format: selectedFormat.format, amount: selectedFormat.price }));
        setAmountInfo((prev) => ({ ...prev, amount: selectedFormat.price, afterdiscount: selectedFormat.price }));
      }
    } else if (name === "whom") {
      setInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
      if (value === "For Other") {
        setOther(true);
      } else {
        setOther(false);
        setInfo((prevInfo) => ({ ...prevInfo, cname: "", relation_with_client: "", age: "" }));
      }
    } else if (name === "phone") {
      const formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length <= 10) {
        setInfo((prevInfo) => ({ ...prevInfo, [name]: formattedValue }));
      }
    } else if (name === "age") {
      const formattedValue = value.replace(/\D/g, "");
      setInfo((prevInfo) => ({ ...prevInfo, [name]: formattedValue }));
    } else if (name === "otp") {
      const formattedValue = value.replace(/\D/g, "").slice(0, 6);
      setOtp(formattedValue);
    } else {
      setInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
    }
  };

  const handlePayment = (bookingId, amount) => {
    const options = {
      key: "rzp_live_SuXa1yR42C4yOa",
      amount: amount * 100,
      currency: "INR",
      name: "CYT",
      description: "Therapist Booking",
      handler: function (response) {
        router.push(`/payment-success/${bookingId}?payment_id=${response.razorpay_payment_id}`);
      },
      prefill: {
        name: info.name || userInfo?.name,
        email: info.email || userInfo?.email,
        contact: info.phone || userInfo?.phone,
      },
      theme: { color: "#228756" },
      modal: {
        ondismiss: function () {
          router.push(`/payment-pending/${bookingId}`);
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async () => {
    setSuccess("");
    if (!info.is_logged_in && !/^\d{10}$/.test(info.phone)) {
      setError("Please enter valid 10-digit phone number.");
      return false;
    }
    if (Object.keys(selectedService).length === 0) {
      setError("Please select service.");
      return false;
    }
    if (!info.is_logged_in && !userInfo?.email && !info.email) {
      setError("Please enter Email ID.");
      return false;
    } else if (!info.is_logged_in && info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
      setError("Please enter valid Email ID.");
      return false;
    }
    if (info.is_logged_in && !info.whom) {
      setError("Please select for whom you want to take service.");
      return false;
    }
    if (Object.keys(selectedFormat).length === 0) {
      setError("Please select format.");
      return false;
    }
    if (info.whom === "For Other") {
      if (!info.cname || info.cname.length < 4) {
        setError("Please enter valid client name.");
        return false;
      }
      if (!info.relation_with_client) {
        setError("Please select relation with client.");
        return false;
      }
      if (!info.age) {
        setError("Please enter age of client.");
        return false;
      }
      if (info.age < 12 || info.age > 90) {
        setError("Please enter valid age.");
        return false;
      }
    }
    setError("");
    setLoading(true);
    try {
      info.amount = amountInfo.afterdiscount;
      const response = await postData(BookTherapistUrl, info);
      if (response.status) {
        handlePayment(response.data.id, amountInfo.afterdiscount);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error?.response?.data?.message);
    } finally {
      setLoading(false);
      setInfo((prev) => ({ ...prev, name: "", phone: "", notes: "" }));
    }
  };

  const onClose = () => setOpen(false);

  const verifyOtp = async () => {
    setOtpError("");
    if (otp.length !== 6) {
      setOtpError("Please enter valid OTP");
      return;
    }
    const value = { email: info.email, otp };
    try {
      setLoading(true);
      const response = await postData(verifyOtpUrl, value);
      if (response.status) {
        setOtpError("");
        setOtp("");
        setOpen(false);
        handlePayment(bookingId, amountInfo.afterdiscount);
      } else {
        setOtpError(response.message);
      }
    } catch (error) {
      setSuccess("");
      setOtpError(error.response.data.message);
    }
    setLoading(false);
  };

  const handleFormatChange = (e) => {
    const selected = sessionFormats.find((item) => item._id === e.target.value);
    setSelectedFormat(selected || {});
    let amount = selected.fee;
    setInfo((prev) => ({ ...prev, format: selected.type, service: selectedService.name, amount }));
    setAmountInfo((prev) => ({ ...prev, amount }));
  };

  const setConfig = useCallback(async (profile) => {
    const validServices = await getServices(profile.fees);
    setServices(validServices);
    setSelectedService(validServices[0]);
    const formats = getFormatsByServiceId(profile.fees, validServices[0]._id);
    setSessionFormats(formats);
    setSelectedFormat(formats[0] || {});
    setInfo((prev) => ({
      ...prev,
      service: validServices[0].name,
      format: formats[0].type,
      amount: formats[0].fee,
      therapist: profile._id,
      is_logged_in: userInfo?.name ? true : false,
      user_id: userInfo?._id ? userInfo._id : "",
      name: userInfo?.name ? userInfo.name : "",
      phone: userInfo?.phone ? userInfo.phone : "",
      email: userInfo?.email ? userInfo.email : "",
    }));
    setAmountInfo((prev) => ({ ...prev, amount: formats[0].fee, afterdiscount: formats[0].fee }));
  }, [userInfo]);

  useEffect(() => {
    if (selectedService && Object.keys(selectedService).length > 0) {
      const formats = getFormatsByServiceId(profile.fees, selectedService._id);
      setSessionFormats(formats);
      if (formats && formats.length > 0) {
        setSelectedFormat(formats[0]);
        setInfo((prev) => ({ ...prev, service: selectedService.name, format: formats[0].type, amount: formats[0].fee }));
        setAmountInfo((prev) => ({ ...prev, amount: formats[0].fee, afterdiscount: formats[0].fee }));
      }
    }
  }, [selectedService, profile.fees]);

  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setConfig(profile);
    }
  }, [profile, userInfo, setConfig]);

  const handleCouponApply = async () => {
    setCouponError("");
    if (!amountInfo.coupon) {
      setCouponError("Please enter coupon code");
      return;
    }
    try {
      const reqData = { therapist_id: profile._id, code: amountInfo.coupon, apply_for: "Therapist" };
      const res = await postData(ApplyCouponUrl, reqData);
      if (res?.status && res?.data) {
        const { discount_type, discount_value } = res.data;
        setAmountInfo((prev) => ({ ...prev, discount_type, discount_value }));
        setCouponError("Coupon applied successfully!");
      } else {
        setCouponError(res.message || "Invalid coupon");
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || "Error applying coupon");
    }
  };

  useEffect(() => {
    let discount = 0;
    if (amountInfo.discount_type === "flat") {
      discount = amountInfo.discount_value;
    } else if (amountInfo.discount_type === "percentage") {
      discount = (amountInfo.amount * amountInfo.discount_value) / 100;
    }
    discount = Math.min(discount, amountInfo.amount);
    setAmountInfo((prev) => ({ ...prev, discount, afterdiscount: amountInfo.amount - discount }));
  }, [amountInfo.amount, amountInfo.discount_type, amountInfo.discount_value]);

  /* ── shared sub-components ─────────────────────────── */
  const CouponBlock = () => (
    <div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder="Enter coupon code"
          className="ck-input"
          value={amountInfo.coupon}
          onChange={(e) => setAmountInfo((prev) => ({ ...prev, coupon: e.target.value }))}
          style={{ flex: 1, height: "44px", borderRadius: "10px !important" }}
        />
        <button
          className="rbt-btn btn-sm"
          onClick={handleCouponApply}
          style={{ height: "44px", minWidth: "72px", borderRadius: "10px", whiteSpace: "nowrap" }}
        >
          Apply
        </button>
      </div>
      {couponError && (
        <span style={{
          fontSize: "12px", fontWeight: 600, display: "block", marginTop: "7px",
          color: couponError.includes("success") ? "#228756" : "#ef4444"
        }}>
          {couponError}
        </span>
      )}
    </div>
  );

  const ConfirmButton = ({ height = 56, radius = 16, fontSize = 16 }) => (
    loading ? <FormProgressBar /> : (
      <button
        onClick={handleSubmit}
        style={{
          width: "100%", height, borderRadius: radius, border: "none",
          background: "linear-gradient(135deg,#228756,#1a6b44)",
          color: "#fff", fontSize, fontWeight: 800, cursor: "pointer",
          letterSpacing: "0.3px", boxShadow: "0 8px 20px rgba(34,135,86,0.3)"
        }}
      >
        Confirm &amp; Book Session →
      </button>
    )
  );

  return (
    <div className="checkout_area bg-color-white" style={{ padding: isMobile ? "8px 0 110px" : "0 0 60px" }}>
      <style>{`
        .ck-label{display:block;font-size:11.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;margin-bottom:7px}
        .ck-input,.ck-select{border-radius:12px!important;height:50px!important;border:1.5px solid #e8edf2!important;background:#f8fafc!important;font-size:14.5px!important;width:100%!important;padding:0 14px!important;transition:border-color .2s,box-shadow .2s;margin-bottom:0!important;color:#1e293b!important}
        .ck-input:focus,.ck-select:focus{border-color:#228756!important;background:#fff!important;box-shadow:0 0 0 3px rgba(34,135,86,.08)!important;outline:none!important}
        .ck-textarea{border-radius:13px!important;border:1.5px solid #e8edf2!important;background:#f8fafc!important;font-size:14px!important;width:100%!important;padding:13px 14px!important;min-height:120px;transition:border-color .2s,box-shadow .2s;margin-bottom:0!important;resize:vertical;color:#1e293b!important}
        .ck-textarea:focus{border-color:#228756!important;background:#fff!important;box-shadow:0 0 0 3px rgba(34,135,86,.08)!important;outline:none!important}
        .ck-field{margin-bottom:18px}
        .ck-card{background:#fff;border-radius:24px;border:1px solid #f1f5f9;box-shadow:0 4px 24px rgba(0,0,0,.04)}
        .ck-srv-tag{background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid rgba(34,135,86,.12);border-radius:14px;padding:14px 16px}
        .ck-trust{display:flex;flex-direction:column;align-items:center;gap:5px}
        .ck-trust i{color:#94a3b8;font-size:18px}
        .ck-trust span{font-size:11px;color:#94a3b8;font-weight:600}
        .ck-total-box{background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:16px;padding:18px 20px;display:flex;justify-content:space-between;align-items:center}
        @keyframes ckFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .ck-live-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f8fafc;animation:ckFadeIn .25s ease}
        .ck-live-row:last-child{border-bottom:none;padding-bottom:0}
        .ck-live-icon{width:30px;height:30px;border-radius:9px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .ck-live-icon i{color:#228756;font-size:13px}
        .ck-live-lbl{font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px;line-height:1}
        .ck-live-val{font-size:13.5px;color:#1e293b;font-weight:700;line-height:1.3;margin-top:2px;word-break:break-all}
        .ck-live-block{background:#f8fafc;border-radius:14px;padding:4px 12px;margin-bottom:16px}
      `}</style>

      <div className="container">

        {/* ── Mobile: compact therapist strip ─────────────── */}
        {isMobile && (
          <div style={{
            display: "flex", alignItems: "center", gap: "14px",
            background: "#fff", borderRadius: "18px", padding: "14px 16px",
            border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,.05)",
            marginBottom: "14px"
          }}>
            <img
              src={`${imagePath}/${profile.user?.profile}`}
              alt={profile.user?.name || "Therapist"}
              style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: "3px solid #f0fdf4", flexShrink: 0 }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "#1e293b", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                {profile.user?.name}
                <i className="feather-check-circle" style={{ color: "#228756", fontSize: "14px" }}></i>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                <span style={{ color: "#228756", fontWeight: 700 }}>{profile.profile_type}</span>
                <span style={{ margin: "0 5px", color: "#cbd5e1" }}>•</span>
                <span style={{ fontWeight: 600 }}>{profile.year_of_exp} exp</span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "20px", fontWeight: 900, color: "#228756", lineHeight: 1 }}>₹{amountInfo.afterdiscount}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, marginTop: "2px" }}>per session</div>
            </div>
          </div>
        )}

        <div className="row g-4">

          {/* ── Left col: Booking form ───────────────────── */}
          <div className="col-lg-7">
            <div className="ck-card" style={{ padding: isMobile ? "20px 16px" : "36px" }}>
              <div style={{ marginBottom: "22px", paddingBottom: "16px", borderBottom: "1px solid #f8fafc" }}>
                <h4 style={{ fontSize: isMobile ? "19px" : "22px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px" }}>
                  Booking Details
                </h4>
                <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>Fill in your details to confirm the session</p>
              </div>

              <FormMessage success={success} error={error} />

              <div className="row g-3">
                {!info.is_logged_in && <>
                  <div className="col-md-6 col-12">
                    <div className="ck-field">
                      <label className="ck-label" htmlFor="name">Full Name *</label>
                      <input className="ck-input" type="text" placeholder="Your full name"
                        value={info.name} id="name" name="name"
                        onChange={!userInfo?.name ? (e) => handleChange(e.target.name, e.target.value) : undefined} />
                    </div>
                  </div>
                  <div className="col-md-6 col-12">
                    <div className="ck-field">
                      <label className="ck-label" htmlFor="phone">WhatsApp Number *</label>
                      <input className="ck-input" type="text" placeholder="10-digit number"
                        id="phone" name="phone" value={info.phone || ""}
                        onChange={(e) => handleChange(e.target.name, e.target.value)} />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="ck-field">
                      <label className="ck-label" htmlFor="email">Email Address *</label>
                      <input className="ck-input" type="text" placeholder="you@email.com"
                        id="email" name="email" value={info.email}
                        onChange={(e) => handleChange(e.target.name, e.target.value)} />
                    </div>
                  </div>
                </>}

                <div className="col-md-6 col-12">
                  <div className="ck-field">
                    <label className="ck-label" htmlFor="service">Service</label>
                    <select className="ck-select" id="service" name="service" value={selectedService._id}
                      onChange={(e) => setSelectedService(services.find(s => s._id === e.target.value))}>
                      {services.map(item => (
                        <option value={item._id} key={item._id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-6 col-12">
                  <div className="ck-field">
                    <label className="ck-label" htmlFor="format">Session Format</label>
                    <select className="ck-select" id="format" name="format" value={selectedFormat._id || ""} onChange={handleFormatChange}>
                      <option value="">Select format</option>
                      {sessionFormats.map(item => (
                        <option value={item._id} key={item._id}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {info.is_logged_in && (
                  <div className="col-md-6 col-12">
                    <div className="ck-field">
                      <label className="ck-label" htmlFor="whom">Booking For</label>
                      <select className="ck-select" id="whom" value={info.whom} name="whom"
                        onChange={(e) => handleChange(e.target.name, e.target.value)}>
                        <option value="" disabled>Select</option>
                        <option value="Self">Self</option>
                        <option value="For Other">For Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {other && <>
                  <div className="col-md-6 col-12">
                    <div className="ck-field">
                      <label className="ck-label" htmlFor="client_name">Client Name *</label>
                      <input className="ck-input" type="text" placeholder="Client's full name"
                        id="client_name" name="cname" value={info.cname}
                        onChange={(e) => handleChange(e.target.name, e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-6 col-12">
                    <div className="ck-field">
                      <label className="ck-label" htmlFor="relation_with_client">Relation With Client</label>
                      <select className="ck-select" id="relation_with_client"
                        value={info.relation_with_client} name="relation_with_client"
                        onChange={(e) => handleChange(e.target.name, e.target.value)}>
                        <option value="" disabled>Select relation</option>
                        <option value="Brother">Brother</option>
                        <option value="Friend">Friend</option>
                        <option value="Cousine">Cousin</option>
                        <option value="Sister">Sister</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Son">Son</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Grand Father">Grand Father</option>
                        <option value="Grand Mother">Grand Mother</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </>}

                <div className="col-md-6 col-12">
                  <div className="ck-field">
                    <label className="ck-label" htmlFor="age">Age</label>
                    <input className="ck-input" type="text" placeholder="Your age in years"
                      id="age" name="age" value={info.age}
                      onChange={(e) => handleChange(e.target.name, e.target.value)} />
                  </div>
                </div>

                <div className="col-12">
                  <div className="ck-field">
                    <label className="ck-label" htmlFor="notes">Major Concern *</label>
                    <textarea className="ck-textarea"
                      placeholder="Share what brings you here. What are you struggling with? Be as detailed as you'd like — your therapist reads this before the session."
                      id="notes" name="notes" value={info.notes}
                      onChange={(e) => handleChange(e.target.name, e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile: coupon + submit handled via sticky footer / coupon card ── */}
            {isMobile && (
              <div className="ck-card" style={{ padding: "18px 16px", marginTop: "12px" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#475569", margin: "0 0 10px" }}>
                  Have a coupon code?
                </p>
                <CouponBlock />
              </div>
            )}
          </div>

          {/* ── Right col: Summary (desktop only) ─────────── */}
          {!isMobile && (
            <div className="col-lg-5">
              <div style={{ position: "sticky", top: "100px" }}>

                {/* Therapist card */}
                <ProfileCheckoutCard pageData={profile} />

                {/* Booking summary card */}
                <div className="ck-card" style={{ padding: "28px", marginTop: "18px" }}>
                  <h5 style={{ fontSize: "17px", fontWeight: 800, color: "#1e293b", margin: "0 0 16px", paddingBottom: "14px", borderBottom: "1px solid #f8fafc" }}>
                    Booking Summary
                  </h5>

                  {/* ── Live user details ─────────────────── */}
                  {(info.name || info.phone || info.email || info.age || (info.whom && info.whom !== "Self") || info.notes) && (
                    <div className="ck-live-block">
                      {info.name && (
                        <div className="ck-live-row">
                          <div className="ck-live-icon"><i className="feather-user"></i></div>
                          <div><div className="ck-live-lbl">Name</div><div className="ck-live-val">{info.name}</div></div>
                        </div>
                      )}
                      {info.phone && (
                        <div className="ck-live-row">
                          <div className="ck-live-icon"><i className="feather-phone"></i></div>
                          <div><div className="ck-live-lbl">WhatsApp</div><div className="ck-live-val">{info.phone}</div></div>
                        </div>
                      )}
                      {info.email && (
                        <div className="ck-live-row">
                          <div className="ck-live-icon"><i className="feather-mail"></i></div>
                          <div><div className="ck-live-lbl">Email</div><div className="ck-live-val">{info.email}</div></div>
                        </div>
                      )}
                      {info.age && (
                        <div className="ck-live-row">
                          <div className="ck-live-icon"><i className="feather-calendar"></i></div>
                          <div><div className="ck-live-lbl">Age</div><div className="ck-live-val">{info.age} years</div></div>
                        </div>
                      )}
                      {info.whom && info.whom !== "Self" && (
                        <div className="ck-live-row">
                          <div className="ck-live-icon"><i className="feather-users"></i></div>
                          <div><div className="ck-live-lbl">Booking For</div><div className="ck-live-val">{info.cname || info.whom}</div></div>
                        </div>
                      )}
                      {info.notes && (
                        <div className="ck-live-row">
                          <div className="ck-live-icon"><i className="feather-file-text"></i></div>
                          <div style={{ minWidth: 0 }}>
                            <div className="ck-live-lbl">Concern</div>
                            <div className="ck-live-val" style={{ fontSize: "12.5px", fontWeight: 600, color: "#475569", whiteSpace: "normal", wordBreak: "break-word" }}>
                              {info.notes.length > 70 ? info.notes.slice(0, 70) + "…" : info.notes}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Selected service ──────────────────── */}
                  <div className="ck-srv-tag" style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>{info.service}</div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "3px", textTransform: "capitalize" }}>
                          <i className="feather-video" style={{ marginRight: "4px", fontSize: "12px" }}></i>
                          {info.format} session
                        </div>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: "18px", color: "#228756" }}>₹{amountInfo.amount}</div>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div style={{ paddingBottom: "14px", borderBottom: "1px solid #f8fafc", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#475569", fontWeight: 600, marginBottom: "8px" }}>
                      <span>Subtotal</span><span>₹{amountInfo.amount}</span>
                    </div>
                    {amountInfo.discount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#228756", fontWeight: 700 }}>
                        <span>Coupon Discount</span><span>− ₹{amountInfo.discount}</span>
                      </div>
                    )}
                  </div>

                  {/* Coupon */}
                  <div style={{ marginBottom: "18px" }}>
                    <label className="ck-label">Coupon Code</label>
                    <CouponBlock />
                  </div>

                  {/* Total */}
                  <div className="ck-total-box" style={{ marginBottom: "18px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Total Amount
                      </div>
                      <div style={{ fontSize: "28px", fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>₹{amountInfo.afterdiscount}</div>
                    </div>
                    {amountInfo.discount > 0 && (
                      <div style={{ background: "rgba(34,135,86,.25)", borderRadius: "10px", padding: "6px 12px" }}>
                        <span style={{ color: "#4ade80", fontSize: "13px", fontWeight: 800 }}>Save ₹{amountInfo.discount}</span>
                      </div>
                    )}
                  </div>

                  <ConfirmButton />

                  {/* Trust badges */}
                  <div style={{ display: "flex", justifyContent: "center", gap: "28px", marginTop: "20px" }}>
                    {[["feather-shield", "Secure"], ["feather-lock", "Private"], ["feather-check-circle", "Verified"]].map(([icon, label]) => (
                      <div className="ck-trust" key={label}>
                        <i className={icon}></i>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Mobile sticky footer ─────────────────────────── */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: "#fff", boxShadow: "0 -4px 20px rgba(0,0,0,.1)",
          padding: "12px 20px", display: "flex", alignItems: "center", gap: "14px",
          borderTop: "1px solid #f1f5f9"
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Grand Total
            </div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#1e293b", lineHeight: 1.1 }}>₹{amountInfo.afterdiscount}</div>
            {amountInfo.discount > 0 && (
              <div style={{ fontSize: "11px", color: "#228756", fontWeight: 700 }}>Saved ₹{amountInfo.discount}</div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            style={{
              background: "linear-gradient(135deg,#228756,#1a6b44)",
              border: "none", borderRadius: "14px", color: "#fff",
              fontSize: "15px", fontWeight: 800, padding: "0 28px", height: "52px",
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: "0 6px 15px rgba(34,135,86,.3)"
            }}
          >
            {loading ? "..." : "Continue →"}
          </button>
        </div>
      )}

    </div>
  );
}

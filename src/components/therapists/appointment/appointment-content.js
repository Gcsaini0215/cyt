import React, { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, useMediaQuery } from "@mui/material";
import { FaPlay, FaStop, FaUser, FaNotesMedical, FaClock, FaTimes, FaPhone, FaFileInvoice } from "react-icons/fa";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import { Divider, Button } from "@mui/material";
import { toast } from "react-toastify";
import { postData, fetchData, deleteById } from "../../../utils/actions";
import { StartSessionUrl, EndSessionUrl, getBookings, deleteBookingUrl } from "../../../utils/url";
import VerifyOtpDialog from "../../global/verify-otp-dialog";
import { SESSION_STATUS } from "../../../utils/constant";
import { formatDateTime } from "../../../utils/time";

const AppointmentsContent = ({ appointments: initialAppointments, onRefresh }) => {
  const [appointments, setAppointments] = useState(initialAppointments || []);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [detailTab, setDetailTab] = useState("details");
  const [otpView, setOtpView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionEnding, setSessionEnding] = useState(false);
  const [pin, setPin] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [isRinging, setIsRinging] = useState(false);
  const [newBookingCount, setNewBookingCount] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const isMobile = useMediaQuery("(max-width:768px)");

  const audioRef = useRef(null); // Notification sound
  const appointmentsRef = useRef(appointments);

  // Sync ref with state
  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  // Load notification sound and handle user interaction
  useEffect(() => {
    const audio = new Audio("/notification.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    const handleInteraction = () => {
      setUserInteracted(true);
      // Try to play and immediately pause to "unlock" audio on mobile/modern browsers
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {});
      
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const stopRinging = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsRinging(false);
    setNewBookingCount(0);
  };

  const playRinging = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error("Autoplay blocked or audio error:", err);
        // Show a message to user if audio is still blocked
        toast.info("Please click anywhere on the page to enable booking alerts.");
      });
    }
  };

  // Live update using polling
  useEffect(() => {
    console.log("Starting appointment polling...");
    const interval = setInterval(async () => {
      try {
        const response = await fetchData(getBookings);
        console.log("Polling response:", response?.status, response?.data?.length);
        
        if (response?.status && Array.isArray(response.data)) {
          const currentAppointments = appointmentsRef.current;
          const existingIds = new Set(currentAppointments.map(a => a._id));
          
          const newAppointments = response.data.filter(
            (appt) => !existingIds.has(appt._id)
          );

          if (newAppointments.length > 0) {
            console.log("New bookings found:", newAppointments.length);
            setNewBookingCount(prev => prev + newAppointments.length);
            setIsRinging(true);
            
            // Try to play sound
            if (audioRef.current) {
              audioRef.current.play().catch(err => {
                console.warn("Autoplay blocked:", err);
                setUserInteracted(false); // Trigger "Unlock Audio" UI
              });
            }

            // Update local state with new items at the top
            setAppointments((prev) => {
              const updated = [...newAppointments, ...prev];
              // Keep it unique just in case
              return Array.from(new Map(updated.map(item => [item._id, item])).values());
            });
            
            toast.success(`🔔 ${newAppointments.length} New Booking Received!`, {
              position: "top-right",
              autoClose: 10000,
            });

            if (onRefresh) onRefresh();
          }
        }
      } catch (err) {
        console.error("Error polling appointments:", err);
      }
    }, 10000);

    return () => {
      console.log("Stopping appointment polling...");
      clearInterval(interval);
    };
  }, [onRefresh]);

  /* ── helpers ──────────────────────────────────── */
  const initials = (name) => {
    if (!name) return "?";
    const p = name.trim().split(" ");
    return (p[0][0] + (p[1]?.[0] || "")).toUpperCase();
  };

  const ST_CFG = {
    [SESSION_STATUS.NEW]:       { color: "#3b82f6", bg: "#eff6ff", label: "Pending"   },
    [SESSION_STATUS.STARTED]:   { color: "#22c55e", bg: "#f0fdf4", label: "Active"    },
    [SESSION_STATUS.COMPLETED]: { color: "#64748b", bg: "#f8fafc", label: "Completed" },
    [SESSION_STATUS.CANCELED]:  { color: "#ef4444", bg: "#fff1f2", label: "Cancelled" },
  };
  const getCfg = (status) => ST_CFG[status] || ST_CFG[SESSION_STATUS.NEW];

  const [view, setView] = useState("grid");

  /* ── stats ─────────────────────────────────────── */
  const now = new Date();
  const todayStr = now.toDateString();
  const stats = {
    total:     appointments.length,
    today:     appointments.filter(a => new Date(a.booking_date).toDateString() === todayStr).length,
    upcoming:  appointments.filter(a => a.status === SESSION_STATUS.NEW && new Date(a.booking_date) > now).length,
    active:    appointments.filter(a => a.status === SESSION_STATUS.STARTED).length,
    completed: appointments.filter(a => a.status === SESSION_STATUS.COMPLETED).length,
  };

  /* ── filtered list ──────────────────────────────── */
  const filteredAppointments = appointments.filter(appt => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      (appt.client?.name || "").toLowerCase().includes(q) ||
      appt._id?.toLowerCase().includes(q);

    let matchFilter = true;
    switch (filterStatus) {
      case "today":    matchFilter = new Date(appt.booking_date).toDateString() === todayStr; break;
      case "upcoming": matchFilter = appt.status === SESSION_STATUS.NEW && new Date(appt.booking_date) > now; break;
      case "active":   matchFilter = appt.status === SESSION_STATUS.STARTED; break;
      case "completed":matchFilter = appt.status === SESSION_STATUS.COMPLETED; break;
      case "cancelled":matchFilter = appt.status === SESSION_STATUS.CANCELED; break;
      default:         matchFilter = true;
    }
    return matchSearch && matchFilter;
  });

  // Auto-stop ringing after 60 seconds to prevent annoyance
  useEffect(() => {
    let timer;
    if (isRinging) {
      timer = setTimeout(() => {
        stopRinging();
      }, 60000);
    }
    return () => clearTimeout(timer);
  }, [isRinging]);

  const handleClose = () => setSelectedAppt(null);
  const handleOtpViewClose = () => setOtpView(false);

  const handleDelete = async (appt) => {
    if (!window.confirm(`Delete booking for ${appt.client?.name || "this client"}?`)) return;
    try {
      await deleteById(`${deleteBookingUrl}/${appt._id}`);
      setAppointments(prev => prev.filter(a => a._id !== appt._id));
      if (selectedAppt?._id === appt._id) setSelectedAppt(null);
      toast.success("Booking deleted.");
    } catch {
      toast.error("Delete failed. Try again.");
    }
  };

  const getPaymentStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "success":
      case "completed":
        return "#228756";
      case "pending":
      case "processing":
        return "#ed6c02";
      case "failed":
      case "canceled":
        return "#d32f2f";
      case "refunded":
        return "#1976d2";
      default:
        return "#64748b";
    }
  };

  const handleView = (item) => {
    setSelectedAppt(item);
    setDetailTab("details");
  };

  const handleInvoice = (item) => {
    setSelectedAppt(item);
    setDetailTab("invoice");
  };

  const printInvoice = (item) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.write(`
      <html><head><title>Invoice - ${item.client?.name}</title>
      <style>
        body{font-family:sans-serif;margin:0;padding:0;color:#1e293b;}
        .top{background:#228756;height:12px;width:100%;}
        .body{padding:40px;}
        .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;}
        .brand{color:#228756;font-weight:900;font-size:22px;margin:0;}
        .div{border-top:1px dashed #e2e8f0;margin:20px 0;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
        .lbl{font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin:0 0 4px;}
        .val{font-weight:800;color:#1e293b;font-size:15px;margin:0;}
        .box{background:#f8fafc;padding:20px;border-radius:12px;}
        .row{display:flex;justify-content:space-between;margin-bottom:10px;color:#64748b;font-weight:600;}
        .total{display:flex;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:2px solid #e2e8f0;font-weight:900;font-size:18px;}
        .ft{margin-top:40px;text-align:center;color:#94a3b8;font-size:11px;}
      </style></head><body>
      <div class="top"></div>
      <div class="body">
        <div class="hdr">
          <div><h1 class="brand">Choose Your Therapist LLP</h1><p style="color:#64748b;font-size:13px;margin:4px 0 0">Professional Therapy Services</p></div>
          <div style="text-align:right"><p class="lbl">Invoice #</p><p class="val">${item.transaction?.transaction_id?.slice(-8) || item._id?.slice(-8)}</p></div>
        </div>
        <div class="div"></div>
        <div class="grid">
          <div><p class="lbl">Billed To</p><p class="val">${item.client?.name}</p><p style="color:#64748b;font-size:12px;margin:2px 0 0">Booking ID: #${item._id?.slice(-8)}</p></div>
          <div style="text-align:right"><p class="lbl">Invoice Date</p><p class="val">${formatDateTime(item.booking_date)}</p></div>
        </div>
        <div class="box">
          <div class="row"><span>${item.service} (${item.format})</span><span style="color:#1e293b">₹${item.transaction?.amount}</span></div>
          <div class="total"><span>Total Payable</span><span style="color:#228756">₹${item.transaction?.amount}</span></div>
        </div>
        <div class="ft"><p>Thank you for choosing Choose Your Therapist LLP.<br/>Computer-generated invoice — no signature required.</p></div>
      </div></body></html>
    `);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  const handlePinChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 6) value = value.slice(0, 6);
    setPin(value);
  };

  const handlePin = (item) => {
    setOtpView(true);
    setBookingId(item._id);
  };

  const handleVerifyOtp = async () => {
    if (pin.length !== 6) {
      toast.error("Please enter valid OTP");
      return;
    }
    try {
      setLoading(true);
      const response = await postData(StartSessionUrl, { pin, bookingId });
      if (response.status) {
        setPin("");
        setOtpView(false);
        toast.success(response.message);
        setAppointments(prev => prev.map(appt => appt._id === bookingId ? { ...appt, status: SESSION_STATUS.STARTED } : appt));
      } else toast.error(response.message);
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (item) => {
    try {
      setSessionEnding(true);
      const response = await postData(EndSessionUrl, { bookingId: item._id });
      if (response.status) {
        toast.success(response.message);
        setAppointments(prev => prev.map(appt => appt._id === item._id ? { ...appt, status: SESSION_STATUS.COMPLETED } : appt));
      } else toast.error(response.message);
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      setSessionEnding(false);
    }
  };

  return (
    <>
      <style>{`
        /* ── New booking banner ─── */
        .nb-banner{position:fixed;top:68px;left:50%;transform:translateX(-50%);z-index:5000;width:calc(100% - 32px);max-width:520px;animation:nbDrop .4s cubic-bezier(.34,1.56,.64,1);}
        @keyframes nbDrop{from{transform:translateX(-50%) translateY(-120px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
        .nb-inner{background:linear-gradient(135deg,#064e3b,#228756);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 36px rgba(34,135,86,.45);position:relative;overflow:hidden;}
        .nb-glow{position:absolute;top:-20px;right:-20px;width:80px;height:80px;background:rgba(255,255,255,.12);border-radius:50%;filter:blur(16px);pointer-events:none;}
        .nb-icon{width:40px;height:40px;background:rgba(255,255,255,.18);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;}
        .nb-text{flex:1;min-width:0;}
        .nb-title{font-size:14px;font-weight:800;color:#fff;}
        .nb-sub{font-size:12px;color:rgba(255,255,255,.72);margin-top:2px;}
        .nb-view{background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);color:#fff;font-size:12px;font-weight:700;padding:7px 15px;border-radius:8px;cursor:pointer;flex-shrink:0;font-family:inherit;}
        .nb-cls{width:28px;height:28px;background:rgba(255,255,255,.12);border:none;border-radius:7px;color:rgba(255,255,255,.75);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px;}

        /* ── Stats ─── */
        .ap-stat{background:#fff;border:1.5px solid #f1f5f9;border-radius:14px;padding:14px 16px;transition:all .18s;}
        .ap-stat:hover{transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.08);}

        /* ── Filter tabs ─── */
        .ap-tabs{display:flex;gap:4px;flex-wrap:wrap;}
        .ap-tab{border:none;background:none;padding:7px 16px;border-radius:9px;font-size:12.5px;font-weight:600;color:#64748b;cursor:pointer;transition:all .15s;white-space:nowrap;}
        .ap-tab.on{background:#228756;color:#fff;}
        .ap-tab:hover:not(.on){background:#f0fdf4;color:#228756;}

        /* ── Search ─── */
        .ap-search{position:relative;}
        .ap-search input{padding-left:34px;border-radius:10px;border:1.5px solid #e2e8f0;font-size:13px;background:#f8fafc;height:38px;outline:none;width:240px;transition:border-color .18s;}
        .ap-search input:focus{border-color:#228756;background:#fff;}
        .ap-si{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:15px;}

        /* ── View toggle ─── */
        .ap-vt{display:flex;gap:2px;background:#f1f5f9;border-radius:9px;padding:3px;}
        .ap-vt-b{border:none;background:none;border-radius:7px;padding:6px 12px;font-size:12px;font-weight:600;color:#64748b;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .15s;}
        .ap-vt-b.on{background:#fff;color:#228756;box-shadow:0 1px 4px rgba(0,0,0,.1);}

        /* ── Grid cards ─── */
        .ap-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;}
        .ap-card{background:#fff;border-radius:14px;padding:16px;border:1.5px solid #f1f5f9;border-top-width:3px;cursor:pointer;transition:all .17s;box-shadow:0 1px 4px rgba(0,0,0,.05);display:flex;flex-direction:column;gap:10px;}
        .ap-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.1);}
        .ap-head{display:flex;align-items:center;gap:10px;}
        .ap-av{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;}
        .ap-info{flex:1;min-width:0;}
        .ap-name{font-size:13.5px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .ap-svc{font-size:11px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .ap-badge{font-size:10px;font-weight:800;border-radius:20px;padding:3px 9px;white-space:nowrap;flex-shrink:0;}
        .ap-meta{font-size:11.5px;color:#64748b;display:flex;align-items:center;gap:6px;background:#f8fafc;padding:8px 10px;border-radius:8px;}
        .ap-actions{display:flex;gap:7px;flex-wrap:wrap;}
        .ap-btn{flex:1;min-width:70px;padding:7px 8px;border-radius:9px;border:1.5px solid #e2e8f0;background:#fff;font-size:11.5px;font-weight:700;color:#475569;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .15s;font-family:inherit;}
        .ap-btn:hover{background:#f8fafc;border-color:#cbd5e1;}
        .ap-btn-start{background:linear-gradient(135deg,#228756,#1b6843);color:#fff;border-color:transparent;}
        .ap-btn-start:hover{opacity:.9;background:linear-gradient(135deg,#228756,#1b6843);}
        .ap-btn-end{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border-color:transparent;}
        .ap-btn-end:hover{opacity:.9;background:linear-gradient(135deg,#ef4444,#dc2626);}
        .ap-btn-done{background:#f1f5f9;color:#94a3b8;border-color:transparent;cursor:not-allowed;}

        /* ── List table ─── */
        .ap-table thead th{background:#1e293b !important;color:#fff !important;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding:12px 14px !important;border:none !important;white-space:nowrap;}
        .ap-table td{padding:11px 14px;border-bottom:1px solid #f1f5f9;vertical-align:middle;font-size:13px;}
        .ap-table tbody tr:hover td{background:#f8fafc;cursor:pointer;}

        /* ── Empty ─── */
        .ap-empty{text-align:center;padding:52px 0;color:#94a3b8;}
        .ap-empty i{font-size:40px;display:block;margin-bottom:12px;}

        /* ── Mobile ─── */
        @media(max-width:767px){.ap-grid{grid-template-columns:1fr 1fr;gap:10px;} .desk-view{display:none !important;} .ap-search input{width:100%;}}
        @media(max-width:480px){.ap-grid{grid-template-columns:1fr;}}

        /* ── Right panel ─── */
        .ap-overlay{position:fixed;inset:0;z-index:1299;background:rgba(15,23,42,.35);}
        .ap-panel{position:fixed;top:56px;right:0;bottom:0;width:420px;max-width:100vw;background:#fff;z-index:1300;display:flex;flex-direction:column;box-shadow:-12px 0 40px rgba(0,0,0,.15);animation:panelIn .24s cubic-bezier(.4,0,.2,1);}
        @keyframes panelIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @media(max-width:480px){.ap-panel{width:100%;top:56px;}}
        .ap-panel-hdr{padding:16px 18px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:12px;flex-shrink:0;}
        .ap-panel-tabs{display:flex;gap:2px;padding:10px 18px 0;border-bottom:1px solid #f1f5f9;flex-shrink:0;}
        .ap-panel-tab{padding:8px 18px;border:none;background:none;font-size:13px;font-weight:700;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;font-family:inherit;}
        .ap-panel-tab.on{color:#228756;border-bottom-color:#228756;}
        .ap-panel-body{flex:1;overflow-y:auto;padding:18px;}
        .ap-detail-row{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:12px;border:1px solid #f1f5f9;margin-bottom:10px;}
        .ap-detail-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .ap-detail-lbl{font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.4px;}
        .ap-detail-val{font-size:13.5px;font-weight:700;color:#1e293b;}
      `}</style>

      {/* ── New booking banner ─────────────────────── */}
      {isRinging && (
        <div className="nb-banner">
          <div className="nb-inner">
            <div className="nb-glow" />
            <div className="nb-icon">🔔</div>
            <div className="nb-text">
              <div className="nb-title">{newBookingCount > 1 ? `${newBookingCount} New Bookings!` : "New Booking!"}</div>
              <div className="nb-sub">A client just scheduled a session</div>
            </div>
            <button className="nb-view" onClick={stopRinging}>View →</button>
            <button className="nb-cls" onClick={stopRinging}>✕</button>
          </div>
        </div>
      )}

      {/* ── Audio unlock ──────────────────────────── */}
      {!userInteracted && (
        <div style={{ position: "fixed", bottom: 80, right: 16, zIndex: 1000, background: "#1e293b", color: "#fff", padding: "10px 14px", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,.25)", border: "1px solid rgba(255,255,255,.1)" }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Enable sound alerts</span>
          <button onClick={() => setUserInteracted(true)} style={{ background: "#228756", color: "#fff", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
            Activate
          </button>
        </div>
      )}

      <div className="content container-fluid pb-4">

        {/* ── Header ─────────────────────────────── */}
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div>
            <h4 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Sessions</h4>
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>Manage your client sessions & bookings</p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="ap-vt desk-view">
              <button className={`ap-vt-b ${view === "grid" ? "on" : ""}`} onClick={() => setView("grid")}>
                <i className="feather-grid" style={{ fontSize: 13 }}></i> Grid
              </button>
              <button className={`ap-vt-b ${view === "list" ? "on" : ""}`} onClick={() => setView("list")}>
                <i className="feather-list" style={{ fontSize: 13 }}></i> List
              </button>
            </div>
            <button onClick={onRefresh} className="ap-vt-b" style={{ border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 9 }}>
              <i className="feather-refresh-cw" style={{ fontSize: 13 }}></i> Refresh
            </button>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────── */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total",     val: stats.total,     icon: "feather-calendar",   color: "#3b82f6", bg: "#eff6ff" },
            { label: "Today",     val: stats.today,     icon: "feather-sun",        color: "#8b5cf6", bg: "#f5f3ff" },
            { label: "Upcoming",  val: stats.upcoming,  icon: "feather-clock",      color: "#f59e0b", bg: "#fffbeb" },
            { label: "Completed", val: stats.completed, icon: "feather-check-circle",color: "#22c55e", bg: "#f0fdf4" },
          ].map(s => (
            <div key={s.label} className="col-6 col-lg-3">
              <div className="ap-stat">
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
                    <i className={s.icon} style={{ fontSize: 18 }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", lineHeight: 1.1 }}>{s.val}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter + Search ─────────────────────── */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div className="ap-tabs">
            {[
              { key: "all",       label: "All" },
              { key: "today",     label: "Today" },
              { key: "upcoming",  label: "Upcoming" },
              { key: "active",    label: "Active" },
              { key: "completed", label: "Completed" },
              { key: "cancelled", label: "Cancelled" },
            ].map(t => (
              <button key={t.key} className={`ap-tab ${filterStatus === t.key ? "on" : ""}`}
                onClick={() => setFilterStatus(t.key)}>
                {t.label}
                {filterStatus === t.key && <span style={{ opacity: .65, fontWeight: 400 }}> ({filteredAppointments.length})</span>}
              </button>
            ))}
          </div>
          <div className="ap-search">
            <i className="feather-search ap-si"></i>
            <input type="text" placeholder="Search client…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* ── Grid view ───────────────────────────── */}
        {view === "grid" && (
          filteredAppointments.length === 0 ? (
            <div className="ap-empty">
              <i className="feather-calendar"></i>
              <p style={{ fontWeight: 700, margin: 0 }}>No sessions found</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>
                {(searchTerm || filterStatus !== "all") && (
                  <button onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
                    style={{ background: "none", border: "none", color: "#228756", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                    Clear filters
                  </button>
                )}
              </p>
            </div>
          ) : (
            <div className="ap-grid">
              {filteredAppointments.map(appt => {
                const cfg = getCfg(appt.status);
                const isActive = appt.status === SESSION_STATUS.STARTED;
                const isDone   = appt.status === SESSION_STATUS.COMPLETED || appt.status === SESSION_STATUS.CANCELED;
                return (
                  <div key={appt._id} className="ap-card" style={{ borderTopColor: cfg.color }} onClick={() => handleView(appt)}>
                    <div className="ap-head">
                      <div className="ap-av" style={{ background: cfg.bg, color: cfg.color }}>
                        {appt.client?.photo
                          ? <img src={appt.client.photo} alt="" style={{ width: "100%", height: "100%", borderRadius: 11, objectFit: "cover" }} />
                          : initials(appt.client?.name)}
                      </div>
                      <div className="ap-info">
                        <div className="ap-name">{appt.client?.name || "Unknown"}</div>
                        <div className="ap-svc">{appt.service || "—"} · {appt.format || "Online"}</div>
                      </div>
                      <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>

                    <div className="ap-meta">
                      <i className="feather-clock" style={{ flexShrink: 0, color: "#94a3b8", fontSize: 11 }}></i>
                      {formatDateTime(appt.booking_date)}
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#94a3b8" }}>#{appt._id?.slice(-6)}</span>
                    </div>

                    <div className="ap-actions" onClick={e => e.stopPropagation()}>
                      <button className="ap-btn" onClick={() => handleView(appt)}>
                        <FaUser size={11} /> Details
                      </button>
                      <button className="ap-btn" onClick={() => handleInvoice(appt)}>
                        <FaFileInvoice size={11} /> Invoice
                      </button>
                      {!isDone && (
                        isActive ? (
                          sessionEnding
                            ? <button className="ap-btn ap-btn-done" disabled><CircularProgress size={12} /></button>
                            : <button className="ap-btn ap-btn-end" onClick={() => endSession(appt)}><FaStop size={11} /> End</button>
                        ) : (
                          <button className="ap-btn ap-btn-start" onClick={() => handlePin(appt)}><FaPlay size={11} /> Start</button>
                        )
                      )}
                      <button className="ap-btn" style={{ color:"#ef4444", borderColor:"#fecaca", background:"#fff5f5" }} onClick={() => handleDelete(appt)}>
                        <FaTimes size={11} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── List view (desktop) ──────────────────── */}
        {view === "list" && (
          <div className="desk-view card border-0 shadow-sm overflow-hidden">
            <div className="table-responsive">
              <table className="table mb-0 ap-table" style={{ tableLayout: "fixed", minWidth: 780 }}>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th style={{ width: 180 }}>Client</th>
                    <th style={{ width: 160 }}>Date & Time</th>
                    <th style={{ width: 120 }}>Service</th>
                    <th style={{ width: 80 }}>Format</th>
                    <th style={{ width: 90 }} className="text-center">Status</th>
                    <th style={{ width: 130 }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-5 text-muted">No sessions found</td></tr>
                  ) : filteredAppointments.map((appt, idx) => {
                    const cfg = getCfg(appt.status);
                    const isActive = appt.status === SESSION_STATUS.STARTED;
                    const isDone   = appt.status === SESSION_STATUS.COMPLETED || appt.status === SESSION_STATUS.CANCELED;
                    return (
                      <tr key={appt._id} onClick={() => handleView(appt)}>
                        <td style={{ color: "#94a3b8", fontSize: 12 }}>{idx + 1}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                              {appt.client?.photo
                                ? <img src={appt.client.photo} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                                : initials(appt.client?.name)}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{appt.client?.name || "Unknown"}</div>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: "#475569" }}>{formatDateTime(appt.booking_date)}</td>
                        <td style={{ fontSize: 12, color: "#475569" }}>{appt.service || "—"}</td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 700, background: appt.format === "Offline" ? "#f1f5f9" : "#f0fdf4", color: appt.format === "Offline" ? "#64748b" : "#228756", borderRadius: 20, padding: "2px 8px" }}>
                            {appt.format || "Online"}
                          </span>
                        </td>
                        <td className="text-center">
                          <span style={{ fontSize: 10, fontWeight: 800, background: cfg.bg, color: cfg.color, borderRadius: 20, padding: "3px 9px" }}>{cfg.label}</span>
                        </td>
                        <td className="text-center" onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                            <button className="ap-btn" style={{ minWidth: 0, flex: "none", padding: "5px 8px" }} onClick={() => handleView(appt)}>
                              <FaUser size={10} />
                            </button>
                            {!isDone && (
                              isActive
                                ? <button className="ap-btn ap-btn-end" style={{ minWidth: 0, flex: "none", padding: "5px 8px" }} onClick={() => endSession(appt)}><FaStop size={10} /></button>
                                : <button className="ap-btn ap-btn-start" style={{ minWidth: 0, flex: "none", padding: "5px 8px" }} onClick={() => handlePin(appt)}><FaPlay size={10} /></button>
                            )}
                            <button className="ap-btn" style={{ minWidth:0, flex:"none", padding:"5px 8px", color:"#ef4444", borderColor:"#fecaca", background:"#fff5f5" }} onClick={() => handleDelete(appt)}>
                              <FaTimes size={10} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── Right side panel ─────────────────────── */}
      {selectedAppt && (() => {
        const item = selectedAppt;
        const cfg = getCfg(item.status);
        return (
          <>
            <div className="ap-overlay" onClick={handleClose} />
            <div className="ap-panel">
              {/* Header */}
              <div className="ap-panel-hdr">
                <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                  {item.client?.photo
                    ? <img src={item.client.photo} alt="" style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover" }} />
                    : initials(item.client?.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.client?.name || "Unknown"}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, background: cfg.bg, color: cfg.color, borderRadius: 20, padding: "2px 9px" }}>{cfg.label}</span>
                </div>
                <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", flexShrink: 0 }}>
                  <FaTimes size={13} />
                </button>
              </div>

              {/* Tabs */}
              <div className="ap-panel-tabs">
                <button className={`ap-panel-tab ${detailTab === "details" ? "on" : ""}`} onClick={() => setDetailTab("details")}>
                  <FaUser size={11} style={{ marginRight: 5 }} />Details
                </button>
                <button className={`ap-panel-tab ${detailTab === "invoice" ? "on" : ""}`} onClick={() => setDetailTab("invoice")}>
                  <FaFileInvoice size={11} style={{ marginRight: 5 }} />Invoice
                </button>
              </div>

              {/* Body */}
              <div className="ap-panel-body">
                {detailTab === "details" && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {/* Client info */}
                    <div style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 60, height: 60, borderRadius: 14, background: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
                        {item.client?.photo
                          ? <img src={item.client.photo} alt="" style={{ width: "100%", height: "100%", borderRadius: 14, objectFit: "cover" }} />
                          : initials(item.client?.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>{item.client?.name || "Unknown"}</div>
                        {item.client?.phone && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                            <FaPhone size={11} />{item.client.phone}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>ID: #{item._id?.slice(-8)}</div>
                      </div>
                    </div>

                    <div className="ap-detail-row">
                      <div className="ap-detail-icon" style={{ background: "#e8f5e9", color: "#228756" }}><FaClock size={15} /></div>
                      <div>
                        <div className="ap-detail-lbl">Booking Date</div>
                        <div className="ap-detail-val">{formatDateTime(item.booking_date)}</div>
                      </div>
                    </div>

                    <div className="ap-detail-row">
                      <div className="ap-detail-icon" style={{ background: "#e3f2fd", color: "#1976d2" }}><FaNotesMedical size={15} /></div>
                      <div>
                        <div className="ap-detail-lbl">Service</div>
                        <div className="ap-detail-val">{item.service || "—"} · <span style={{ fontSize: 12, color: "#64748b" }}>{item.format || "Online"}</span></div>
                      </div>
                    </div>

                    <div className="ap-detail-row">
                      <div className="ap-detail-icon" style={{ background: "#fff3e0", color: "#ed6c02" }}>₹</div>
                      <div>
                        <div className="ap-detail-lbl">Amount</div>
                        <div className="ap-detail-val">
                          ₹{item.transaction?.amount || "—"}
                          {item.transaction?.status?.name && (
                            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 800, color: getPaymentStatusColor(item.transaction.status.name), background: getPaymentStatusColor(item.transaction.status.name) + "15", borderRadius: 6, padding: "2px 8px" }}>
                              {item.transaction.status.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.notes && (
                      <div style={{ background: "#f8fafc", borderRadius: 12, padding: "13px 14px", marginTop: 4 }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
                        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{item.notes}</div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                      {item.status === SESSION_STATUS.NEW && (
                        <button className="ap-btn ap-btn-start" style={{ flex: 1, padding: "10px" }} onClick={() => handlePin(item)}>
                          <FaPlay size={12} /> Start Session
                        </button>
                      )}
                      {item.status === SESSION_STATUS.STARTED && (
                        sessionEnding
                          ? <button className="ap-btn ap-btn-done" style={{ flex: 1, padding: "10px" }} disabled><CircularProgress size={14} /></button>
                          : <button className="ap-btn ap-btn-end" style={{ flex: 1, padding: "10px" }} onClick={() => endSession(item)}>
                              <FaStop size={12} /> End Session
                            </button>
                      )}
                      <button className="ap-btn" style={{ flex: 1, padding: "10px" }} onClick={() => setDetailTab("invoice")}>
                        <FaFileInvoice size={12} /> View Invoice
                      </button>
                    </div>
                  </div>
                )}

                {detailTab === "invoice" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 18, color: "#228756" }}>ChooseYourTherapist</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Professional Therapy Services</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Invoice</div>
                        <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 14 }}>#{item.transaction?.transaction_id?.slice(-8) || item._id?.slice(-8)}</div>
                      </div>
                    </div>

                    <Divider sx={{ mb: 2.5, borderStyle: "dashed" }} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>Billed To</div>
                        <div style={{ fontWeight: 800, color: "#1e293b" }}>{item.client?.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>Booking: #{item._id?.slice(-8)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>Date</div>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 13 }}>{formatDateTime(item.booking_date)}</div>
                        <span style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 800, background: getPaymentStatusColor(item.transaction?.status?.name) + "15", color: getPaymentStatusColor(item.transaction?.status?.name), borderRadius: 6, padding: "2px 9px" }}>
                          {item.transaction?.status?.name || "PAID"}
                        </span>
                      </div>
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                        <span>{item.service} ({item.format})</span>
                        <span style={{ color: "#1e293b" }}>₹{item.transaction?.amount}</span>
                      </div>
                      <Divider sx={{ my: 1.5 }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 16 }}>
                        <span>Total</span>
                        <span style={{ color: "#228756" }}>₹{item.transaction?.amount}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <Button fullWidth variant="contained" startIcon={<DownloadIcon />}
                        onClick={() => printInvoice(item)}
                        sx={{ bgcolor: "#228756", "&:hover": { bgcolor: "#1b6843" }, borderRadius: "12px", py: 1.5, textTransform: "none", fontWeight: 800 }}>
                        Download PDF
                      </Button>
                      <Button fullWidth variant="outlined" startIcon={<PrintIcon />}
                        onClick={() => printInvoice(item)}
                        sx={{ borderColor: "#e2e8f0", color: "#64748b", borderRadius: "12px", py: 1.5, textTransform: "none", fontWeight: 800, "&:hover": { borderColor: "#cbd5e1", background: "#f8fafc" } }}>
                        Print
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        );
      })()}

      <VerifyOtpDialog
        open={otpView}
        onClose={handleOtpViewClose}
        placeholder="Enter Pin"
        label="Pin"
        value={pin}
        handleChange={handlePinChange}
        handleClick={handleVerifyOtp}
        loading={loading}
      />
    </>
  );
};

export default AppointmentsContent;

import React, { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, useMediaQuery, Modal, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Typography, Grid, Card } from "@mui/material";
import { FaPlay, FaStop, FaUser, FaNotesMedical, FaClock, FaTimes, FaPhone, FaCheck, FaFileInvoice, FaSearch, FaFilter, FaCalendarDay, FaHistory } from "react-icons/fa";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import { Divider, Button, Chip } from "@mui/material";
import { toast } from "react-toastify";
import { postData, fetchData } from "../../../utils/actions";
import { StartSessionUrl, EndSessionUrl, getBookings } from "../../../utils/url"; // Fixed URL
import VerifyOtpDialog from "../../global/verify-otp-dialog";
import { SESSION_STATUS } from "../../../utils/constant";
import { formatDateTime } from "../../../utils/time";

// Modal Component
const ModalComponent = ({ open, handleClose, content }) => (
  <Modal open={open} onClose={handleClose}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: "0px 12px 45px rgba(0,0,0,0.35)",
        p: 3,
        minWidth: { xs: "90%", sm: 420 },
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      {content}
    </Box>
  </Modal>
);

const AppointmentsContent = ({ appointments: initialAppointments, onRefresh }) => {
  const [appointments, setAppointments] = useState(initialAppointments || []);
  const [open, setOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
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

  // Stats calculation
  const stats = {
    today: appointments.filter(a => new Date(a.booking_date).toDateString() === new Date().toDateString()).length,
    pending: appointments.filter(a => a.status === SESSION_STATUS.PENDING).length,
    completed: appointments.filter(a => a.status === SESSION_STATUS.COMPLETED).length,
    total: appointments.length
  };

  const StatsCard = ({ title, value, icon, color }) => (
    <Card sx={{ 
      p: 2.5, 
      borderRadius: 4, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      border: '1px solid #f1f5f9',
      height: '100%'
    }}>
      <Box sx={{ 
        width: 48, 
        height: 48, 
        borderRadius: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: `${color}15`, 
        color: color 
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
        <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 900 }}>{value}</Typography>
      </Box>
    </Card>
  );

  // Filtered appointments
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          appt._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || appt.status === filterStatus;
    return matchesSearch && matchesStatus;
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

  const handleClose = () => setOpen(false);
  const handleOtpViewClose = () => setOtpView(false);

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
    setOpen(true);
    setModalContent(
      <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ 
            background: "linear-gradient(135deg, #228756, #1b6843)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent", 
            fontWeight: "900", 
            margin: 0,
            fontSize: '1.8rem'
          }}>
            Session Details
          </h3>
          <FaTimes onClick={handleClose} style={{ cursor: "pointer", fontSize: 22, color: "#64748b" }} />
        </div>

        {/* Client Photo & Name */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 16, 
          padding: 20, 
          borderRadius: 20, 
          background: "#f8fafc",
          border: '1px solid #f1f5f9'
        }}>
          {item.client?.photo ? (
            <img src={item.client.photo} alt={item.client?.name || "Client"} style={{ width: 70, height: 70, borderRadius: "18px", objectFit: "cover", boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          ) : (
            <div style={{ width: 70, height: 70, borderRadius: "18px", background: "linear-gradient(135deg, #228756, #1b6843)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff" }}>
              <FaUser />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h5 style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '1.2rem' }}>{item.client?.name || "Unknown Client"}</h5>
            {item.client?.phone && <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, color: '#64748b', fontWeight: 500 }}><FaPhone size={14} /> {item.client.phone}</p>}
          </div>
        </div>

        {/* Booking & Payment Info */}
        <div style={{ display: "grid", gridTemplateColumns: '1fr', gap: 12 }}>
          <div style={{ padding: 16, borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#228756' }}><FaClock /></div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Booking Date</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{formatDateTime(item.booking_date)}</p>
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976d2' }}><FaNotesMedical /></div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Service Details</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{item.service} ({item.format})</p>
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ed6c02' }}><FaUser /></div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Fees & Payment</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>₹{item.transaction?.amount || "-"} • <span style={{ color: getPaymentStatusColor(item.transaction?.status?.name) }}>{item.transaction?.status?.name || "-"}</span></p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ padding: 20, borderRadius: 20, background: "#f8fafc", border: '1px solid #f1f5f9' }}>
          <p style={{ margin: "0 0 10px 0", fontWeight: "800", display: "flex", alignItems: "center", gap: 8, color: '#1e293b' }}>
            <FaNotesMedical color="#228756" /> Medical Notes
          </p>
          <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>{item.notes || "No additional notes provided by the client."}</p>
        </div>
      </div>
    );
  };

  const handleInvoice = (item) => {
    const printInvoice = () => {
      const content = document.getElementById('printable-invoice').innerHTML;
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      doc.write(`
        <html>
          <head>
            <title>Invoice - ${item.client?.name}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
              body { font-family: "Inter", sans-serif; margin: 0; padding: 0; color: #1e293b; }
              .top-banner { background: #228756; height: 12px; width: 100%; }
              .content { padding: 40px; }
              .no-print { display: none !important; }
              .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
              .brand-name { color: #228756; font-weight: 900; font-size: 26px; margin: 0; letter-spacing: -0.5px; }
              .brand-llp { font-size: 14px; color: #64748b; font-weight: 700; }
              .divider { border-top: 1px dashed #e2e8f0; margin: 25px 0; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .label { font-size: 11px; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
              .value { font-weight: 800; color: #1e293b; font-size: 16px; margin: 0; }
              .sub-value { color: #64748b; font-size: 13px; margin: 2px 0 0 0; font-weight: 500; }
              .amount-box { background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #f1f5f9; }
              .amount-row { display: flex; justify-content: space-between; margin-bottom: 12px; color: #64748b; font-weight: 600; }
              .total-row { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 15px; border-top: 2px solid #e2e8f0; font-weight: 900; font-size: 20px; color: #1e293b; }
              .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; font-weight: 500; }
            </style>
          </head>
          <body>
            <div class="top-banner"></div>
            <div class="content">
              <div class="invoice-header">
                <div>
                  <h1 class="brand-name">Choose Your Therapist <span class="brand-llp">LLP</span></h1>
                  <p class="sub-value">Official Therapy & Wellness Services</p>
                </div>
                <div style="text-align: right;">
                  <p class="label">Invoice Number</p>
                  <p class="value">#${item.transaction?.transaction_id?.slice(-8) || item._id?.slice(-8)}</p>
                </div>
              </div>
              <div class="divider"></div>
              <div class="grid">
                <div>
                  <p class="label">Customer Details</p>
                  <p class="value">${item.client?.name}</p>
                  <p class="sub-value">Booking ID: #${item._id?.slice(-8)}</p>
                </div>
                <div style="text-align: right;">
                  <p class="label">Billing Date</p>
                  <p class="value">${formatDateTime(item.booking_date)}</p>
                  <p class="label" style="margin-top: 18px;">Payment Status</p>
                  <p class="value" style="color: #228756; background: #e8f5e9; display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 13px;">${item.transaction?.status?.name || 'SUCCESS'}</p>
                </div>
              </div>
              <div class="amount-box">
                <div class="amount-row">
                  <span>Service: ${item.service} (${item.format})</span>
                  <span style="color: #1e293b;">₹${item.transaction?.amount}</span>
                </div>
                <div class="total-row">
                  <span>Total Payable</span>
                  <span style="color: #228756;">₹${item.transaction?.amount}</span>
                </div>
              </div>
              <div class="footer">
                <p>Thank you for choosing Choose Your Therapist LLP.<br/>This is a computer-generated invoice and does not require a signature.</p>
              </div>
            </div>
          </body>
        </html>
      `);
      doc.close();
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };

    setOpen(true);
    setModalContent(
      <div id="printable-invoice" style={{ padding: 10 }}>
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#228756', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <ReceiptLongIcon />
            </div>
            <h3 style={{ margin: 0, fontWeight: 900, color: '#1e293b' }}>Invoice</h3>
          </div>
          <FaTimes onClick={handleClose} style={{ cursor: "pointer", fontSize: 22, color: "#64748b" }} />
        </div>

        {/* Invoice Body */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
          <div>
            <h4 style={{ margin: 0, fontWeight: 900, color: '#228756', fontSize: '1.4rem' }}>ChooseYourTherapist</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13, fontWeight: 500 }}>Professional Therapy Services</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Invoice ID</p>
            <p style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>#{item.transaction?.transaction_id?.slice(-8) || item._id?.slice(-8)}</p>
          </div>
        </div>

        <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Billed To</p>
            <p style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{item.client?.name}</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13, fontWeight: 500 }}>Booking ID: #{item._id?.slice(-8)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Invoice Date</p>
            <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{formatDateTime(item.booking_date)}</p>
            <p style={{ margin: '12px 0 4px 0', fontSize: 11, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Payment Status</p>
            <span style={{ 
              padding: '4px 10px', 
              borderRadius: 8, 
              fontSize: 11, 
              fontWeight: 800, 
              background: getPaymentStatusColor(item.transaction?.status?.name) + '15',
              color: getPaymentStatusColor(item.transaction?.status?.name)
            }}>
              {item.transaction?.status?.name || 'PAID'}
            </span>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 20, marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>{item.service} Fee</p>
            <p style={{ margin: 0, fontWeight: 700 }}>₹{item.transaction?.amount}</p>
          </div>
          <Divider sx={{ my: 2 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>Total Amount</p>
            <p style={{ margin: 0, fontWeight: 900, color: '#228756', fontSize: '1.2rem' }}>₹{item.transaction?.amount}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={printInvoice}
            sx={{ bgcolor: '#228756', '&:hover': { bgcolor: '#1b6843' }, borderRadius: '14px', py: 1.5, textTransform: 'none', fontWeight: 800, boxShadow: '0 4px 12px rgba(34, 135, 86, 0.2)' }}
          >
            Download PDF
          </Button>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={printInvoice}
            sx={{ borderColor: '#f1f5f9', color: '#64748b', borderRadius: '14px', py: 1.5, textTransform: 'none', fontWeight: 800, '&:hover': { borderColor: '#e2e8f0', background: '#f8fafc' } }}
          >
            Print
          </Button>
        </div>
      </div>
    );
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

  const handleLoadMore = () => setVisibleCount(prev => prev + 6);
  const visibleAppointments = filteredAppointments.slice(0, visibleCount);

  return (
    <>
      {/* Ringing Overlay */}
      {isRinging && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(34, 135, 86, 0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          p: 3,
          animation: 'pulse 2s infinite'
        }}>
          <Box sx={{ 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            bgcolor: '#fff', 
            color: '#228756',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            boxShadow: '0 0 50px rgba(255,255,255,0.5)',
          }}>
            <FaClock size={60} className="animate-bounce" />
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 1 }}>NEW BOOKING!</Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>You have {newBookingCount} new appointment request(s)</Typography>
          
          <Button 
            variant="contained" 
            size="large"
            onClick={stopRinging}
            sx={{ 
              bgcolor: '#fff', 
              color: '#228756', 
              fontWeight: 900,
              px: 6,
              py: 2,
              borderRadius: 4,
              fontSize: '1.2rem',
              '&:hover': { bgcolor: '#f8fafc' }
            }}
          >
            I'M CHECKING NOW
          </Button>

          <style jsx global>{`
            @keyframes pulse {
              0% { background-color: rgba(34, 135, 86, 0.95); }
              50% { background-color: rgba(27, 104, 67, 0.98); }
              100% { background-color: rgba(34, 135, 86, 0.95); }
            }
            .animate-bounce {
              animation: bounce 1s infinite;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
              50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
            }
          `}</style>
        </Box>
      )}

      {/* Audio Unlock Helper */}
      {!userInteracted && (
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: '#1e293b',
          color: '#fff',
          p: 2,
          borderRadius: 3,
          zIndex: 1000,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Enable sound alerts</Typography>
          <Button 
            size="small" 
            variant="contained" 
            sx={{ bgcolor: '#228756', fontWeight: 800 }}
            onClick={() => setUserInteracted(true)}
          >
            Click to Activate
          </Button>
        </Box>
      )}

      {/* Search and Filter Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2, 
        mb: 4, 
        px: '10px',
        alignItems: 'center'
      }}>
        <TextField
          fullWidth
          placeholder="Search client name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': { 
              borderRadius: 3,
              bgcolor: '#fff',
              '& fieldset': { borderColor: '#f1f5f9' },
            }
          }}
        />
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            displayEmpty
            sx={{ 
              borderRadius: 3, 
              bgcolor: '#fff',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#f1f5f9' }
            }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value={SESSION_STATUS.PENDING}>Pending</MenuItem>
            <MenuItem value={SESSION_STATUS.STARTED}>Active</MenuItem>
            <MenuItem value={SESSION_STATUS.COMPLETED}>Completed</MenuItem>
            <MenuItem value={SESSION_STATUS.CANCELED}>Canceled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <h4 style={{ marginBottom: 20, fontWeight: 900, color: "#1e293b", fontSize: "1.2rem", padding: '0 10px' }}>
        {searchTerm || filterStatus !== 'all' ? `Filtered Results (${filteredAppointments.length})` : `Recent Sessions (${appointments.length})`}
      </h4>

      {filteredAppointments.length > 0 ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(380px, 1fr))", gap: 24, padding: '10px' }}>
            {visibleAppointments.map((appt) => {
              const sessionNumber = appointments.filter(a => a.client?._id === appt.client?._id && new Date(a.booking_date) <= new Date(appt.booking_date)).length;
              return (
                <div key={appt._id} style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  padding: 24, 
                  borderRadius: 24, 
                  background: "#fff", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)", 
                  border: "1px solid #f1f5f9",
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Modern Badge Header */}
                  <div style={{ display: "flex", justifyContent: 'space-between', alignItems: "center", marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800, color: "#228756", background: "#e8f5e9", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Session {sessionNumber}</span>
                      <span style={{ 
                        padding: "4px 10px", 
                        borderRadius: 8, 
                        fontSize: 11, 
                        fontWeight: 800, 
                        color: "#fff", 
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: appt.status === SESSION_STATUS.STARTED ? "linear-gradient(135deg,#228756,#1b6843)" : appt.status === SESSION_STATUS.COMPLETED ? "#64748b" : "#ed6c02" 
                      }}>
                        {appt.status}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>#{appt._id?.slice(-6)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    {appt.client?.photo ? (
                      <img src={appt.client.photo} alt={appt.client?.name || "Client"} style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <FaUser size={24} />
                      </div>
                    )}
                    <div>
                      <h6 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{appt.client?.name}</h6>
                      <p style={{ margin: "2px 0 0 0", fontSize: 14, color: '#64748b', fontWeight: 500 }}>{appt.service} • {appt.format}</p>
                    </div>
                  </div>

                  <div style={{ 
                    background: '#f8fafc', 
                    padding: 16, 
                    borderRadius: 16, 
                    marginBottom: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1e293b', fontWeight: 600 }}>
                      <FaClock color="#228756" /> {formatDateTime(appt.booking_date)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1e293b', fontWeight: 600 }}>
                      <FaCheck color="#228756" /> Payment: <span style={{ color: getPaymentStatusColor(appt.transaction?.status?.name), fontWeight: 800 }}>{appt.transaction?.status?.name || "-"}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button 
                        onClick={() => handleView(appt)} 
                        style={{ 
                          flex: 1,
                          padding: "10px", 
                          borderRadius: 12, 
                          background: "#fff", 
                          border: "1.5px solid #f1f5f9", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: 'center',
                          gap: 8,
                          fontWeight: 700,
                          color: '#475569',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                      >
                        <FaUser size={14} /> Details
                      </button>
                      <button 
                        onClick={() => handleInvoice(appt)} 
                        style={{ 
                          flex: 1,
                          padding: "10px", 
                          borderRadius: 12, 
                          background: "#fff", 
                          border: "1.5px solid #f1f5f9", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: 'center',
                          gap: 8,
                          fontWeight: 700,
                          color: '#475569',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                      >
                        <FaFileInvoice size={14} /> Invoice
                      </button>
                    </div>

                    {appt.status !== SESSION_STATUS.COMPLETED && appt.status !== SESSION_STATUS.CANCELED ? (
                      appt.status === SESSION_STATUS.STARTED ? (
                        sessionEnding ? <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}><CircularProgress size={26} /></Box> :
                        <button 
                          onClick={() => endSession(appt)} 
                          style={{ 
                            width: '100%',
                            padding: "12px", 
                            borderRadius: 12, 
                            background: "linear-gradient(135deg,#ef4444,#dc2626)", 
                            color: "#fff", 
                            border: "none", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: 'center',
                            gap: 8,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                          }}
                        >
                          <FaStop size={14} /> End Session
                        </button>
                      ) :
                      <button 
                        onClick={() => handlePin(appt)} 
                        style={{ 
                          width: '100%',
                          padding: "12px", 
                          borderRadius: 12, 
                          background: "linear-gradient(135deg, #228756 0%, #1b6843 100%)", 
                          color: "#fff", 
                          border: "none", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: 'center',
                          gap: 8,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(34, 135, 86, 0.2)'
                        }}
                      >
                        <FaPlay size={14} /> Start Session
                      </button>
                    ) : (
                      <button 
                        disabled 
                        style={{ 
                          width: '100%',
                          padding: "12px", 
                          borderRadius: 12, 
                          background: "#f1f5f9", 
                          color: "#94a3b8", 
                          border: "none", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: 'center',
                          gap: 8,
                          fontWeight: 700
                        }}
                      >
                        <FaCheck size={14} /> Session Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount < filteredAppointments.length && (
            <div style={{ textAlign: "center", marginTop: 40, marginBottom: 40 }}>
              <button 
                onClick={handleLoadMore} 
                style={{ 
                  padding: "14px 32px", 
                  borderRadius: 14, 
                  background: "linear-gradient(135deg, #228756 0%, #1b6843 100%)", 
                  color: "#fff", 
                  fontWeight: 800, 
                  border: "none", 
                  cursor: "pointer", 
                  fontSize: 16,
                  boxShadow: '0 8px 20px rgba(34, 135, 86, 0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Load More Sessions
              </button>
            </div>
          )}
        </>
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          py: 10, 
          bgcolor: '#fff', 
          borderRadius: 6, 
          border: '1px dashed #e2e8f0',
          mx: '10px'
        }}>
          <Box sx={{ fontSize: '4rem', mb: 2 }}>📂</Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>No Appointments Found</Typography>
          <Typography sx={{ color: '#64748b', mb: 3 }}>Try adjusting your search or filters to find what you're looking for.</Typography>
          {(searchTerm || filterStatus !== 'all') && (
            <Button 
              variant="outlined" 
              onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#475569' }}
            >
              Clear All Filters
            </Button>
          )}
        </Box>
      )}
      {isRinging && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 80, sm: 20 }, // Adjust for mobile bottom nav
            right: 20,
            zIndex: 9999,
            bgcolor: "#fff",
            p: 3,
            borderRadius: 4,
            boxShadow: "0px 10px 40px rgba(0,0,0,0.2)",
            border: "2px solid #228756",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            animation: "pulse 1.5s infinite",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.05)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        >
          <Box sx={{ color: "#228756", fontSize: "2.5rem" }}>🔔</Box>
          <h3 style={{ margin: 0, color: "#1e293b", fontWeight: 800, textAlign: "center" }}>New Booking Received!</h3>
          <p style={{ margin: 0, color: "#64748b", fontWeight: 500, textAlign: "center" }}>
            You have {newBookingCount} new appointment request(s).
          </p>
          <Button
            variant="contained"
            onClick={stopRinging}
            sx={{
              bgcolor: "#228756",
              "&:hover": { bgcolor: "#1b6843" },
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 800,
              width: "100%"
            }}
          >
            Accept / Stop Ringing
          </Button>
        </Box>
      )}

      <ModalComponent open={open} handleClose={handleClose} content={modalContent} />
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

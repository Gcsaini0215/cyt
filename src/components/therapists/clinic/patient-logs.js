import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Avatar,
  Chip,
  Button,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  Popover
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PhoneIcon from "@mui/icons-material/Phone";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EmailIcon from "@mui/icons-material/Email";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import FileInvoiceIcon from "@mui/icons-material/Receipt";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { getClinicLogsUrl, createClinicLogUrl, updateClinicLogUrl, deleteClinicLogUrl, sendClinicInvoiceEmailUrl } from "../../../utils/url";
import { fetchById, postData, putData, deleteById } from "../../../utils/actions";
import axios from "axios";
import { useMediaQueryClient } from "../../../hooks/useMediaQueryClient";
import useTherapistStore from "../../../store/therapistStore";

export default function ClientLogs() {
  const isMobile = useMediaQueryClient("sm");
  const { therapistInfo } = useTherapistStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("We hope you're doing well. Thank you for choosing ChooseYourTherapist for your clinic visit. Please find your invoice details below. You can view or download the full invoice using the link provided.");
  const [origin, setOrigin] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    type: "Clinic",
    amount: "",
    remainingAmount: "",
    status: "Paid",
    packageName: "Individual Session",
    paidVia: "Online",
    date: dayjs()
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchById(getClinicLogsUrl);
      if (response.status) {
        const logsData = response.data || [];
        // Map _id from MongoDB to id for frontend consistency
        const mappedLogs = (Array.isArray(logsData) ? logsData : []).map(log => ({
          ...log,
          id: log._id || log.id,
          packageName: log.packageName || log.medicineName || "Individual Session",
          paidVia: log.paidVia || log.medication || "Online"
        }));
        setLogs(mappedLogs);
        // Sync with localStorage
        localStorage.setItem('clinicLogs', JSON.stringify(mappedLogs));
        setIsOffline(false);
      } else {
        console.error("Server returned false status:", response);
        setIsOffline(true);
      }
    } catch (error) {
      console.error("ERROR FETCHING FROM SERVER:", {
        message: error.message,
        status: error.response?.status,
        url: getClinicLogsUrl,
        data: error.response?.data
      });
      setIsOffline(true);
      
      if (error.response?.status === 404) {
        toast.error("API Error: '/clinic-logs' endpoint not found on server.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    
    // Load from localStorage first for instant display
    const localLogs = localStorage.getItem('clinicLogs');
    if (localLogs) {
      try {
        setLogs(JSON.parse(localLogs));
      } catch (e) {
        console.error("Error parsing localLogs", e);
      }
    }
    
    // Then fetch from API
    fetchLogs();
  }, [fetchLogs]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, date: newDate });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.amount || !formData.date || !formData.type) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date.format('YYYY-MM-DD'),
        type: formData.type,
        amount: formData.amount,
        remainingAmount: formData.remainingAmount,
        status: formData.status,
        packageName: formData.packageName,
        medicineName: formData.packageName, // Mapping for backend
        paidVia: formData.paidVia,
        medication: formData.paidVia, // Mapping for backend
        therapist_name: therapistInfo?.user?.name,
        therapist_type: therapistInfo?.profile_type
      };

      if (formData.id) {
        // Edit mode
        await putData(`${updateClinicLogUrl}/${formData.id}`, payload);
        toast.success("Entry updated on server & device!");
      } else {
        // Add mode
        await postData(createClinicLogUrl, payload);
        toast.success("Client entry saved to server & device!");
      }

      setFormData({ id: null, name: "", email: "", phone: "", type: "Clinic", amount: "", remainingAmount: "", status: "Paid", packageName: "Individual Session", paidVia: "Online", date: dayjs() });
      await fetchLogs(); // Refresh both sources
      
    } catch (error) {
      console.error("CRITICAL API ERROR:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: formData.id ? `${updateClinicLogUrl}/${formData.id}` : createClinicLogUrl
      });
      
      // Fallback: Save locally if API fails
      const fallbackId = formData.id || Date.now();
      const localEntry = {
        ...formData,
        id: fallbackId,
        _id: fallbackId,
        date: formData.date.format('YYYY-MM-DD'),
        therapist_name: therapistInfo?.user?.name,
        therapist_type: therapistInfo?.profile_type,
        isLocalOnly: true 
      };

      const updatedLogs = formData.id 
        ? logs.map(l => (l._id || l.id) === formData.id ? localEntry : l)
        : [localEntry, ...logs];

      setLogs(updatedLogs);
      localStorage.setItem('clinicLogs', JSON.stringify(updatedLogs));
      toast.warning("Saved locally (Server offline)");
      
      setFormData({ id: null, name: "", email: "", phone: "", type: "Clinic", amount: "", remainingAmount: "", status: "Paid", packageName: "Individual Session", paidVia: "Online", date: dayjs() });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        setSubmitting(true);
        // Try deleting from API first
        try {
          await deleteById(`${deleteClinicLogUrl}/${id}`);
          toast.success("Entry deleted from server!");
        } catch (apiError) {
          console.error("API Delete failed:", apiError);
          toast.warning("Deleted from device (Server sync failed)");
        }
        
        // Always remove from local state/cache
        const updatedLogs = logs.filter(log => (log._id || log.id) !== id);
        setLogs(updatedLogs);
        localStorage.setItem('clinicLogs', JSON.stringify(updatedLogs));
        
        await fetchLogs(); // Refresh to ensure sync
      } catch (error) {
        console.error("Error deleting entry:", error);
        toast.error("Failed to delete entry");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSendEmail = (log) => {
    if (!log.email) {
      toast.error("No email address provided for this client");
      return;
    }
    setSelectedLog(log);
    
    // Dynamic message based on visit type
    let typeText = "in-person visit";
    if (log.type === 'Online') typeText = "online session";
    if (log.type === 'Home Visit') typeText = "home visit";
    
    setEmailMessage(`We hope you're doing well. Thank you for choosing Choose Your Therapist for your ${typeText}. Please find your invoice details below. You can view or download the full invoice using the link provided.`);
    setEmailDialogOpen(true);
  };

  const confirmSendEmail = async () => {
    if (!selectedLog) return;

    try {
      setSubmitting(true);
      
      const liveOrigin = "https://chooseyourtherapist.in";
      // Ensure we use the correct ID for the link
      const logId = selectedLog._id || selectedLog.id;
      const invoiceIdValue = logId ? logId.toString().slice(-8) : "UNKNOWN";
      
      const emailTemplate = {
        to: selectedLog.email,
        subject: `Invoice from Choose Your Therapist - #${invoiceIdValue}`,
        message: emailMessage,
        invoiceId: invoiceIdValue,
        invoiceLink: `${liveOrigin}/invoice/${logId}`, 
        clientName: selectedLog.name,
        amount: selectedLog.amount,
        date: selectedLog.date,
        phone: selectedLog.phone,
        therapistName: therapistInfo?.user?.name || "Your Therapist",
        therapistType: therapistInfo?.profile_type
      };

      // Call the Next.js API route
      await axios.post(sendClinicInvoiceEmailUrl, emailTemplate);
      
      // Update local state to show email sent
      const updatedLogs = logs.map(l => 
        (l._id || l.id) === selectedLog.id ? { ...l, emailSent: true } : l
      );
      setLogs(updatedLogs);
      localStorage.setItem('clinicLogs', JSON.stringify(updatedLogs));

      toast.success(`Invoice email sent to ${selectedLog.email}`);
      setEmailDialogOpen(false);
      await fetchLogs(); // Final sync with server
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (log) => {
    setFormData({
      id: log.id,
      name: log.name,
      email: log.email || "",
      phone: log.phone,
      type: log.type,
      amount: log.amount,
      remainingAmount: log.remainingAmount || '',
      status: log.status || "Paid",
      packageName: log.packageName || log.medicineName || "Individual Session",
      paidVia: log.paidVia || log.medication || "Online",
      date: dayjs(log.date)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInvoice = (log) => {
    const invoiceId = log._id || log.id;
    if (invoiceId) {
      window.open(`/invoice/${invoiceId}`, '_blank');
    } else {
      toast.error("Invalid Invoice ID");
    }
  };

  const handleCloseInvoice = () => {
    setInvoiceOpen(false);
    setSelectedLog(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ pb: 4, mt: -2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#228756' }} />
          </Box>
        )}
        {!loading && (
          <>
            {/* Premium Quick Client Entry Card */}
            <Paper 
              elevation={0} 
              sx={{ 
                mb: 4, 
                borderRadius: '16px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                background: '#ffffff',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Green Header Banner - Mobile Friendly */}
              <Box sx={{ 
                bgcolor: '#228756', 
                py: 2.2, 
                px: { xs: 2, sm: 4 },
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #228756 0%, #1b6843 100%)',
                flexWrap: 'nowrap',
                gap: 1.2
              }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '1px', fontSize: { xs: '1.3rem', sm: '1.5rem' }, flex: 1 }}>
                  {formData.id ? "EDIT INVOICE ENTRY" : "GENERATE NEW INVOICE"}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.2 }, position: 'relative', width: { xs: 'auto', sm: 'auto' } }}>
                  {isOffline && (
                    <Chip 
                      label="Offline Mode" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(239, 68, 68, 0.2)', 
                        color: '#ffffff', 
                        fontWeight: 900, 
                        fontSize: '0.65rem',
                        height: '24px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                  )}
                  <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{ 
                      color: formData.date && formData.date.isValid() ? '#ffffff' : '#d32f2f',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                      width: { xs: '36px', sm: '40px' },
                      height: { xs: '36px', sm: '40px' },
                      padding: { xs: '4px', sm: 0 },
                      minWidth: 'auto',
                      flexShrink: 0
                    }}
                  >
                    <CalendarMonthIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  </IconButton>

                  <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={formData.date}
                          onChange={(newDate) => {
                            handleDateChange(newDate);
                            setAnchorEl(null);
                          }}
                          slotProps={{
                            paper: {
                              sx: {
                                bgcolor: '#ffffff',
                                '& .MuiPickersDay-root': {
                                  fontSize: '1.3rem',
                                  fontWeight: 700,
                                  height: '40px',
                                  width: '40px'
                                },
                                '& .MuiDayCalendar-weekDayLabel': {
                                  fontSize: '1.1rem',
                                  fontWeight: 700
                                }
                              }
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Popover>
                  <TextField
                    select
                    size="small"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    sx={{ 
                      minWidth: { xs: '120px', sm: '180px' },
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '6px',
                        bgcolor: '#ffffff',
                        color: '#1e293b'
                      },
                      '& .MuiOutlinedInput-input': {
                        py: { xs: 0.8, sm: 1.2 },
                        fontSize: { xs: '0.9rem', sm: '1.1rem' },
                        fontWeight: 700,
                        textAlign: 'center',
                        padding: { xs: '6px 4px', sm: 'auto' }
                      }
                    }}
                  >
                    <MenuItem value="Clinic">In-Person</MenuItem>
                    <MenuItem value="Home Visit">Home Visit</MenuItem>
                    <MenuItem value="Online">Online</MenuItem>
                  </TextField>
                </Box>
              </Box>
              
              <Box sx={{ p: isMobile ? 2.5 : 3 }}>
                <form onSubmit={handleAddClient}>
                  <Grid container spacing={isMobile ? 1.5 : 2} alignItems="center">
                    <Grid item xs={12} sm={2.5}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Client Name / Invoice For"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                          '& .MuiOutlinedInput-input': { fontWeight: 600 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Email ID (Optional)"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                          '& .MuiOutlinedInput-input': { fontWeight: 600 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1.5}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Phone No."
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                          '& .MuiOutlinedInput-input': { fontWeight: 600 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Fees"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ fontSize: 16, color: '#228756' }} /></InputAdornment>,
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                          '& .MuiOutlinedInput-input': { fontWeight: 700 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Remaining"
                        name="remainingAmount"
                        type="number"
                        value={formData.remainingAmount}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ fontSize: 16, color: '#ef4444' }} /></InputAdornment>,
                        }}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                          '& .MuiOutlinedInput-input': { fontWeight: 700 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        sx={{ 
                          bgcolor: formData.id ? '#1e40af' : '#228756', 
                          '&:hover': { bgcolor: formData.id ? '#1e3a8a' : '#1b6843' },
                          '&:disabled': { bgcolor: '#cbd5e1', color: '#94a3b8' },
                          borderRadius: '12px',
                          py: isMobile ? 1.5 : 1.2,
                          fontWeight: 800,
                          fontSize: isMobile ? '1rem' : '0.95rem',
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(34, 135, 86, 0.15)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {submitting ? "Saving..." : (formData.id ? "Update" : "Save")}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            </Paper>

            {/* Month Badges */}
            {(() => {
              const groupedByMonth = {};
              logs.forEach(log => {
                const date = dayjs(log.date, 'DD MMM YYYY');
                const monthKey = date.format('MMM YYYY');
                if (!groupedByMonth[monthKey]) {
                  groupedByMonth[monthKey] = [];
                }
                groupedByMonth[monthKey].push(log);
              });

              const completedMonths = Object.entries(groupedByMonth)
                .filter(([_, entries]) => entries.length === 31)
                .map(([month]) => month);

              return completedMonths.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                  {completedMonths.map((month) => (
                    <Chip
                      key={month}
                      label={month}
                      sx={{
                        bgcolor: '#228756',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '14px',
                        py: 3,
                        px: 2
                      }}
                    />
                  ))}
                </Box>
              ) : null;
            })()}

            {/* Client Records Table */}
            {!isMobile ? (
              <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0', 
                  overflow: 'auto',
                  boxShadow: '0 4px 25px rgba(0,0,0,0.02)',
                  background: '#ffffff',
                  maxHeight: 'calc(100vh - 400px)',
                  minHeight: '500px'
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900, color: '#ffffff', bgcolor: '#228756', py: 2, pl: 4, fontSize: '1.1rem' }}>INVOICE DETAILS</TableCell>
                      <TableCell sx={{ fontWeight: 900, color: '#ffffff', bgcolor: '#228756', py: 2, fontSize: '1.1rem' }}>VISIT DATE</TableCell>
                      <TableCell sx={{ fontWeight: 900, color: '#ffffff', bgcolor: '#228756', py: 2, fontSize: '1.1rem' }}>TYPE</TableCell>
                      <TableCell sx={{ fontWeight: 900, color: '#ffffff', bgcolor: '#228756', py: 2, fontSize: '1.1rem' }}>FEES</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: '#ffffff', bgcolor: '#228756', pr: 4, py: 2, fontSize: '1.1rem' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...logs].sort((a, b) => {
                      const dateA = dayjs(a.date, 'DD MMM YYYY');
                      const dateB = dayjs(b.date, 'DD MMM YYYY');
                      return dateB - dateA;
                    }).map((log) => (
                      <TableRow key={log.id} sx={{ '&:hover': { bgcolor: '#fbfcfd' }, transition: 'background 0.2s' }}>
                        <TableCell sx={{ pl: 4, py: 2.5 }}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.3rem' }}>{log.name}</Typography>
                            {log.email && (
                              <Typography variant="body2" sx={{ color: '#228756', fontWeight: 700, fontSize: '1.15rem', display: 'block' }}>
                                {log.email}
                              </Typography>
                            )}
                            {log.phone && <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '1.15rem' }}>{log.phone}</Typography>}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#475569', fontSize: '1.25rem', fontWeight: 800 }}>{log.date}</TableCell>
                        <TableCell>
                          <Box>
                            <Chip 
                              label={log.type === 'Clinic' ? 'In-Person' : log.type} 
                              size="small" 
                              sx={{ 
                                bgcolor: log.type === 'Clinic' ? '#f0fdf4' : '#eff6ff', 
                                color: log.type === 'Clinic' ? '#166534' : '#1e40af', 
                                fontWeight: 900, 
                                borderRadius: '6px',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                px: 1,
                                mb: 0.5
                              }} 
                            />
                            <Typography sx={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 700 }}>
                              {log.packageName || log.medicineName || 'Individual Session'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.4rem' }}>
                              ₹{log.amount}
                            </Typography>
                            <Typography sx={{ fontSize: '1.1rem', color: '#228756', fontWeight: 700 }}>
                              {log.paidVia || log.medication || 'Online'}
                            </Typography>
                            {log.remainingAmount && (
                              <Typography component="span" sx={{ color: '#d32f2f', fontWeight: 900, fontSize: '1.15rem' }}>
                                (Due: ₹{log.remainingAmount})
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 4 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title={log.emailSent ? "Email Sent" : "Send Email"}>
                              <span>
                                <IconButton 
                                  size="medium" 
                                  onClick={() => handleSendEmail(log)} 
                                  disabled={submitting}
                                  sx={{ 
                                    color: log.emailSent ? '#16a34a' : '#f59e0b', 
                                    bgcolor: log.emailSent ? 'rgba(22, 163, 74, 0.05)' : 'rgba(245, 158, 11, 0.05)', 
                                    '&:hover': { bgcolor: log.emailSent ? 'rgba(22, 163, 74, 0.1)' : 'rgba(245, 158, 11, 0.1)' }, 
                                  }}
                                >
                                  {log.emailSent ? <MarkEmailReadIcon fontSize="medium" /> : <EmailIcon fontSize="medium" />}
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Invoice">
                              <span>
                                <IconButton 
                                  size="medium" 
                                  onClick={() => handleInvoice(log)} 
                                  disabled={submitting}
                                  sx={{ color: '#228756', bgcolor: 'rgba(34, 135, 86, 0.05)', '&:hover': { bgcolor: 'rgba(34, 135, 86, 0.1)' } }}
                                >
                                  <ReceiptLongIcon fontSize="medium" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <span>
                                <IconButton 
                                  size="medium" 
                                  onClick={() => handleEdit(log)} 
                                  disabled={submitting}
                                  sx={{ color: '#1976d2', bgcolor: 'rgba(25, 118, 210, 0.05)', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' } }}
                                >
                                  <EditIcon fontSize="medium" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <span>
                                <IconButton 
                                  size="medium" 
                                  onClick={() => handleDelete(log._id || log.id)} 
                                  disabled={submitting}
                                  sx={{ color: '#d32f2f', bgcolor: 'rgba(211, 47, 47, 0.05)', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' } }}
                                >
                                  <DeleteOutlineIcon fontSize="medium" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {logs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                          <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>No client records found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              /* Mobile Card View */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[...logs].sort((a, b) => {
                  const dateA = dayjs(a.date, 'DD MMM YYYY');
                  const dateB = dayjs(b.date, 'DD MMM YYYY');
                  return dateB - dateA;
                }).map((log) => (
                  <Paper 
                    key={log.id} 
                    elevation={0} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: '20px', 
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                      background: '#fff'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.25rem' }}>{log.name}</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>{log.date} • {log.type === 'Clinic' ? 'In-Person' : log.type}</Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#228756', fontWeight: 800, mt: 0.5 }}>{log.packageName || log.medicineName || 'Individual Session'}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, p: 2, bgcolor: '#f8fafc', borderRadius: '14px' }}>
                      <Box>
                        <Typography sx={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fees ({log.paidVia || log.medication || 'Online'})</Typography>
                        <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>₹{log.amount}</Typography>
                      </Box>
                      {log.remainingAmount && (
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: '11px', color: '#f87171', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining</Typography>
                          <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#d32f2f' }}>₹{log.remainingAmount}</Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="soft"
                        size="small"
                        onClick={() => handleInvoice(log)}
                        startIcon={<ReceiptLongIcon />}
                        sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 800, borderRadius: '10px', py: 1 }}
                      >
                        Invoice
                      </Button>
                      <Button
                        fullWidth
                        variant="soft"
                        size="small"
                        onClick={() => handleSendEmail(log)}
                        startIcon={<EmailIcon />}
                        sx={{ bgcolor: 'rgba(245, 158, 11, 0.08)', color: '#b45309', fontWeight: 800, borderRadius: '10px', py: 1 }}
                      >
                        Email
                      </Button>
                      <IconButton 
                        onClick={() => handleEdit(log)}
                        sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)', color: '#1976d2', borderRadius: '10px' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(log._id || log.id)}
                        sx={{ bgcolor: 'rgba(211, 47, 47, 0.08)', color: '#d32f2f', borderRadius: '10px' }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
                {logs.length === 0 && (
                  <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>No client records found</Typography>
                  </Box>
                )}
              </Box>
            )}
          </>
        )}

        {/* Invoice Modal */}
        <Dialog open={invoiceOpen} onClose={handleCloseInvoice} maxWidth="sm" fullWidth>
          <DialogContent sx={{ p: 0 }}>
            {selectedLog && (
              <Box>
                {/* Close Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 1.5, background: '#228756', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <ReceiptLongIcon />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>Invoice</Typography>
                  </Box>
                  <IconButton onClick={handleCloseInvoice} sx={{ color: '#64748b' }}>
                    <FaTimes size={20} />
                  </IconButton>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Invoice Content */}
                <Box id="printable-invoice" sx={{ px: 3, pb: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                      <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#228756', m: 0 }}>ChooseYourTherapist</Typography>
                      <Typography sx={{ color: '#64748b', fontSize: 13, fontWeight: 500, m: 0 }}>Professional Therapy Services</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ m: 0, fontSize: 12, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>Invoice ID</Typography>
                      <Typography sx={{ m: 0, fontWeight: 800, color: '#1e293b' }}>#{selectedLog.id?.toString().slice(-8)}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                  {/* Details Grid */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                    <Box>
                      <Typography sx={{ m: 0, fontSize: 11, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>Billed To</Typography>
                      <Typography sx={{ m: 0, fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{selectedLog.name}</Typography>
                      <Typography sx={{ m: 0, color: '#64748b', fontSize: 13, fontWeight: 500 }}>Phone: {selectedLog.phone}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ m: 0, fontSize: 11, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>Invoice Date</Typography>
                      <Typography sx={{ m: 0, fontWeight: 700, color: '#1e293b' }}>{selectedLog.date}</Typography>
                      <Typography sx={{ m: '12px 0 4px 0', fontSize: 11, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Type</Typography>
                      <Chip 
                        label={selectedLog.type} 
                        size="small"
                        sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 800, fontSize: 11 }}
                      />
                    </Box>
                  </Box>

                  {/* Amount Box */}
                  <Box sx={{ background: '#f8fafc', p: 2.5, borderRadius: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography sx={{ m: 0, fontWeight: 600, color: '#64748b' }}>{selectedLog.type} Consultation Fee</Typography>
                      <Typography sx={{ m: 0, fontWeight: 700 }}>₹{selectedLog.amount}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ m: 0, fontWeight: 800, fontSize: '1.1rem' }}>Total Amount</Typography>
                      <Typography sx={{ m: 0, fontWeight: 900, color: '#228756', fontSize: '1.2rem' }}>₹{selectedLog.amount}</Typography>
                    </Box>
                  </Box>

                  {/* Buttons */}
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        const content = document.getElementById('printable-invoice').innerHTML;
                        const iframe = document.createElement('iframe');
                        iframe.style.display = 'none';
                        document.body.appendChild(iframe);
                        const doc = iframe.contentWindow.document;
                        doc.write(`
                          <html>
                            <head>
                              <title>Invoice - ${selectedLog.name}</title>
                              <style>
                                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                                body { font-family: "Inter", sans-serif; margin: 0; padding: 40px 20px; color: #1e293b; background: #f1f5f9; }
                                .invoice-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px rgba(0,0,0,0.08); max-width: 850px; margin: 0 auto; position: relative; }
                                .top-banner { background: linear-gradient(90deg, #228756 0%, #1b6843 100%); height: 8px; width: 100%; }
                                .content { padding: 40px; }
                                .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #f1f5f9; }
                                .brand-info h1 { color: #228756; font-weight: 900; font-size: 26px; margin: 0; letter-spacing: -0.5px; }
                                .brand-info p { color: #64748b; font-size: 13px; margin: 5px 0 0 0; font-weight: 600; }
                                .invoice-meta { text-align: right; }
                                .invoice-meta h2 { font-size: 28px; font-weight: 900; color: #cbd5e1; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
                                .invoice-meta p { font-weight: 800; color: #1e293b; margin: 8px 0 0 0; font-size: 15px; }
                                
                                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; background: #f8fafc; padding: 25px; border-radius: 15px; border: 1px solid #f1f5f9; position: relative; }
                                .info-block h3 { font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: 1.2px; }
                                .info-block p { font-weight: 700; color: #1e293b; font-size: 15px; margin: 0; }
                                .info-block span { color: #64748b; font-size: 12px; display: block; margin-top: 3px; font-weight: 500; }
                                
                                .qr-code { position: absolute; right: 25px; top: 25px; text-align: center; }
                                .qr-code img { width: 65px; height: 65px; border: 1px solid #e2e8f0; padding: 4px; border-radius: 8px; background: white; }
                                .qr-code p { font-size: 8px; color: #94a3b8; margin-top: 4px; font-weight: 700; text-transform: uppercase; }

                                .items-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 30px; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; }
                                .items-table th { text-align: left; padding: 12px 15px; background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f1f5f9; }
                                .items-table td { padding: 20px 15px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: 600; font-size: 14px; }
                                .items-table tr:last-child td { border-bottom: none; }
                                .items-table td:last-child { text-align: right; font-weight: 800; font-size: 16px; }
                                .item-desc { color: #64748b; font-size: 12px; font-weight: 500; margin-top: 3px; line-height: 1.4; }
                                
                                .totals-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; }
                                .terms-section { max-width: 450px; }
                                .terms-section h4 { font-size: 10px; color: #1e293b; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; }
                                .terms-section p { font-size: 10px; color: #94a3b8; line-height: 1.6; margin: 0; }
                                .totals-table { width: 250px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
                                .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
                                .total-row.grand-total { border-top: 2px solid #e2e8f0; margin-top: 10px; padding-top: 12px; }
                                .total-row span:first-child { color: #64748b; font-weight: 700; font-size: 13px; }
                                .total-row span:last-child { color: #1e293b; font-weight: 800; font-size: 14px; }
                                .grand-total span:first-child { color: #1e293b; font-weight: 900; font-size: 14px; }
                                .grand-total span:last-child { color: #228756; font-weight: 900; font-size: 20px; }
                                
                                .signature-area { display: flex; justify-content: flex-end; margin-top: 50px; text-align: center; }
                                .sig-box { width: 180px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
                                .sig-box p { font-size: 11px; font-weight: 700; color: #64748b; margin: 0; text-transform: uppercase; }
                                .sig-box span { font-size: 9px; color: #94a3b8; font-style: italic; }

                                .paid-stamp { position: absolute; top: 180px; left: 50%; transform: translateX(-50%) rotate(-15deg); border: 4px solid #228756; color: #228756; padding: 8px 25px; border-radius: 12px; font-size: 36px; font-weight: 900; text-transform: uppercase; opacity: 0.1; pointer-events: none; }
                                
                                .footer { margin-top: 60px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center; }
                                .footer p { color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0; font-weight: 500; }
                                .footer .brand { color: #228756; font-weight: 800; margin-top: 8px; display: block; font-size: 13px; }
                                
                                @media print {
                                  body { background: white; padding: 0; margin: 0; }
                                  .invoice-card { border: none; box-shadow: none; border-radius: 0; max-width: 100%; width: 100%; margin: 0; }
                                  .paid-stamp { opacity: 0.15; }
                                }
                              </style>
                            </head>
                            <body>
                              <div class="invoice-card">
                                <div class="paid-stamp">Paid</div>
                                <div class="top-banner"></div>
                                <div class="content">
                                  <div class="header">
                                    <div class="brand-info">
                                      <h1>Choose Your Therapist <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">LLP</span></h1>
                                      <p>Official Health & Wellness Clinic Receipt</p>
                                      <p style="font-size: 11px; margin-top: 4px; color: #94a3b8;">Email: support@chooseyourtherapist.in | Web: www.chooseyourtherapist.in</p>
                                    </div>
                                    <div class="invoice-meta">
                                      <h2>RECEIPT</h2>
                                      <p>#CYT-${selectedLog.id?.toString().slice(-8).toUpperCase() || 'NEW'}</p>
                                    </div>
                                  </div>
                                  
                                  <div class="info-grid">
                                    <div class="info-block">
                                      <h3>BILL TO CLIENT</h3>
                                      <p>${selectedLog.name}</p>
                                      <span>Phone: +91-${selectedLog.phone}</span>
                                      ${selectedLog.email ? `<span>Email: ${selectedLog.email}</span>` : ''}
                                    </div>
                                    <div class="info-block" style="text-align: right; padding-right: 90px;">
                                      <h3>SESSION DETAILS</h3>
                                      <p>${selectedLog.date}</p>
                                      <span>Type: ${selectedLog.type} Consultation</span>
                                      <span>Status: Payment Received</span>
                                    </div>
                                    <div class="qr-code">
                                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chooseyourtherapist.in/verify/${selectedLog.id}" alt="QR Code" />
                                      <p>Verify</p>
                                    </div>
                                  </div>
                                  
                                  <table class="items-table">
                                    <thead>
                                      <tr>
                                        <th>Service Description</th>
                                        <th style="width: 120px; text-align: right;">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>
                                          Therapy Consultation - ${selectedLog.type}
                                          <div class="item-desc">Professional mental health consultation session with ${therapistInfo?.user?.name || 'Certified Practitioner'}. This session was conducted as part of clinical services.</div>
                                        </td>
                                        <td>₹${selectedLog.amount}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  
                                  <div class="totals-section">
                                    <div class="terms-section">
                                      <h4>Important Notes & Terms</h4>
                                      <p>
                                        • This receipt confirms the professional services provided by ${therapistInfo?.user?.name || 'the practitioner'}.<br/>
                                        • Rescheduling or cancellations must be notified at least 24 hours prior to the session.<br/>
                                        • This is a computer-generated document and does not require a physical signature.<br/>
                                        • For billing inquiries or support, please contact us at support@chooseyourtherapist.in
                                      </p>
                                    </div>
                                    <div class="totals-table">
                                      <div class="total-row">
                                        <span>Subtotal</span>
                                        <span>₹${selectedLog.amount}</span>
                                      </div>
                                      ${selectedLog.remainingAmount && selectedLog.remainingAmount > 0 ? `
                                      <div class="total-row">
                                        <span>Balance Due</span>
                                        <span style="color: #ef4444;">₹${selectedLog.remainingAmount}</span>
                                      </div>` : ''}
                                      <div class="total-row grand-total">
                                        <span>Total Paid</span>
                                        <span>₹${selectedLog.amount}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div class="signature-area">
                                    <div class="sig-box">
                                      <p>${therapistInfo?.user?.name || 'Authorised Signatory'}</p>
                                      <span>Clinical Practitioner</span>
                                    </div>
                                  </div>
                                  
                                  <div class="footer">
                                    <p>Thank you for choosing Choose Your Therapist for your wellness journey.<br/>Our mission is to make quality mental health support accessible to everyone.</p>
                                    <span class="brand">www.chooseyourtherapist.in</span>
                                  </div>
                                </div>
                              </div>
                            </body>
                          </html>
                        `);
                        doc.close();
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                        setTimeout(() => document.body.removeChild(iframe), 1000);
                      }}
                      sx={{ bgcolor: '#228756', '&:hover': { bgcolor: '#1b6843' }, borderRadius: '14px', py: 1.5, textTransform: 'none', fontWeight: 800, boxShadow: '0 4px 12px rgba(34, 135, 86, 0.2)' }}
                    >
                      Download PDF
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<PrintIcon />}
                      onClick={() => {
                        const content = document.getElementById('printable-invoice').innerHTML;
                        const iframe = document.createElement('iframe');
                        iframe.style.display = 'none';
                        document.body.appendChild(iframe);
                        const doc = iframe.contentWindow.document;
                        doc.write(`
                          <html>
                            <head>
                              <title>Invoice - ${selectedLog.name}</title>
                              <style>
                                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                                body { font-family: "Inter", sans-serif; margin: 0; padding: 40px 20px; color: #1e293b; background: #f1f5f9; }
                                .invoice-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px rgba(0,0,0,0.08); max-width: 850px; margin: 0 auto; position: relative; }
                                .top-banner { background: linear-gradient(90deg, #228756 0%, #1b6843 100%); height: 8px; width: 100%; }
                                .content { padding: 40px; }
                                .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #f1f5f9; }
                                .brand-info h1 { color: #228756; font-weight: 900; font-size: 26px; margin: 0; letter-spacing: -0.5px; }
                                .brand-info p { color: #64748b; font-size: 13px; margin: 5px 0 0 0; font-weight: 600; }
                                .invoice-meta { text-align: right; }
                                .invoice-meta h2 { font-size: 28px; font-weight: 900; color: #cbd5e1; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
                                .invoice-meta p { font-weight: 800; color: #1e293b; margin: 8px 0 0 0; font-size: 15px; }
                                
                                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; background: #f8fafc; padding: 25px; border-radius: 15px; border: 1px solid #f1f5f9; position: relative; }
                                .info-block h3 { font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: 1.2px; }
                                .info-block p { font-weight: 700; color: #1e293b; font-size: 15px; margin: 0; }
                                .info-block span { color: #64748b; font-size: 12px; display: block; margin-top: 3px; font-weight: 500; }
                                
                                .qr-code { position: absolute; right: 25px; top: 25px; text-align: center; }
                                .qr-code img { width: 65px; height: 65px; border: 1px solid #e2e8f0; padding: 4px; border-radius: 8px; background: white; }
                                .qr-code p { font-size: 8px; color: #94a3b8; margin-top: 4px; font-weight: 700; text-transform: uppercase; }

                                .items-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 30px; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; }
                                .items-table th { text-align: left; padding: 12px 15px; background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f1f5f9; }
                                .items-table td { padding: 20px 15px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: 600; font-size: 14px; }
                                .items-table tr:last-child td { border-bottom: none; }
                                .items-table td:last-child { text-align: right; font-weight: 800; font-size: 16px; }
                                .item-desc { color: #64748b; font-size: 12px; font-weight: 500; margin-top: 3px; line-height: 1.4; }
                                
                                .totals-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; }
                                .terms-section { max-width: 450px; }
                                .terms-section h4 { font-size: 10px; color: #1e293b; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; }
                                .terms-section p { font-size: 10px; color: #94a3b8; line-height: 1.6; margin: 0; }
                                .totals-table { width: 250px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
                                .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
                                .total-row.grand-total { border-top: 2px solid #e2e8f0; margin-top: 10px; padding-top: 12px; }
                                .total-row span:first-child { color: #64748b; font-weight: 700; font-size: 13px; }
                                .total-row span:last-child { color: #1e293b; font-weight: 800; font-size: 14px; }
                                .grand-total span:first-child { color: #1e293b; font-weight: 900; font-size: 14px; }
                                .grand-total span:last-child { color: #228756; font-weight: 900; font-size: 20px; }
                                
                                .signature-area { display: flex; justify-content: flex-end; margin-top: 50px; text-align: center; }
                                .sig-box { width: 180px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
                                .sig-box p { font-size: 11px; font-weight: 700; color: #64748b; margin: 0; text-transform: uppercase; }
                                .sig-box span { font-size: 9px; color: #94a3b8; font-style: italic; }

                                .paid-stamp { position: absolute; top: 180px; left: 50%; transform: translateX(-50%) rotate(-15deg); border: 4px solid #228756; color: #228756; padding: 8px 25px; border-radius: 12px; font-size: 36px; font-weight: 900; text-transform: uppercase; opacity: 0.1; pointer-events: none; }
                                
                                .footer { margin-top: 60px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center; }
                                .footer p { color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0; font-weight: 500; }
                                .footer .brand { color: #228756; font-weight: 800; margin-top: 8px; display: block; font-size: 13px; }
                                
                                @media print {
                                  body { background: white; padding: 0; margin: 0; }
                                  .invoice-card { border: none; box-shadow: none; border-radius: 0; max-width: 100%; width: 100%; margin: 0; }
                                  .paid-stamp { opacity: 0.15; }
                                }
                              </style>
                            </head>
                            <body>
                              <div class="invoice-card">
                                <div class="paid-stamp">Paid</div>
                                <div class="top-banner"></div>
                                <div class="content">
                                  <div class="header">
                                    <div class="brand-info">
                                      <h1>Choose Your Therapist <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">LLP</span></h1>
                                      <p>Official Health & Wellness Clinic Receipt</p>
                                      <p style="font-size: 11px; margin-top: 4px; color: #94a3b8;">Email: support@chooseyourtherapist.in | Web: www.chooseyourtherapist.in</p>
                                    </div>
                                    <div class="invoice-meta">
                                      <h2>RECEIPT</h2>
                                      <p>#CYT-${selectedLog.id?.toString().slice(-8).toUpperCase() || 'NEW'}</p>
                                    </div>
                                  </div>
                                  
                                  <div class="info-grid">
                                    <div class="info-block">
                                      <h3>BILL TO CLIENT</h3>
                                      <p>${selectedLog.name}</p>
                                      <span>Phone: +91-${selectedLog.phone}</span>
                                      ${selectedLog.email ? `<span>Email: ${selectedLog.email}</span>` : ''}
                                    </div>
                                    <div class="info-block" style="text-align: right; padding-right: 90px;">
                                      <h3>SESSION DETAILS</h3>
                                      <p>${selectedLog.date}</p>
                                      <span>Type: ${selectedLog.type} Consultation</span>
                                      <span>Status: Payment Received</span>
                                    </div>
                                    <div class="qr-code">
                                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chooseyourtherapist.in/verify/${selectedLog.id}" alt="QR Code" />
                                      <p>Verify</p>
                                    </div>
                                  </div>
                                  
                                  <table class="items-table">
                                    <thead>
                                      <tr>
                                        <th>Service Description</th>
                                        <th style="width: 120px; text-align: right;">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>
                                          Therapy Consultation - ${selectedLog.type}
                                          <div class="item-desc">Professional mental health consultation session with ${therapistInfo?.user?.name || 'Certified Practitioner'}. This session was conducted as part of clinical services.</div>
                                        </td>
                                        <td>₹${selectedLog.amount}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  
                                  <div class="totals-section">
                                    <div class="terms-section">
                                      <h4>Important Notes & Terms</h4>
                                      <p>
                                        • This receipt confirms the professional services provided by ${therapistInfo?.user?.name || 'the practitioner'}.<br/>
                                        • Rescheduling or cancellations must be notified at least 24 hours prior to the session.<br/>
                                        • This is a computer-generated document and does not require a physical signature.<br/>
                                        • For billing inquiries or support, please contact us at support@chooseyourtherapist.in
                                      </p>
                                    </div>
                                    <div class="totals-table">
                                      <div class="total-row">
                                        <span>Subtotal</span>
                                        <span>₹${selectedLog.amount}</span>
                                      </div>
                                      ${selectedLog.remainingAmount && selectedLog.remainingAmount > 0 ? `
                                      <div class="total-row">
                                        <span>Balance Due</span>
                                        <span style="color: #ef4444;">₹${selectedLog.remainingAmount}</span>
                                      </div>` : ''}
                                      <div class="total-row grand-total">
                                        <span>Total Paid</span>
                                        <span>₹${selectedLog.amount}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div class="signature-area">
                                    <div class="sig-box">
                                      <p>${therapistInfo?.user?.name || 'Authorised Signatory'}</p>
                                      <span>Clinical Practitioner</span>
                                    </div>
                                  </div>
                                  
                                  <div class="footer">
                                    <p>Thank you for choosing Choose Your Therapist for your wellness journey.<br/>Our mission is to make quality mental health support accessible to everyone.</p>
                                    <span class="brand">www.chooseyourtherapist.in</span>
                                  </div>
                                </div>
                              </div>
                            </body>
                          </html>
                        `);
                        doc.close();
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                        setTimeout(() => document.body.removeChild(iframe), 1000);
                      }}
                      sx={{ borderColor: '#f1f5f9', color: '#64748b', borderRadius: '14px', py: 1.5, textTransform: 'none', fontWeight: 800, '&:hover': { borderColor: '#e2e8f0', background: '#f8fafc' } }}
                    >
                      Print
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Send Email Template Dialog */}
        <Dialog 
          open={emailDialogOpen} 
          onClose={() => setEmailDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : '20px',
              m: isMobile ? 0 : 2,
              maxHeight: isMobile ? '100%' : '90vh'
            }
          }}
        >
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: { xs: 2.5, sm: 4 }, flexGrow: 1, overflowY: 'auto', pb: { xs: 12, sm: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>Send Invoice Email</Typography>
                <IconButton onClick={() => setEmailDialogOpen(false)} sx={{ bgcolor: '#f1f5f9' }}>
                  <FaTimes size={18} />
                </IconButton>
              </Box>
              
              <Box sx={{ bgcolor: '#f8fafc', p: { xs: 2, sm: 3 }, borderRadius: 4, border: '1px solid #e2e8f0', mb: 4 }}>
                <Typography sx={{ fontSize: 13, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', mb: 1.5, letterSpacing: 1 }}>Email Preview</Typography>
                <Box sx={{ bgcolor: '#fff', p: { xs: 1.5, sm: 2.5 }, borderRadius: 3, border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <Typography sx={{ fontSize: { xs: 13, sm: 14 }, mb: 1, color: '#475569' }}><strong>From:</strong> appointment.cyt@gmail.com</Typography>
                  <Typography sx={{ fontSize: { xs: 13, sm: 14 }, mb: 1, color: '#475569' }}><strong>To:</strong> {selectedLog?.email}</Typography>
                  <Typography sx={{ fontSize: { xs: 13, sm: 14 }, mb: 2, color: '#1e293b', fontWeight: 700 }}><strong>Subject:</strong> Invoice from Choose Your Therapist - #{selectedLog?.id?.toString().slice(-8)}</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography sx={{ fontSize: { xs: 14, sm: 15 }, whiteSpace: 'pre-wrap', mb: 3, color: '#334155', lineHeight: 1.6 }}>{emailMessage}</Typography>
                  <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px dashed #228756', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: '#228756', fontWeight: 700, wordBreak: 'break-all' }}>
                      🔗 View Invoice: https://chooseyourtherapist.in/invoice/{selectedLog?.id}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Typography sx={{ fontSize: 13, color: '#94a3b8', fontWeight: 800, mb: 1.5, letterSpacing: 1 }}>CUSTOM MESSAGE</Typography>
              <TextField
                fullWidth
                multiline
                rows={isMobile ? 4 : 3}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Write a custom message to your client..."
                sx={{ 
                  mb: 2, 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '16px',
                    bgcolor: '#fff',
                    '&:hover fieldset': { borderColor: '#228756' },
                    '&.Mui-focused fieldset': { borderColor: '#228756' }
                  } 
                }}
              />
            </Box>

            <Box sx={{ 
              p: 2.5, 
              borderTop: '1px solid #e2e8f0', 
              bgcolor: '#fff',
              position: isMobile ? 'fixed' : 'relative',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              pb: isMobile ? '80px' : 2.5 // Extra padding for mobile bottom nav
            }}>
              <Button
                fullWidth
                variant="contained"
                onClick={confirmSendEmail}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                sx={{ 
                  bgcolor: '#228756', 
                  '&:hover': { bgcolor: '#1b6843' }, 
                  py: 2, 
                  borderRadius: '16px', 
                  fontWeight: 900, 
                  textTransform: 'none', 
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 20px rgba(34, 135, 86, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                {submitting ? "Sending..." : "Send Email Now"}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

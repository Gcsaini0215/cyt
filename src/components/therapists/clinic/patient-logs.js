import React, { useState, useEffect } from "react";
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
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import FileInvoiceIcon from "@mui/icons-material/Receipt";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { getClinicLogsUrl, createClinicLogUrl, updateClinicLogUrl, deleteClinicLogUrl } from "../../../utils/url";
import { fetchById, postData, putData, deleteById } from "../../../utils/actions";

export default function ClientLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    phone: "",
    type: "Clinic",
    amount: "",
    remainingAmount: "",
    date: dayjs()
  });

  useEffect(() => {
    // Try to load from localStorage first
    const localLogs = localStorage.getItem('clinicLogs');
    if (localLogs) {
      try {
        setLogs(JSON.parse(localLogs));
      } catch (e) {
        console.error("Error parsing localStorage", e);
      }
    }
    // Then fetch from API (will update if available)
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetchById(getClinicLogsUrl);
      if (response.status) {
        const logsData = response.data || [];
        setLogs(Array.isArray(logsData) ? logsData : []);
        localStorage.setItem('clinicLogs', JSON.stringify(logsData));
      }
    } catch (error) {
      console.error("Error fetching logs from API, using local storage:", error);
      // Fallback to localStorage
      const localLogs = localStorage.getItem('clinicLogs');
      if (localLogs) {
        setLogs(JSON.parse(localLogs));
      }
    } finally {
      setLoading(false);
    }
  };

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
        phone: formData.phone,
        date: formData.date.format('YYYY-MM-DD'),
        type: formData.type,
        amount: formData.amount,
        remainingAmount: formData.remainingAmount
      };

      let isAPISuccess = false;

      if (formData.id) {
        // Edit mode
        try {
          await putData(`${updateClinicLogUrl}/${formData.id}`, payload);
          isAPISuccess = true;
          toast.success("Entry updated successfully!");
        } catch (apiError) {
          console.error("API update failed, using local storage");
          // Fallback: Update in local state and localStorage
          const updatedLogs = logs.map(log => 
            log.id === formData.id 
              ? {
                  ...log,
                  name: formData.name,
                  phone: formData.phone,
                  date: formData.date.format('DD MMM YYYY'),
                  type: formData.type,
                  amount: formData.amount,
                  remainingAmount: formData.remainingAmount
                }
              : log
          );
          setLogs(updatedLogs);
          localStorage.setItem('clinicLogs', JSON.stringify(updatedLogs));
          toast.success("Entry updated (local)!");
        }
      } else {
        // Add mode
        try {
          await postData(createClinicLogUrl, payload);
          isAPISuccess = true;
          toast.success("Client entry added successfully!");
        } catch (apiError) {
          console.error("API create failed, using local storage");
          // Fallback: Add to local state and localStorage
          const newLog = {
            id: Date.now(),
            name: formData.name,
            phone: formData.phone,
            date: formData.date.format('DD MMM YYYY'),
            type: formData.type,
            amount: formData.amount,
            remainingAmount: formData.remainingAmount,
            status: "Paid"
          };
          const updatedLogs = [newLog, ...logs];
          setLogs(updatedLogs);
          localStorage.setItem('clinicLogs', JSON.stringify(updatedLogs));
          toast.success("Client entry added (local)!");
        }
      }

      setFormData({ id: null, name: "", phone: "", type: "Clinic", amount: "", remainingAmount: "", date: dayjs() });
      
      if (isAPISuccess) {
        await fetchLogs();
      }
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error("Failed to save client entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        setSubmitting(true);
        let isAPISuccess = false;

        try {
          await deleteById(`${deleteClinicLogUrl}/${id}`);
          isAPISuccess = true;
          toast.success("Entry deleted successfully");
        } catch (apiError) {
          console.error("API delete failed, using local storage");
          // Fallback: Delete from local state and localStorage
          const updatedLogs = logs.filter(log => log.id !== id);
          setLogs(updatedLogs);
          localStorage.setItem('clinicLogs', JSON.stringify(updatedLogs));
          toast.success("Entry deleted (local)!");
        }

        if (isAPISuccess) {
          await fetchLogs();
        }
      } catch (error) {
        console.error("Error deleting entry:", error);
        toast.error("Failed to delete entry");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleEdit = (log) => {
    setFormData({
      id: log.id,
      name: log.name,
      phone: log.phone,
      type: log.type,
      amount: log.amount,
      remainingAmount: log.remainingAmount || '',
      date: dayjs(log.date)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInvoice = (log) => {
    setSelectedLog(log);
    setInvoiceOpen(true);
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
                  {formData.id ? "EDIT CLIENT ENTRY" : "ADD NEW CLIENT"}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.2 }, position: 'relative', width: { xs: 'auto', sm: 'auto' } }}>
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
                    <MenuItem value="Clinic">Clinic</MenuItem>
                    <MenuItem value="Home Visit">Home Visit</MenuItem>
                    <MenuItem value="Online">Online</MenuItem>
                  </TextField>
                </Box>
              </Box>
              
              <Box sx={{ p: 3 }}>
                <form onSubmit={handleAddClient}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Client Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Phone No."
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1.8}>
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
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Remaining Amount"
                        name="remainingAmount"
                        type="number"
                        value={formData.remainingAmount}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ fontSize: 16, color: '#d32f2f' }} /></InputAdornment>,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        sx={{ 
                          bgcolor: formData.id ? '#1976d2' : '#228756', 
                          '&:hover': { bgcolor: formData.id ? '#115293' : '#1b6843' },
                          '&:disabled': { bgcolor: '#cbd5e1', color: '#94a3b8' },
                          borderRadius: '8px',
                          py: 1.4,
                          fontWeight: 900,
                          fontSize: '1.35rem',
                          textTransform: 'none',
                          boxShadow: 'none'
                        }}
                      >
                        {submitting ? "Saving..." : (formData.id ? "Update Entry" : "Save Entry")}
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
            <TableContainer 
              component={Paper} 
              elevation={0} 
              sx={{ 
                borderRadius: '0px', 
                border: '1px solid #e2e8f0', 
                overflow: 'auto',
                boxShadow: '0 4px 25px rgba(0,0,0,0.02)',
                background: '#ffffff',
                maxHeight: 'calc(100vh - 400px)',
                minHeight: '500px'
              }}
            >
              <Table>
                <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <TableRow sx={{ bgcolor: '#87CEEB', borderBottom: '2px solid #4A90E2' }}>
                    <TableCell sx={{ fontWeight: 900, color: '#000000', py: 1.2, pl: 4, fontSize: '1.15rem' }}>CLIENT DETAILS</TableCell>
                    <TableCell sx={{ fontWeight: 900, color: '#000000', py: 1.2, fontSize: '1.15rem' }}>VISIT DATE</TableCell>
                    <TableCell sx={{ fontWeight: 900, color: '#000000', py: 1.2, fontSize: '1.15rem' }}>TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 900, color: '#000000', py: 1.2, fontSize: '1.15rem' }}>FEES</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 900, color: '#000000', py: 1.2, fontSize: '1.15rem' }}>STATUS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, color: '#000000', pr: 4, py: 1.2, fontSize: '1.15rem' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...logs].sort((a, b) => {
                    const dateA = dayjs(a.date, 'DD MMM YYYY');
                    const dateB = dayjs(b.date, 'DD MMM YYYY');
                    return dateB - dateA;
                  }).map((log) => (
                    <TableRow key={log.id} sx={{ '&:hover': { bgcolor: '#fbfcfd' }, transition: 'background 0.2s' }}>
                      <TableCell sx={{ pl: 4, py: 3 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.25rem' }}>{log.name}</Typography>
                          {log.phone && <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '1.05rem' }}>{log.phone}</Typography>}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontSize: '1.2rem', fontWeight: 800 }}>{log.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={log.type} 
                          size="medium" 
                          sx={{ 
                            bgcolor: log.type === 'Clinic' ? '#f0fdf4' : '#eff6ff', 
                            color: log.type === 'Clinic' ? '#166534' : '#1e40af', 
                            fontWeight: 900, 
                            borderRadius: '6px',
                            fontSize: '14px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            px: 1.5
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.4rem' }}>
                        ₹{log.amount}
                        {log.remainingAmount && (
                          <Typography component="span" sx={{ ml: 1, color: '#d32f2f', fontWeight: 900, fontSize: '1.2rem' }}>
                            (+ ₹{log.remainingAmount})
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 1.2, 
                          bgcolor: '#f0fdf4', 
                          color: '#16a34a', 
                          px: 2.5, 
                          py: 0.8, 
                          borderRadius: '8px',
                          border: '1px solid rgba(22, 163, 74, 0.15)'
                        }}>
                          <Typography sx={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.5px' }}>{log.status.toUpperCase()}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                          <Tooltip title="Invoice">
                            <span>
                              <IconButton 
                                size="large" 
                                onClick={() => handleInvoice(log)} 
                                disabled={submitting}
                                sx={{ color: '#228756', bgcolor: 'rgba(34, 135, 86, 0.05)', '&:hover': { bgcolor: 'rgba(34, 135, 86, 0.1)' }, '&:disabled': { color: '#cbd5e1' } }}
                              >
                                <ReceiptLongIcon fontSize="large" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <span>
                              <IconButton 
                                size="large" 
                                onClick={() => handleEdit(log)} 
                                disabled={submitting}
                                sx={{ color: '#1976d2', bgcolor: 'rgba(25, 118, 210, 0.05)', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' }, '&:disabled': { color: '#cbd5e1' } }}
                              >
                                <EditIcon fontSize="large" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <span>
                              <IconButton 
                                size="large" 
                                onClick={() => handleDelete(log.id)} 
                                disabled={submitting}
                                sx={{ color: '#d32f2f', bgcolor: 'rgba(211, 47, 47, 0.05)', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' }, '&:disabled': { color: '#cbd5e1' } }}
                              >
                                <DeleteOutlineIcon fontSize="large" />
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
                                    <p class="sub-value">Official Clinic Services</p>
                                  </div>
                                  <div style="text-align: right;">
                                    <p class="label">Invoice Number</p>
                                    <p class="value">#${selectedLog.id?.toString().slice(-8)}</p>
                                  </div>
                                </div>
                                <div class="divider"></div>
                                <div class="grid">
                                  <div>
                                    <p class="label">Customer Details</p>
                                    <p class="value">${selectedLog.name}</p>
                                    <p class="sub-value">Phone: ${selectedLog.phone}</p>
                                  </div>
                                  <div style="text-align: right;">
                                    <p class="label">Billing Date</p>
                                    <p class="value">${selectedLog.date}</p>
                                    <p class="label" style="margin-top: 18px;">Type</p>
                                    <p class="value" style="color: #166534; background: #f0fdf4; display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 13px;">${selectedLog.type}</p>
                                  </div>
                                </div>
                                <div class="amount-box">
                                  <div class="amount-row">
                                    <span>${selectedLog.type} Consultation Fee</span>
                                    <span style="color: #1e293b;">₹${selectedLog.amount}</span>
                                  </div>
                                  <div class="total-row">
                                    <span>Total Payable</span>
                                    <span style="color: #228756;">₹${selectedLog.amount}</span>
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
                                    <p class="sub-value">Official Clinic Services</p>
                                  </div>
                                  <div style="text-align: right;">
                                    <p class="label">Invoice Number</p>
                                    <p class="value">#${selectedLog.id?.toString().slice(-8)}</p>
                                  </div>
                                </div>
                                <div class="divider"></div>
                                <div class="grid">
                                  <div>
                                    <p class="label">Customer Details</p>
                                    <p class="value">${selectedLog.name}</p>
                                    <p class="sub-value">Phone: ${selectedLog.phone}</p>
                                  </div>
                                  <div style="text-align: right;">
                                    <p class="label">Billing Date</p>
                                    <p class="value">${selectedLog.date}</p>
                                    <p class="label" style="margin-top: 18px;">Type</p>
                                    <p class="value" style="color: #166534; background: #f0fdf4; display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 13px;">${selectedLog.type}</p>
                                  </div>
                                </div>
                                <div class="amount-box">
                                  <div class="amount-row">
                                    <span>${selectedLog.type} Consultation Fee</span>
                                    <span style="color: #1e293b;">₹${selectedLog.amount}</span>
                                  </div>
                                  <div class="total-row">
                                    <span>Total Payable</span>
                                    <span style="color: #228756;">₹${selectedLog.amount}</span>
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
      </Box>
    </LocalizationProvider>
  );
}

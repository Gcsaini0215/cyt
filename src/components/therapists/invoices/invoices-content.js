import React, { useState } from "react";
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
  Button, 
  IconButton, 
  Chip, 
  TextField, 
  InputAdornment,
  Modal,
  Avatar,
  Divider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PrintIcon from "@mui/icons-material/Print";

const InvoicesContent = ({ invoices = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredInvoices = invoices.filter(invoice => 
    invoice.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoice_id?.toString().includes(searchTerm) ||
    invoice.booking_id?.toString().includes(searchTerm)
  );

  const handleOpenModal = (invoice) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInvoice(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'paid':
        return { bg: '#e8f5e9', text: '#228756' };
      case 'pending':
        return { bg: '#fff3e0', text: '#ed6c02' };
      default:
        return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Search and Filters */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: '20px', 
          border: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
          All Invoices ({filteredInvoices.length})
        </Typography>
        <TextField
          size="small"
          placeholder="Search by client or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            width: { xs: '100%', sm: '300px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: '#f8fafc'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Invoices Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Invoice ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Client Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => {
                const status = getStatusColor(invoice.status || 'Paid');
                return (
                  <TableRow key={invoice.id} sx={{ '&:hover': { bgcolor: '#fbfcfd' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>#{invoice.invoice_id || invoice.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: '#e8f5e9', color: '#228756', fontWeight: 700 }}>
                          {invoice.client_name?.charAt(0)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>{invoice.client_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{invoice.booking_date || invoice.date}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>₹{invoice.amount}</TableCell>
                    <TableCell>
                      <Chip 
                        label={invoice.status || 'Paid'} 
                        size="small" 
                        sx={{ bgcolor: status.bg, color: status.text, fontWeight: 700, borderRadius: '8px' }} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleOpenModal(invoice)} sx={{ color: '#228756', bgcolor: '#e8f5e9' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton size="small" sx={{ color: '#1976d2', bgcolor: '#e3f2fd' }}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography sx={{ color: '#94a3b8' }}>No invoices found matching your search.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Invoice Detail Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Paper sx={{ width: '100%', maxWidth: '600px', borderRadius: '28px', overflow: 'hidden', outline: 'none', position: 'relative' }}>
          {/* Modal Header */}
          <Box sx={{ p: 3, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#228756' }}><ReceiptLongIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Invoice Details</Typography>
            </Box>
            <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
          </Box>

          {/* Modal Content - Invoice Preview */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#228756', mb: 0.5 }}>ChooseYourTherapist</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Professional Therapy Services</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>INVOICE</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>#{selectedInvoice?.invoice_id || selectedInvoice?.id}</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Billed To</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>{selectedInvoice?.client_name}</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Booking ID: #{selectedInvoice?.booking_id || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Invoice Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>{selectedInvoice?.booking_date || selectedInvoice?.date}</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', mt: 2 }}>Payment Status</Typography>
                <Chip 
                  label={selectedInvoice?.status || 'Paid'} 
                  size="small" 
                  sx={{ mt: 0.5, bgcolor: getStatusColor(selectedInvoice?.status || 'Paid').bg, color: getStatusColor(selectedInvoice?.status || 'Paid').text, fontWeight: 800 }} 
                />
              </Grid>
            </Grid>

            <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: '16px', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Service Fee</Typography>
                <Typography sx={{ fontWeight: 700 }}>₹{selectedInvoice?.amount}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Total Amount</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#228756' }}>₹{selectedInvoice?.amount}</Typography>
              </Box>
            </Box>

            {/* Modal Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<DownloadIcon />}
                sx={{ bgcolor: '#228756', '&:hover': { bgcolor: '#1b6843' }, borderRadius: '12px', py: 1.5, textTransform: 'none', fontWeight: 700 }}
              >
                Download PDF
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<PrintIcon />}
                sx={{ borderColor: '#f1f5f9', color: '#64748b', borderRadius: '12px', py: 1.5, textTransform: 'none', fontWeight: 700 }}
              >
                Print
              </Button>
            </Box>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default InvoicesContent;
import { Grid, Tooltip } from "@mui/material";

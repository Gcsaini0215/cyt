import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Paper, Divider, Button, CircularProgress, Container, Grid } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fetchById } from '../../utils/actions';
import { getClinicLogsUrl } from '../../utils/url';
import Head from 'next/head';
import html2canvas from 'html2canvas';

export default function InvoiceViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching invoice for ID:", id);
      const url = `${getClinicLogsUrl}/${id}`;
      console.log("Full URL:", url);
      
      const res = await fetchById(url);
      console.log("API Response:", res);
      
      if (res.status && res.data) {
        setLog(res.data);
      } else {
        console.warn("API failed or returned no data, checking localStorage...");
        // Fallback to localStorage if API fails (common for local testing)
        const localLogs = localStorage.getItem('clinicLogs');
        if (localLogs) {
          const logs = JSON.parse(localLogs);
          const found = logs.find(l => l.id.toString() === id.toString());
          if (found) {
            console.log("Found in localStorage:", found);
            setLog(found);
            return;
          }
        }
        setError(res.message || "Invoice not found in system");
      }
    } catch (err) {
      console.error("Invoice fetch error:", err);
      // Try localStorage even on catch
      const localLogs = localStorage.getItem('clinicLogs');
      if (localLogs) {
        try {
          const logs = JSON.parse(localLogs);
          const found = logs.find(l => l.id.toString() === id.toString());
          if (found) {
            console.log("Found in localStorage (after error):", found);
            setLog(found);
            return;
          }
        } catch (e) {
          console.error("Error parsing localStorage logs:", e);
        }
      }
      setError("Failed to load invoice from server");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('printable-invoice');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = data;
    link.download = `Invoice-${log.id?.toString().slice(-8)}.png`;
    link.click();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#228756', mb: 2 }} />
        <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Generating your invoice...</Typography>
      </Box>
    );
  }

  if (error || !log) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 2 }}>Oops!</Typography>
        <Typography sx={{ color: '#64748b', mb: 4 }}>{error || "We couldn't find the invoice you're looking for."}</Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/')}
          sx={{ bgcolor: '#228756', '&:hover': { bgcolor: '#1b6843' }, borderRadius: '12px', px: 4, py: 1.5, textTransform: 'none', fontWeight: 700 }}
        >
          Go to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh', py: { xs: 4, md: 8 }, px: 2 }}>
      <Head>
        <title>Invoice - {log.name} | ChooseYourTherapist</title>
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              #printable-invoice, #printable-invoice * { visibility: visible; }
              #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none; border: none; }
              .no-print { display: none !important; }
            }
          `}
        </style>
      </Head>

      <Container maxWidth="md">
        {/* Actions Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }} className="no-print">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: '#228756', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <ReceiptLongIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>Official Invoice</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>#{log.id?.toString().slice(-8)}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ borderColor: '#e2e8f0', color: '#475569', borderRadius: '12px', fontWeight: 700, textTransform: 'none', '&:hover': { borderColor: '#cbd5e1', bgcolor: '#fff' } }}
            >
              Download
            </Button>
            <Button 
              variant="contained" 
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ bgcolor: '#228756', '&:hover': { bgcolor: '#1b6843' }, borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
            >
              Print
            </Button>
          </Box>
        </Box>

        {/* Invoice Paper */}
        <Paper 
          id="printable-invoice"
          elevation={0} 
          sx={{ 
            borderRadius: '24px', 
            overflow: 'hidden', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 50px rgba(0,0,0,0.04)'
          }}
        >
          {/* Header Banner */}
          <Box sx={{ bgcolor: '#228756', height: '12px', width: '100%' }} />
          
          <Box sx={{ p: { xs: 4, md: 6 } }}>
            {/* Logo and Status */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3, mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box component="img" src="/favicon.png" sx={{ width: 60, height: 60, borderRadius: '12px' }} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#228756', letterSpacing: '-1px', mb: 0.2 }}>Choose Your Therapist</Typography>
                  <Typography variant="body1" sx={{ color: '#000000', fontWeight: 600, display: 'block' }}>Because healing starts with your choice.</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#f0fdf4', color: '#16a34a', px: 3, py: 1.5, borderRadius: '14px', border: '1px solid rgba(22, 163, 74, 0.15)' }}>
                <CheckCircleIcon sx={{ fontSize: 24 }} />
                <Typography sx={{ fontWeight: 900, fontSize: '18px', letterSpacing: '0.5px' }}>PAID</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 6, borderStyle: 'dashed' }} />

            {/* Billing Info Grid */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '14px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', mb: 1.5, letterSpacing: '1px' }}>BILLED TO</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>{log.name}</Typography>
                <Typography sx={{ color: '#475569', fontWeight: 600, fontSize: '18px' }}>+91-{log.phone}</Typography>
                {log.email && <Typography sx={{ color: '#475569', fontWeight: 600, fontSize: '18px' }}>{log.email}</Typography>}
              </Grid>
              <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography sx={{ fontSize: '14px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', mb: 1.5, letterSpacing: '1px' }}>INVOICE DETAILS</Typography>
                <Typography sx={{ color: '#1e293b', fontWeight: 800, mb: 1, fontSize: '18px' }}>Invoice Date: <Box component="span" sx={{ color: '#64748b', ml: 1 }}>{log.date}</Box></Typography>
                <Typography sx={{ color: '#1e293b', fontWeight: 800, fontSize: '18px' }}>Visit Type: <Box component="span" sx={{ color: '#228756', ml: 1, bgcolor: '#f0fdf4', px: 1.5, py: 0.5, borderRadius: '6px' }}>{log.type === 'Clinic' ? 'In-Person' : log.type}</Box></Typography>
              </Grid>
            </Grid>

            {/* Table-like Detail Area */}
            <Box sx={{ border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden', mb: 6 }}>
              <Box sx={{ bgcolor: '#f8fafc', p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 800, color: '#64748b', fontSize: '16px' }}>DESCRIPTION</Typography>
                <Typography sx={{ fontWeight: 800, color: '#64748b', fontSize: '16px' }}>AMOUNT</Typography>
              </Box>
              <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '20px', mb: 0.5 }}>Therapy Consultation Fee</Typography>
                  <Typography variant="body1" sx={{ color: '#94a3b8', fontWeight: 600 }}>Mode: {log.type === 'Clinic' ? 'In-Person' : log.type}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '24px' }}>₹{log.amount}</Typography>
              </Box>
            </Box>

            {/* Total Section */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ width: { xs: '100%', sm: '350px' }, bgcolor: '#f8fafc', p: 4, borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 700, fontSize: '18px' }}>Subtotal</Typography>
                  <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '18px' }}>₹{log.amount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 700, fontSize: '18px' }}>Tax</Typography>
                  <Typography sx={{ color: '#1e293b', fontWeight: 700, fontSize: '18px' }}>₹0</Typography>
                </Box>
                <Divider sx={{ my: 2.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#1e293b', fontWeight: 900, fontSize: '1.5rem' }}>Total</Typography>
                  <Typography sx={{ color: '#228756', fontWeight: 900, fontSize: '2rem' }}>₹{log.amount}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 10, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 800, mb: 2 }}>Thank you for choosing Choose Your Therapist</Typography>
              <Typography variant="body1" sx={{ color: '#cbd5e1', fontWeight: 500, display: 'block', mt: 2 }}>This is a computer generated invoice and does not require a signature.</Typography>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }} className="no-print">
          <Typography sx={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
            Need help? Contact us at <Box component="span" sx={{ color: '#228756' }}>chooseyourtherapist@gmail.com</Box> or call <Box component="span" sx={{ color: '#228756' }}>+91-8077757951</Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

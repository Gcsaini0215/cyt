import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Paper, Divider, Button, CircularProgress, Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { fetchById } from '../../utils/actions';
import { getClinicLogsUrl } from '../../utils/url';
import Head from 'next/head';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import useTherapistStore from '../../store/therapistStore';

export default function InvoiceViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const { therapistInfo, fetchTherapistInfo } = useTherapistStore();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (id) {
      fetchInvoice();
      const currentUrl = window.location.href;
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`);
    }
  }, [id]);

  useEffect(() => {
    if (!therapistInfo?.user?.name) {
      fetchTherapistInfo();
    }
  }, []);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id || id === 'undefined') {
        throw new Error("Invalid Invoice ID");
      }

      const url = `${getClinicLogsUrl}/${id}`;
      const res = await fetchById(url);
      
      if (res.status && res.data) {
        setLog(res.data);
        updateLocalCache(res.data);
        return;
      }

      setError(res.message || "Invoice not found.");
    } catch (err) {
      const localLogs = localStorage.getItem('clinicLogs');
      if (localLogs) {
        try {
          const logs = JSON.parse(localLogs);
          const found = logs.find(l => {
            const logIdStr = (l._id || l.id)?.toString();
            return logIdStr === id.toString() || logIdStr?.slice(-8) === id.toString();
          });
          if (found) {
            setLog(found);
            return;
          }
        } catch (e) {}
      }
      setError("Unable to load invoice. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const updateLocalCache = (data) => {
    try {
      const localLogs = localStorage.getItem('clinicLogs');
      let logs = localLogs ? JSON.parse(localLogs) : [];
      const updatedLogs = [data, ...logs.filter(l => (l._id || l.id) !== (data._id || data.id))];
      localStorage.setItem('clinicLogs', JSON.stringify(updatedLogs.slice(0, 50)));
    } catch (e) {}
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const invoicePage = document.getElementById('printable-invoice');
      const adPage = document.getElementById('invoice-ad-page');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Capture Page 1 (Invoice)
      const canvas1 = await html2canvas(invoicePage, { scale: 4, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1000 });
      const imgData1 = canvas1.toDataURL('image/jpeg', 1.0);
      const imgHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
      pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, imgHeight1);
      
      // Capture Page 2 (Ad)
      pdf.addPage();
      const canvas2 = await html2canvas(adPage, { scale: 4, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1000 });
      const imgData2 = canvas2.toDataURL('image/jpeg', 1.0);
      const imgHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
      pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, imgHeight2);
      
      pdf.save(`Invoice-${formattedInvoiceId}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
    }
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
        <Typography sx={{ color: '#64748b', mb: 4 }}>{error || "Invoice not found."}</Typography>
        <Button variant="contained" onClick={() => router.push('/therapist-dashboard')} sx={{ bgcolor: '#228756', '&:hover': { bgcolor: '#1b6843' }, borderRadius: '12px', px: 4, py: 1.5, textTransform: 'none', fontWeight: 700 }}>Back to Dashboard</Button>
      </Box>
    );
  }

  const logId = log._id || log.id;
  const formattedInvoiceId = logId ? `${logId.toString().slice(-8).toUpperCase()}` : 'UNKNOWN';
  const displayDate = log.date ? dayjs(log.date).format('DD MMM YYYY') : (log.updatedAt ? dayjs(log.updatedAt).format('DD MMM YYYY') : dayjs().format('DD MMM YYYY'));
  const displayTime = log.updatedAt ? dayjs(log.updatedAt).format('hh:mm A') : (log.createdAt ? dayjs(log.createdAt).format('hh:mm A') : dayjs().format('hh:mm A'));

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: { xs: 3, md: 5 }, px: { xs: 1.5, sm: 2 } }}>
      <Head>
        <title>Invoice - {log.name} | Choose Your Therapist</title>
        <style>
          {`
            @media print {
              @page { size: A4; margin: 0; }
              body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .no-print { display: none !important; }
              #printable-invoice, #invoice-ad-page { 
                width: 100% !important; margin: 0 !important; padding: 40px 60px !important; 
                box-shadow: none !important; border: none !important; height: auto !important; 
                page-break-after: always !important; 
              }
            }
          `}
        </style>
      </Head>

      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 1.5 }} className="no-print">
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload} sx={{ borderColor: '#e2e8f0', color: '#475569', borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>Download PDF</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ bgcolor: '#228756', '&:hover': { bgcolor: '#1b6843' }, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>Print</Button>
        </Box>

        {/* PAGE 1: INVOICE */}
        <Paper id="printable-invoice" elevation={0} sx={{ p: { xs: 4, sm: 8 }, pt: { xs: 6, sm: 10 }, borderRadius: '0px', border: '1px solid #e2e8f0', background: '#ffffff', mb: 4 }}>
          <Grid container spacing={2} sx={{ mb: 6, alignItems: 'center' }}>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box component="img" src="/favicon.png" sx={{ width: 80, height: 80, borderRadius: '12px' }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: '#228756', lineHeight: 1.2 }}>{log.therapist_name || "Therapist"}</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#475569', mt: 0.3 }}>{therapistInfo?.qualification || "Psychologist"}</Typography>
                  <Typography sx={{ fontSize: '1.15rem', fontWeight: 600, color: '#64748b', mt: 0.2 }}>{log.therapist_type || "Professional Services"}</Typography>
                  {(therapistInfo?.license_number || log.license_number) && <Typography sx={{ fontSize: '1rem', color: '#94a3b8', mt: 0.5 }}>Reg.No. {therapistInfo?.license_number || log.license_number}</Typography>}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography sx={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>Choose Your Therapist, D-137, Sector 51</Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>Noida, Uttar Pradesh, 201301</Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#64748b' }}>+91-8077757951</Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#64748b' }}>appointment.cyt@gmail.com</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4, borderColor: '#f1f5f9' }} />

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={7}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#228756', mb: 1 }}>Client Details</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>{log.name}</Typography>
              <Typography sx={{ fontSize: '1.1rem', color: '#475569' }}>Mobile: +91-{log.phone}</Typography>
              {log.email && <Typography sx={{ fontSize: '1.1rem', color: '#475569' }}>Email: {log.email}</Typography>}
              <Typography sx={{ fontSize: '1.1rem', color: '#475569' }}>UHID: {log.uhid || 'CYT.' + (logId.toString().slice(-8).toUpperCase())}</Typography>
            </Grid>
            <Grid item xs={5} sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '1.1rem', color: '#475569', mb: 0.5 }}><strong>Date:</strong> {displayDate}</Typography>
              <Typography sx={{ fontSize: '1.1rem', color: '#475569', mb: 0.5 }}><strong>Time:</strong> {displayTime}</Typography>
              <Typography sx={{ fontSize: '1.1rem', color: '#475569', mb: 0.5 }}><strong>Consult Type:</strong> {log.type === 'Clinic' ? 'In-Person' : (log.type || 'In-Person')}</Typography>
              <Typography sx={{ fontSize: '1.1rem', color: '#475569' }}><strong>Invoice ID:</strong> {formattedInvoiceId}</Typography>
            </Grid>
          </Grid>

          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#228756', mb: 1.5 }}>Booking Summary</Typography>
            <TableContainer component={Box} sx={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#228756' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 800 }}>Service</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 800 }}>Duration</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 800 }}>Session Details</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 800 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>{log.packageName || log.medicineName || 'Individual Session'}</TableCell>
                    <TableCell>{log.duration || '1 Session'} (60m)</TableCell>
                    <TableCell>Paid Via {log.paidVia || log.medication || 'Online'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#228756' }}>₹{log.amount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1 }}><Typography sx={{ fontSize: '0.9rem' }}><strong>CONFIDENTIALITY:</strong> Strictly private.</Typography></Box>
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1 }}><Typography sx={{ fontSize: '0.9rem' }}><strong>RESCHEDULING:</strong> 24h notice required.</Typography></Box>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#228756', mb: 1 }}>Notes & Guidelines</Typography>
            <Typography sx={{ fontSize: '1rem', mb: 1 }}>• <strong>Therapist Note:</strong> {log.advice || 'Follow the discussed plan.'}</Typography>
            <Typography sx={{ fontSize: '1rem', mb: 1 }}>• Consistency is vital for achieving your goals.</Typography>
            <Typography sx={{ fontSize: '1rem' }}>• Maintain a journal to track your progress.</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box>{qrUrl && <Box component="img" src={qrUrl} sx={{ width: 100 }} />}</Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>{log.therapist_name}</Typography>
              <Divider sx={{ my: 0.5 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Authorized Signature</Typography>
            </Box>
          </Box>
        </Paper>

        {/* PAGE 2: ADVERTISEMENT */}
        <Paper 
          id="invoice-ad-page" 
          elevation={0} 
          sx={{ 
            p: 8, 
            borderRadius: '0px', 
            border: '1px solid #e2e8f0', 
            background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)', 
            minHeight: '1120px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Background Elements */}
          <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(34, 135, 86, 0.03)' }} />
          <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(34, 135, 86, 0.05)' }} />

          <Box component="img" src="/favicon.png" sx={{ width: 120, mb: 4, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }} />
          
          <Typography variant="h2" sx={{ fontWeight: 900, color: '#228756', mb: 2, letterSpacing: '-1px' }}>
            Elevate Your Mental Wellbeing
          </Typography>
          
          <Typography variant="h5" sx={{ color: '#475569', mb: 8, maxWidth: 700, fontWeight: 500, lineHeight: 1.6 }}>
            "Healing takes courage, and we all have courage, even if we have to dig a little deeper to find it."
          </Typography>

          <Grid container spacing={4} sx={{ mb: 10, px: 4 }}>
            {[
              { title: 'Individual Therapy', desc: 'One-on-one sessions tailored to your unique journey.' },
              { title: 'Couple Counseling', desc: 'Strengthen bonds and resolve conflicts with expert guidance.' },
              { title: 'Stress & Anxiety', desc: 'Proven techniques to regain control and find inner peace.' },
              { title: 'Corporate Wellness', desc: 'Mental health support for high-performing teams.' }
            ].map((s) => (
              <Grid item xs={12} sm={6} key={s.title}>
                <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 10px 30px rgba(34, 135, 86, 0.05)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 1 }}>{s.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>{s.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ bgcolor: '#228756', p: 6, borderRadius: '32px', color: '#fff', width: '100%', maxWidth: '800px', boxShadow: '0 20px 40px rgba(34, 135, 86, 0.2)', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, background: 'radial-gradient(circle at top right, #fff, transparent)' }} />
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5 }}>Transform Your Life Today</Typography>
            <Typography sx={{ mb: 4, fontSize: '1.2rem', opacity: 0.9 }}>Visit our website to discover more resources and book sessions.</Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '1px' }}>www.chooseyourtherapist.in</Typography>
          </Box>
          
          <Typography sx={{ mt: 8, color: '#94a3b8', fontWeight: 600, fontSize: '1rem' }}>
            © {new Date().getFullYear()} Choose Your Therapist LLP. All Rights Reserved.
          </Typography>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }} className="no-print">
          <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Powered by Choose Your Therapist LLP</Typography>
        </Box>
      </Container>
    </Box>
  );
}

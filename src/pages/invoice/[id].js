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
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const canvas1 = await html2canvas(invoicePage, { scale: 4, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1000 });
      const imgData1 = canvas1.toDataURL('image/jpeg', 1.0);
      const imgHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
      pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, imgHeight1);
      
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

  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : '';
    return str;
  };

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
              #printable-invoice { 
                width: 100% !important; margin: 0 !important; padding: 40px 60px !important; 
                box-shadow: none !important; border: none !important; height: auto !important; 
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
        <Paper id="printable-invoice" elevation={0} sx={{ p: { xs: 4, sm: 8 }, pt: { xs: 6, sm: 10 }, borderRadius: '0px', border: '1px solid #e2e8f0', background: '#ffffff', mb: 4, position: 'relative' }}>
          {/* LOGO WATERMARK */}
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.04, pointerEvents: 'none', zIndex: 0 }}>
            <Box component="img" src="/favicon.png" sx={{ width: 350, height: 350 }} />
          </Box>

          <Grid container spacing={2} sx={{ mb: 6, alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box component="img" src="/favicon.png" sx={{ width: 90, height: 90, borderRadius: '15px' }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '2.2rem', color: '#228756', lineHeight: 1.1 }}>
                    {log.therapist_name || "Therapist"} {therapistInfo?.state && `(${therapistInfo.state})`}
                  </Typography>
                  <Typography sx={{ fontSize: '1.35rem', fontWeight: 600, color: '#64748b', mt: 0.3 }}>{log.therapist_type || "Professional Services"}</Typography>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#475569', mt: 0.1 }}>{therapistInfo?.qualification || "Psychologist"}</Typography>
                  {(therapistInfo?.license_number || log.license_number) && <Typography sx={{ fontSize: '1.15rem', color: '#94a3b8', mt: 0.8 }}>Reg.No. {therapistInfo?.license_number || log.license_number}</Typography>}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography sx={{ fontSize: '1.15rem', color: '#64748b', fontWeight: 600 }}>Choose Your Therapist, D-137, Sector 51</Typography>
              <Typography sx={{ fontSize: '1.15rem', color: '#64748b', fontWeight: 600 }}>Noida, Uttar Pradesh, 201301</Typography>
              <Typography sx={{ fontSize: '1.15rem', color: '#64748b' }}>+91-8077757951</Typography>
              <Typography sx={{ fontSize: '1.15rem', color: '#64748b' }}>appointment.cyt@gmail.com</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4, borderColor: '#f1f5f9' }} />

          <Grid container spacing={2} sx={{ mb: 5 }}>
            <Grid item xs={7}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#228756', mb: 1.5 }}>Client Details</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.45rem', mb: 0.5 }}>{log.name}</Typography>
              <Typography sx={{ fontSize: '1.25rem', color: '#475569', mb: 0.3 }}>Mobile: +91-{log.phone}</Typography>
              {log.email && <Typography sx={{ fontSize: '1.25rem', color: '#475569', mb: 0.3 }}>Email: {log.email}</Typography>}
              <Typography sx={{ fontSize: '1.25rem', color: '#475569' }}>UHID: {log.uhid || 'CYT.' + (logId.toString().slice(-8).toUpperCase())}</Typography>
            </Grid>
            <Grid item xs={5} sx={{ textAlign: 'right', mt: 4.5 }}>
              <Typography sx={{ fontSize: '1.25rem', color: '#475569', mb: 0.5 }}><strong>Date:</strong> {displayDate}</Typography>
              <Typography sx={{ fontSize: '1.25rem', color: '#475569', mb: 0.5 }}><strong>Consult Type:</strong> {log.type === 'Clinic' ? 'In-Person' : (log.type || 'In-Person')}</Typography>
              <Typography sx={{ fontSize: '1.25rem', color: '#475569' }}><strong>Invoice ID:</strong> {formattedInvoiceId}</Typography>
            </Grid>
          </Grid>

          <Box sx={{ mb: 5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#228756', mb: 2 }}>Booking Summary</Typography>
            <TableContainer component={Box} sx={{ borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#228756' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', py: 2 }}>Service</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', py: 2 }}>Duration</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', py: 2 }}>Session Details</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', py: 2 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontSize: '1.25rem', py: 2.5 }}>{log.packageName || log.medicineName || 'Individual Session'}</TableCell>
                    <TableCell sx={{ fontSize: '1.2rem' }}>{log.duration || '1 Session'} (60m)</TableCell>
                    <TableCell sx={{ fontSize: '1.2rem' }}>Paid Via {log.paidVia || log.medication || 'Online'}</TableCell>
                    <TableCell sx={{ fontWeight: 900, color: '#228756', fontSize: '1.4rem' }}>₹{log.amount}</TableCell>
                  </TableRow>
                  {/* Total Row */}
                  <TableRow sx={{ bgcolor: '#fbfcfd' }}>
                    <TableCell colSpan={3} sx={{ textAlign: 'right', py: 2, borderBottom: 'none' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#1e293b' }}>Total Amount</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                      <Typography sx={{ fontWeight: 900, color: '#228756', fontSize: '1.5rem' }}>₹{log.amount}</Typography>
                    </TableCell>
                  </TableRow>
                  {/* Amount in Words Row */}
                  <TableRow sx={{ bgcolor: '#ffffff' }}>
                    <TableCell colSpan={4} sx={{ py: 1.5, borderTop: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '1.15rem', color: '#64748b', fontStyle: 'italic' }}>
                        <strong style={{ color: '#1e293b' }}>Amount in Words:</strong> {numberToWords(log.amount)} Only
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>



          <Box sx={{ mb: 10 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#228756', mb: 1.5 }}>Notes & Guidelines</Typography>
            <Typography sx={{ fontSize: '1.2rem', mb: 1.5 }}>• <strong>Therapist Note:</strong> {log.advice || 'Follow the discussed therapeutic plan.'}</Typography>
            <Typography sx={{ fontSize: '1.2rem', mb: 1.5 }}>• Consistency in sessions is vital for achieving your goals.</Typography>
            <Typography sx={{ fontSize: '1.2rem' }}>• Maintain a personal journal to track your progress between sessions.</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
            <Box>
              <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8', mb: 0.5, fontWeight: 700 }}>SCAN TO VERIFY INVOICE</Typography>
              {qrUrl && <Box component="img" src={qrUrl} sx={{ width: 120 }} />}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.45rem', mb: 0.5 }}>{log.therapist_name}</Typography>
              <Divider sx={{ my: 1, borderColor: '#1e293b', borderWidth: 1 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: 1 }}>Authorized Signature</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />
          
          <Box sx={{ mb: 3, px: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#228756', mb: 1, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>About Choose Your Therapist LLP</Typography>
            <Typography sx={{ fontSize: '1rem', color: '#64748b', textAlign: 'center', lineHeight: 1.5, fontStyle: 'italic' }}>
              ChooseYourTherapist LLP is a mental healthcare platform connecting individuals with qualified therapists and 
              psychologists across India through online and in-person therapy services in Noida. We offer personalised 
              therapy sessions, couple counselling, workplace mental health support, and programs for schools, colleges, 
              and community initiatives, ensuring flexible and tailored mental health support for all.
            </Typography>
          </Box>

          <Typography sx={{ fontSize: '0.95rem', color: '#94a3b8', textAlign: 'center', fontWeight: 600 }}>
            * This is a computer-generated invoice and does not require a physical signature.
          </Typography>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }} className="no-print">
          <Typography sx={{ color: '#64748b', fontWeight: 800, fontSize: '1.2rem' }}>Powered by Choose Your Therapist LLP</Typography>
        </Box>
      </Container>
    </Box>
  );
}

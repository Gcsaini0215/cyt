import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Paper, Divider, Button, CircularProgress, Container, Grid } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import { fetchById } from '../../utils/actions';
import { getClinicLogsUrl } from '../../utils/url';
import Head from 'next/head';
import html2canvas from 'html2canvas';
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
      // Generate QR Code URL (pointing to the current page for verification)
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
      
      // Ensure we have a valid ID before fetching
      if (!id || id === 'undefined') {
        throw new Error("Invalid Invoice ID");
      }

      console.log("Fetching invoice for ID:", id);
      const url = `${getClinicLogsUrl}/${id}`;
      
      const res = await fetchById(url);
      
      if (res.status && res.data) {
        setLog(res.data);
        // Silently update local cache
        const localLogs = localStorage.getItem('clinicLogs');
        let logs = [];
        if (localLogs) {
          try {
            logs = JSON.parse(localLogs);
          } catch (e) { logs = []; }
        }
        const updatedLogs = [res.data, ...logs.filter(l => (l._id || l.id) !== (res.data._id || res.data.id))];
        localStorage.setItem('clinicLogs', JSON.stringify(updatedLogs.slice(0, 50)));
      } else {
        // Only if API returns 404/failure, try local fallback as last resort
        const localLogs = localStorage.getItem('clinicLogs');
        if (localLogs) {
          const logs = JSON.parse(localLogs);
          const found = logs.find(l => (l._id || l.id)?.toString() === id.toString());
          if (found) {
            setLog(found);
            return;
          }
        }
        setError(res.message || "Invoice not found on server");
      }
    } catch (err) {
      console.error("Invoice fetch error:", err);
      // Try localStorage fallback
      const localLogs = localStorage.getItem('clinicLogs');
      if (localLogs) {
        try {
          const logs = JSON.parse(localLogs);
          const found = logs.find(l => (l._id || l.id)?.toString() === id.toString());
          if (found) {
            setLog(found);
            return;
          }
        } catch (e) {}
      }
      setError("Unable to connect to server. Please check your internet.");
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
    const formattedId = `CYT-INV-${(log._id || log.id)?.toString().slice(-6).toUpperCase()}`;
    link.download = `Invoice-${formattedId}.png`;
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

  const formattedInvoiceId = `CYT-INV-${(log._id || log.id)?.toString().slice(-6).toUpperCase()}`;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: { xs: 3, md: 8 }, px: { xs: 1.5, sm: 2 } }}>
      <Head>
        <title>Invoice - {log.name} | Choose Your Therapist</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
            
            #printable-invoice {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              position: relative;
            }

            @media print {
              body { background: white !important; }
              .no-print { display: none !important; }
              #printable-invoice { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                margin: 0; 
                padding: 0; 
                box-shadow: none !important; 
                border: none !important; 
              }
              #printable-invoice { background-color: white !important; -webkit-print-color-adjust: exact; }
            }
          `}
        </style>
      </Head>

      <Container maxWidth="md" sx={{ px: { xs: 0.5, sm: 2 } }}>
        {/* Actions Bar */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 4,
          gap: 2 
        }} className="no-print">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 44, 
              height: 44, 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #228756 0%, #1b6843 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff',
              boxShadow: '0 4px 12px rgba(34, 135, 86, 0.2)'
            }}>
              <ReceiptLongIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.25rem', letterSpacing: '-0.3px' }}>Invoice Preview</Typography>
              <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>{formattedInvoiceId}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button 
              fullWidth
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ 
                borderColor: '#e2e8f0', 
                color: '#475569', 
                borderRadius: '12px', 
                fontWeight: 700, 
                textTransform: 'none', 
                fontSize: '0.95rem',
                bgcolor: '#ffffff',
                '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }, 
                py: 1.2,
                px: 3
              }}
            >
              Download
            </Button>
            <Button 
              fullWidth
              variant="contained" 
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ 
                bgcolor: '#228756', 
                '&:hover': { bgcolor: '#1b6843' }, 
                borderRadius: '12px', 
                fontWeight: 700, 
                textTransform: 'none', 
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(34, 135, 86, 0.2)',
                py: 1.2,
                px: 3
              }}
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
            borderRadius: { xs: '16px', sm: '24px' }, 
            overflow: 'hidden', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
            background: '#ffffff',
            position: 'relative'
          }}
        >
          {/* Top Brand Accent */}
          <Box sx={{ background: 'linear-gradient(90deg, #228756 0%, #1b6843 100%)', height: '10px', width: '100%', position: 'relative', zIndex: 1 }} />
          
          <Box sx={{ p: { xs: 3, sm: 6 }, position: 'relative', zIndex: 1 }}>
            {/* Logo and Status Header */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              gap: 3, 
              mb: { xs: 5, sm: 8 } 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box component="img" src="/favicon.png" sx={{ width: { xs: 50, sm: 65 }, height: { xs: 50, sm: 65 }, borderRadius: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                <Box>
                  <Typography sx={{ fontWeight: 900, color: '#228756', letterSpacing: '-1px', lineHeight: 1, fontSize: { xs: '1.5rem', sm: '2.4rem' } }}>Choose Your Therapist</Typography>
                  <Typography sx={{ color: '#64748b', fontWeight: 600, display: 'block', fontSize: { xs: '0.8rem', sm: '1.05rem' }, mt: 0.5 }}>Because healing starts with your choice.</Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', mb: 0.5, letterSpacing: '1px' }}>Invoice Date</Typography>
                  <Typography sx={{ color: '#1e293b', fontWeight: 900, fontSize: '1.25rem' }}>{log.date}</Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: { xs: 5, sm: 8 }, opacity: 0.6 }} />

            {/* Entity Grid - No Cards */}
            <Grid container spacing={4} sx={{ mb: { xs: 5, sm: 8 } }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', mb: 2, letterSpacing: '1.5px' }}>BILL TO</Typography>
                <Box sx={{ pl: 1 }}>
                  <Typography sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, fontSize: { xs: '1.4rem', sm: '1.6rem' } }}>{log.name}</Typography>
                  <Typography sx={{ color: '#475569', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ color: '#94a3b8' }}>Ph:</Box> +91-{log.phone}
                  </Typography>
                  {log.email && (
                    <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '1.05rem', mt: 0.5, wordBreak: 'break-all' }}>
                      {log.email}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', mb: 2, letterSpacing: '1.5px', textAlign: { xs: 'left', sm: 'right' } }}>ISSUED BY</Typography>
                <Box sx={{ pr: 1, textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, fontSize: { xs: '1.4rem', sm: '1.6rem' } }}>
                    {therapistInfo?.user?.name || log.therapist_name || "Therapist"}
                  </Typography>
                  <Typography sx={{ color: '#228756', fontWeight: 800, fontSize: '1.1rem' }}>
                    {therapistInfo?.profile_type || log.therapist_type || "Professional Therapy Services"}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '1rem', mt: 0.5 }}>
                    Certified Mental Health Practitioner
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Services Table */}
            <Box sx={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9', mb: 6 }}>
              <Box sx={{ bgcolor: 'rgba(34, 135, 86, 0.04)', px: 4, py: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 800, color: '#228756', fontSize: '0.75rem', letterSpacing: '1.5px' }}>DESCRIPTION</Typography>
                <Typography sx={{ fontWeight: 800, color: '#228756', fontSize: '0.75rem', letterSpacing: '1.5px' }}>AMOUNT</Typography>
              </Box>
              
              <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: { xs: '1.15rem', sm: '1.5rem' }, letterSpacing: '-0.3px' }}>
                    Therapy Consultation 
                    <Box component="span" sx={{ color: '#228756', ml: 1 }}>
                      ({log.type === 'Clinic' ? 'In-Person' : log.type})
                    </Box>
                  </Typography>
                  <Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem', mt: 0.5 }}>
                    Individual Therapy Session • 60 Minutes Duration
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 900, color: '#1e293b', fontSize: { xs: '1.4rem', sm: '1.8rem' } }}>₹{log.amount}</Typography>
              </Box>

              {log.remainingAmount && (
                <Box sx={{ 
                  p: 4, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  bgcolor: 'rgba(239, 68, 68, 0.02)',
                  borderTop: '1px solid rgba(239, 68, 68, 0.05)',
                  borderLeft: '4px solid #ef4444'
                }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#ef4444', fontSize: { xs: '1.15rem', sm: '1.4rem' } }}>Remaining Balance</Typography>
                    <Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', mt: 0.5 }}>Pending amount for this session</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontWeight: 900, color: '#ef4444', fontSize: { xs: '1.4rem', sm: '1.8rem' } }}>₹{log.remainingAmount}</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Summary Section - Full Width */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 8 }}>
              <Box sx={{ width: { xs: '100%', sm: '400px' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, bgcolor: 'rgba(34, 135, 86, 0.04)', p: 2, borderRadius: '12px' }}>
                  <Typography sx={{ color: '#228756', fontWeight: 800, fontSize: '1rem' }}>Paid Amount</Typography>
                  <Typography sx={{ color: '#1e293b', fontWeight: 900, fontSize: '1.1rem' }}>₹{log.amount}</Typography>
                </Box>
                {log.remainingAmount && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, px: 2 }}>
                    <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '1rem' }}>Pending Balance</Typography>
                    <Typography sx={{ color: '#ef4444', fontWeight: 800, fontSize: '1.1rem' }}>₹{log.remainingAmount}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2, borderColor: '#f1f5f9', mx: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                  <Typography sx={{ color: '#1e293b', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>Total Value</Typography>
                  <Typography sx={{ color: '#228756', fontWeight: 900, fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>₹{Number(log.amount || 0) + Number(log.remainingAmount || 0)}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Signature & Footer Area */}
            <Box sx={{ mt: 6 }}>
              {/* Stamp and QR side-by-side */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: { xs: 3, sm: 8 },
                mb: 4
              }}>
                {/* Stamp */}
                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: { xs: 100, sm: 120 }, 
                    height: { xs: 100, sm: 120 }, 
                    borderRadius: '50%', 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(-15deg)',
                    opacity: 0.8,
                    mb: 1
                  }}>
                    {/* Outer SVG with Curved Text */}
                    <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', fill: '#228756' }}>
                      <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                      <text font-size="8.5" font-weight="900" letter-spacing="2">
                        <textPath xlinkHref="#circlePath" startOffset="0%">CHOOSE YOUR THERAPIST • CHOOSE YOUR THERAPIST •</textPath>
                      </text>
                    </svg>
                    
                    {/* Inner Circle and Content */}
                    <Box sx={{ 
                      width: { xs: 65, sm: 80 }, 
                      height: { xs: 65, sm: 80 }, 
                      border: '2px solid #228756', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'rgba(34, 135, 86, 0.02)',
                      zIndex: 1
                    }}>
                      <CheckCircleIcon sx={{ fontSize: { xs: 22, sm: 28 }, color: '#228756', mb: -0.5 }} />
                      <Typography sx={{ 
                        fontSize: { xs: '8px', sm: '10px' }, 
                        fontWeight: 900, 
                        color: '#228756', 
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        VERIFIED
                      </Typography>
                    </Box>
                    
                    {/* Double Border Detail */}
                    <Box sx={{ 
                      position: 'absolute', 
                      width: '94%', 
                      height: '94%', 
                      border: '1px solid #228756', 
                      borderRadius: '50%',
                      opacity: 0.3
                    }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Official Digital Seal</Typography>
                </Box>

                {/* QR Code */}
                {qrUrl && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box component="img" src={qrUrl} sx={{ width: { xs: 80, sm: 90 }, height: { xs: 80, sm: 90 }, mb: 1, borderRadius: '8px', border: '1px solid #f1f5f9', p: 0.5 }} />
                    <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Scan to Verify</Typography>
                  </Box>
                )}
              </Box>
              
              {/* Thank you message */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#1e293b', fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 1 }}>Thank you for your trust.</Typography>
                <Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>Choosing therapy is a brave first step towards wellness.</Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Bottom Branding & Socials */}
          <Box sx={{ bgcolor: '#f8fafc', p: 4, textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748b' }}>
                <InstagramIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>@choose.your.therapist</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748b' }}>
                <LinkedInIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>Choose Your Therapist</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748b' }}>
                <LanguageIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>chooseyourtherapist.in</Typography>
              </Box>
            </Box>
            <Typography sx={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Computer Generated Official Document • No Signature Required
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }} className="no-print">
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            Official communication from <Box component="span" sx={{ color: '#228756', fontWeight: 800 }}>Choose Your Therapist</Box>
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>support@chooseyourtherapist.in</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>+91-8077757951</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

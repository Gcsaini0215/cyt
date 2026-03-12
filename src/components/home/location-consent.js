import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Slide, Paper, IconButton } from '@mui/material';
import { LocationOn, Cookie, Close, CheckCircle } from '@mui/icons-material';

const LocationConsent = ({ onAccept }) => {
  const [show, setShow] = useState(false);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cyt-location-consent');
    if (!hasConsented) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cyt-location-consent', 'true');
    setConsented(true);
    setTimeout(() => {
      setShow(false);
      if (onAccept) onAccept();
    }, 1000);
  };

  const handleDecline = () => {
    localStorage.setItem('cyt-location-consent', 'declined');
    setShow(false);
  };

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
      <Paper
        elevation={10}
        sx={{
          position: 'fixed',
          bottom: { xs: 0, md: 24 },
          left: { xs: 0, md: 24 },
          right: { xs: 0, md: 'auto' },
          maxWidth: { xs: '100%', md: 450 },
          width: '100%',
          p: 0,
          borderRadius: { xs: '20px 20px 0 0', md: 4 },
          overflow: 'hidden',
          zIndex: 9999,
          border: '1px solid #e2e8f0',
          boxShadow: { xs: '0 -10px 30px rgba(0,0,0,0.1)', md: '0 10px 30px rgba(0,0,0,0.1)' }
        }}
      >
        <Box sx={{ p: 3, bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                bgcolor: '#f0fdf4', 
                p: 1, 
                borderRadius: '12px',
                display: 'flex'
              }}>
                <LocationOn sx={{ color: '#228756' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Enable Location
              </Typography>
            </Box>
            <IconButton onClick={handleDecline} size="small">
              <Close sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Typography sx={{ color: '#64748b', fontSize: '14px', mb: 3, lineHeight: 1.6 }}>
            By allowing location access, we can help you find the best 
            <strong> psychologists in your city</strong> and show you relevant local mental health studios.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Cookie sx={{ color: '#64748b', fontSize: 18 }} />
              <Typography sx={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                Cookie Policy Included
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAccept}
              disabled={consented}
              sx={{
                bgcolor: consented ? '#22c55e' : '#228756',
                color: '#ffffff',
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#1a6b44' },
                boxShadow: 'none'
              }}
            >
              {consented ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 20 }} /> Enabled
                </Box>
              ) : 'Allow & Continue'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleDecline}
              sx={{
                borderColor: '#e2e8f0',
                color: '#64748b',
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
              }}
            >
              Maybe Later
            </Button>
          </Box>
        </Box>
        <Box sx={{ height: '4px', bgcolor: '#228756', width: consented ? '100%' : '30%', transition: 'width 0.5s ease' }} />
      </Paper>
    </Slide>
  );
};

export default LocationConsent;

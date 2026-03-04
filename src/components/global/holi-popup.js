import React, { useState, useEffect } from 'react';
import { IconButton, Box, Typography, Button, Zoom, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const HoliPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenHoliPopup = sessionStorage.getItem('hasSeenHoliPopup');
    if (!hasSeenHoliPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenHoliPopup', 'true');
  };

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      }}
    >
      <Fade in={isOpen} timeout={800}>
        <Box
          sx={{
            position: 'relative',
            width: '90%',
            maxWidth: '500px',
            backgroundColor: '#ffffff',
            borderRadius: '30px',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          }}
        >
          {/* Animated Color Splashes */}
          <Box className="color-splash splash-1" />
          <Box className="color-splash splash-2" />
          <Box className="color-splash splash-3" />
          <Box className="color-splash splash-4" />
          <Box className="color-splash splash-5" />
          <Box className="color-splash splash-6" />

          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              color: '#64748b',
              backgroundColor: 'rgba(0,0,0,0.05)',
              zIndex: 10,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>

          <Zoom in={isOpen} style={{ transitionDelay: '300ms' }}>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: 'linear-gradient(45deg, #228756, #e91e63, #ff9800, #228756, #2196f3, #9c27b0)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradient-shift 5s ease infinite',
                  mb: 2,
                  lineHeight: 1.2
                }}
              >
                Happy Holi!
              </Typography>
              
              <Typography
                sx={{
                  color: '#475569',
                  fontSize: '1.1rem',
                  mb: 4,
                  fontWeight: 500,
                  lineHeight: 1.6
                }}
              >
                May your journey of healing <br /> be filled with vibrant colors <br /> and lasting peace.
              </Typography>

              <Button
                variant="contained"
                onClick={handleClose}
                sx={{
                  background: 'linear-gradient(135deg, #228756 0%, #1a6b44 100%)',
                  color: '#fff',
                  padding: '12px 40px',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  textTransform: 'none',
                  boxShadow: '0 10px 20px rgba(34, 135, 86, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1a6b44 0%, #134e32 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 30px rgba(34, 135, 86, 0.3)',
                  },
                  transition: 'all 0.3s'
                }}
              >
                Celebrate Life
              </Button>
            </Box>
          </Zoom>

          <style jsx global>{`
            @keyframes gradient-shift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }

            @keyframes splash-float {
              0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.3; }
              50% { transform: scale(1.2) translate(10px, -10px); opacity: 0.5; }
            }

            .color-splash {
              position: absolute;
              border-radius: 50%;
              filter: blur(40px);
              z-index: 0;
              pointer-events: none;
            }

            .splash-1 {
              top: -50px;
              left: -50px;
              width: 150px;
              height: 150px;
              background: #228756;
              animation: splash-float 7s infinite;
            }

            .splash-2 {
              bottom: -50px;
              right: -50px;
              width: 180px;
              height: 180px;
              background: #e91e63;
              animation: splash-float 8s infinite reverse;
            }

            .splash-3 {
              top: 20%;
              right: -30px;
              width: 100px;
              height: 100px;
              background: #ff9800;
              animation: splash-float 6s infinite;
            }

            .splash-4 {
              bottom: 20%;
              left: -30px;
              width: 120px;
              height: 120px;
              background: #2196f3;
              animation: splash-float 9s infinite reverse;
            }

            .splash-5 {
              top: 50%;
              left: -40px;
              width: 80px;
              height: 80px;
              background: #9c27b0;
              animation: splash-float 10s infinite;
            }

            .splash-6 {
              top: -20px;
              right: 30%;
              width: 90px;
              height: 90px;
              background: #ffeb3b;
              animation: splash-float 11s infinite reverse;
            }
          `}</style>
        </Box>
      </Fade>
    </Box>
  );
};

export default HoliPopup;

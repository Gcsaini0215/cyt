import React, { useState, useEffect } from 'react';
import { Box, Typography, Link, Zoom, Fade, IconButton, Paper, useMediaQuery, useTheme } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const WhatsAppWidget = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const whatsappNumber = "+918077757951";
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const actions = [
    {
      label: "Book a Free Consultation",
      link: "/therapy-booking",
      icon: "📅",
      isExternal: false
    },
    {
      label: "Pricing & Plans",
      link: "/plans",
      icon: "💰",
      isExternal: false
    },
    {
      label: "Talk to an Expert",
      link: `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent("Hi! I'd like to talk to an expert.")}`,
      icon: "💬",
      isExternal: true
    }
  ];

  return (
    <Box className="no-print" sx={{ 
      position: 'fixed', 
      bottom: '50%', 
      left: 0,
      transform: 'translateY(50%)',
      zIndex: 9999 
    }}>
      {/* Quick-Action Menu */}
      <Fade in={isOpen}>
        <Paper
          elevation={10}
          sx={{
            position: 'absolute',
            top: 0,
            left: '50px',
            width: '300px',
            borderRadius: '24px',
            overflow: 'hidden',
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            transform: 'translateY(-50%)'
          }}
        >
          <Box sx={{ p: 2.5, background: 'linear-gradient(135deg, #228756 0%, #1a6b44 100%)', color: 'white', position: 'relative' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '18px', mb: 0.5 }}>How can we help?</Typography>
            <Typography sx={{ opacity: 0.9, fontSize: '13px', fontWeight: 500 }}>Typically replies in 5 minutes</Typography>
            <IconButton 
              size="small" 
              onClick={() => setIsOpen(false)}
              sx={{ position: 'absolute', top: 10, right: 10, color: 'white' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ p: 1 }}>
            {actions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                target={action.isExternal ? "_blank" : "_self"}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '12px',
                  color: '#1e293b',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    transform: 'translateX(5px)',
                    color: '#228756'
                  }
                }}
              >
                <Box sx={{ fontSize: '20px' }}>{action.icon}</Box>
                <Typography sx={{ fontWeight: 600, fontSize: '14px', flexGrow: 1 }}>
                  {action.label}
                </Typography>
                <ArrowForwardIosIcon sx={{ fontSize: '10px', opacity: 0.3 }} />
              </Link>
            ))}
          </Box>
        </Paper>
      </Fade>

      {/* Main WhatsApp Toggle Button */}
      <Zoom in={true} style={{ transitionDelay: '2000ms' }}>
        <Box
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            background: '#228756',
            color: 'white',
            padding: isMobile ? '10px 5px' : '15px 10px',
            borderRadius: '0 10px 10px 0',
            boxShadow: '0 10px 25px rgba(34, 135, 86, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            '&:hover': {
              transform: 'translateX(5px)',
              background: '#1a6b44',
            }
          }}
        >
          <WhatsAppIcon sx={{ fontSize: isMobile ? '20px' : '28px', transform: 'rotate(90deg)' }} />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: isMobile ? '13px' : '15px',
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap'
            }}
          >
            {isOpen ? 'Close' : 'Chat with us'}
          </Typography>

          {/* Animation removed */}
        </Box>
      </Zoom>
    </Box>
  );
};

export default WhatsAppWidget;

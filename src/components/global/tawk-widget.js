import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Box, Typography, Zoom, useMediaQuery, useTheme } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const TawkToWidget = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Tawk is already loaded
    if (window.Tawk_API && window.Tawk_API.onLoad) {
      setIsLoaded(true);
    }
  }, []);

  const handleToggle = () => {
    if (window.Tawk_API) {
      window.Tawk_API.toggle();
    }
  };

  return (
    <>
      <Script id="tawk-to-script" strategy="lazyOnload">
        {`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          Tawk_API.onLoad = function(){
            Tawk_API.hideWidget();
          };
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/69b9862178528f1c350005ee/1jjub7tpj';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `}
      </Script>

      <Box className="no-print" sx={{ 
        position: 'fixed', 
        bottom: '50%', 
        right: 0,
        transform: 'translateY(-100%)', // Position it above the middle point
        zIndex: 9999,
        mb: 2 // Some margin from the WhatsApp widget which starts at 50%
      }}>
        <Zoom in={true} style={{ transitionDelay: '2500ms' }}>
          <Box
            onClick={handleToggle}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              background: '#0366d6', // Blue color for Tawk.to
              color: 'white',
              padding: isMobile ? '10px 5px' : '15px 10px',
              borderRadius: '10px 0 0 10px',
              boxShadow: '0 10px 25px rgba(3, 102, 214, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              '&:hover': {
                transform: 'translateX(-5px)',
                background: '#024ea2',
              }
            }}
          >
            <ChatIcon sx={{ fontSize: isMobile ? '20px' : '28px', transform: 'rotate(90deg)' }} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: isMobile ? '13px' : '15px',
                letterSpacing: '0.3px',
                whiteSpace: 'nowrap'
              }}
            >
              Live Chat
            </Typography>
          </Box>
        </Zoom>
      </Box>

      <style>{`
        #tawk-chat-container {
          display: none !important;
        }
      `}</style>
    </>
  );
};

export default TawkToWidget;

import React from "react";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function InvoicesHeader() {
  return (
    <Box sx={{ mb: 4 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2, color: '#64748b' }}
      >
        <Link underline="hover" color="inherit" href="/therapist-dashboard" sx={{ fontSize: '14px', fontWeight: 500 }}>
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ fontSize: '14px', fontWeight: 600, color: '#228756' }}>
          Invoices
        </Typography>
      </Breadcrumbs>

      <Box 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: '24px', 
          background: 'linear-gradient(135deg, #1b6843 0%, #228756 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(34, 135, 86, 0.2)'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <ReceiptIcon sx={{ fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
              Invoice Management
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: '600px', fontWeight: 500 }}>
            Track your earnings, download receipts, and manage billing history for all your therapy sessions.
          </Typography>
        </Box>

        {/* Decorative Elements */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -20, 
            right: -20, 
            width: 150, 
            height: 150, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 20, 
            right: 100, 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.05)',
            zIndex: 0
          }} 
        />
      </Box>
    </Box>
  );
}

import React from "react";
import { Box, Typography, Container, Grid, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import Link from "next/link";

export default function CrisisSupport() {
  return (
    <section className="rbt-section-gap bg-color-extra2" style={{ padding: '80px 0' }}>
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            backgroundColor: '#fff1f1', 
            borderRadius: '24px', 
            padding: { xs: '30px', md: '50px' },
            border: '2px solid #fee2e2',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background decoration */}
          <ErrorOutlineIcon 
            sx={{ 
              position: 'absolute', 
              right: -20, 
              bottom: -20, 
              fontSize: '200px', 
              color: 'rgba(239, 68, 68, 0.05)',
              transform: 'rotate(-15deg)'
            }} 
          />

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box 
                  sx={{ 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    borderRadius: '12px', 
                    p: 1,
                    display: 'flex'
                  }}
                >
                  <ErrorOutlineIcon />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#ef4444', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px' 
                  }}
                >
                  Immediate Help
                </Typography>
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 900, 
                  color: '#1e293b', 
                  mb: 2,
                  fontSize: { xs: '28px', md: '36px' }
                }}
              >
                Are you in a crisis?
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#475569', 
                  fontSize: '18px', 
                  lineHeight: 1.6,
                  maxWidth: '600px',
                  mb: 4
                }}
              >
                If you or someone you know is in immediate danger or experiencing a mental health emergency, 
                please don't wait. Reach out to professional help right now.
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button 
                  component="a"
                  href="tel:18008914416"
                  variant="contained" 
                  sx={{ 
                    backgroundColor: '#ef4444', 
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    fontWeight: 700,
                    fontSize: '16px',
                    boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)',
                    '&:hover': {
                      backgroundColor: '#dc2626'
                    },
                    textTransform: 'none',
                    display: 'flex',
                    gap: 1
                  }}
                >
                  <PhoneInTalkIcon sx={{ fontSize: 20 }} />
                  Tele Manas: 1800-891-4416
                </Button>
                
                <Link href="/emergency-support" passHref>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      borderColor: '#ef4444', 
                      color: '#ef4444',
                      px: 4,
                      py: 1.5,
                      borderRadius: '50px',
                      fontWeight: 700,
                      fontSize: '16px',
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderColor: '#dc2626'
                      },
                      textTransform: 'none'
                    }}
                  >
                    View All Helplines
                  </Button>
                </Link>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                sx={{ 
                  backgroundColor: 'white', 
                  borderRadius: '20px', 
                  p: 3, 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                  border: '1px solid #f1f5f9'
                }}
              >
                <Typography sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>Available 24/7</Typography>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    { name: 'Tele Manas', num: '1800 891 4416' },
                    { name: 'Vandrevala', num: '9999 666 555' },
                    { name: 'AASRA', num: '98204 66726' }
                  ].map((h, i) => (
                    <li key={i} style={{ marginBottom: i === 2 ? 0 : '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>{h.name}</span>
                      <a href={`tel:${h.num.replace(/\s/g, '')}`} style={{ color: '#ef4444', fontWeight: 700, textDecoration: 'none' }}>{h.num}</a>
                    </li>
                  ))}
                </ul>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </section>
  );
}

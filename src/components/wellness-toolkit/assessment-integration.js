import React from "react";
import { Box, Typography, Container, Grid, Button } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import Link from "next/link";

export default function AssessmentIntegration() {
  return (
    <section className="rbt-section-gap bg-color-white" style={{ padding: '100px 0' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: '40px', md: '60px' },
                background: 'linear-gradient(135deg, #228756 0%, #1a4d32 100%)',
                borderRadius: '32px',
                boxShadow: '0 30px 60px rgba(34, 135, 86, 0.2)',
                overflow: 'hidden'
              }}
            >
              <AssignmentIcon 
                sx={{ 
                  fontSize: '240px', 
                  color: 'rgba(255, 255, 255, 0.1)',
                  position: 'absolute'
                }} 
              />
              <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <RocketLaunchIcon sx={{ fontSize: '80px', color: 'white', mb: 3 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 900, mb: 1 }}>
                  92% Accuracy
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                  Based on clinical assessments
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ pl: { md: 4 } }}>
              <div className="section-title text-start mb--30">
                <Typography 
                  sx={{ 
                    color: '#228756', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    letterSpacing: '2px', 
                    fontSize: '14px', 
                    mb: 2,
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: 'rgba(34, 135, 86, 0.1)',
                    borderRadius: '50px'
                  }}
                >
                  Bridge Tools with Insights
                </Typography>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    color: '#1e293b', 
                    fontWeight: 900, 
                    fontSize: { xs: '32px', md: '48px' },
                    lineHeight: 1.2,
                    mb: 3
                  }}
                >
                  Know your <span style={{ color: '#228756' }}>Mental Health</span> Score
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#64748b', 
                    fontSize: '18px', 
                    lineHeight: 1.7,
                    mb: 4
                  }}
                >
                  Our free wellness tools are even more effective when you understand 
                  your current state. Take our comprehensive self-assessment to get 
                  personalized insights and recommendations on which tools in this toolkit 
                  will help you most.
                </Typography>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px' }}>
                  {[
                    'Clinically validated assessments',
                    'Instant personalized report',
                    'Tool recommendations for your score',
                    'Expert psychologist insights'
                  ].map((item, i) => (
                    <li key={i} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <Box sx={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        backgroundColor: '#228756', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <i className="feather-check" style={{ fontSize: '14px', fontWeight: 800 }}></i>
                      </Box>
                      <span style={{ color: '#1e293b', fontWeight: 700, fontSize: '16px' }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/self-assessment" passHref>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      backgroundColor: '#228756', 
                      color: 'white',
                      px: 5,
                      py: 2,
                      borderRadius: '50px',
                      fontWeight: 800,
                      fontSize: '18px',
                      boxShadow: '0 15px 30px rgba(34, 135, 86, 0.2)',
                      '&:hover': {
                        backgroundColor: '#1a6b44'
                      },
                      textTransform: 'none'
                    }}
                  >
                    Take Self-Assessment
                  </Button>
                </Link>
              </div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
}

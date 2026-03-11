import React from 'react';
import { Box, Container, Typography, Grid, Paper, Button } from '@mui/material';
import { LocationOn, Phone, Email, Navigation } from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';

const LocalPresence = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const locations = [
    {
      city: "Noida",
      address: "D-137, Sector 51, Noida, Uttar Pradesh 201301",
      phone: "+91 8077757951",
      email: "appointment.cyt@gmail.com",
      image: "/assets/img/noida.jpeg",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=D-137%2C+Sector+51%2C+Noida%2C+Uttar+Pradesh+201301"
    },
    {
      city: "Delhi",
      address: "Serving clients across South Delhi, East Delhi & Central Delhi",
      phone: "+91 8077757951",
      email: "appointment.cyt@gmail.com",
      image: "https://images.unsplash.com/photo-1587474260584-1f21915c0f79?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Delhi+India"
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: '#f8fafc' }}>
      <Container>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ 
            fontSize: isMobile ? "2rem" : "3.5rem", 
            fontWeight: 800, 
            color: "#1e293b",
            mb: 2
          }}>
            Our Presence in <span style={{ color: '#228756' }}>Noida & Delhi</span>
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '700px', mx: 'auto' }}>
            Visit our centers or book an in-person session with the best psychologists in Noida and Delhi NCR.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {locations.map((loc, index) => (
            <Grid item xs={12} key={index}>
              <Paper sx={{ p: 0, borderRadius: 6, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <Grid container>
                  <Grid item xs={12} sm={6} order={{ xs: 2, sm: index % 2 === 0 ? 1 : 2 }}>
                    <Box sx={{ p: 5 }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>{loc.city} Center</Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <LocationOn sx={{ color: '#228756' }} />
                        <Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '1.1rem' }}>{loc.address}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Phone sx={{ color: '#228756' }} />
                        <Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '1.1rem' }}>{loc.phone}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                        <Email sx={{ color: '#228756' }} />
                        <Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '1.1rem' }}>{loc.email}</Typography>
                      </Box>

                      <Button 
                        variant="contained" 
                        startIcon={<Navigation />}
                        href={loc.mapUrl}
                        target="_blank"
                        sx={{ 
                          bgcolor: '#228756', 
                          borderRadius: 3, 
                          px: 4,
                          py: 1.5, 
                          fontWeight: 700,
                          '&:hover': { bgcolor: '#1a6b44' }
                        }}
                      >
                        View on Google Maps
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} order={{ xs: 1, sm: index % 2 === 0 ? 2 : 1 }}>
                    <Box sx={{ height: '100%', minHeight: '350px' }}>
                      <img 
                        src={loc.image} 
                        alt={loc.city} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LocalPresence;

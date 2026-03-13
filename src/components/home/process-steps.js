import React from "react";
import { 
  ClipboardList, 
  UserCheck, 
  Sparkles,
  ShieldCheck, 
  MessageCircle,
} from "lucide-react";
import { Box, Typography, Container, Grid, Avatar, Stack, useMediaQuery } from "@mui/material";

const ProcessSteps = () => {
  const isMobile = useMediaQuery("(max-width:900px)");
  
  const clientSteps = [
    {
      title: "Self-Assessment",
      desc: "Identify your concerns through our simple discovery tools and expert-backed assessments.",
      icon: <ClipboardList size={28} />,
      step: "01",
      bgColor: "#f0fdf4", // Light Mint
      borderColor: "#bbf7d0",
      iconColor: "#228756"
    },
    {
      title: "Explore & Choose",
      desc: "Browse our network of verified professionals and select the expert who truly resonates with you.",
      icon: <UserCheck size={28} />,
      step: "02",
      bgColor: "#eff6ff", // Light Blue
      borderColor: "#dbeafe",
      iconColor: "#3b82f6"
    },
    {
      title: "Guided Healing",
      desc: "Start your consistent sessions in a safe, confidential space designed for your growth.",
      icon: <Sparkles size={28} />,
      step: "03",
      bgColor: "#faf5ff", // Light Purple
      borderColor: "#f3e8ff",
      iconColor: "#a855f7"
    }
  ];

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#ffffff" }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: { xs: 6, md: 9 }, textAlign: "center" }}>
          <Typography sx={{ 
            color: "#228756", 
            fontWeight: 800, 
            fontSize: "1rem", 
            textTransform: "uppercase", 
            letterSpacing: 3,
            mb: 2
          }}>
            How it Works
          </Typography>
          <Typography variant="h3" sx={{ 
            fontWeight: 900, 
            color: "#0f172a", 
            fontSize: { xs: "2.2rem", md: "3.8rem" },
            lineHeight: 1.1,
            letterSpacing: "-0.03em"
          }}>
            Your Path to <span style={{ color: "#228756" }}>Mental Wellness</span>
          </Typography>
        </Box>

        {/* Steps Grid */}
        <Grid container spacing={{ xs: 3, md: 5 }}>
          {clientSteps.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{
                p: { xs: 4, md: 5 },
                height: '100%',
                borderRadius: '32px',
                bgcolor: item.bgColor,
                border: `1px solid ${item.borderColor}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-12px)',
                  boxShadow: `0 30px 60px -12px ${item.borderColor}`,
                  borderColor: item.iconColor
                }
              }}>
                <Stack spacing={4} sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Avatar sx={{ 
                      bgcolor: item.iconColor, 
                      width: 64, 
                      height: 64,
                      boxShadow: `0 12px 24px -6px ${item.iconColor}40`
                    }}>
                      {item.icon}
                    </Avatar>
                    <Typography sx={{ 
                      fontSize: '4rem', 
                      fontWeight: 900, 
                      color: `${item.iconColor}15`,
                      lineHeight: 1,
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {item.step}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 800, 
                      color: "#0f172a", 
                      mb: 2,
                      fontSize: { xs: '1.4rem', md: '1.6rem' },
                      letterSpacing: '-0.01em'
                    }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ 
                      color: "#475569", 
                      lineHeight: 1.7, 
                      fontSize: { xs: '1.1rem', md: '1.2rem' },
                      fontWeight: 500
                    }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Trust Indicators */}
        <Stack 
          direction="row" 
          spacing={{ xs: 2, md: 6 }} 
          justifyContent="center" 
          alignItems="center"
          flexWrap="wrap"
          sx={{ mt: { xs: 6, md: 10 }, pt: 5, borderTop: '1px solid #f1f5f9' }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 } }}>
            <ShieldCheck size={isMobile ? 18 : 22} color="#228756" />
            <Typography variant="body1" sx={{ color: "#1e293b", fontWeight: 700, fontSize: { xs: '0.75rem', md: '1rem' }, whiteSpace: 'nowrap' }}>100% Confidential</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 } }}>
            <MessageCircle size={isMobile ? 18 : 22} color="#228756" />
            <Typography variant="body1" sx={{ color: "#1e293b", fontWeight: 700, fontSize: { xs: '0.75rem', md: '1rem' }, whiteSpace: 'nowrap' }}>Verified Experts</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 } }}>
            <UserCheck size={isMobile ? 18 : 22} color="#228756" />
            <Typography variant="body1" sx={{ color: "#1e293b", fontWeight: 700, fontSize: { xs: '0.75rem', md: '1rem' }, whiteSpace: 'nowrap' }}>Secure Sessions</Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default ProcessSteps;

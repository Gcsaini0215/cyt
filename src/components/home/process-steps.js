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
      icon: <ClipboardList size={26} />,
      step: "01",
      bgColor: "#f5faf7", // Soft Mint
      borderColor: "#e2f0e6",
      iconColor: "#2f8f66"
    },
    {
      title: "Explore & Choose",
      desc: "Browse our network of verified professionals and select the expert who truly resonates with you.",
      icon: <UserCheck size={26} />,
      step: "02",
      bgColor: "#f5f8fc", // Soft Blue
      borderColor: "#e2eaf5",
      iconColor: "#4d7fc9"
    },
    {
      title: "Guided Healing",
      desc: "Start your consistent sessions in a safe, confidential space designed for your growth.",
      icon: <Sparkles size={26} />,
      step: "03",
      bgColor: "#f8f6fb", // Soft Lavender
      borderColor: "#ece5f4",
      iconColor: "#8b6bb8"
    }
  ];

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#fcfdfc", position: 'relative', overflow: 'hidden' }}>
      {/* Soft ambient blobs for a calmer backdrop */}
      <Box sx={{
        position: 'absolute', top: '-80px', left: '-60px',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(47,143,102,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-100px', right: '-80px',
        width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,107,184,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ mb: { xs: 6, md: 9 }, textAlign: "center" }}>
          <Typography sx={{
            color: "#2f8f66",
            fontWeight: 700,
            fontSize: "0.95rem",
            textTransform: "uppercase",
            letterSpacing: 3,
            mb: 2
          }}>
            How it Works
          </Typography>
          <Typography variant="h3" sx={{
            fontWeight: 800,
            color: "#1e293b",
            fontSize: { xs: "2.1rem", md: "3.4rem" },
            lineHeight: 1.2,
            letterSpacing: "-0.02em"
          }}>
            Your Path to <span style={{ color: "#2f8f66" }}>Mental Wellness</span>
          </Typography>
        </Box>

        {/* Steps Grid */}
        <Grid container spacing={{ xs: 3, md: 5 }}>
          {clientSteps.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{
                p: { xs: 4, md: 5 },
                height: '100%',
                borderRadius: '28px',
                bgcolor: item.bgColor,
                border: `1px solid ${item.borderColor}`,
                transition: 'all 0.45s cubic-bezier(0.25, 0.8, 0.4, 1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: `0 24px 50px -24px ${item.iconColor}55`,
                  borderColor: `${item.iconColor}55`
                }
              }}>
                <Stack spacing={4} sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Avatar sx={{
                      background: `linear-gradient(135deg, ${item.iconColor}, ${item.iconColor}cc)`,
                      width: 60,
                      height: 60,
                      boxShadow: `0 10px 20px -8px ${item.iconColor}55`
                    }}>
                      {item.icon}
                    </Avatar>
                    <Typography sx={{
                      fontSize: '3.4rem',
                      fontWeight: 700,
                      color: `${item.iconColor}1f`,
                      lineHeight: 1,
                      letterSpacing: '0.02em',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {item.step}
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{
                      fontWeight: 700,
                      color: "#1e293b",
                      mb: 1.5,
                      fontSize: { xs: '1.3rem', md: '1.45rem' },
                      letterSpacing: '-0.01em'
                    }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{
                      color: "#5b6b76",
                      lineHeight: 1.75,
                      fontSize: { xs: '1.02rem', md: '1.08rem' },
                      fontWeight: 400
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
          spacing={{ xs: 1.5, md: 2.5 }}
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          sx={{ mt: { xs: 6, md: 9 }, pt: 5, borderTop: '1px solid #f1f5f9' }}
        >
          {[
            { Icon: ShieldCheck, label: "100% Confidential" },
            { Icon: MessageCircle, label: "Verified Experts" },
            { Icon: UserCheck, label: "Secure Sessions" },
          ].map(({ Icon, label }) => (
            <Box key={label} sx={{
              display: "flex", alignItems: "center", gap: { xs: 0.75, md: 1 },
              bgcolor: "#f6faf8", border: "1px solid #e9f2ec",
              borderRadius: "999px",
              px: { xs: 1.75, md: 2.25 }, py: { xs: 0.9, md: 1.1 }
            }}>
              <Icon size={isMobile ? 16 : 18} color="#2f8f66" />
              <Typography variant="body1" sx={{ color: "#3f4d47", fontWeight: 600, fontSize: { xs: '0.72rem', md: '0.88rem' }, whiteSpace: 'nowrap' }}>{label}</Typography>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default ProcessSteps;

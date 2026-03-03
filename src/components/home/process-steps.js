import React from "react";
import { 
  ClipboardList, 
  UserCheck, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Box, Typography, Container, Grid, Paper, useMediaQuery } from "@mui/material";

const ProcessSteps = () => {
  const isMobile = useMediaQuery("(max-width: 900px)");

  const clientSteps = [
    {
      title: "Self-Assessment",
      desc: "Identify your concerns through our simple discovery tools.",
      icon: <ClipboardList size={28} />,
      step: "01"
    },
    {
      title: "Explore & Choose",
      desc: "Browse verified professionals and select the expert who resonates most with you.",
      icon: <UserCheck size={28} />,
      step: "02"
    },
    {
      title: "Guided Healing",
      desc: "Start consistent sessions in a safe, confidential space.",
      icon: <Sparkles size={28} />,
      step: "03"
    }
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 15 }, backgroundColor: "#ffffff" }}>
      <Container maxWidth="lg">
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 8 }, 
            borderRadius: "40px", 
            backgroundColor: "#ffffff",
            border: "1px solid #f1f5f9",
            boxShadow: "0 30px 60px rgba(0,0,0,0.04)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <Box sx={{ mb: { xs: 6, md: 10 }, textAlign: "center" }}>
            <Box sx={{ 
              display: "inline-block", 
              px: 2, 
              py: 0.5, 
              borderRadius: "50px", 
              bgcolor: "#f0fdf4", 
              color: "#228756",
              fontSize: "0.85rem",
              fontWeight: 800,
              mb: 2,
              letterSpacing: 1
            }}>
              THE CYT METHODOLOGY
            </Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 900, 
              color: "#1e293b", 
              fontSize: { xs: "2.5rem", md: "4.5rem" },
              letterSpacing: "-2px",
              lineHeight: 1.1
            }}>
              Your Personalized <span style={{ color: "#228756" }}>Healing Blueprint</span>
            </Typography>
          </Box>

          {/* Steps Grid */}
          <Grid container spacing={6} sx={{ position: "relative" }}>
            {/* Desktop Connector Line */}
            {!isMobile && (
              <Box sx={{ 
                position: "absolute", 
                top: "120px", 
                left: "10%", 
                right: "10%", 
                height: "2px", 
                background: "dashed 2px #e2e8f0",
                borderTop: "2px dashed #e2e8f0",
                zIndex: 0
              }} />
            )}

            {clientSteps.map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box 
                  sx={{ 
                    textAlign: "center", 
                    position: "relative", 
                    zIndex: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)"
                    }
                  }}
                >
                  <Box sx={{ 
                    width: "80px", 
                    height: "80px", 
                    borderRadius: "24px", 
                    bgcolor: "#ffffff", 
                    border: "2px solid #f1f5f9",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    mx: "auto",
                    mb: 3,
                    color: "#228756",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.03)",
                    position: "relative"
                  }}>
                    {item.icon}
                    <Typography sx={{ 
                      position: "absolute", 
                      top: -10, 
                      right: -10, 
                      width: "30px", 
                      height: "30px", 
                      bgcolor: "#228756", 
                      color: "#fff", 
                      borderRadius: "50%", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 900
                    }}>
                      {item.step}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 2, fontSize: "1.8rem" }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ 
                    color: "#64748b", 
                    fontSize: "1.3rem", 
                    lineHeight: 1.6,
                    px: { md: 2 },
                    fontWeight: 500
                  }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Trust Footer */}
          <Box 
            sx={{ 
              mt: 8, 
              pt: 4, 
              borderTop: "1px solid #f1f5f9", 
              display: "flex", 
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 2, md: 6 }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ShieldCheck size={24} color="#228756" />
              <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "1.1rem" }}>
                100% Confidential
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <MessageCircle size={24} color="#228756" />
              <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "1.1rem" }}>
                Verified Experts Only
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <UserCheck size={24} color="#228756" />
              <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "1.1rem" }}>
                Empowered Expert Selection
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProcessSteps;

import React from "react";
import { Box, Typography, Container, Grid, Paper } from "@mui/material";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StarIcon from "@mui/icons-material/Star";

const missionStyles = `
.mission-card {
  height: 100%;
  padding: 40px;
  border-radius: 24px;
  transition: all 0.3s ease;
  border: 1px solid #edf2f7;
  background: #ffffff;
}

.mission-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(34, 135, 86, 0.08);
  border-color: #c6f6d5;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.mission-icon {
  background-color: #f0fdf4;
  color: #228756;
}

.vision-icon {
  background-color: #fffaf0;
  color: #ed8936;
}

.values-icon {
  background-color: #ebf8ff;
  color: #3182ce;
}

.section-tag {
  color: #228756;
  font-weight: 800;
  letter-spacing: 1.5px;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: block;
}

@media (max-width: 600px) {
  .mission-card {
    padding: 30px 20px;
  }
}
`;

export default function MissionVision() {
  return (
    <>
      <style>{missionStyles}</style>
      <Box sx={{ py: { xs: 8, md: 12 }, background: "#f9fffb" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Mission */}
            <Grid item xs={12} md={4}>
              <div className="mission-card">
                <div className="icon-wrapper mission-icon">
                  <AdsClickIcon sx={{ fontSize: 32 }} />
                </div>
                <span className="section-tag">Our Mission</span>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: "#1a202c", fontSize: "1.75rem" }}>
                  Empowering Minds
                </Typography>
                <Typography sx={{ color: "#718096", lineHeight: 1.7, fontSize: "15px" }}>
                  To bridge the gap in mental healthcare by providing a trusted, accessible, and inclusive platform 
                  where everyone can find professional support tailored to their unique needs.
                </Typography>
              </div>
            </Grid>

            {/* Vision */}
            <Grid item xs={12} md={4}>
              <div className="mission-card">
                <div className="icon-wrapper vision-icon">
                  <VisibilityIcon sx={{ fontSize: 32 }} />
                </div>
                <span className="section-tag">Our Vision</span>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: "#1a202c", fontSize: "1.75rem" }}>
                  A Stigma-Free India
                </Typography>
                <Typography sx={{ color: "#718096", lineHeight: 1.7, fontSize: "15px" }}>
                  To create a future where seeking mental health support is as normalized as physical care, 
                  fostering a society that prioritizes emotional well-being and resilience.
                </Typography>
              </div>
            </Grid>

            {/* Core Values */}
            <Grid item xs={12} md={4}>
              <div className="mission-card">
                <div className="icon-wrapper values-icon">
                  <StarIcon sx={{ fontSize: 32 }} />
                </div>
                <span className="section-tag">Our Values</span>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: "#1a202c", fontSize: "1.75rem" }}>
                  Empathy & Integrity
                </Typography>
                <Typography sx={{ color: "#718096", lineHeight: 1.7, fontSize: "15px" }}>
                  We operate with deep compassion, unwavering ethics, and a commitment to quality, 
                  ensuring every individual feels heard, respected, and safe.
                </Typography>
              </div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

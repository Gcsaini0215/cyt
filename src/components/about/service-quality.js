import React from "react";
import LazyImage from "../../utils/lazy-image";
import { Box, Typography, Container, Grid } from "@mui/material";
import { Link } from "react-router-dom";

const BulbImg = "/assets/img/001-bulbf434.png";
const HatImg = "/assets/img/002-hat387c.png";
const IdCard = "/assets/img/003-id-cardae63.png";
const PassImg = "/assets/img/004-pass56c5.png";

const qualityStyles = `
.quality-section {
  padding: 60px 0 100px 0;
  background-color: #ffffff;
}

.section-tag {
  color: #228756;
  font-weight: 800;
  letter-spacing: 1.5px;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: block;
  text-align: left;
}

.join-btn-new {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 28px;
  background: #228756;
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.join-btn-new:hover {
  background: #1a6d45;
  transform: translateY(-2px);
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(34, 135, 86, 0.15);
}

.join-btn-new .arrow-icon {
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.join-btn-new:hover .arrow-icon {
  transform: translateX(5px);
}

.quality-card {
  padding: 40px 30px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #edf2f7;
  height: 100%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quality-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(34, 135, 86, 0.08);
  border-color: #228756;
}

.quality-card .icon-box {
  width: 70px;
  height: 70px;
  background: #f0fdf4;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.quality-card .number-text {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 40px;
  font-weight: 900;
  color: #f0fdf4;
  line-height: 1;
  z-index: 0;
}

.quality-card .content {
  position: relative;
  z-index: 1;
}

.quality-card .card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 15px;
}

.quality-card .description {
  font-size: 15px;
  color: #718096;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .quality-section {
    padding: 30px 0 60px 0;
  }
  .quality-card {
    padding: 25px 20px;
  }
  .quality-card .card-title {
    font-size: 16px;
    margin-bottom: 8px;
  }
  .quality-card .description {
    font-size: 13px;
  }
  .quality-card .icon-box {
    width: 50px;
    height: 50px;
    margin-bottom: 15px;
  }
}
`;

const qualityData = [
  {
    title: "Holistic Wellness",
    desc: "We take a holistic approach to mental health, considering all aspects of your life and well-being.",
    icon: BulbImg,
    num: "01"
  },
  {
    title: "Easy to Access",
    desc: "Convenient access to therapy through our online platform, making it easier to get the help you need.",
    icon: HatImg,
    num: "02"
  },
  {
    title: "Personalized Care",
    desc: "We tailor our services to meet your individual needs, ensuring you receive care that addresses your concerns.",
    icon: IdCard,
    num: "03"
  },
  {
    title: "Qualified Experts",
    desc: "Diverse range of therapists with expertise in various modalities and specialties to fit your needs.",
    icon: PassImg,
    num: "04"
  }
];

export default function ServiceQuality() {
  return (
    <>
      <style>{qualityStyles}</style>
      <section className="quality-section">
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ textAlign: "left", width: "100%", maxWidth: { md: "800px" } }}>
              <span className="section-tag">Our Commitment</span>
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#1a202c", mb: 0, fontSize: { xs: "1.75rem", md: "2.5rem" }, width: "100%" }}>
                Making Your Mental Health Our <span style={{ color: "#228756" }}>Top Priority</span>
              </Typography>
            </Box>
            <Box>
              <Link to="/therapist-registration" className="join-btn-new">
                <span>Join Our Community</span>
                <div className="arrow-icon">
                  <i className="feather-arrow-right"></i>
                </div>
              </Link>
            </Box>
          </Box>

          <Grid container spacing={{ xs: 2, md: 4 }}>
            {qualityData.map((item, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <div className="quality-card">
                  <span className="number-text">{item.num}</span>
                  <div className="icon-box">
                    <LazyImage alt={item.title} dim={"50"} src={item.icon} />
                  </div>
                  <div className="content">
                    <Typography className="card-title">{item.title}</Typography>
                    <Typography className="description">{item.desc}</Typography>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>
    </>
  );
}

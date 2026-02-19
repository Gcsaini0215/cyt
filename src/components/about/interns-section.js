import React from "react";
import { Box, Typography, Container, Avatar } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, FreeMode } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/free-mode";

const internStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.intern-section-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.intern-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  margin-bottom: 50px;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.intern-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #228756, #48bb78);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.intern-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #228756;
}

.intern-card:hover::before {
  opacity: 1;
}

.intern-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.intern-avatar {
  width: 64px;
  height: 64px;
  border: 2px solid #f0fdf4;
}

.intern-info {
  flex: 1;
}

.intern-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f0fdf4;
  color: #228756;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.intern-name {
  font-weight: 700;
  color: #1a202c;
  font-size: 1.1rem;
  line-height: 1.2;
}

.intern-university {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  font-size: 13px;
  margin-top: 4px;
}

.intern-quote-box {
  position: relative;
  padding-top: 10px;
}

.intern-quote {
  font-size: 15px;
  color: #4a5568;
  line-height: 1.6;
  font-style: italic;
  font-weight: 400;
}

.quote-icon {
  color: #228756;
  opacity: 0.15;
  font-size: 40px;
  position: absolute;
  top: -10px;
  left: -10px;
}

/* Custom Swiper Pagination */
.swiper-pagination-bullet {
  background: #228756 !important;
  opacity: 0.2;
  width: 10px;
  height: 10px;
  transition: all 0.3s ease;
}
.swiper-pagination-bullet-active {
  opacity: 1;
  width: 24px;
  border-radius: 5px;
}

.soothing-bg {
  background-color: #ffffff;
  background-image: radial-gradient(#22875605 1px, transparent 1px);
  background-size: 20px 20px;
}

@media (max-width: 600px) {
  .intern-card {
    padding: 24px;
  }
}
`;

const interns = [
  {
    name: "Priya Ranga",
    role: "Diploma",
    university: "Mental Health Awareness",
    image: "/assets/img/priyaa.png",
    quote: "Start the journey to mental health awareness with a simple step: nurture your mind with kindness."
  },
  {
    name: "Priya Mehta",
    role: "B.Sc. Psychology Student",
    university: "Academic Excellence",
    image: "/assets/img/Priya.png",
    quote: "Start the journey to mental health awareness with a simple step: nurture your mind with kindness."
  },
  {
    name: "Shivangi Chandola",
    role: "Graduate Psychology",
    university: "Professional Support",
    image: "/assets/img/shivangi.png",
    quote: "Mental health awareness starts with you. Be kind to your mind."
  },
  {
    name: "Aparaajita Bhawaani",
    role: "Graduate Psychology",
    university: "Clinical Foundations",
    image: "/assets/img/aparajitab.png",
    quote: "Don't suffer in silence. Reach out and get the support you deserve."
  },
  {
    name: "Shivangi Rana",
    role: "Graduation Student",
    university: "Community Engagement",
    image: "/assets/img/shivangirana.png",
    quote: "Your story is important. Share it and inspire others to seek help."
  },
  {
    name: "Avika",
    role: "Graduation Student",
    university: "Advocacy",
    image: "/assets/img/avika.png",
    quote: "Every step towards mental wellness is a step towards a brighter future."
  }
];

export default function InternsSection() {
  return (
    <>
      <style>{internStyles}</style>
      <Box className="soothing-bg" sx={{ py: { xs: 8, md: 10 }, overflow: "hidden" }}>
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              textAlign: "center", 
              mb: { xs: 6, md: 8 }, 
              maxWidth: "700px", 
              mx: "auto" 
            }} 
            className="intern-section-fade-in"
          >
            <Typography 
              variant="overline" 
              sx={{ 
                color: "#228756", 
                fontWeight: 800, 
                letterSpacing: 2, 
                fontSize: "13px",
                display: "block",
                mb: 1
              }}
            >
              Our Community
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 900, 
                color: "#1a202c", 
                fontSize: { xs: "2.25rem", md: "3rem" },
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Meet Our <span style={{ color: "#228756" }}>Rising Stars</span>
            </Typography>
            <Typography 
              sx={{ 
                color: "#718096", 
                fontSize: "17px", 
                lineHeight: 1.7
              }}
            >
              The dedicated individuals shaping the future of mental health and wellness. 
              Discover the passionate minds behind our growing community.
            </Typography>
          </Box>

          <Box className="intern-section-fade-in" sx={{ animationDelay: "0.2s" }}>
            <Swiper
              modules={[Pagination, Autoplay, FreeMode]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              freeMode={true}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
              }}
              style={{ paddingBottom: "50px" }}
            >
              {interns.map((intern, index) => (
                <SwiperSlide key={index} style={{ height: "auto" }}>
                  <InternCard intern={intern} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Container>
      </Box>
    </>
  );
}

function InternCard({ intern }) {
  return (
    <div className="intern-card">
      <div className="intern-header">
        <Avatar src={intern.image} alt={intern.name} className="intern-avatar" />
        <div className="intern-info">
          <div className="intern-badge">
            <WorkOutlineIcon sx={{ fontSize: 12 }} />
            {intern.role}
          </div>
          <Typography className="intern-name">{intern.name}</Typography>
          <div className="intern-university">
            <SchoolIcon sx={{ fontSize: 14, color: "#228756" }} />
            {intern.university}
          </div>
        </div>
      </div>
      
      <div className="intern-quote-box">
        <FormatQuoteIcon className="quote-icon" />
        <Typography className="intern-quote">
          {intern.quote}
        </Typography>
      </div>
    </div>
  );
}

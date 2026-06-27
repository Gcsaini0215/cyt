import { Box, Container } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";

const styles = `
.contact-banner {
  position: relative;
  background-image: url('https://i.postimg.cc/5yf8k8ts/bg-image-12dabd.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: scroll;
  padding: 60px 0 50px 0;
  overflow: hidden;
}
.contact-banner::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1;
}
.contact-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.15);
  color: #fff;
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
  border: 1px solid rgba(255,255,255,0.3);
  backdrop-filter: blur(4px);
}
.contact-title {
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.contact-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  max-width: 560px;
  margin: 0 auto 36px;
  line-height: 1.7;
}
.contact-cards-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.contact-info-card {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}
.contact-info-card:hover {
  background: rgba(255,255,255,0.13);
  border-color: #4ade80;
  transform: translateY(-4px);
}
.contact-card-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #16a34a, #22bb33);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  box-shadow: 0 6px 16px rgba(34,187,51,0.3);
}
.contact-card-title {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.contact-card-value {
  font-size: 13px;
  color: rgba(255,255,255,0.9);
  margin: 0 0 4px;
  line-height: 1.5;
  word-break: break-all;
}
.contact-card-sub {
  font-size: 11px;
  color: #4ade80;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}
@media (max-width: 768px) {
  .contact-banner { padding: 28px 0 24px 0; }
  .contact-badge { font-size: 11px; padding: 6px 14px; margin-bottom: 14px; }
  .contact-title { font-size: 20px; }
  .contact-subtitle { font-size: 12px; margin-bottom: 24px; padding: 0 8px; }
  .contact-cards-row { grid-template-columns: 1fr; gap: 10px; }
  .contact-info-card { padding: 16px 14px; text-align: left; display: flex; align-items: center; gap: 14px; }
  .contact-card-icon { margin: 0; flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px; }
  .contact-card-body { text-align: left; }
}
`;

export default function Header() {
  return (
    <>
      <style>{styles}</style>
      <section className="contact-banner">
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <div className="contact-badge">
              <HeadsetMicIcon sx={{ fontSize: 16 }} />
              <span>Get In Touch</span>
            </div>
            <h1 className="contact-title">
              We're Here to <span style={{ color: '#4ade80' }}>Listen & Support</span>
            </h1>
            <p className="contact-subtitle">
              Have questions about finding the right therapist? Our team is ready to help you take the first step towards better mental health.
            </p>

            <div className="contact-cards-row">
              <a href="tel:+918077757951" style={{ textDecoration: 'none' }}>
                <div className="contact-info-card">
                  <div className="contact-card-icon">
                    <PhoneIcon sx={{ fontSize: 22, color: '#fff' }} />
                  </div>
                  <div className="contact-card-body">
                    <p className="contact-card-title">Call Support</p>
                    <p className="contact-card-value">+91-807-775-7951</p>
                    <p className="contact-card-sub">Mon – Sat · 10AM – 7PM</p>
                  </div>
                </div>
              </a>

              <a href="mailto:chooseyourtherapist@gmail.com" style={{ textDecoration: 'none' }}>
                <div className="contact-info-card">
                  <div className="contact-card-icon">
                    <EmailIcon sx={{ fontSize: 22, color: '#fff' }} />
                  </div>
                  <div className="contact-card-body">
                    <p className="contact-card-title">Email Us</p>
                    <p className="contact-card-value">chooseyourtherapist@gmail.com</p>
                    <p className="contact-card-sub">24/7 Response Support</p>
                  </div>
                </div>
              </a>

              <a href="https://www.google.com/maps/place/Choose+Your+Therapist+LLP" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div className="contact-info-card">
                  <div className="contact-card-icon">
                    <LocationOnIcon sx={{ fontSize: 22, color: '#fff' }} />
                  </div>
                  <div className="contact-card-body">
                    <p className="contact-card-title">Our Office</p>
                    <p className="contact-card-value">D-137, Sector 51, Noida, UP</p>
                    <p className="contact-card-sub">Visit by Appointment</p>
                  </div>
                </div>
              </a>
            </div>
          </Box>
        </Container>
      </section>
    </>
  );
}

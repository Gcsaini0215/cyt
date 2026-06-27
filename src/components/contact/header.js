import { Box, Container } from "@mui/material";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import { TypeAnimation } from "react-type-animation";

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
  background: rgba(0,0,0,0.62);
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
  font-size: 30px;
  font-weight: 900;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.contact-animated {
  color: #4ade80;
  display: inline-block;
  min-width: 200px;
  text-align: left;
}
.contact-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}
@media (max-width: 768px) {
  .contact-banner { padding: 24px 0 20px 0; }
  .contact-badge { display: none; }
  .contact-title { font-size: 18px; line-height: 1.4; }
  .contact-subtitle { font-size: 12px; padding: 0 12px; }
  .contact-animated { min-width: 100%; display: block; text-align: center; }
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
              We're Here to{" "}
              <span className="contact-animated">
                <TypeAnimation
                  sequence={["Listen & Support", 2000, "Answer Your Questions", 2000, "Help You Heal", 2000]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
            </h1>
            <p className="contact-subtitle">
              Have questions about finding the right therapist? Reach out to our team — we're happy to help you take the first step.
            </p>
          </Box>
        </Container>
      </section>
    </>
  );
}

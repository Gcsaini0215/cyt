import { Box, Container } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { TypeAnimation } from "react-type-animation";

/**
 * About-Us hero — same full-bleed photo-banner recipe as login/register/
 * contact-us, with its own image (a calm, open road rather than the
 * lifestyle photo reused everywhere else) and copy.
 * Keeps the `ab-section` class so navbar.js runs it up behind the floating
 * desktop navbar, same as every other hero on the site.
 */
const styles = `
.ab-section {
  position: relative;
  background-image: url('/images/bg5.jpg');
  background-size: cover;
  background-position: center 65%;
  background-attachment: scroll;
  padding: 60px 0 50px 0;
  overflow: hidden;
}
.ab-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10, 20, 12, 0.66);
  z-index: 1;
}
.ab-badge {
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
.ab-title {
  font-size: 30px;
  font-weight: 900;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.ab-animated {
  color: #4ade80;
  display: inline-block;
  min-width: 260px;
  text-align: left;
}
.ab-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}
@media (max-width: 768px) {
  .ab-section { padding: 28px 0 24px 0; }
  .ab-badge { display: none; }
  .ab-title { font-size: 22px; line-height: 1.3; margin-bottom: 8px; }
  .ab-subtitle { font-size: 13px; padding: 0 16px; }
  .ab-animated { min-width: 100%; display: block; text-align: center; }
}
`;

export default function AboutUsBanner() {
  return (
    <>
      {/* dangerouslySetInnerHTML, not a string child: React escapes quotes
          in <style> text children but browsers don't un-escape them, so a
          string child hydration-mismatches and silently breaks any rule
          with a quote in it (the url('...') here included). */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <section className="ab-section">
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center" }}>
            <div className="ab-badge">
              <FavoriteIcon sx={{ fontSize: 16 }} />
              <span>Our Story &amp; Vision</span>
            </div>
            <h1 className="ab-title">
              Making Mental Health{" "}
              <span className="ab-animated">
                <TypeAnimation
                  sequence={["Accessible", 2000, "Judgment-Free", 2000, "Human Again", 2000]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
            </h1>
            <p className="ab-subtitle">
              Founded in 2020, Choose Your Therapist connects individuals across India with
              verified psychologists — because everyone deserves to be heard.
            </p>
          </Box>
        </Container>
      </section>
    </>
  );
}

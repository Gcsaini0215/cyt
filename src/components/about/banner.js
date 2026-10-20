import { Box, Container } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

/**
 * About-Us hero — the soothing light banner shared with /blogs, login,
 * register and therapist-registration (sage → cream → lavender, soft shapes).
 * Keeps the `ab-section` class so navbar.js runs it up behind the floating
 * desktop navbar, same as every other hero on the site.
 */
const styles = `
.ab-section {
  position: relative;
  background: linear-gradient(135deg, #c3e3cd 0%, #f0dfb4 52%, #cfe6d3 100%);
  padding: 60px 0 50px 0;
  overflow: hidden;
}
/* gentle shapes, same as the /blogs banner */
.ab-section::before, .ab-section::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}
.ab-section::before { width: 420px; height: 420px; right: -100px; top: -150px; background: radial-gradient(circle, rgba(104,182,136,.7), rgba(104,182,136,0)); }
.ab-section::after { width: 300px; height: 300px; left: -90px; bottom: -140px; background: radial-gradient(circle, rgba(232,190,110,.55), rgba(232,190,110,0)); }
.ab-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.75);
  color: #166534;
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
  border: 1px solid #e3cc96;
  box-shadow: 0 6px 16px -10px rgba(20,83,45,.35);
}
.ab-title {
  font-size: 34px;
  font-weight: 900;
  color: #173c2a;
  line-height: 1.25;
  margin-bottom: 12px;
}
.ab-accent { color: #a86e0e; }
@media (max-width: 767px) { .ab-section { background: linear-gradient(135deg, #e3f2e8 0%, #f8f1de 52%, #e6f3ea 100%); } .ab-section::before, .ab-section::after { opacity: .4; } }
.ab-subtitle {
  font-size: 16px;
  color: #475569;
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.6;
}
@media (max-width: 768px) {
  .ab-section { padding: 28px 0 24px 0; }
  .ab-badge { display: none; }
  .ab-title { font-size: 24px; line-height: 1.3; margin-bottom: 8px; }
  .ab-subtitle { font-size: 14px; padding: 0 16px; }
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
              Find the <span className="ab-accent">Right Therapist</span> in India — Online or In-Person in Noida
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

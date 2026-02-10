import React from "react";
import { Box, Typography, Container, useMediaQuery } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { TypeAnimation } from "react-type-animation";

const styles = `
.plans-banner {
  position: relative;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  padding: 120px 0 80px 0;
  overflow: hidden;
  margin-top: 0px; /* Removed margin to fix gap */
}

.plans-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 30%, rgba(34, 135, 86, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(34, 135, 86, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.plans-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(34, 135, 86, 0.1);
  color: #228756;
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
  border: 1px solid rgba(34, 135, 86, 0.2);
}

.plans-title {
  font-size: 48px;
  font-weight: 900;
  color: #1a1a1a;
  line-height: 1.2;
  margin-bottom: 20px;
}

.plans-animated-text {
  color: #228756;
  display: inline-block;
  min-width: 280px;
  text-align: left;
}

.plans-subtitle {
  font-size: 18px;
  color: #64748b;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.floating-icon {
  position: absolute;
  color: rgba(34, 135, 86, 0.1);
  z-index: 0;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.float-1 { top: 20%; left: 10%; animation: float 6s ease-in-out infinite; }
.float-2 { bottom: 20%; right: 10%; animation: float 8s ease-in-out infinite; }

@media (max-width: 768px) {
  .plans-banner { padding: 100px 0 60px 0; }
  .plans-title { font-size: 32px; }
  .plans-subtitle { font-size: 16px; }
  .plans-animated-text { min-width: 100%; text-align: center; }
}
`;

export default function PlansHeader() {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <>
      <style>{styles}</style>
      <section className="plans-banner">
        <AutoAwesomeIcon className="floating-icon float-1" sx={{ fontSize: 100 }} />
        <SupportAgentIcon className="floating-icon float-2" sx={{ fontSize: 120 }} />
        
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="plans-badge">
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              <span>Investment in Yourself</span>
            </div>
            
            <h1 className="plans-title">
              Your Journey to{" "}
              <span className="plans-animated-text">
                <TypeAnimation
                  sequence={[
                    "Mental Wellness",
                    2000,
                    "Inner Peace",
                    2000,
                    "Self Growth",
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
              <br /> Starts with a Single Step
            </h1>
            
            <p className="plans-subtitle">
              Our therapy packages ensure continuity in your healing journey, helping you maintain
              <br /> steady progress toward your emotional well-being goals.
            </p>

            {/* Toggle Switch */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  borderRadius: '50px',
                  backgroundColor: 'white',
                  padding: '6px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  style={{
                    padding: isMobile ? '10px 24px' : '12px 40px',
                    borderRadius: '50px',
                    border: 'none',
                    backgroundColor: '#228756',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: isMobile ? '14px' : '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(34, 135, 86, 0.2)',
                  }}
                >
                  Individual
                </button>
                <button
                  disabled
                  style={{
                    padding: isMobile ? '10px 24px' : '12px 40px',
                    borderRadius: '50px',
                    border: 'none',
                    backgroundColor: '#f1f5f9',
                    color: '#94a3b8',
                    fontWeight: 800,
                    fontSize: isMobile ? '14px' : '16px',
                    cursor: 'not-allowed',
                    marginLeft: '4px',
                  }}
                >
                  Couple (Soon)
                </button>
              </Box>
            </Box>
          </Box>
        </Container>
      </section>
    </>
  );
}

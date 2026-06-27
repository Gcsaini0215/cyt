import React from "react";

const styles = `
.sa-banner {
  position: relative;
  background-image: url('https://i.postimg.cc/5yf8k8ts/bg-image-12dabd.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: scroll;
  padding: 60px 0 50px 0;
  overflow: hidden;
}
.sa-banner::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.62);
  z-index: 1;
}
.sa-badge {
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
.sa-title {
  font-size: 30px;
  font-weight: 900;
  color: #fff;
  line-height: 1.3;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.sa-title span { color: #4ade80; }
.sa-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}
@media (max-width: 768px) {
  .sa-banner { height: 4px; padding: 0; background-image: none; background: linear-gradient(90deg, #16a34a, #4ade80); }
  .sa-banner::before { display: none; }
  .sa-badge, .sa-title, .sa-subtitle { display: none; }
}
`;

export default function SelfAssessmentBanner() {
  return (
    <>
      <style>{styles}</style>
      <section className="sa-banner">
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div className="sa-badge">
            <i className="feather-clipboard" style={{ fontSize: 15 }}></i>
            <span>Know Yourself Better</span>
          </div>
          <h1 className="sa-title">
            Mental Health <span>Self Assessment</span>
          </h1>
          <p className="sa-subtitle">
            Take our expert-designed assessments to understand your mental well-being. Get personalized insights and know when to seek professional support.
          </p>
        </div>
      </section>
    </>
  );
}

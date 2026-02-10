import React from "react";
import { TypeAnimation } from "react-type-animation";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

const styles = `
.about-banner {
  position: relative;
  background: linear-gradient(135deg, #e6f4ea, #d1f0d1);
  color: #065f28;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 90vh;
  padding: 50px 20px;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

.about-overlay {
  position: absolute;
  inset: 0;
  background: rgba(6, 95, 40, 0.05);
  z-index: 0;
  border-radius: 20px;
}

.about-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  background: #ffffff;
  padding: 50px 30px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

/* Badge */
.about-badge {
  display: inline-flex;
  align-items: center;
  background: #22c55e;
  color: #ffffff;
  padding: 10px 25px;
  border-radius: 50px;
  font-weight: 600;
  margin-bottom: 25px;
  font-size: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

/* Title */
.about-title {
  font-size: 50px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 25px;
  color: #065f28;
}

@media (max-width: 768px) {
  .about-title {
    font-size: 32px;
  }
}

/* Type animation wrapper to fix jump */
.about-type-wrapper {
  display: inline-block;
  min-width: 180px; /* fixed width prevents jump */
  text-align: left;
  vertical-align: middle;
}

.about-type {
  background: linear-gradient(to right, #22c55e, #16a34a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  display: inline-block;
}

/* Subtitle */
.about-subtitle {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 35px;
  color: #555;
  max-width: 750px;
  margin-left: auto;
  margin-right: auto;
}

/* Buttons */
.about-buttons {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  padding: 14px 35px;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 16px;
}

.btn-primary {
  background: linear-gradient(to right, #22c55e, #16a34a);
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(34,197,94,0.3);
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(34,197,94,0.4);
}

.btn-outline {
  background: #ffffff;
  border: 2px solid #22c55e;
  color: #22c55e;
}

.btn-outline:hover {
  background: #22c55e;
  color: #ffffff;
}

/* Decorative wave at bottom */
.about-wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 80px;
  background: url('https://svgshare.com/i/15C2.svg') repeat-x;
  background-size: cover;
  z-index: 1;
}
`;

export default function AboutUsBanner() {
  return (
    <>
      <style>{styles}</style>

      <section className="about-banner">
        <div className="about-overlay" />
        <div className="about-content">
          <div className="about-badge">
            <PersonSearchIcon style={{ fontSize: 24, marginRight: "8px" }} />
            <span>About CYT</span>
          </div>

          <h1 className="about-title">
            Because Your Mental Health Matters, <br />
            Therapists should be{" "}
            <span className="about-type-wrapper">
              <TypeAnimation
                sequence={[
                  "Verified",
                  2000,
                  "Accessible",
                  2000,
                  "Specialized",
                  2000,
                ]}
                wrapper="span"
                speed={40}
                deletionSpeed={30}
                repeat={Infinity}
                className="about-type"
              />
            </span>
          </h1>

          <p className="about-subtitle">
            At CYT, therapy is safe, easy to access, and delivered by trusted
            professionals. Join India’s leading network of verified therapists
            and experience premium healthcare with a hospital-grade, professional feel.
          </p>

          <div className="about-buttons">
            <a href="/login" className="btn btn-primary">
              Log in to Start
            </a>
            <a href="/contact" className="btn btn-outline">
              Contact Us
            </a>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="about-wave"></div>
      </section>
    </>
  );
}

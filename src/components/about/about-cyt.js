import Link from "next/link";

export default function AboutCyt() {
  return (
    <>
      <style>{`
        .rbt-about-area {
          padding: 100px 0 80px 0;
          background: #ffffff;
          position: relative;
        }

        .rbt-about-area .title {
          font-size: 42px;
          font-weight: 900;
          color: #1a202c;
          line-height: 1.2;
          margin-bottom: 24px;
        }

        .rbt-about-area p {
          font-size: 17px;
          line-height: 1.8;
          color: #4a5568;
          margin-bottom: 25px;
        }

        .highlight-text {
          font-weight: 700;
          color: #228756;
        }

        .journey-wrapper {
          padding: 20px 40px 60px;
          margin-top: -20px;
          position: relative;
        }

        .journey-line {
          position: absolute;
          top: 130px;
          left: 8%;
          right: 8%;
          height: 2px;
          background: #e2e8f0;
          z-index: 1;
        }

        .journey-line-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: #228756;
          width: 66%;
          transition: width 1s ease;
        }

        .journey-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          position: relative;
          z-index: 2;
        }

        .milestone-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 25px 15px;
          text-align: center;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .milestone-year {
          display: inline-block;
          padding: 4px 12px;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 15px;
          transition: all 0.3s ease;
        }

        .milestone-card.completed .milestone-year {
          background: #dcfce7;
          color: #166534;
        }

        .milestone-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border-color: #228756;
        }

        .milestone-icon {
          width: 70px;
          height: 70px;
          background: #ffffff;
          color: #94a3b8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 28px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
          box-shadow: 0 0 0 5px #ffffff;
        }

        .milestone-card.completed .milestone-icon {
          border-color: #228756;
          color: #228756;
        }

        .milestone-card.active {
          border: 2px solid #228756;
          background: #ffffff;
        }

        .milestone-card.active .milestone-icon {
          background: #228756;
          color: white;
          border-color: #228756;
        }

        .milestone-card.global .milestone-icon {
          border-color: #3b82f6;
          color: #3b82f6;
          animation: pulse-blue 2s infinite;
        }

        @keyframes pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        .milestone-name {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .milestone-desc {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          line-height: 1.5;
        }

        .service-info-card {
          background: #228756;
          border-radius: 24px;
          padding: 40px;
          height: 100%;
          color: white;
          box-shadow: 0 20px 40px rgba(34, 135, 86, 0.2);
        }

        .service-info-card h5 {
          color: white;
        }

        .service-info-card p {
          color: rgba(255, 255, 255, 0.9);
        }

        .service-info-card b {
          color: white;
          text-decoration: underline;
        }

        .service-type-item {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 30px;
        }

        .service-icon {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #228756;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .process-section {
          padding: 60px 40px;
          background: #f0fdf4;
          border-radius: 40px;
          margin: 50px 20px 0;
        }

        .process-step {
          background: #ffffff;
          border-radius: 20px;
          padding: 30px 20px;
          text-align: center;
          position: relative;
          box-shadow: 0 10px 30px rgba(34, 135, 86, 0.05);
          height: 100%;
          transition: transform 0.3s ease;
        }

        .process-step:hover {
          transform: translateY(-5px);
        }

        .process-icon-wrapper {
          width: 60px;
          height: 60px;
          background: #ffffff;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 24px;
          color: #228756;
          border: 1px solid #f0fdf4;
          box-shadow: 0 8px 15px rgba(34, 135, 86, 0.08);
          position: relative;
          z-index: 2;
        }

        .process-step-number {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 30px;
          height: 30px;
          background: #228756;
          color: white;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #f8fafc;
        }

        .process-step h4 {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 12px;
          color: #1e293b;
        }

        .process-step p {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
        }

        .process-connector {
          position: absolute;
          top: 60px;
          right: -15%;
          width: 30%;
          height: 2px;
          border-top: 2px dashed #dcfce7;
          z-index: 1;
        }

        @media (max-width: 767px) {
          .process-connector { display: none; }
          .process-step { margin-bottom: 40px; }
        }

        .journey-content-row {
          padding: 0 20px;
        }

        @media (max-width: 991px) {
          .journey-line {
            display: none;
          }
          .journey-grid {
            grid-template-columns: 1fr;
            max-width: 450px;
            margin: 0 auto;
          }
          .milestone-card {
            padding: 40px 30px;
          }
        }
      `}</style>

      <div className="rbt-about-area">
        <div className="container">
          <div className="row g-5 align-items-center journey-content-row">
            <div className="col-lg-12 text-center mb-4">
              <h2 className="title">
                Our Journey in <span style={{ color: "#228756" }}>Mental Health Excellence</span>
              </h2>
              <p style={{ maxWidth: "800px", margin: "0 auto" }}>
                Leading the way in professional mental health support, CYT provides accessible therapy through a global network of verified psychologists.
              </p>
            </div>

            <div className="col-lg-12">
              <div className="journey-wrapper">
                <div className="journey-line">
                  <div className="journey-line-progress"></div>
                </div>
                <div className="journey-grid">
                  <div className="milestone-card completed">
                    <div className="milestone-year">2020</div>
                    <div className="milestone-icon"><i className="feather-home"></i></div>
                    <div className="milestone-name">Haridwar</div>
                    <div className="milestone-desc">Official Incorporation</div>
                  </div>

                  <div className="milestone-card completed">
                    <div className="milestone-year">2021</div>
                    <div className="milestone-icon"><i className="feather-trending-up"></i></div>
                    <div className="milestone-name">Dehradun</div>
                    <div className="milestone-desc">Strategic Implementation</div>
                  </div>

                  <div className="milestone-card active">
                    <div className="milestone-year">Active</div>
                    <div className="milestone-icon"><i className="feather-map-pin"></i></div>
                    <div className="milestone-name">Noida & Delhi</div>
                    <div className="milestone-desc">In-Person Therapy Hubs</div>
                  </div>

                  <div className="milestone-card global">
                    <div className="milestone-year">Global</div>
                    <div className="milestone-icon"><i className="feather-globe"></i></div>
                    <div className="milestone-name">Worldwide</div>
                    <div className="milestone-desc">Online Support System</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 mt-5">
              <div className="content">
                <span className="section-tag" style={{ textAlign: "left" }}>Our Legacy</span>
                <h3 style={{ fontSize: "36px", fontWeight: "600", color: "#1e293b", marginBottom: "25px", lineHeight: "1.2" }}>
                  Our Journey <span style={{ color: "#228756" }}>So Far</span>
                </h3>
                <p style={{ fontSize: "18px", color: "#475569", marginBottom: "20px" }}>
                  Choose Your Therapist LLP started in <span className="highlight-text">2020</span> during the pandemic as a response to the growing need for mental health support.
                </p>
                <p style={{ fontSize: "16px", color: "#64748b" }}>
                  By <span className="highlight-text">2021</span>, we evolved into a registered entity under MCA and MSME, 
                  committed to building a transparent platform where professional therapy is accessible to everyone, everywhere.
                </p>
                <div className="mt-4" style={{ display: "flex", gap: "30px" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#228756", fontWeight: "900", fontSize: "28px" }}>10k+</h4>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>Sessions</p>
                  </div>
                  <div style={{ width: "1px", background: "#e2e8f0" }}></div>
                  <div>
                    <h4 style={{ margin: 0, color: "#228756", fontWeight: "900", fontSize: "28px" }}>50+</h4>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>Experts</p>
                  </div>
                  <div style={{ width: "1px", background: "#e2e8f0" }}></div>
                  <div>
                    <h4 style={{ margin: 0, color: "#228756", fontWeight: "900", fontSize: "28px" }}>4.9/5</h4>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>Rating</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 mt-5">
              <div className="service-info-card">
                <div className="service-type-item">
                  <div className="service-icon"><i className="feather-users"></i></div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 800 }}>In-Person Therapy</h5>
                    <p style={{ margin: 0, fontSize: "14px" }}>Dedicated clinical spaces in <b>Noida</b> and <b>Delhi NCR</b> for face-to-face sessions.</p>
                  </div>
                </div>
                <div className="service-type-item">
                  <div className="service-icon"><i className="feather-video"></i></div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 800 }}>Online Worldwide</h5>
                    <p style={{ margin: 0, fontSize: "14px" }}>Seamless video/audio consultations available <b>Globaly</b> for complete flexibility.</p>
                  </div>
                </div>
                <div className="service-type-item" style={{ marginBottom: 0 }}>
                  <div className="service-icon"><i className="feather-shield"></i></div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 800 }}>Trusted Experts</h5>
                    <p style={{ margin: 0, fontSize: "14px" }}>Network of <b>Verified Psychologists</b> committed to your mental health journey.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="process-section">
            <div className="container">
              <div className="row text-center mb-5">
                <div className="col-lg-12">
                  <h3 style={{ fontSize: "32px", fontWeight: "900", color: "#1e293b" }}>How We Empower You</h3>
                  <p style={{ maxWidth: "650px", margin: "0 auto" }}>
                    Our simplified 3-step approach ensures you find the right therapist and start your journey with ease.
                  </p>
                </div>
              </div>
              <div className="row g-4">
                <div className="col-lg-4">
                  <div className="process-step">
                    <div className="process-icon-wrapper">
                      <i className="feather-search"></i>
                      <div className="process-step-number">1</div>
                    </div>
                    <div className="process-connector"></div>
                    <h4>Discovery</h4>
                    <p>Explore our network of 50+ verified psychologists based on your specific emotional and mental health needs.</p>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="process-step">
                    <div className="process-icon-wrapper">
                      <i className="feather-calendar"></i>
                      <div className="process-step-number">2</div>
                    </div>
                    <div className="process-connector"></div>
                    <h4>Selection</h4>
                    <p>Schedule your session at a time that works for you, choosing between in-person or global online consultations.</p>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="process-step">
                    <div className="process-icon-wrapper">
                      <i className="feather-heart"></i>
                      <div className="process-step-number">3</div>
                    </div>
                    <h4>Healing</h4>
                    <p>Begin your sessions in a safe, confidential environment and work towards a more resilient and mindful version of yourself.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

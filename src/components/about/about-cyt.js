import Link from "next/link";

export default function AboutCyt() {
  return (
    <>
      <style>{`
        .rbt-about-area {
          padding: 100px 0 60px 0;
          background: #ffffff;
          position: relative;
        }

        .rbt-about-area .title {
          font-size: 44px;
          font-weight: 900;
          color: #1a202c;
          line-height: 1.2;
          margin-bottom: 0;
          text-align: left;
        }

        .rbt-about-area p {
          font-size: 17px;
          line-height: 1.8;
          color: #4a5568;
          margin-bottom: 25px;
          text-align: left;
        }

        .rbt-about-area .highlight-text {
          font-weight: 700;
          color: #228756;
        }

        .join-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 36px;
          background: #228756;
          color: #ffffff;
          font-weight: 700;
          font-size: 16px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          margin-top: 15px;
        }

        .join-btn:hover {
          background: #1a6d45;
          transform: translateY(-2px);
          color: #ffffff;
          box-shadow: 0 10px 20px rgba(34, 135, 86, 0.15);
        }

        .join-btn .arrow-icon {
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
        }

        .join-btn:hover .arrow-icon {
          transform: translateX(5px);
        }

        .journey-container {
          margin-top: 40px;
          padding: 20px 0;
          position: relative;
        }

        .journey-line {
          display: flex;
          align-items: flex-start;
          gap: 0;
          position: relative;
          padding-bottom: 20px;
        }

        .journey-line::before {
          content: '';
          position: absolute;
          top: 15px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(to right, #228756 70%, #cbd5e0 70%);
          z-index: 1;
        }

        .location-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .step-dot {
          width: 32px;
          height: 32px;
          background: #ffffff;
          border: 2px solid #228756;
          border-radius: 50%;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .location-step.active .step-dot {
          background: #228756;
          box-shadow: 0 0 0 4px rgba(34, 135, 86, 0.2);
          animation: pulse 2s infinite;
        }

        .location-step.past .step-dot {
          background: #228756;
        }

        .location-step.past .step-dot i {
          color: white;
          font-size: 14px;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 135, 86, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(34, 135, 86, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 135, 86, 0); }
        }

        .location-name {
          font-size: 15px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 4px;
        }

        .impact-text {
          font-size: 11px;
          color: #718096;
          font-weight: 500;
          line-height: 1.2;
        }

        .serving-tag {
          font-size: 9px;
          background: #228756;
          color: white;
          padding: 1px 6px;
          border-radius: 4px;
          margin-top: 5px;
          text-transform: uppercase;
          font-weight: 800;
        }

        .continuing-step {
          flex: 0.5;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }

        .dot-loader {
          display: flex;
          gap: 4px;
          margin-top: 14px;
        }

        .dot-loader span {
          width: 4px;
          height: 4px;
          background: #cbd5e0;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .dot-loader span:nth-child(1) { animation-delay: -0.32s; }
        .dot-loader span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }

        @media (max-width: 991px) {
          .rbt-about-area .title {
            font-size: 34px;
            margin-bottom: 20px;
          }
        }

        @media (max-width: 767px) {
          .rbt-about-area {
            padding: 60px 0 20px 0;
          }
          .rbt-about-area .title {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .rbt-about-area p {
            font-size: 16px;
            margin-bottom: 15px;
          }
          .journey-container {
            margin-top: 20px;
            margin-bottom: 10px;
          }
        }
      `}</style>

      <div className="rbt-about-area">
        <div className="container">
          <div className="row g-md-5 gy-4 align-items-start">
            <div className="col-lg-6">
              <div className="content">
                <h2 className="title">
                  A Continuing Journey <br />
                  Connecting You with <span style={{ color: "#228756" }}>Trusted Therapists</span>
                </h2>
                
                <div className="journey-container">
                  <div className="journey-line">
                    <div className="location-step past">
                      <div className="step-dot"><i className="feather-check"></i></div>
                      <span className="location-name">Har</span>
                      <span className="impact-text">Foundation</span>
                    </div>
                    
                    <div className="location-step past">
                      <div className="step-dot"><i className="feather-check"></i></div>
                      <span className="location-name">Dehradun</span>
                      <span className="impact-text">Expansion</span>
                    </div>
                    
                    <div className="location-step active">
                      <div className="step-dot"></div>
                      <span className="location-name">Noida</span>
                      <span className="impact-text">Growing Community</span>
                      <span className="serving-tag">Serving</span>
                    </div>
                    
                    <div className="location-step">
                      <div className="step-dot" style={{borderColor: '#cbd5e0'}}></div>
                      <span className="location-name" style={{color: '#718096'}}>Delhi</span>
                      <span className="impact-text">Next Hub</span>
                    </div>

                    <div className="continuing-step">
                      <div className="dot-loader">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="content">
                <p>
                  Choose Your Therapist LLP was born out of an idea during the COVID-19 pandemic in <span className="highlight-text">2020</span>, 
                  when the need for accessible and trusted mental health care became more evident than ever. 
                  What began as a simple initiative gradually took shape into a structured platform.
                </p>
                <p>
                  On <span className="highlight-text">16th July 2021</span>, CYT was officially incorporated. 
                  Today, we operate under the Ministry of Corporate Affairs (MCA) and MSME, fostering awareness 
                  and creating safe spaces where therapy is approachable and trusted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

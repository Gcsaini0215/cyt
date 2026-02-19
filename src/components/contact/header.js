export default function Header() {
  return (
    <div className="rbt-conatct-area dark-premium-contact-header rbt-section-gap">
      <div className="container">
        <div className="row mt--40">
          <div className="col-lg-12">
            <div className="section-title text-center mb--60">
              <span className="subtitle premium-badge-green">GET IN TOUCH</span>
              <h2 className="title text-white">
                We're Here to Listen & <br />
                <span className="text-gradient-green">Support Your Journey</span>
              </h2>
              <p className="description text-white-opacity mt--20">Our dedicated team is ready to help you find the perfect mental health professional.</p>
            </div>
          </div>
        </div>
        <div className="row g-5">
          <div
            className="col-lg-4 col-md-6 col-sm-6 col-12 sal-animate"
            data-sal="slide-up"
            data-sal-delay="150"
            data-sal-duration="800"
          >
            <div className="premium-contact-card">
              <div className="card-icon">
                <i className="feather-phone-call"></i>
              </div>
              <div className="inner">
                <h4 className="title">Call Support</h4>
                <p>
                  <a href="tel:+918077757951">+91-807-775-7951</a>
                </p>
                <span className="availability">Mon - Sat (10AM - 7PM)</span>
              </div>
            </div>
          </div>
          <div
            className="col-lg-4 col-md-6 col-sm-6 col-12 sal-animate"
            data-sal="slide-up"
            data-sal-delay="150"
            data-sal-duration="800"
          >
            <div className="premium-contact-card">
              <div className="card-icon">
                <i className="feather-mail"></i>
              </div>
              <div className="inner">
                <h4 className="title">Email Us</h4>
                <p>
                  <a href="mailto:info.cyt@gmail.com">info.cyt@gmail.com</a>
                </p>
                <span className="availability">24/7 Response Support</span>
              </div>
            </div>
          </div>
          <div
            className="col-lg-4 col-md-6 col-sm-6 col-12 sal-animate"
            data-sal="slide-up"
            data-sal-delay="150"
            data-sal-duration="800"
          >
            <div className="premium-contact-card">
              <div className="card-icon">
                <i className="feather-map-pin"></i>
              </div>
              <div className="inner">
                <h4 className="title">Our HQ</h4>
                <p>
                  <a href="https://www.google.com/maps/place/Choose+Your+Therapist+LLP+%7C+Psychologist+in+Noida+%26+Delhi/@28.5821626,77.3716335,17z" target="_blank" rel="noreferrer">
                    Block D-137, Sector 51, Noida, UP 201301
                  </a>
                </p>
                <span className="availability">Visit by Appointment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .dark-premium-contact-header {
          background: linear-gradient(135deg, #0d2b1c 0%, #1a4d32 100%);
          position: relative;
          overflow: hidden;
        }
        .premium-badge-green {
          background: rgba(46, 204, 113, 0.15) !important;
          color: #2ecc71 !important;
          padding: 8px 20px !important;
          border-radius: 100px !important;
          font-weight: 700 !important;
          letter-spacing: 1px !important;
          display: inline-block !important;
          margin-bottom: 20px !important;
        }
        .text-gradient-green {
          background: linear-gradient(90deg, #2ecc71, #27ae60);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .text-white-opacity {
          color: rgba(255, 255, 255, 0.7);
          max-width: 600px;
          margin: 0 auto;
        }
        .premium-contact-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 40px 30px;
          border-radius: 24px;
          text-align: center;
          transition: all 0.4s ease;
          height: 100%;
          backdrop-filter: blur(10px);
        }
        .premium-contact-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.06);
          border-color: #2ecc71;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .card-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 25px;
          color: white;
          font-size: 28px;
          box-shadow: 0 10px 20px rgba(46, 204, 113, 0.2);
        }
        .premium-contact-card .title {
          color: white;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 15px;
        }
        .premium-contact-card p a {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          transition: color 0.3s;
          display: block;
          line-height: 1.6;
        }
        .premium-contact-card p a:hover {
          color: #2ecc71;
        }
        .availability {
          display: block;
          margin-top: 15px;
          font-size: 12px;
          color: #2ecc71;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        @media (max-width: 768px) {
          .premium-contact-card {
            padding: 30px 20px;
          }
          .dark-premium-contact-header {
            padding-top: 60px;
            padding-bottom: 60px;
          }
        }
      `}</style>
    </div>
  );
}

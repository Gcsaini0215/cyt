import LazyImage from "../../utils/lazy-image";
import ContactImg from "../../assets/img/contact.webp";

export default function ContactForm() {
  return (
    <div className="rbt-contact-address premium-form-section rbt-section-gap">
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6 sal-animate" data-sal="slide-right" data-sal-duration="800">
            <div className="thumbnail contact-img-wrapper">
              <LazyImage alt="Contact" dim={"550-500"} src={ContactImg} />
              <div className="image-overlay-card">
                <i className="feather-check-circle"></i>
                <span>Verified Professionals</span>
              </div>
            </div>
          </div>
          <div className="col-lg-6 sal-animate" data-sal="slide-left" data-sal-duration="800">
            <div className="rbt-contact-form premium-green-form">
              <div className="form-header mb--30">
                <h3 className="title">Send us a Message</h3>
                <p>Have a specific inquiry? Fill out the form and we'll get back to you within 24 hours.</p>
              </div>
              <form
                id="contact-form"
                method="POST"
                className="rainbow-dynamic-form"
              >
                <div className="form-group-wrapper">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      name="contact-name"
                      id="contact-name"
                      type="text"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      name="contact-phone"
                      type="email"
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="How can we help?"
                  />
                </div>
                
                <div className="form-group">
                  <label>Your Message</label>
                  <textarea
                    name="contact-message"
                    id="contact-message"
                    placeholder="Tell us more about your requirements..."
                  ></textarea>
                </div>
                
                <div className="form-submit-group mt--20">
                  <button
                    name="submit"
                    type="submit"
                    id="submit"
                    className="premium-submit-btn"
                  >
                    <span>Send Message</span>
                    <i className="feather-arrow-right"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .premium-form-section {
          background: #f8fafc;
        }
        .contact-img-wrapper {
          position: relative;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
        }
        .image-overlay-card {
          position: absolute;
          bottom: 30px;
          left: 30px;
          background: white;
          padding: 15px 25px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .image-overlay-card i {
          color: #2ecc71;
          font-size: 20px;
        }
        .image-overlay-card span {
          font-weight: 700;
          color: #1e293b;
          font-size: 14px;
        }
        .premium-green-form {
          background: white;
          padding: 40px;
          border-radius: 30px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.04);
          border: 1px solid #f1f5f9;
        }
        .premium-green-form .title {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 10px;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 8px;
          display: block;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .premium-green-form input, 
        .premium-green-form textarea {
          width: 100%;
          background: #f8fafc !important;
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 12px !important;
          padding: 12px 20px !important;
          font-size: 15px !important;
          transition: all 0.3s ease !important;
          color: #1e293b !important;
        }
        .premium-green-form input:focus, 
        .premium-green-form textarea:focus {
          border-color: #2ecc71 !important;
          background: white !important;
          box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.1) !important;
        }
        .form-group-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .premium-submit-btn {
          background: linear-gradient(90deg, #2ecc71, #27ae60);
          color: white;
          border: none;
          padding: 16px 35px;
          border-radius: 15px;
          font-weight: 700;
          font-size: 16px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(46, 204, 113, 0.2);
        }
        .premium-submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(46, 204, 113, 0.3);
          background: linear-gradient(90deg, #27ae60, #219150);
        }
        @media (max-width: 768px) {
          .premium-green-form {
            padding: 30px 20px;
          }
          .form-group-wrapper {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .image-overlay-card {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

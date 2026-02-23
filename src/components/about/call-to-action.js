import React from "react";
import Link from "next/link";

export default function CallToActionAbout() {
  return (
    <div className="elementor-widget-container">
      <div className="rbt-callto-action-area">
        <style>{`
          .rbt-call-to-action.custom-dark-green-bg {
            background: #1a4d32 !important;
            border-radius: 0;
            padding: 50px 0 0 0;
            margin: 0;
            width: 100%;
            overflow: hidden;
          }
          .elementor-widget-container {
            padding: 0;
            margin: 0;
          }
          .btn-white-custom {
            background: #ffffff !important;
            color: #1a4d32 !important;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
            text-decoration: none;
          }
          .btn-white-custom:hover {
            background: #f0fdf4 !important;
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          .custom-dark-green-bg .title {
            font-size: 42px;
            font-weight: 900;
            margin-bottom: 25px;
            color: #ffffff;
            line-height: 1.2;
          }
          .custom-dark-green-bg .description {
            color: rgba(255,255,255,0.9);
            font-size: 19px;
            line-height: 1.7;
            margin-bottom: 35px;
          }
          @media (max-width: 991px) {
            .custom-dark-green-bg {
              padding: 40px 20px 40px 20px;
              text-align: center;
            }
            .custom-dark-green-bg .title {
              font-size: 28px;
              margin-bottom: 15px;
            }
            .custom-dark-green-bg .description {
              font-size: 16px;
              margin-bottom: 25px;
            }
          }
        `}</style>
        <div className="rbt-call-to-action custom-dark-green-bg">
          <div className="container">
            <div className="row align-items-center">
              
              {/* Content Column */}
              <div className="col-lg-7 pb--50">
                <div className="inner">
                  <div className="content text-left">
                    <h2 className="title">
                      Are You a Therapist?
                    </h2>

                    <p className="description">
                      Access your personalized dashboard on our platform to seamlessly connect online with clients to serve and manage your profile with ease.
                    </p>

                    <div className="call-to-btn">
                      <Link href="/therapist-registration" className="btn-white-custom">
                        <span>Join Us Today</span>
                        <i className="feather-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail Column */}
              <div className="col-lg-5 align-self-end d-none d-lg-block">
                <div className="thumbnail text-center">
                  <img
                    decoding="async"
                    src="https://rainbowthemes.net/themes/histudy/wp-content/uploads/2024/03/cta.webp"
                    alt="Therapist Join Us"
                    loading="lazy"
                    className="img-fluid"
                    style={{ maxHeight: '320px', width: 'auto', verticalAlign: 'bottom', display: 'block', margin: '0 auto', filter: 'brightness(1.1)' }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";

export default function CallToActionAbout() {
  return (
    <div className="elementor-widget-container">
      <div className="rbt-callto-action-area">
        <div className="rbt-call-to-action rbt-cta-default style-4 bg-gradient-6 mt--75">
          <div className="container">
            <div className="row align-items-center content-wrapper row--30 mt_dec--30 position-relative flex-lg-row flex-column-reverse">
              
              {/* Content Column */}
              <div className="col-lg-8 mt--30 offset-lg-3">
                <div className="inner">
                  <div className="content text-left">
                    <h2 className="title sal-animate" data-sal="slide-up">
                      Are You a Therapist?
                    </h2>

                    <p className="mt--20" style={{ color: "#000" }}>
                      Access your personalized dashboard on our platform to seamlessly connect online with clients to serve and manage your profile with ease.
                    </p>

                    <div className="call-to-btn text-start mt--30">
                      <Link
                        className="rbt-btn btn-gradient hover-icon-reverse"
                        to="/therapist-registration"
                      >
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">Join Us</span>
                          <span className="btn-icon"><i className="feather-arrow-right"></i></span>
                          <span className="btn-icon"><i className="feather-arrow-right"></i></span>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail Column */}
              <div className="col-lg-4 mb--30">
                <div className="thumbnail text-lg-end text-center">
                  <img
                    decoding="async"
                    src="https://rainbowthemes.net/themes/histudy/wp-content/uploads/2024/03/cta.webp"
                    title="cta"
                    alt="cta"
                    loading="lazy"
                    className="img-fluid"
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

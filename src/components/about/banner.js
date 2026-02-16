import React from "react";
import { Link } from "react-router-dom";
import ImageTag from "../../utils/image-tag";
import PageBreadCrumb from "../../components/global/page-breadcrumb";

export default function AboutUsBanner() {
  return (
    <>
      <PageBreadCrumb title="About Our Mission" linkTitle="About Us" />

      <div className="rbt-banner-area rbt-banner-3 header-transperent-spacer" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' }}>
        <div className="wrapper">
          <div className="container">
            <div className="row g-5 align-items-center">
              <div className="col-lg-7">
                <div className="banner-content">
                  <div className="inner">
                    <div className="section-title text-start">
                      <span className="subtitle bg-pink-opacity">
                        Our Story & Commitment
                      </span>
                    </div>
                    <h1 className="title">
                      Empowering Minds, <br />
                      Transforming <span className="color-primary">Lives</span>.
                    </h1>
                    <p className="description">
                      At CYT, we believe that mental health is a fundamental human right. 
                      Our mission is to provide a safe, accessible, and professional platform 
                      where everyone can find their perfect therapist match and begin their 
                      journey toward emotional well-being.
                    </p>
                    <div className="rbt-like-total">
                      <div className="profile-share">
                        <Link
                          to="#"
                          className="avatar"
                          data-tooltip="Counselling Psychologist"
                          tabIndex="0"
                        >
                          <ImageTag
                            alt="avatar"
                            width="55"
                            height="55"
                            src="/assets/img/avatar-027dc8.png"
                          />
                        </Link>
                        <Link
                          to="#"
                          className="avatar"
                          data-tooltip="Psychologist"
                          tabIndex="0"
                        >
                          <ImageTag
                            alt="avatar"
                            width="55"
                            height="55"
                            src="/assets/img/psychologist.png"
                          />
                        </Link>
                        <Link
                          to="#"
                          className="avatar"
                          data-tooltip="Therapist"
                          tabIndex="0"
                        >
                          <ImageTag
                            alt="avatar"
                            width="55"
                            height="55"
                            src="/assets/img/counselling.png"
                          />
                        </Link>
                        <div className="more-author-text">
                          <h5 className="total-join-students">
                            10,000+ Journeys Supported
                          </h5>
                          <p className="subtitle">Across India & beyond.</p>
                        </div>
                      </div>
                    </div>

                    <div className="rbt-button-group justify-content-start mt--30">
                      <Link className="rbt-btn btn-gradient hover-icon-reverse" to="/view-all-therapist">
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">Explore Therapists</span>
                          <span className="btn-icon"><i className="feather-arrow-right"></i></span>
                          <span className="btn-icon"><i className="feather-arrow-right"></i></span>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="thumbnail" style={{ position: 'relative' }}>
                  <ImageTag
                    src="/assets/img/counselling.png"
                    alt="Soothing Therapy"
                    style={{ 
                      borderRadius: '30px', 
                      boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover'
                    }}
                  />
                  {/* Decorative element */}
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '100px',
                    height: '100px',
                    background: 'rgba(34, 135, 86, 0.1)',
                    borderRadius: '50%',
                    zIndex: -1
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

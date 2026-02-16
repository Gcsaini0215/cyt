import React from "react";
import { Helmet } from "react-helmet-async"; // SEO

import LazyImage from "../../utils/lazy-image";
import BgImage from "../../assets/img/bg-image-10.png";
import { Link } from "react-router-dom";
import ImageTag from "../../utils/image-tag";
import { truncateString } from "../../utils/helpers";
import { getDateDifference } from "../../utils/time";
import WellNessCard from "./wellness-card";
import { imagePath } from "../../utils/url";

export default function WorkshopDetail(props) {
  const { data, workshopByThisUser, moreWorkshop } = props;
  const [open, setOpen] = React.useState(false);
  const [sidebar, setSidebar] = React.useState(false);


  const handleSidebarClick = () => setSidebar(!sidebar);

  // Short description for meta tags
  const metaDescription = truncateString(data.short_desc, 160);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{data.title} | Mind Matters Programs</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`Mindfulness, Therapy, Mental Health, ${data.title}`} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={`${imagePath}/${data.workshop_image}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={`${imagePath}/${data.workshop_image}`} />
      </Helmet>

      {/* Breadcrumb & Header */}
      <div
        className="rbt-breadcrumb-default rbt-breadcrumb-style-3"
        style={{ paddingTop: "20px", marginTop: "0px" }}
      >
        <div className="breadcrumb-inner breadcrumb-dark">
          <LazyImage alt="BG Image" width="1920" height="1408" src={BgImage} />
        </div>
        <div className="container mt--20">
          <div className="row">
            <div className="col-lg-8">
              <div className="content text-start">
                <ul className="page-list">
                  <li className="rbt-breadcrumb-item">
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <div className="icon-right">
                      <i className="feather-chevron-right"></i>
                    </div>
                  </li>
                  <li className="rbt-breadcrumb-item active">
                    Mind Matters Programs
                  </li>
                </ul>
                <h2 className="title mb--0">{data.title}</h2>
                <p className="description" style={{ textAlign: "justify" }}>
                  {data.short_desc}
                </p>
                <div className="rbt-author-meta mb--20">
                  <div className="rbt-avater">
                    <Link to={`/view-profile/${data.post_by._id}`}>
                      <ImageTag
                        alt={data.post_by.name}
                        src={`${imagePath}/${data.post_by.user.profile}`}
                      />
                    </Link>
                  </div>
                  <div className="rbt-author-info">
                    By &nbsp;
                    <Link to={`/view-profile/${data.post_by._id}`}>
                      {data.post_by.user.name}
                    </Link>
                    &nbsp;|&nbsp;
                    <a href="#">{data.post_by.profile_type}</a>
                  </div>
                </div>
                <ul className="rbt-meta">
                  <li>
                    <i className="feather-calendar"></i>
                    {data.event_date} &nbsp; {data.event_time} ({data.duration})
                  </li>
                  <li>
                    <i className="feather-award"></i> {data.level}
                  </li>
                  <li>
                    <i className="feather-globe"></i> {data.language}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workshop Details */}
      <div className="rbt-course-details-area rbt-section-gap" style={{ paddingTop: "30px" }}>
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-8">
              <div className="course-details-content">
                {/* Workshop Image */}
                <div className="rbt-feature-box rbt-shadow-box thuumbnail">
                  <ImageTag
                    alt="Card image"
                    width="800"
                    height="550"
                    className="w-100"
                    src={`${imagePath}/${data.workshop_image}`}
                  />
                </div>

                {/* Event Description */}
                <div className="rbt-feature-box rbt-shadow-box mt--60">
                  <div className="row g-5">
                    <div className="col-lg-12">
                      <div className="section-title">
                        <h4 className="title mb--20">Event Description</h4>
                      </div>
                      <div
                       
                        dangerouslySetInnerHTML={{ __html: data.desc }}
                      />
                    </div>
                  </div>
                </div>

                {/* Instructor */}
                <div
                  className="rbt-instructor rbt-shadow-box intructor-wrapper mt--30"
                  id="intructor"
                >
                  <div className="about-author border-0 pb--0 pt--0">
                    <div className="section-title mb--30">
                      <h4 className="rbt-title-style-3">By Listed Therapist</h4>
                    </div>
                    <div className="row g-5 media align-items-center">
                      <div className="col-lg-6 col-md-6 col-sm-6 thumbnail rbt-avatars size-lg">
                        <ImageTag
                          alt="Instructor"
                          width="250"
                          height="250"
                          src={`${imagePath}/${data.post_by.user.profile}`}
                          style={{
                            borderRadius: 0,
                            padding: 0,
                            minWidth: 110,
                            width: 110,
                            minHeight: 120,
                            height: 120,
                          }}
                        />
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-6 media-body">
                        <div className="author-info">
                          <h5 className="title" style={{ lineHeight: 0.24 }}>
                            <Link
                              className="hover-flip-item-wrapper"
                              to={`/view-profile/${data.post_by._id}`}
                            >
                              {data.post_by.user.name}
                            </Link>
                          </h5>
                          <span className="b3 subtitle">{data.post_by.profile_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* More Workshops by Same User */}
                {workshopByThisUser.length > 0 && (
                  <div className="related-course mt--60">
                    <div className="row g-5 align-items-end mb--20">
                      <div className="col-lg-12 col-md-12 col-12">
                        <div className="section-title">
                          <span className="subtitle bg-pink-opacity">
                            Mental Health Practices & Tools
                          </span>
                          <h4 className="title">
                            Mind Matters Programs By
                            <strong className="color-primary ms-3">
                              {data.post_by.name}
                            </strong>
                          </h4>
                        </div>
                      </div>
                    </div>
                    <div className="row g-5">
                      {workshopByThisUser.map((item) => (
                        <div key={item._id} className="col-lg-6 col-md-6 col-sm-6 col-12 sal-animate">
                          <WellNessCard data={item} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4 mt_md--60 mt_sm--60">
              <div className="course-sidebar rbt-gradient-border sticky-top rbt-shadow-box course-sidebar-top">
                <div className="inner">
                  <div className="rbt-price-wrapper d-flex flex-wrap align-items-center justify-content-between">
                    <div className="rbt-price">
                      <span className="current-price">₹{data.price}</span>
                      <span className="off-price" style={{ fontSize: 15 }}>
                        ₹{data.mrp}
                      </span>
                    </div>
                    <div className="discount-time">
                      <span className="rbt-badge color-danger bg-color-danger-opacity">
                        <i className="feather-clock"></i>{" "}
                        {getDateDifference(data.event_date)} days left!
                      </span>
                    </div>
                  </div>

                  {/* Video/Image */}
                  <div className="video-popup-with-text video-popup-wrapper text-center popup-video sidebar-video-hidden mb--15 mt--20">
                    <div className="video-content">
                      <ImageTag
                        alt={data.title}
                        width="355"
                        height="255"
                        src={`${imagePath}/${data.workshop_image}`}
                      />
                    </div>
                  </div>

                  {/* Register Button */}
                  <div className="content pt--30">
                    <div className="add-to-card-button mb--15">
                      <Link
                        className="rbt-btn btn-gradient icon-hover w-100 d-block text-center"
                        to={`/workshop-booking/${data._id}`}
                      >
                        <span className="btn-text">Register Now</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </Link>
                    </div>

                    {/* Sidebar Details */}
                    <div
                      onClick={() => handleSidebarClick()}
                      className={
                        sidebar
                          ? "rbt-widget-details has-show-more active"
                          : "rbt-widget-details has-show-more"
                      }
                    >
                      <ul className="has-show-more-inner-content rbt-course-details-list-wrapper">
                        <li>
                          <span>Start Date</span>
                          <span className="rbt-feature-value rbt-badge-5">{data.event_date}</span>
                        </li>
                        <li>
                          <span>End Date</span>
                          <span className="rbt-feature-value rbt-badge-5">{data.event_end_date}</span>
                        </li>
                        <li>
                          <span>Start Time</span>
                          <span className="rbt-feature-value rbt-badge-5">{data.event_time}</span>
                        </li>
                        <li>
                          <span>Level</span>
                          <span className="rbt-feature-value rbt-badge-5">{data.level}</span>
                        </li>
                        <li>
                          <span>Language</span>
                          <span className="rbt-feature-value rbt-badge-5">{data.language}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Social Share */}
                    <div className="social-share-wrapper mt--30 text-center">
                      <div className="rbt-post-share d-flex align-items-center justify-content-center">
                        <ul className="social-icon social-default transparent-with-border justify-content-center">
                          <li>
                            <a href="https://www.facebook.com/">
                              <i className="feather-facebook"></i>
                            </a>
                          </li>
                          <li>
                            <a href="https://www.twitter.com">
                              <i className="feather-twitter"></i>
                            </a>
                          </li>
                          <li>
                            <a href="https://www.instagram.com/">
                              <i className="feather-instagram"></i>
                            </a>
                          </li>
                          <li>
                            <a href="https://www.linkedin.com/">
                              <i className="feather-linkedin"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                      <hr className="mt--20" />
                      <div className="contact-with-us text-center">
                        <p>For any queries</p>
                        <p className="rbt-badge-2 mt--10 justify-content-center w-100">
                          <i className="feather-phone mr--5"></i> WhatsApp us:
                          <a href="#">
                            <strong>+91 8077757951</strong>
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Register Bar */}
      <div className="rbt-course-action-bottom rbt-course-action-active">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6">
              <div className="section-title text-center text-md-start">
                <h5 className="title mb--0">{data.title}</h5>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 mt_sm--15">
              <div className="course-action-bottom-right rbt-single-group">
                <div className="rbt-single-list rbt-price large-size justify-content-center">
                  <span className="current-price color-primary">₹{data.price}</span>
                  <span className="off-price">₹{data.mrp}</span>
                </div>
                <div className="rbt-single-list action-btn">
                  <Link
                    className="rbt-btn btn-gradient hover-icon-reverse btn-md"
                    to={`/workshop-booking/${data._id}`}
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Register Now</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More Workshops */}
      {moreWorkshop.length > 0 && (
        <div className="rbt-related-course-area bg-color-white pt--60 rbt-section-gapBottom">
          <div className="container">
            <div className="section-title mb--30">
              <span className="subtitle bg-primary-opacity">
                More Similar Mental Health Practices & Tools
              </span>
              <h4 className="title">Related Mind Matters Programs</h4>
            </div>
            <div className="row g-5">
              {moreWorkshop.map((item) => (
                <div key={item._id} className="col-lg-4 col-md-4 col-sm-6 col-12 sal-animate">
                  <WellNessCard data={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rbt-separator-mid">
        <div className="container">
          <hr className="rbt-separator m-0" />
        </div>
      </div>
    </>
  );
}

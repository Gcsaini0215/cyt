import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";
import { Link } from "react-router-dom";
import ErrorPage from "../../pages/error-page";
import { fetchById, fetchData } from "../../utils/actions";
import {
  GetFavriouteTherapistListUrl,
  getTherapistProfiles,
} from "../../utils/url";
import ProfileCardHor from "./profile-card-hor";
import { getDecodedToken } from "../../utils/jwt";
export default function ProfileCard() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [tab, setTab] = React.useState("");
  const [data, setData] = React.useState([]);
  const [favrioutes, setFavrioutes] = React.useState([]);
  const getData = async (profileType = tab) => {
    console.log("getData called with profileType:", profileType);
    try {
      const res = await fetchData(getTherapistProfiles, {
        profile_type: profileType,
      });
      console.log("getData response:", res);
      if (res && res.data) {
        setData(res.data);
      } else {
        console.log("getData: No data found in response");
      }
    } catch (err) {
      console.error("getData error:", err);
    }
  };

  const handleClick = (id) => {
    setTab(id);
    getData(id);
  };

  const getFavrioutes = async () => {
    try {
      const res = await fetchById(GetFavriouteTherapistListUrl);
      if (res && res.data) {
        setFavrioutes(res.data.therapists || []);
      }
    } catch (err) {
      console.log(err);
    }
  };
  React.useEffect(() => {
    getData();
    const data = getDecodedToken();
    if (data) {
      if (data.role !== 1) {
        getFavrioutes();
      }
    }
  }, []);
  return (
    <div className="rbt-rbt-card-area rbt-section-gap" style={{
      background: 'linear-gradient(180deg, #fdf8f3 0%, #f5ece1 50%, #fdf8f3 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '100px 0'
    }}>
      {/* Wave transition at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        lineHeight: 0,
        transform: 'rotate(180deg)'
      }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '60px', fill: '#ffffff' }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V120c68.47-14.46,140.24-21.41,210.45-12.09,60.2,8,118,25.43,178.61,23.32,54.12-1.89,103.52-21,154.77-33.87,51.25-12.87,105.15-20.41,158-11.88,52.85,8.53,101.45,34.1,153.6,33.56,52.15-.54,101.52-25.13,153.37-23.07C1100.86,110.15,1151,126.31,1200,120V0H0V120Z" opacity=".1"></path>
        </svg>
      </div>

      {/* Decorative Blur Blobs */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(139, 94, 60, 0.12)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title text-center" style={{ marginBottom: '50px' }}>
              <span className="subtitle" style={{ 
                background: '#8b5e3c', 
                color: '#ffffff', 
                padding: '8px 20px', 
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                boxShadow: '0 4px 10px rgba(139, 94, 60, 0.2)'
              }}>
                Verified Professionals
              </span>
              <h2 className="title" style={{ 
                fontSize: isMobile ? "2.5rem" : "4.5rem", 
                fontWeight: "900", 
                color: "#000000",
                marginTop: '25px',
                lineHeight: isMobile ? '3rem' : '1.1',
                whiteSpace: "normal"
              }}>
                Find Your Perfect <span style={{ 
                  backgroundImage: "linear-gradient(135deg, #27ae60 0%, #10b981 50%, #007f99 100%)", 
                  WebkitBackgroundClip: "text", 
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent"
                }}>Therapist</span> Match
              </h2>
              <p style={{ 
                fontSize: isMobile ? '1.2rem' : '1.5rem', 
                color: '#444', 
                maxWidth: '850px', 
                margin: '20px auto 0',
                lineHeight: '1.6',
                fontWeight: '500',
                padding: isMobile ? '0 10px' : '0'
              }}>
                Therapy works when you feel safe, heard, and understood. Discover professionals who match your needs and values.
              </p>
              <div className="row mt--40">
                <div className="col-lg-12">
                  <div className="advance-tab-button">
                    <ul
                      className="nav nav-tabs tab-button-style-2"
                      id="myTab-4"
                      style={{
                        background: '#ffffff',
                        backdropFilter: 'blur(15px)',
                        padding: '10px',
                        borderRadius: isMobile ? '15px' : '100px',
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: isMobile ? 'nowrap' : 'wrap',
                        overflowX: isMobile ? 'auto' : 'visible',
                        WebkitOverflowScrolling: 'touch',
                        border: '1px solid rgba(139, 94, 60, 0.2)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        justifyContent: isMobile ? 'flex-start' : 'center',
                        width: isMobile ? '100%' : 'auto',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                        gap: '5px'
                      }}
                    >
                      <style>{`
                        ul#myTab-4::-webkit-scrollbar {
                          display: none;
                        }
                        @media (max-width: 768px) {
                          .advance-tab-button ul.nav-tabs li a.tab-button {
                            padding: 8px 16px !important;
                            font-size: 14px !important;
                            white-space: nowrap !important;
                          }
                        }
                      `}</style>
                      <li>
                        <Link
                          className={
                            tab === "" ? "tab-button active" : "tab-button"
                          }
                          aria-selected={tab === "" ? "true" : "false"}
                          onClick={() => handleClick("")}
                          to="#"
                        >
                          <span className="title" style={{ cursor: "pointer" }}>
                            See all
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          className={
                            tab === "Counselling Psychologist"
                              ? "tab-button active"
                              : "tab-button"
                          }
                          id="profile-tab-4"
                          aria-selected={
                            tab === "Counselling Psychologist"
                              ? "true"
                              : "false"
                          }
                          onClick={() =>
                            handleClick("Counselling Psychologist")
                          }
                          to="#"
                        >
                          <span className="title" style={{ cursor: "pointer" }}>
                            Counselling Psychologist
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          className={
                            tab === "Clinical Psychologist"
                              ? "tab-button active"
                              : "tab-button"
                          }
                          id="contact-tab-4"
                          aria-selected={
                            tab === "Clinical Psychologist" ? "true" : "false"
                          }
                          onClick={() => handleClick("Clinical Psychologist")}
                          to="#"
                        >
                          <span className="title" style={{ cursor: "pointer" }}>
                            Clinical Psychologist
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          className={
                            tab === "Psychiatrist"
                              ? "tab-button active"
                              : "tab-button"
                          }
                          id="business-tab-4"
                          aria-selected={
                            tab === "Psychiatrist" ? "true" : "false"
                          }
                          onClick={() => handleClick("Psychiatrist")}
                          to="#"
                        >
                          <span className="title" style={{ cursor: "pointer" }}>
                            Psychiatrist
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          className={
                            tab === "Special Educator"
                              ? "tab-button active"
                              : "tab-button"
                          }
                          id="business-tab-4"
                          aria-selected={
                            tab === "Special Educator" ? "true" : "false"
                          }
                          onClick={() => handleClick("Special Educator")}
                          to="#"
                        >
                          <span className="title" style={{ cursor: "pointer" }}>
                            Special Educator
                          </span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row row--15" style={{ margin: isMobile ? 5 : 0 }}>
          {data && data.length > 0 ? (
            <Swiper
              spaceBetween={50}
              breakpoints={{
                640: {
                  slidesPerView: isMobile ? 1 : 2,
                  spaceBetween: 40,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                },
                1024: {
                  slidesPerView: 2,
                  spaceBetween: 40,
                },
              }}
              loop={data.length > 2}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              modules={[Autoplay]}
              className="mySwiper"
            >
              {data.map((item) => {
                return (
                  <SwiperSlide key={item._id}>
                    <ProfileCardHor pageData={item} favrioutes={favrioutes} />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            <div className="col-lg-12 text-center" style={{ padding: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '15px' }}>
              <p style={{ fontSize: '1.2rem', color: '#666' }}>No therapists found for this category.</p>
            </div>
          )}
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="load-more-btn mt--60 text-center">
              <Link
                className="rbt-btn btn-gradient btn-sm hover-icon-reverse"
                to={"/view-all-therapist"}
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">Find More</span>

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
  );
}

import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import useMediaQuery from "@mui/material/useMediaQuery";
import WellNessCard from "./wellness-card";
import React from "react";
import { Link } from "react-router-dom";
import { fetchData } from "../../utils/actions";
import { getWorkshopsWebUrl } from "../../utils/url";
export default function HomeWorkshop({ isWhite = false }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [data, setData] = React.useState([]);
  const [tab, setTab] = React.useState("See All");
  const handleClick = (id) => {
    setTab(id);
    getData(id);
  };

  const getData = async (categoryTab = tab) => {
    try {
      const res = await fetchData(getWorkshopsWebUrl, {
        category: categoryTab === "See All" ? "" : categoryTab,
      });
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <div className={`rbt-course-area rbt-section-gap`} style={{
      background: '#f0fdf4',
      backgroundImage: `radial-gradient(#228756 0.5px, transparent 0.5px), radial-gradient(#228756 0.5px, #f0fdf4 0.5px)`,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0,10px 10px',
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
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '60px', fill: '#fdf8f3' }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V120c68.47-14.46,140.24-21.41,210.45-12.09,60.2,8,118,25.43,178.61,23.32,54.12-1.89,103.52-21,154.77-33.87,51.25-12.87,105.15-20.41,158-11.88,52.85,8.53,101.45,34.1,153.6,33.56,52.15-.54,101.52-25.13,153.37-23.07C1100.86,110.15,1151,126.31,1200,120V0H0V120Z" opacity=".1"></path>
        </svg>
      </div>

      {/* Decorative Blur Blobs */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(34, 135, 86, 0.07)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row" style={{ marginBottom: '40px' }}>
          <div className="col-lg-12">
            <div className="section-title text-center" style={{ marginBottom: '50px' }}>
              <span className="subtitle" style={{ 
                background: '#228756', 
                color: '#ffffff', 
                padding: '8px 20px', 
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                boxShadow: '0 4px 10px rgba(34, 135, 86, 0.2)'
              }}>
                Mental Health Practices & Tools
              </span>
              <h2 className="title" style={{ 
                fontSize: isMobile ? "2.5rem" : "4.5rem", 
                fontWeight: "900", 
                color: "#000000",
                marginTop: '25px',
                lineHeight: isMobile ? '3rem' : '1.1',
                whiteSpace: isMobile ? 'nowrap' : 'normal'
              }}>
                Mind Matters <span style={{ 
                  backgroundImage: "linear-gradient(135deg, #27ae60 0%, #10b981 50%, #007f99 100%)", 
                  WebkitBackgroundClip: "text", 
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent"
                }}>Programs</span>
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
                Learn, connect, and grow with guided programs focused on building calm, clarity, and confidence.
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="advance-tab-button">
              <ul className="nav nav-tabs tab-button-style-2" id="myTab-4" style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(15px)',
                        padding: '10px',
                        borderRadius: isMobile ? '15px' : '100px',
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: isMobile ? 'nowrap' : 'wrap',
                        overflowX: isMobile ? 'auto' : 'visible',
                        WebkitOverflowScrolling: 'touch',
                        border: '1px solid rgba(34, 135, 86, 0.2)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        justifyContent: isMobile ? 'flex-start' : 'center',
                        width: isMobile ? '100%' : 'auto',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                        gap: '5px'
                      }}>
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
                      tab === "See All" ? "tab-button active" : "tab-button"
                    }
                    id="home-tab-4"
                    aria-selected={tab === "See All" ? "true" : "false"}
                    onClick={() => handleClick("See All")}
                    to="#"
                  >
                    <span className="title" style={{ cursor: "pointer" }}>
                      See All
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      tab === "Support Groups"
                        ? "tab-button active"
                        : "tab-button"
                    }
                    id="profile-tab-4"
                    aria-selected={tab === "Support Groups" ? "true" : "false"}
                    onClick={() => handleClick("Support Groups")}
                    to="#"
                  >
                    <span className="title" style={{ cursor: "pointer" }}>
                      Support Groups
                    </span>
                  </Link>
                </li>
               
                <li>
                  <Link
                    className={
                      tab === "Capacity Building"
                        ? "tab-button active"
                        : "tab-button"
                    }
                    id="business-tab-4"
                    aria-selected={
                      tab === "Capacity Building" ? "true" : "false"
                    }
                    onClick={() => handleClick("Capacity Building")}
                    to="#"
                  >
                    <span className="title" style={{ cursor: "pointer" }}>
                      Capacity Building
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      tab === "Ongoing Series"
                        ? "tab-button active"
                        : "tab-button"
                    }
                    id="business-tab-4"
                    aria-selected={
                      tab === "Ongoing Series" ? "true" : "false"
                    }
                    onClick={() => handleClick("Ongoing Series")}
                    to="#"
                  >
                    <span className="title" style={{ cursor: "pointer" }}>
                      Ongoing Series
                    </span>
                  </Link>
                </li>
                 <li>
                  <Link
                    className={
                      tab === "Mentorship"
                        ? "tab-button active"
                        : "tab-button"
                    }
                    id="contact-tab-4"
                    aria-selected={
                      tab === "Mentorship" ? "true" : "false"
                    }
                    onClick={() => handleClick("Mentorship")}
                    to="#"
                  >
                    <span className="title" style={{ cursor: "pointer" }}>
                     Mentorship
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {!isMobile && (
          <div className="row g-4" style={{ marginTop: 20 }}>
            {data &&
              data.slice(0, 8).map((item) => {
                return (
                  <div className="col-lg-6 col-md-12 col-12" key={item._id}>
                    <WellNessCard data={item} />
                  </div>
                );
              })}
          </div>
        )}
        {isMobile && (
          <div className="row" style={{ marginTop: 20 }}>
            <div className="col-12">
              <div className="swiper swiper-initialized swiper-horizontal viral-banner-activation rbt-arrow-between swiper-backface-hidden">
                <div className="swiper-wrapper">
                  <Swiper
                    spaceBetween={50}
                    slidesPerView={1}
                    autoplay={{
                      delay: 2500,
                      disableOnInteraction: false,
                    }}
                    breakpoints={{
                      640: {
                        slidesPerView: 1,
                        spaceBetween: 40,
                      },
                    }}
                    modules={[Autoplay]}
                    className="mySwiper"
                  >
                    {data &&
                      data.slice(0, 8).map((item) => {
                        return (
                          <SwiperSlide key={item._id}>
                            <WellNessCard data={item} />
                          </SwiperSlide>
                        );
                      })}
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
        )}
        {data.length > 8 && (
          <div className="row">
            <div className="col-lg-12">
              <div className="load-more-btn mt--60 text-center">
                <Link
                  className="rbt-btn btn-gradient btn-sm hover-icon-reverse"
                  to={"/all-workshop"}
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Find All Workshop</span>
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
        )}
      </div>
    </div>
  );
}

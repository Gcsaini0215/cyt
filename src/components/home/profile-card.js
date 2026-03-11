import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchById, fetchData } from "../../utils/actions";
import {
  GetFavriouteTherapistListUrl,
  getTherapistProfiles,
} from "../../utils/url";
import ProfileCardHor from "./profile-card-hor";
import { getDecodedToken } from "../../utils/jwt";
export default function ProfileCard({ profiles }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 600px)");
    setIsMobile(query.matches);
    const handle = (e) => setIsMobile(e.matches);
    query.addListener(handle);
    return () => query.removeListener(handle);
  }, []);
  const [tab, setTab] = React.useState("");
  const [data, setData] = React.useState([]);
  const [favrioutes, setFavrioutes] = React.useState([]);

  // Use profiles prop if provided, otherwise fetch
  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setData(profiles);
    }
  }, [profiles]);

  const getData = async (profileType = tab) => {
    if (profiles) return; // Don't fetch if we have explicit profiles prop
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
      background: 'linear-gradient(180deg, #f0fdf4 0%, #e6f4ea 50%, #f0fdf4 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '80px 0 60px'
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
            <div className="section-title text-start" style={{ marginBottom: '30px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ flex: '1', minWidth: '300px' }}>
                <h3 className="title" style={{ 
                  fontSize: isMobile ? "2.5rem" : "4.5rem", 
                  fontWeight: "900", 
                  color: "#000000",
                  marginTop: '0px',
                  lineHeight: isMobile ? '3rem' : '1.1',
                  whiteSpace: "normal",
                  textAlign: 'left',
                  marginBottom: '15px'
                }}>
                  Best <span style={{ 
                    backgroundImage: "linear-gradient(135deg, #27ae60 0%, #10b981 50%, #007f99 100%)", 
                    WebkitBackgroundClip: "text", 
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent"
                  }}>Online Psychologists</span> across India
                </h3>
                <p style={{ 
                  fontSize: isMobile ? '1.2rem' : '1.5rem', 
                  color: '#444', 
                  maxWidth: '850px', 
                  margin: '0',
                  lineHeight: '1.6',
                  fontWeight: '500',
                  padding: isMobile ? '0 10px' : '0',
                  textAlign: 'left'
                }}>
                  Connect with the top-rated therapists and mental health experts near you. Start your journey towards healing with professional counseling tailored to your needs.
                </p>
              </div>
              
              {!isMobile && (
                <div className="view-all-btn-wrapper" style={{ marginBottom: '10px' }}>
                  <Link
                    className="rbt-btn btn-gradient btn-sm hover-icon-reverse"
                    href={"/view-all-therapist"}
                    style={{ padding: '12px 30px', height: 'auto', lineHeight: '1' }}
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">View All</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row row--15" style={{ margin: isMobile ? 5 : 0 }}>
          {data && data.length > 0 ? (
            <Swiper
              spaceBetween={50}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                  spaceBetween: 20,
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
        {/* Remove bottom load-more-btn if profiles prop exists or as requested since it's now at top */}
        {!profiles && (
          <div className="row">
            <div className="col-lg-12">
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

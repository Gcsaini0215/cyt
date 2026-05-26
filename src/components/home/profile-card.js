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
export default function ProfileCard({ profiles, detectedState, detectedCity }) {
  const [isMobile, setIsMobile] = useState(false);
  const [userDetectedState, setUserDetectedState] = useState(detectedState || "");
  const [userDetectedCity, setUserDetectedCity] = useState(detectedCity || "");
  const [activeState, setActiveState] = useState(detectedCity || detectedState || "");

  useEffect(() => {
    if (detectedState || detectedCity) {
      setUserDetectedState(detectedState || "");
      setUserDetectedCity(detectedCity || "");
      setActiveState(detectedCity || detectedState || "");
    }
  }, [detectedState, detectedCity]);

  const onSlideChange = (swiper) => {
    if (data && data[swiper.realIndex]) {
      const state = data[swiper.realIndex].state || "";
      if (state) {
        setActiveState(state);
      }
    }
  };

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
    if (profiles && profiles.length > 0) return; // Don't fetch if we have explicit profiles prop
    try {
      const res = await fetchData(getTherapistProfiles, {
        profile_type: profileType,
      });
      if (res && res.data) {
        setData(res.data);
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
      console.error("getFavrioutes error:", err);
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
      background: '#071a10',
      position: 'relative',
      overflow: 'hidden',
      padding: '80px 0 60px'
    }}>
      {/* Decorative Blur Blobs */}
      <div style={{
        position: 'absolute', top: '-60px', right: '5%',
        width: '360px', height: '360px',
        background: 'rgba(34,135,86,.08)', filter: 'blur(90px)',
        borderRadius: '50%', pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute', bottom: '0', left: '3%',
        width: '260px', height: '260px',
        background: 'rgba(74,222,128,.05)', filter: 'blur(70px)',
        borderRadius: '50%', pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title text-start" style={{ marginBottom: '30px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'nowrap', gap: '10px' }}>
                <h3 className="title" style={{
                  fontSize: isMobile ? "2.8rem" : "4.5rem",
                  fontWeight: "900",
                  color: "#f1f5f9",
                  marginTop: '0px',
                  lineHeight: isMobile ? '3.2rem' : '1.1',
                  whiteSpace: isMobile ? "normal" : "nowrap",
                  textAlign: 'left',
                  marginBottom: '15px',
                  padding: 0,
                  flex: '1'
                }}>
                  Best Online Psychologists {isMobile && <br />} From <span style={{
                    backgroundImage: "linear-gradient(135deg, #4ade80 0%, #34d399 50%, #22d3ee 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent"
                  }}>{activeState || "Across India"}</span>
                </h3>
                <div className="view-all-btn-wrapper" style={{ marginTop: isMobile ? '10px' : '0', flexShrink: 0 }}>
                  <Link
                    className="rbt-btn btn-gradient btn-sm"
                    href={"/view-all-therapist"}
                    style={{ 
                      padding: isMobile ? '10px 18px' : '12px 30px', 
                      height: 'auto', 
                      lineHeight: '1.2',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '800',
                      minWidth: 'max-content',
                      borderRadius: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <span className="btn-text">{isMobile ? "View All" : "View All Experts"}</span>
                    {!isMobile && (
                      <span className="btn-icon" style={{ marginLeft: '10px' }}>
                        <i className="feather-arrow-right"></i>
                      </span>
                    )}
                  </Link>
                </div>
              </div>
              <p style={{
                fontSize: isMobile ? '1.4rem' : '1.5rem',
                color: '#94a3b8',
                maxWidth: '850px',
                margin: '0',
                lineHeight: '1.6',
                fontWeight: '500',
                padding: 0,
                textAlign: 'left'
              }}>
                Connec with the top-rated therapists and mental health experts near you. Start your journey towards healing with professional counseling tailored to your needs.
              </p>
            </div>
          </div>
        </div>
        <div className="row row--15" style={{ margin: isMobile ? 5 : 0 }}>
          {data && data.length > 0 ? (
            isMobile ? (
              <div style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '12px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
                {data.slice(0, 10).map((item) => (
                  <div key={item._id} style={{ minWidth: '85vw', scrollSnapAlign: 'start', flexShrink: 0 }}>
                    <ProfileCardHor pageData={item} favrioutes={favrioutes} />
                  </div>
                ))}
              </div>
            ) : (
              <Swiper
                slidesPerView={1}
                spaceBetween={16}
                onSlideChange={onSlideChange}
                breakpoints={{
                  640: { slidesPerView: 1, spaceBetween: 20 },
                  768: { slidesPerView: 2, spaceBetween: 30 },
                  1024: { slidesPerView: 2, spaceBetween: 40 },
                }}
                loop={data.length > 2}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                modules={[Autoplay]}
                className="mySwiper"
              >
                {data.map((item) => (
                  <SwiperSlide key={item._id}>
                    <ProfileCardHor pageData={item} favrioutes={favrioutes} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )
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

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import "swiper/css";
import "swiper/css/pagination";
import React from "react";
import Link from "next/link";
import { Star, LocationOn, Language } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { imagePath, defaultProfile } from "../../utils/url";

export default function Banner({ topTherapists = [], userCity = null }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const displayList = topTherapists.slice(0, 8);

  return (
    <div className="rbt-banner-area rbt-banner-1 variation-2 height-750" style={{ paddingBottom: isMobile ? "20px" : "40px" }}>
      <div className="container" style={{ marginTop: isMobile ? "0px" : "-60px" }}>
        <div className="row justify-content-between align-items-center">

          {/* LEFT */}
          <div className="col-lg-8 col-md-12 col-sm-12 col-12" style={{ display: "flex", justifyContent: "center" }}>
            <div className="content">
              <div className="inner">
                {!isMobile && (
                  <div className="rbt-new-badge rbt-new-badge-one">
                    <span className="rbt-new-badge-icon">
                      <PersonSearchIcon sx={{ color: "#228756", fontSize: 30 }} />
                    </span>{" "}
                    Discover mental wellness solutions.
                  </div>
                )}
                <style jsx global>{`
                  @keyframes wordCycle {
                    0%   { opacity: 0; }
                    5%   { opacity: 1; }
                    45%  { opacity: 1; }
                    50%  { opacity: 0; }
                    100% { opacity: 0; }
                  }
                  .banner-word-1 {
                    position: absolute; left: 0; top: 0;
                    animation: wordCycle 6s ease-in-out infinite;
                  }
                  .banner-word-2 {
                    position: absolute; left: 0; top: 0;
                    animation: wordCycle 6s ease-in-out infinite;
                    animation-delay: 3s;
                    opacity: 0;
                  }
                  @media (max-width: 600px) {
                    .rbt-banner-1 { padding-top: 20px !important; }
                    .mySwiper .swiper-pagination { display: none !important; }
                  }
                `}</style>
                <h4 className="title">
                  Find your therapist <br />
                  and start&nbsp;
                  <span style={{ display: "inline-block", position: "relative", minWidth: "175px", verticalAlign: "bottom" }}>
                    <span className="banner-word-1 theme-gradient">Personalized</span>
                    <span className="banner-word-2 theme-gradient">Affordable</span>
                    <span style={{ visibility: "hidden" }}>Personalized</span>
                  </span>
                  <br />
                  path to wellness.
                </h4>
                <p className="description">
                  We provide verified mental health experts every step of the way to your <strong>well-being.</strong>
                </p>
                <div className="slider-btn">
                  <Link className="rbt-btn btn-gradient hover-icon-reverse" href="/view-all-therapist">
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Get Started</span>
                      <span className="btn-icon"><i className="feather-arrow-right"></i></span>
                      <span className="btn-icon"><i className="feather-arrow-right"></i></span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — real therapist cards */}
          <div className="col-lg-4 col-md-12 col-sm-12 col-12" style={{ marginTop: isMobile ? 10 : 60 }}>
            <div className="content">
              <div>
                <Swiper
                  style={{ width: "100%", paddingBottom: "28px" }}
                  slidesPerView={1}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  loop={displayList.length > 1}
                  modules={[Autoplay, Pagination]}
                  className="mySwiper"
                >
                  {displayList.length > 0 ? displayList.map((t, i) => {
                    const avgRating = t.reviews?.length > 0
                      ? (t.reviews.reduce((a, r) => a + (r.rating || 5), 0) / t.reviews.length).toFixed(1)
                      : null;
                    return (
                      <SwiperSlide key={i}>
                        <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #e8f5e9", boxShadow: "0 8px 28px rgba(0,0,0,0.08)", background: "#fff", display: "flex", flexDirection: "column" }}>
                          {/* Photo */}
                          <div style={{ position: "relative", overflow: "hidden", height: "280px", flexShrink: 0 }}>
                            <Avatar
                              src={t.user?.profile ? `${imagePath}/${t.user.profile}` : undefined}
                              alt={t.user?.name || "Therapist"}
                              variant="square"
                              sx={{ width: "100%", height: "100%", borderRadius: 0, "& img": { objectFit: "cover", objectPosition: "center 10%" } }}
                            />
                            {t.priority === 1 && (
                              <div style={{ position: "absolute", top: 10, left: 10, background: "#228756", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" }}>
                                ⭐ Recommended
                              </div>
                            )}
                            {avgRating && (
                              <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", borderRadius: "20px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "4px" }}>
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} sx={{ fontSize: 12, color: s <= Math.round(avgRating) ? "#fbc02d" : "rgba(255,255,255,0.3)" }} />
                                ))}
                                <span style={{ fontSize: "12px", color: "#fff", fontWeight: 700, marginLeft: "2px" }}>{avgRating}</span>
                              </div>
                            )}
                          </div>

                          {/* Body */}
                          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div>
                              <h5 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Link href={`/view-profile/${t._id}`} style={{ color: "inherit", textDecoration: "none" }}>
                                  {t.user?.name || "Therapist"}
                                </Link>
                                <span title="Verified" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#1d9bf0", flexShrink: 0 }}>
                                  <svg viewBox="0 0 24 24" width="11" height="11" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                </span>
                              </h5>
                              <p style={{ margin: 0, marginTop: "2px", fontSize: "13px", color: "#228756", fontWeight: 600 }}>{t.profile_type || "Mental Health Professional"}</p>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                              {t.language_spoken && (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" }}>
                                  <Language sx={{ fontSize: 14, color: "#94a3b8" }} /> {t.language_spoken}
                                </div>
                              )}
                              {t.state && (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" }}>
                                  <LocationOn sx={{ fontSize: 14, color: "#94a3b8" }} /> {t.state}
                                </div>
                              )}
                            </div>

                            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                              <Link className="view-btn view-btn-border" href={`/view-profile/${t._id}`} style={{ flex: 1, textAlign: "center", padding: "0 10px", fontSize: "13px", height: "44px", lineHeight: "44px" }}>
                                View Profile
                              </Link>
                              <Link className="rbt-btn btn-gradient book-btn" href={`/therapist-checkout/${t._id}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", height: "44px" }}>
                                <span>Book Now</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  }) : (
                    <SwiperSlide>
                      <div style={{ height: "420px", background: "#f8fafc", borderRadius: "16px" }} />
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

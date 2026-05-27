import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import "swiper/css";
import React from "react";
import Link from "next/link";
import { Star, LocationOn, Language } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { imagePath, defaultProfile } from "../../utils/url";

export default function Banner({ topTherapists = [], userCity = null }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const displayList = [...topTherapists]
    .sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0))
    .slice(0, 10);

  return (
    <div className="rbt-banner-area rbt-banner-1 variation-2" style={{ paddingTop: isMobile ? "16px" : "50px", paddingBottom: isMobile ? "20px" : "50px" }}>
      <div className="container" style={{ marginTop: 0 }}>
        <div className="row justify-content-between align-items-center">

          {/* LEFT */}
          <div className="col-lg-7 col-md-12 col-sm-12 col-12" style={{ display: "flex", justifyContent: "center" }}>
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
                    .rbt-banner-1 { padding-top: 10px !important; }
                  }
                `}</style>
                <h4 className="title" style={{ fontSize: isMobile ? undefined : "clamp(2.8rem, 5vw, 4.8rem)", lineHeight: 1.15, marginBottom: "12px" }}>
                  Find your&nbsp;
                  <span style={{ display: "inline-block", position: "relative", minWidth: isMobile ? "140px" : "220px", verticalAlign: "bottom" }}>
                    <span className="banner-word-1 theme-gradient">Personalized</span>
                    <span className="banner-word-2 theme-gradient">Affordable</span>
                    <span style={{ visibility: "hidden" }}>Personalized</span>
                  </span>
                  <br />
                  therapist &amp; start healing.
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
          <div className="col-lg-5 col-md-12 col-sm-12 col-12" style={{ marginTop: isMobile ? 10 : 0 }}>
            <div className="content">
              <div>
                <Swiper
                  style={{ width: "100%", maxWidth: isMobile ? "100%" : "340px", margin: "0 auto", paddingBottom: "28px" }}
                  slidesPerView={1}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  loop={displayList.length > 1}
                  modules={[Autoplay]}
                  className="mySwiper"
                >
                  {displayList.length > 0 ? displayList.map((t, i) => {
                    const avgRating = t.reviews?.length > 0
                      ? (t.reviews.reduce((a, r) => a + (r.rating || 5), 0) / t.reviews.length).toFixed(1)
                      : null;
                    return (
                      <SwiperSlide key={i}>
                        <div style={{ borderRadius: "18px", overflow: "hidden", border: "1px solid #e8f5e9", boxShadow: "0 8px 32px rgba(0,0,0,0.10)", background: "#fff", display: "flex", flexDirection: "column" }}>
                          {/* Photo — slightly shorter so body gets more room */}
                          <div style={{ position: "relative", width: "100%", paddingBottom: "88%", flexShrink: 0, overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0 }}>
                              <Avatar
                                src={t.user?.profile ? `${imagePath}/${t.user.profile}` : undefined}
                                alt={t.user?.name || "Therapist"}
                                variant="square"
                                sx={{ width: "100%", height: "100%", borderRadius: 0, "& img": { objectFit: "cover", objectPosition: "top center", imageRendering: "auto" } }}
                              />
                            </div>
                            {/* CYT watermark */}
                            <span style={{ position: "absolute", top: 12, left: 13, color: "#fff", fontSize: "12px", fontWeight: 900, letterSpacing: "2px", zIndex: 2 }}>CYT</span>
                            {/* Gradient overlay */}
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)", zIndex: 1 }} />
                            {/* Name + rating overlay */}
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px 12px", zIndex: 2 }}>
                              {avgRating && (
                                <div style={{ display: "flex", alignItems: "center", gap: "2px", marginBottom: "6px" }}>
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} sx={{ fontSize: 13, color: s <= Math.round(avgRating) ? "#fbc02d" : "rgba(255,255,255,0.3)" }} />
                                  ))}
                                  <span style={{ fontSize: "12px", color: "#fff", fontWeight: 700, marginLeft: "4px" }}>{avgRating}</span>
                                </div>
                              )}
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ color: "#fff", fontSize: "21px", fontWeight: 800, lineHeight: 1.2, textShadow: "0 2px 8px rgba(0,0,0,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {t.user?.name || "Therapist"}
                                </span>
                                <span title="Verified" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "17px", height: "17px", borderRadius: "50%", background: "#1d9bf0", flexShrink: 0 }}>
                                  <svg viewBox="0 0 24 24" width="10" height="10" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Body */}
                          <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            {/* Profile type */}
                            <p style={{ margin: 0, fontSize: "13px", color: "#228756", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {t.profile_type || "Mental Health Professional"}
                            </p>
                            {/* Language + Location */}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                              {t.language_spoken && (
                                <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                                  <Language sx={{ fontSize: 13, color: "#94a3b8" }} />{t.language_spoken}
                                </span>
                              )}
                              {t.state && (
                                <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                                  <LocationOn sx={{ fontSize: 13, color: "#94a3b8" }} />{t.state}
                                </span>
                              )}
                            </div>
                            {/* Buttons */}
                            <div style={{ display: "flex", gap: "8px" }}>
                              <Link className="view-btn view-btn-border" href={`/view-profile/${t._id}`} style={{ flex: 1, textAlign: "center", padding: "0 8px", fontSize: "13px", height: "38px", lineHeight: "38px" }}>
                                View Profile
                              </Link>
                              <Link className="rbt-btn btn-gradient book-btn" href={`/therapist-checkout/${t._id}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", height: "38px" }}>
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

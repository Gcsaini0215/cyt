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
                        <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #e8f5e9", boxShadow: "0 8px 28px rgba(0,0,0,0.08)", background: "#fff", display: "flex", flexDirection: "column" }}>
                          {/* Photo */}
                          <div style={{ position: "relative", width: "100%", paddingBottom: "100%", flexShrink: 0, overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0 }}>
                              <Avatar
                                src={t.user?.profile ? `${imagePath}/${t.user.profile}` : undefined}
                                alt={t.user?.name || "Therapist"}
                                variant="square"
                                sx={{ width: "100%", height: "100%", borderRadius: 0, "& img": { objectFit: "cover", objectPosition: "top center", imageRendering: "auto" } }}
                              />
                            </div>
                            {/* CYT watermark — top left */}
                            <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(10,46,28,0.72)", backdropFilter: "blur(4px)", borderRadius: "20px", padding: "4px 10px", zIndex: 2 }}>
                              <span style={{ color: "#fff", fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px" }}>CYT</span>
                            </div>
                            {/* Dark gradient overlay at bottom */}
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "58%", background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)", zIndex: 1 }} />
                            {/* Stars + name + profile type — bottom overlay */}
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 12px 10px", zIndex: 2 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {avgRating && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "2px", marginBottom: "4px" }}>
                                    {[1,2,3,4,5].map(s => (
                                      <Star key={s} sx={{ fontSize: 13, color: s <= Math.round(avgRating) ? "#fbc02d" : "rgba(255,255,255,0.3)" }} />
                                    ))}
                                    <span style={{ fontSize: "11px", color: "#fff", fontWeight: 700, marginLeft: "3px" }}>{avgRating}</span>
                                  </div>
                                )}
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                                  <span style={{ color: "#fff", fontSize: "20px", fontWeight: 800, lineHeight: 1.2, textShadow: "0 1px 6px rgba(0,0,0,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {t.user?.name || "Therapist"}
                                  </span>
                                  <span title="Verified" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px", borderRadius: "50%", background: "#1d9bf0", flexShrink: 0 }}>
                                    <svg viewBox="0 0 24 24" width="10" height="10" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                  </span>
                                </div>
                                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.profile_type || "Mental Health Professional"}</p>
                                {/* Language + Location on image */}
                                {(t.language_spoken || t.state) && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px", flexWrap: "nowrap", overflow: "hidden" }}>
                                    {t.language_spoken && (
                                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "rgba(255,255,255,0.8)" }}>
                                        <Language sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }} />{t.language_spoken}
                                      </span>
                                    )}
                                    {t.state && (
                                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "rgba(255,255,255,0.8)" }}>
                                        <LocationOn sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }} />{t.state}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Body — About + Buttons */}
                          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            {t.user?.bio && (
                              <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {t.user.bio}
                              </p>
                            )}
                            <div style={{ display: "flex", gap: "8px" }}>
                              <Link className="view-btn view-btn-border" href={`/view-profile/${t._id}`} style={{ flex: 1, textAlign: "center", padding: "0 10px", fontSize: "13px", height: "42px", lineHeight: "42px" }}>
                                View Profile
                              </Link>
                              <Link className="rbt-btn btn-gradient book-btn" href={`/therapist-checkout/${t._id}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", height: "42px" }}>
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

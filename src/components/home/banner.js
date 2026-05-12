import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import "swiper/css";
import "swiper/css/pagination";
import React from "react";
import TherapistCard from "../therapist-card";
import useMediaQuery from "@mui/material/useMediaQuery";
export default function Banner() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [hideShow, setHideShow] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setHideShow((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rbt-banner-area rbt-banner-1 variation-2 height-750">
      <div className="container mt--60">
        <div className="row justify-content-between align-items-center">
          <div
            className="col-lg-8 col-md-12 col-sm-12 col-12"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div className="content">
              <div className="inner">
                <div className="rbt-new-badge rbt-new-badge-one">
                  <span className="rbt-new-badge-icon">
                    <PersonSearchIcon sx={{ color: "#228756", fontSize: 30 }} />
                  </span>{" "}
                  Discover mental wellness solutions.
                </div>
                <h4 class="title">
                  Find your therapist <br />
                  and start&nbsp;
                  <span class="header-caption ms-2">
                    <span class="cd-headline rotate-1">
                      <span class="cd-words-wrapper">
                        <b
                          class={
                            hideShow
                              ? "is-visible theme-gradient"
                              : "is-hidden theme-gradient"
                          }
                        >
                          Personalized
                        </b>
                        <b
                          class={
                            hideShow
                              ? "is-hidden theme-gradient"
                              : "is-visible theme-gradient"
                          }
                        >
                          Affordable
                        </b>
                      </span>
                    </span>
                  </span>
                  <br />
                  journey to mental wellness.
                </h4>
                <p className="description">
                  we provide mental health experts every step of the way to your
                  <strong>well-being.</strong>.
                </p>
                <div className="slider-btn">
                  <a
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    href="/05-classic-lms#"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Get Started</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div
            className="col-lg-4 col-md-12 col-sm-12 col-12"
            style={{
              marginTop: isMobile ? 10 : 60,
            }}
          >
            <div className="content">
              <div className=" pb--60 swiper rbt-dot-bottom-center banner-swiper-active">
                <div className="swiper swiper-wrapper swiper-cards swiper-3d swiper-initialized swiper-horizontal swiper-watch-progress">
                  <div className="swiper-wrapper">
                    <Swiper
                      style={{
                        "--swiper-pagination-bottom": 0,
                        height: isMobile ? 500 : isTablet ? 440 : 550,
                        width: "100%",
                      }}
                      breakpoints={{
                        412: {
                          slidesPerView: 1,
                        },
                        680: {
                          slidesPerView: 2,
                          spaceBetween: 30,
                        },
                        768: {
                          slidesPerView: 2,
                          spaceBetween: 30,
                        },
                        1024: {
                          slidesPerView: 1,
                        },
                      }}
                      autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                      }}
                      pagination={{
                        clickable: true,
                      }}
                      modules={[Autoplay, Pagination]}
                      className="mySwiper"
                    >
                      {[1, 2, 3, 4].map((item, index) => {
                        return (
                          <SwiperSlide key={index}>
                            <TherapistCard />
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

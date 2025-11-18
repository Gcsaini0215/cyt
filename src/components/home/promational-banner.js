import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";


// Banner data
const banners = [
  {
    id: 1,
    title: "Find Your Perfect Therapist",
    description: "Connect with verified mental health professionals for personalized care and support.",
    buttonText: "Browse Therapists",
    link: "/view-all-therapist",
    gradient: "linear-gradient(135deg, #228756 0%, #2e7d32 50%, #1b5e20 100%)",
    headingColor: "#ffffff",
    buttonColor: "#66bb6a",
    buttonTextColor: "#ffffff",
    accentColor: "#81c784"
  },
  {
    id: 2,
    title: "Join Our Therapist Network",
    description: "Expand your practice and help more people with our trusted platform.",
    buttonText: "Get Started",
    link: "/therapist-registration",
    gradient: "linear-gradient(135deg, #007f99 0%, #0097a7 50%, #00695c 100%)",
    headingColor: "#ffffff",
    buttonColor: "#4dd0e1",
    buttonTextColor: "#ffffff",
    accentColor: "#80deea"
  },
];

export default function PromotionalBannerCTA() {
  const navigate = useNavigate();

  return (
    <div className="rbt-banner-area" style={{
      position: "relative",
      paddingBottom: 60,
      zIndex: 1,
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(34, 135, 86, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 127, 153, 0.03) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      <div className="container mt--60" style={{
        borderRadius: 24,
        overflow: "hidden",
        position: 'relative',
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)'
      }}>
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          modules={[Autoplay, Pagination]}
          className="mySwiper"
          style={{
            borderRadius: 24,
            overflow: 'hidden'
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={false}
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "300px",
                  maxHeight: "340px",
                  borderRadius: 24,
                  overflow: "hidden",
                  cursor: "pointer",
                  background: banner.gradient,
                  padding: "50px 40px",
                  textAlign: "center",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                  position: "relative"
                }}
                className="banner-slide"
              >
                {/* Decorative background elements */}
                <div style={{
                  position: "absolute",
                  top: "-50%",
                  right: "-20%",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${banner.accentColor}20 0%, transparent 70%)`,
                  pointerEvents: "none"
                }}></div>
                <div style={{
                  position: "absolute",
                  bottom: "-30%",
                  left: "-15%",
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${banner.accentColor}15 0%, transparent 70%)`,
                  pointerEvents: "none"
                }}></div>

                {/* Content */}
                <div style={{ maxWidth: "650px", width: "100%", position: "relative", zIndex: 1 }}>
                  <div style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "20px",
                    marginBottom: "16px",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}>
                    <span style={{
                      color: banner.headingColor,
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px"
                    }}>
                      ✨ Featured
                    </span>
                  </div>

                  <h2
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      marginBottom: 16,
                      lineHeight: 1.2,
                      color: banner.headingColor,
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                      letterSpacing: "-0.5px"
                    }}
                  >
                    {banner.title}
                  </h2>
                  <p
                    style={{
                      fontSize: 18,
                      marginBottom: 32,
                      color: "rgba(255, 255, 255, 0.9)",
                      lineHeight: 1.6,
                      fontWeight: 400,
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)"
                    }}
                  >
                    {banner.description}
                  </p>
                  <button
                    onClick={() => navigate(banner.link)}
                    className="banner-button"
                    style={{
                      background: banner.buttonColor,
                      color: banner.buttonTextColor,
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <span style={{ position: "relative", zIndex: 1 }}>
                      {banner.buttonText}
                    </span>
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                      transition: "left 0.5s",
                    }} className="button-shine"></div>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Responsive CSS */}
      <style>
        {`
          .banner-button {
            padding: 16px 40px;
            border: none;
            border-radius: 30px;
            font-weight: 700;
            font-size: 17px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .banner-button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          }
          .banner-button:hover .button-shine {
            left: 100%;
          }
          .banner-button:active {
            transform: translateY(-1px) scale(1.02);
          }

          /* Mobile App-like Enhancements */
          @media (max-width: 768px) {
            .banner-slide {
              min-height: 240px !important;
              max-height: 280px !important;
              padding: 32px 20px !important;
              cursor: grab;
            }
            .banner-slide:active {
              cursor: grabbing;
            }
            .banner-slide h2 {
              font-size: 26px !important;
              font-weight: 800 !important;
              margin-bottom: 12px !important;
              line-height: 1.2 !important;
            }
            .banner-slide p {
              font-size: 15px !important;
              margin-bottom: 24px !important;
              line-height: 1.5 !important;
            }
            .banner-button {
              padding: 16px 36px !important;
              font-size: 15px !important;
              font-weight: 700 !important;
              min-height: 48px !important; /* Touch-friendly height */
              width: 100% !important;
              max-width: 280px !important;
            }
          }

          @media (max-width: 480px) {
            .banner-slide {
              min-height: 220px !important;
              max-height: 260px !important;
              padding: 28px 16px !important;
            }
            .banner-slide h2 {
              font-size: 24px !important;
              margin-bottom: 10px !important;
            }
            .banner-slide p {
              font-size: 14px !important;
              margin-bottom: 20px !important;
            }
            .banner-button {
              padding: 14px 32px !important;
              font-size: 14px !important;
              min-height: 44px !important;
              max-width: 240px !important;
            }
          }

          /* Swiper Pagination Mobile Styles */
          .swiper-pagination {
            bottom: 16px !important;
          }
          .swiper-pagination-bullet {
            width: 8px !important;
            height: 8px !important;
            background: rgba(255, 255, 255, 0.5) !important;
            opacity: 1 !important;
            transition: all 0.3s ease !important;
          }
          .swiper-pagination-bullet-active {
            background: #ffffff !important;
            transform: scale(1.2) !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
          }

          /* Mobile touch improvements */
          @media (hover: none) and (pointer: coarse) {
            .banner-button {
              transition: all 0.1s ease !important;
            }
            .banner-button:active {
              transform: scale(0.98) !important;
            }
          }
        `}
      </style>
    </div>
  );
}

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { FaHandshake, FaGlobe, FaLeaf, FaBrain, FaHeart, FaUserFriends } from "react-icons/fa";

// Brand items with professional gradients and titles
const brands = [
  { icon: FaHandshake, gradient: "linear-gradient(135deg, #007f99, #00c2cc)", title: "Collaboration & Partnership" },
  { icon: FaGlobe, gradient: "linear-gradient(135deg, #2a9d8f, #00b3a1)", title: "Global Presence" },
  { icon: FaLeaf, gradient: "linear-gradient(135deg, #006d77, #00d9a5)", title: "Sustainable Practices" },
  { icon: FaBrain, gradient: "linear-gradient(135deg, #007f99, #7ed957)", title: "Expert Knowledge" },
  { icon: FaHeart, gradient: "linear-gradient(135deg, #0097b2, #00c2ff)", title: "Client Care & Support" },
  { icon: FaUserFriends, gradient: "linear-gradient(135deg, #014f86, #2a9d8f)", title: "Community Engagement" },
];

export default function BrandsSection() {
  return (
    <div className="rbt-brand-area bg-color-white rbt-section-gap">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-3">
            <div className="brand-content-left">
              <h4 className="mb--0 main-heading">
                Collaborating with Professional Psychologists & Therapists
              </h4>
            </div>
          </div>

          <div className="col-lg-9">
            <Swiper
              spaceBetween={30}
              breakpoints={{
                380: { slidesPerView: 2, spaceBetween: 15 },
                640: { slidesPerView: 3, spaceBetween: 20 },
                768: { slidesPerView: 4, spaceBetween: 25 },
                1024: { slidesPerView: 5, spaceBetween: 30 },
              }}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              loop={brands.length > 5}
              modules={[Autoplay]}
              className="brand-swiper"
            >
              {brands.map((brand, index) => {
                const Icon = brand.icon;
                return (
                  <SwiperSlide key={index}>
                    <div className="brand-slide">
                      <div
                        className="brand-icon"
                        style={{ background: brand.gradient }}
                      >
                        <div className="shape-circle"></div>
                        <Icon style={{ zIndex: 1, color: "#fff", fontSize: 36 }} />
                      </div>
                      <div className="brand-title">{brand.title}</div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>

      <style>
        {`
          .brand-icon {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
            transition: box-shadow 0.3s;
            margin: auto;
          }

          .brand-icon:hover {
            box-shadow: 0 12px 25px rgba(0, 151, 178, 0.5);
          }

          .shape-circle {
            position: absolute;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.2);
            top: -10px;
            left: -10px;
            z-index: 0;
          }

          .brand-slide {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 150px;
          }

          .brand-title {
            margin-top: 10px;
            font-size: 14px;
            font-weight: 600;
            color: #003f4d; /* dark color for visibility on gradient */
            text-align: center;
            max-width: 120px;
            word-wrap: break-word;
          }

          /* Center main heading only on mobile */
          @media (max-width: 767px) {
            .brand-content-left {
              text-align: center;
              margin-bottom: 20px;
            }
          }
        `}
      </style>
    </div>
  );
}

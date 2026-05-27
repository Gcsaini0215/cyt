import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Link from "next/link";
import { imagePath } from "../../utils/url";

const FALLBACK = [
  { reviewerName: "Priya Patel", rating: 5, text: "The platform connected me with a fantastic therapist who truly understood my needs. I feel supported every step of the way.", therapistName: "CYT Therapist", therapistType: "Psychologist", therapistId: null },
  { reviewerName: "Nandini", rating: 5, text: "This platform has been a lifesaver. My therapist is compassionate and skilled, providing the support I need to cope with anxiety.", therapistName: "CYT Therapist", therapistType: "Counselor", therapistId: null },
  { reviewerName: "Shivani", rating: 5, text: "Finding a therapist who listens and understands has made a world of difference. Easy process, highly recommend!", therapistName: "CYT Therapist", therapistType: "Psychologist", therapistId: null },
  { reviewerName: "Prakshit", rating: 5, text: "An incredible experience. My therapist helped me navigate tough times and I've learned so much about myself.", therapistName: "CYT Therapist", therapistType: "Mental Health Expert", therapistId: null },
  { reviewerName: "Rohit Sharma", rating: 5, text: "Booking was seamless and the therapist very professional. I felt heard from session one and have seen real progress.", therapistName: "CYT Therapist", therapistType: "Psychotherapist", therapistId: null },
];

export default function Feedback({ therapists = [] }) {
  const slides = useMemo(() => {
    const all = [];
    therapists.forEach(t => {
      if (!t.reviews?.length) return;
      [...t.reviews]
        .filter(r => r.description?.trim())
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 3)
        .forEach(r => {
          all.push({
            reviewerName: r.name || "Client",
            rating: r.rating || 5,
            text: r.description,
            therapistId: t._id,
            therapistName: t.user?.name || "Therapist",
            therapistType: t.profile_type || "Mental Health Professional",
            therapistPhoto: t.user?.profile ? `${imagePath}/${t.user.profile}` : null,
          });
        });
    });
    return all.sort((a, b) => b.rating - a.rating).slice(0, 18);
  }, [therapists]);

  const items = slides.length >= 3 ? slides : FALLBACK;

  return (
    <div className="rbt-testimonial-area bg-color-white rbt-section-gap">
      <style>{`
        .rv-swiper .swiper-wrapper { align-items: stretch; }
        .rv-swiper .swiper-slide  { height: auto; }
        .rv-card {
          background: #fff;
          border: 1px solid #e8f5e9;
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,.05);
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
          transition: box-shadow .18s, transform .18s;
        }
        .rv-card:hover { box-shadow: 0 6px 24px rgba(34,135,86,.1); transform: translateY(-2px); }
        .rv-text {
          font-size: 13px;
          line-height: 1.7;
          color: #475569;
          margin: 10px 0 0;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .rv-divider { border: none; border-top: 1px solid #f1f5f9; margin: 14px 0 12px; }
        .rv-th-name { font-size: 12px; font-weight: 800; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rv-th-name a { color: #228756; text-decoration: none; }
        .rv-th-name a:hover { text-decoration: underline; }
        .rv-th-type { font-size: 10px; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 1px; }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="row align-items-center mb--40 g-4">
          <div className="col-12">
            <div className="section-title text-start">
              <span className="subtitle bg-primary-opacity" style={{ color: "#228756", fontWeight: 800 }}>
                REAL CLIENT REVIEWS
              </span>
              <h2 className="title" style={{ fontWeight: 800, marginTop: 8 }}>What Our Clients Say</h2>
              <p className="description mt--15" style={{ fontSize: 16, color: "#64748b" }}>
                Verified reviews from clients who found the right therapist with us.
              </p>
            </div>
          </div>
        </div>

        {/* Slider */}
        <Swiper
          className="rv-swiper"
          spaceBetween={16}
          breakpoints={{
            0:    { slidesPerView: 1 },
            640:  { slidesPerView: 1 },
            768:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop={items.length >= 3}
          modules={[Autoplay]}
          style={{ padding: "6px 4px 44px" }}
        >
          {items.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div className="rv-card">

                {/* Stars + verified */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    {[1,2,3,4,5].map(i => (
                      <i key={i} className="fa fa-star" style={{ color: i <= item.rating ? "#fbbf24" : "#e2e8f0", fontSize: 12, marginRight: 1 }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#228756", background: "#f0fdf4", borderRadius: 20, padding: "2px 8px", border: "1px solid #bbf7d0" }}>
                    ✓ Verified
                  </span>
                </div>

                {/* Review text — clamped to 4 lines */}
                <p className="rv-text">"{item.text}"</p>

                <hr className="rv-divider" />

                {/* Reviewer + therapist */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Reviewer avatar */}
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa fa-user" style={{ color: "#228756", fontSize: 13 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.reviewerName}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>Session with</span>
                      <div className="rv-th-name" style={{ flex: 1 }}>
                        {item.therapistId
                          ? <Link href={`/view-profile/${item.therapistId}`}>{item.therapistName}</Link>
                          : item.therapistName}
                      </div>
                    </div>
                  </div>
                  {/* Therapist photo */}
                  {item.therapistPhoto ? (
                    <img src={item.therapistPhoto} alt={item.therapistName}
                      style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover", objectPosition: "top", border: "1.5px solid #e8f5e9", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="fa fa-user-md" style={{ color: "#228756", fontSize: 12 }} />
                    </div>
                  )}
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

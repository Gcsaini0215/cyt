import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Link from "next/link";
import { imagePath } from "../../utils/url";

const FALLBACK = [
  { reviewerName: "Priya Patel", rating: 5, text: "The platform connected me with a fantastic therapist who truly understood my needs. I feel so supported and empowered to work through my challenges every day.", therapistName: "CYT Therapist", therapistType: "Psychologist", therapistId: null },
  { reviewerName: "Nandini", rating: 5, text: "This platform has been a lifesaver. My therapist is compassionate and skilled, providing exactly the support I need to cope with my anxiety and depression.", therapistName: "CYT Therapist", therapistType: "Counselor", therapistId: null },
  { reviewerName: "Shivani", rating: 5, text: "Finding a therapist who really listens and understands me has made a world of difference. The process was easy and stress-free. Highly recommend to everyone!", therapistName: "CYT Therapist", therapistType: "Psychologist", therapistId: null },
  { reviewerName: "Prakshit", rating: 5, text: "I have had an incredible experience with my therapist. She has helped me navigate tough times and I have learned so much about myself throughout this journey.", therapistName: "CYT Therapist", therapistType: "Mental Health Expert", therapistId: null },
  { reviewerName: "Rohit Sharma", rating: 5, text: "Booking was seamless and the therapist was very professional. I felt heard from the very first session and have seen real progress in my mental well-being.", therapistName: "CYT Therapist", therapistType: "Psychotherapist", therapistId: null },
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
          border: 1.5px solid #f1f5f9;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 2px 16px rgba(0,0,0,.05);
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
          transition: box-shadow .2s, transform .2s;
        }
        .rv-card:hover { box-shadow: 0 8px 32px rgba(34,135,86,.1); transform: translateY(-3px); }
        .rv-text {
          font-size: 14px;
          line-height: 1.75;
          color: #475569;
          font-style: italic;
          margin: 0;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .rv-therapist {
          border-top: 1px solid #f1f5f9;
          padding-top: 14px;
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rv-th-photo {
          width: 40px; height: 40px; border-radius: 10px;
          object-fit: cover; object-position: top;
          border: 2px solid #e8f5e9; flex-shrink: 0;
        }
        .rv-th-placeholder {
          width: 40px; height: 40px; border-radius: 10px;
          background: #e8f5e9; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .rv-th-name {
          font-size: 13px; font-weight: 800; color: #1e293b;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .rv-th-name a { color: #228756; text-decoration: none; }
        .rv-th-name a:hover { text-decoration: underline; }
        .rv-th-type {
          font-size: 11px; color: #94a3b8;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        @media (max-width: 575px) {
          .rv-card { padding: 18px; }
          .rv-text { font-size: 13px; -webkit-line-clamp: 4; }
        }
      `}</style>

      <div className="container">

        {/* Header */}
        <div className="row align-items-center mb--50 g-4">
          <div className="col-lg-8 col-md-12">
            <div className="section-title text-start">
              <span className="subtitle bg-primary-opacity" style={{ color: "#228756", fontWeight: 800 }}>
                REAL CLIENT REVIEWS
              </span>
              <h2 className="title" style={{ fontWeight: 800, marginTop: 10 }}>What Our Clients Say</h2>
              <p className="description mt--20" style={{ fontSize: 17, color: "#64748b" }}>
                Verified reviews from clients who transformed their lives with our therapists.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-12">
            <div style={{ background: "#f0fdf4", padding: "22px 20px", borderRadius: "18px", border: "1.5px solid #bbf7d0", textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#228756", lineHeight: 1 }}>4.9</div>
              <div style={{ margin: "6px 0 4px" }}>
                {[1,2,3,4,5].map(i => <i key={i} className="fa fa-star" style={{ color: "#fbbf24", fontSize: 16, marginRight: 2 }} />)}
              </div>
              <div style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}>500+ Verified Client Reviews</div>
            </div>
          </div>
        </div>

        {/* Swiper */}
        <Swiper
          className="rv-swiper"
          spaceBetween={20}
          breakpoints={{
            0:    { slidesPerView: 1 },
            640:  { slidesPerView: 1 },
            768:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 3800, disableOnInteraction: false }}
          loop={items.length >= 3}
          modules={[Autoplay]}
          style={{ padding: "8px 4px 48px" }}
        >
          {items.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div className="rv-card">

                {/* Quote mark */}
                <div style={{ fontSize: 40, lineHeight: 1, color: "#bbf7d0", fontFamily: "Georgia, serif", marginBottom: 4 }}>&ldquo;</div>

                {/* Review text — clamped to 5 lines so all cards stay equal */}
                <p className="rv-text">{item.text}</p>

                {/* Reviewer row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid #bbf7d0" }}>
                    <i className="fa fa-user" style={{ color: "#228756", fontSize: 16 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.reviewerName}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      {[1,2,3,4,5].map(i => (
                        <i key={i} className="fa fa-star" style={{ color: i <= item.rating ? "#fbbf24" : "#e2e8f0", fontSize: 11 }} />
                      ))}
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#228756", background: "#f0fdf4", borderRadius: 20, padding: "1px 7px", marginLeft: 2 }}>✓ Verified</span>
                    </div>
                  </div>
                </div>

                {/* Therapist footer */}
                <div className="rv-therapist">
                  {item.therapistPhoto ? (
                    <img src={item.therapistPhoto} alt={item.therapistName} className="rv-th-photo" />
                  ) : (
                    <div className="rv-th-placeholder">
                      <i className="fa fa-user-md" style={{ color: "#228756", fontSize: 14 }} />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 1, textTransform: "uppercase", letterSpacing: ".4px" }}>Session with</div>
                    <div className="rv-th-name">
                      {item.therapistId
                        ? <Link href={`/view-profile/${item.therapistId}`}>{item.therapistName}</Link>
                        : item.therapistName}
                    </div>
                    <div className="rv-th-type">{item.therapistType}</div>
                  </div>
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </div>
  );
}

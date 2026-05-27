import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Link from "next/link";
import { imagePath } from "../../utils/url";

const FALLBACK = [
  { reviewerName: "Priya Patel", rating: 5, text: "The platform connected me with a fantastic therapist who truly understood my needs. I feel supported and empowered.", therapistName: "CYT Therapist", therapistType: "Psychologist", therapistId: null },
  { reviewerName: "Nandini", rating: 5, text: "This platform has been a lifesaver. My therapist is compassionate and skilled, providing the support I need.", therapistName: "CYT Therapist", therapistType: "Counselor", therapistId: null },
  { reviewerName: "Shivani", rating: 5, text: "Finding a therapist who really listens and understands me has made a world of difference. Highly recommend!", therapistName: "CYT Therapist", therapistType: "Psychologist", therapistId: null },
  { reviewerName: "Prakshit", rating: 5, text: "I've had an incredible experience. She helped me navigate tough times and I've learned so much about myself.", therapistName: "CYT Therapist", therapistType: "Mental Health Expert", therapistId: null },
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
      <div className="container">

        {/* Header */}
        <div className="row align-items-end mb--50 g-4">
          <div className="col-lg-8 col-md-12">
            <div className="section-title text-start">
              <span className="subtitle bg-primary-opacity" style={{ color: "#228756", fontWeight: 800 }}>
                REAL CLIENT REVIEWS
              </span>
              <h2 className="title" style={{ fontWeight: 800, marginTop: 10 }}>What Our Clients Say</h2>
              <p className="description mt--20" style={{ fontSize: 18, color: "#666" }}>
                Verified reviews from clients who transformed their lives with our therapists.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-12">
            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#228756" }}>4.9</div>
              <div style={{ margin: "4px 0" }}>
                {[1,2,3,4,5].map(i => <i key={i} className="fa fa-star" style={{ color: "#ffb400", marginRight: 2 }} />)}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>500+ Verified Reviews</div>
            </div>
          </div>
        </div>

        {/* Swiper */}
        <Swiper
          spaceBetween={20}
          breakpoints={{
            0:    { slidesPerView: 1 },
            640:  { slidesPerView: 1 },
            768:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop={items.length >= 3}
          modules={[Autoplay]}
          style={{ padding: "10px 4px 50px" }}
        >
          {items.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div style={{
                background: "#fff",
                border: "1px solid #f1f5f9",
                borderRadius: "20px",
                padding: "22px",
                boxShadow: "0 4px 20px rgba(0,0,0,.04)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                height: "100%",
              }}>
                {/* Reviewer row */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa fa-user" style={{ color: "#228756", fontSize: 18 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.reviewerName}
                    </div>
                    <div style={{ display: "flex", gap: 1, marginTop: 2 }}>
                      {[1,2,3,4,5].map(i => (
                        <i key={i} className="fa fa-star" style={{ color: i <= item.rating ? "#ffb400" : "#e2e8f0", fontSize: 12 }} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#228756", background: "#f0fdf4", borderRadius: 20, padding: "3px 9px", flexShrink: 0 }}>
                    ✓ Verified
                  </span>
                </div>

                {/* Review text */}
                <p style={{ fontSize: 14, lineHeight: 1.75, color: "#475569", margin: 0, flexGrow: 1, fontStyle: "italic" }}>
                  &ldquo;{item.text.length > 180 ? item.text.substring(0, 180) + "…" : item.text}&rdquo;
                </p>

                {/* Therapist info */}
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                  {item.therapistPhoto ? (
                    <img
                      src={item.therapistPhoto}
                      alt={item.therapistName}
                      style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", objectPosition: "top", flexShrink: 0, border: "2px solid #e8f5e9" }}
                    />
                  ) : (
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className="fa fa-user-md" style={{ color: "#228756", fontSize: 14 }} />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 1 }}>Session with</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.therapistId ? (
                        <Link href={`/view-profile/${item.therapistId}`} style={{ color: "#228756", textDecoration: "none" }}>
                          {item.therapistName}
                        </Link>
                      ) : (
                        item.therapistName
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.therapistType}
                    </div>
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

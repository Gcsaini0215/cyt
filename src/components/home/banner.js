import { useState, useEffect } from "react";
import { Star, CheckCircle, CalendarMonth, LocationOn, Language, Work, ArrowForward, Close, QuestionAnswer } from "@mui/icons-material";
import { Avatar, Box, Typography, IconButton, Dialog, Chip } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { getTherapistProfiles, imagePath, defaultProfile } from "../../utils/url";
import ConsultationForm from "./consultation-form";

const SPECIALTIES = [
  "All", "Anxiety", "Depression", "Stress", "Relationship", "Trauma",
  "Child & Adolescent", "Career", "OCD", "Sleep Issues", "Grief",
];

export default function Banner({ topTherapists = [], userCity = null }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [therapistCount, setTherapistCount] = useState(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const h = (e) => setIsMobile(e.matches);
    mq.addListener(h);
    return () => mq.removeListener(h);
  }, []);

  useEffect(() => {
    fetch(getTherapistProfiles)
      .then(r => r.json())
      .then(res => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (list.length > 0) setTherapistCount(list.length);
      })
      .catch(() => {});
  }, []);

  const filteredTherapists = topTherapists.filter(t => {
    if (activeFilter === "All") return true;
    const exp = (t.experties || t.services || "").toLowerCase();
    return exp.includes(activeFilter.toLowerCase());
  });

  const displayList = filteredTherapists.length > 0 ? filteredTherapists : topTherapists;

  const stats = [
    { value: therapistCount ? `${therapistCount}+` : "500+", label: "Verified Experts", icon: <CheckCircle sx={{ fontSize: 20, color: "#228756" }} /> },
    { value: "10,000+", label: "Sessions Done", icon: <CalendarMonth sx={{ fontSize: 20, color: "#228756" }} /> },
    { value: "4.9★", label: "Avg Rating", icon: <Star sx={{ fontSize: 20, color: "#f59e0b" }} /> },
    { value: "100%", label: "Confidential", icon: <CheckCircle sx={{ fontSize: 20, color: "#228756" }} /> },
  ];

  return (
    <>
      <style jsx global>{`
        .cyt-banner { background: #ffffff; }
        .specialty-chip {
          cursor: pointer;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #374151;
          padding: 7px 16px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
        }
        .specialty-chip:hover { border-color: #228756; color: #228756; background: #f0fdf4; }
        .specialty-chip.active { background: #228756; color: #fff; border-color: #228756; }
        .therapist-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
        .therapist-scroll::-webkit-scrollbar { height: 4px; }
        .therapist-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .therapist-scroll::-webkit-scrollbar-thumb { background: #228756; border-radius: 4px; }
        .t-card { min-width: 200px; max-width: 200px; scroll-snap-align: start; background: #fff; border-radius: 16px; border: 1.5px solid #e8f5e9; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; transition: all 0.25s ease; flex-shrink: 0; }
        .t-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(34,135,86,0.14); border-color: #228756; }
        .book-btn { display: block; text-align: center; background: #228756; color: #fff; font-size: 12px; font-weight: 700; padding: 9px; text-decoration: none; letter-spacing: 0.5px; transition: background 0.2s; }
        .book-btn:hover { background: #1a6b44; }
        .consult-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 2px solid #228756; color: #228756; font-weight: 700; font-size: 14px; padding: 12px 26px; border-radius: 50px; text-decoration: none; transition: all 0.2s; }
        .consult-btn:hover { background: #f0fdf4; }
        .browse-btn { display: inline-flex; align-items: center; gap: 8px; background: #228756; color: #fff; font-weight: 700; font-size: 14px; padding: 13px 28px; border-radius: 50px; text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 16px rgba(34,135,86,0.3); }
        .browse-btn:hover { background: #1a6b44; box-shadow: 0 6px 20px rgba(34,135,86,0.4); }
      `}</style>

      <section className="cyt-banner" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <div className="container" style={{ paddingTop: isMobile ? "24px" : "48px", paddingBottom: isMobile ? "24px" : "40px" }}>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: isMobile ? "20px" : "32px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "50px", padding: "5px 14px", marginBottom: "14px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#228756", display: "inline-block" }}></span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#228756", letterSpacing: "0.5px" }}>
                {userCity ? `Therapists in ${userCity}` : "India's Trusted Therapy Platform"}
              </span>
            </div>
            <h1 style={{
              fontSize: isMobile ? "2.2rem" : "3.4rem",
              fontWeight: 900,
              color: "#0f172a",
              margin: 0,
              marginBottom: "12px",
              lineHeight: 1.15,
              letterSpacing: "-0.04em",
              fontFamily: "'Inter', sans-serif",
            }}>
              Find Verified{" "}
              <span style={{
                position: "relative",
                display: "inline-block",
                color: "#228756",
              }}>
                Therapists
                <svg viewBox="0 0 220 12" style={{ position: "absolute", bottom: "-4px", left: 0, width: "100%", height: "10px" }} preserveAspectRatio="none">
                  <path d="M2,8 Q55,2 110,8 Q165,14 218,6" stroke="#228756" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"/>
                </svg>
              </span>
              <br />Near You
            </h1>
            <p style={{ fontSize: isMobile ? "14px" : "16px", color: "#64748b", margin: "0 auto", maxWidth: "520px", lineHeight: 1.6, fontWeight: 400 }}>
              Book online or in-person sessions with verified mental health experts across India.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px", flexWrap: "wrap" }}>
              <Link href="/view-all-therapist" className="browse-btn">
                Browse Therapists <ArrowForward sx={{ fontSize: 18 }} />
              </Link>
              <button onClick={() => setIsConsultationOpen(true)} className="consult-btn" style={{ border: "2px solid #228756", background: "#fff", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                Free Consultation
              </button>
            </div>
          </div>

          {/* Specialty Filter Chips */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginBottom: "20px", scrollbarWidth: "none" }}>
            {SPECIALTIES.map(s => (
              <button
                key={s}
                className={`specialty-chip${activeFilter === s ? " active" : ""}`}
                onClick={() => setActiveFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Therapist Cards Row */}
          <div className="therapist-scroll" style={{ marginBottom: "24px" }}>
            {displayList.length > 0 ? displayList.slice(0, 12).map((t, i) => {
              const avgRating = t.reviews?.length > 0
                ? (t.reviews.reduce((a, r) => a + (r.rating || 5), 0) / t.reviews.length).toFixed(1)
                : null;
              return (
                <div key={i} className="t-card" onClick={() => { setSelectedTherapist(t); setIsProfileOpen(true); }}>
                  {/* Photo */}
                  <div style={{ position: "relative", height: "180px", background: "#f8fafc", overflow: "hidden" }}>
                    <Avatar
                      src={t.user?.profile ? `${imagePath}/${t.user.profile}` : undefined}
                      alt={t.user?.name || "Therapist"}
                      variant="square"
                      sx={{ width: "100%", height: "100%", borderRadius: 0, "& img": { objectFit: "cover", objectPosition: "top center" } }}
                    />
                    {avgRating && (
                      <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "3px" }}>
                        <Star sx={{ fontSize: 11, color: "#f59e0b" }} /> {avgRating}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "12px 12px 0" }}>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.user?.name || "Therapist"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#228756", fontWeight: 600, marginBottom: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.profile_type || "Mental Health Professional"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "10px" }}>
                      {t.state && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <LocationOn sx={{ fontSize: 12, color: "#94a3b8" }} />
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{t.state}</span>
                        </div>
                      )}
                      {t.year_of_exp && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Work sx={{ fontSize: 12, color: "#94a3b8" }} />
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{t.year_of_exp} exp</span>
                        </div>
                      )}
                      {t.language_spoken && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Language sx={{ fontSize: 12, color: "#94a3b8" }} />
                          <span style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>{t.language_spoken}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href={`/view-profile/${t._id}`} className="book-btn" onClick={e => e.stopPropagation()}>
                    View Profile
                  </Link>
                </div>
              );
            }) : (
              [0,1,2,3,4].map(i => (
                <div key={i} className="t-card" style={{ height: "300px", background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              ))
            )}
          </div>

          {/* Stats Bar */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: isMobile ? "16px" : "40px",
            flexWrap: "wrap",
            paddingTop: "20px",
            borderTop: "1px solid #f1f5f9",
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {s.icon}
                <div>
                  <div style={{ fontWeight: 800, fontSize: isMobile ? "15px" : "18px", color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, marginTop: "2px" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Consultation Modal */}
      <Dialog open={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ style: { borderRadius: "20px", margin: isMobile ? "12px" : "32px" } }}>
        <Box sx={{ background: "linear-gradient(135deg, #166534 0%, #228756 100%)", px: 3, pt: 3, pb: 3.5, position: "relative", textAlign: "center" }}>
          <IconButton onClick={() => setIsConsultationOpen(false)} size="small" sx={{ position: "absolute", top: 10, right: 10, color: "rgba(255,255,255,0.8)" }}>
            <Close fontSize="small" />
          </IconButton>
          <QuestionAnswer sx={{ fontSize: 28, color: "#fff", mb: 1 }} />
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "18px" }}>Free Consultation</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", mt: 0.5 }}>Talk to a therapist — no commitment needed</Typography>
        </Box>
        <Box sx={{ px: 3, py: 3, overflowY: "auto", maxHeight: "60vh" }}>
          <ConsultationForm showHeading={false} showLocation={false} showSource={false} />
        </Box>
      </Dialog>

      {/* Therapist Quick View Modal */}
      <Dialog open={isProfileOpen} onClose={() => setIsProfileOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "20px", m: isMobile ? 2 : 3 } }}>
        <Box sx={{ p: 3, position: "relative" }}>
          <IconButton onClick={() => setIsProfileOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
          {selectedTherapist && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Avatar src={selectedTherapist.user?.profile ? `${imagePath}/${selectedTherapist.user.profile}` : undefined} sx={{ width: 72, height: 72 }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>{selectedTherapist.user?.name}</Typography>
                  <Typography sx={{ fontSize: "12px", color: "#228756", fontWeight: 600 }}>{selectedTherapist.profile_type}</Typography>
                  {selectedTherapist.state && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <LocationOn sx={{ fontSize: 13, color: "#94a3b8" }} />
                      <Typography sx={{ fontSize: "12px", color: "#64748b" }}>{selectedTherapist.state}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              <Typography sx={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {selectedTherapist.user?.bio || selectedTherapist.about_me || "Verified mental health professional dedicated to your well-being."}
              </Typography>
              <Link href={`/view-profile/${selectedTherapist._id}`} style={{
                display: "block", textAlign: "center", background: "#228756", color: "#fff",
                fontWeight: 700, fontSize: "14px", padding: "13px", borderRadius: "12px",
                textDecoration: "none",
              }}>
                View Full Profile
              </Link>
            </Box>
          )}
        </Box>
      </Dialog>
    </>
  );
}

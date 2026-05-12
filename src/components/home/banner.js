import { useState, useEffect } from "react";
import { Star, CheckCircle, CalendarMonth, LocationOn, Work, Language, ArrowForward, Close, QuestionAnswer } from "@mui/icons-material";
import { Avatar, Box, Typography, IconButton, Dialog } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { getTherapistProfiles, imagePath, defaultProfile } from "../../utils/url";
import ConsultationForm from "./consultation-form";

export default function Banner({ topTherapists = [], userCity = null }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [therapistCount, setTherapistCount] = useState(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const h = e => setIsMobile(e.matches);
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

  const stats = [
    { value: therapistCount ? `${therapistCount}+` : "500+", label: "Verified Experts" },
    { value: "10,000+", label: "Sessions Done" },
    { value: "4.9★", label: "Avg Rating" },
    { value: "100%", label: "Confidential" },
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        .hero-card { animation: floatCard 4s ease-in-out infinite; background: rgba(255,255,255,0.12); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 14px; color: #fff; min-width: 160px; }
        .hero-card:nth-child(2) { animation-delay: 1.3s; }
        .hero-card:nth-child(3) { animation-delay: 2.6s; }
        .t-strip-card { background: #fff; border-radius: 14px; overflow: hidden; min-width: 170px; max-width: 170px; flex-shrink: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.12); transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
        .t-strip-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(0,0,0,0.18); }
        .strip-book-btn { display: block; text-align: center; background: #228756; color: #fff; font-size: 11px; font-weight: 700; padding: 9px; text-decoration: none; letter-spacing: 0.5px; text-transform: uppercase; }
        .strip-book-btn:hover { background: #1a6b44; }
        .hero-browse-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #166534; font-weight: 800; font-size: 15px; padding: 14px 32px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: all 0.25s ease; }
        .hero-browse-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.2); }
        .hero-consult-btn { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #fff; font-weight: 700; font-size: 15px; padding: 13px 28px; border-radius: 50px; text-decoration: none; border: 2px solid rgba(255,255,255,0.6); transition: all 0.25s ease; cursor: pointer; font-family: inherit; }
        .hero-consult-btn:hover { background: rgba(255,255,255,0.12); border-color: #fff; }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section style={{
        background: "linear-gradient(135deg, #0d3320 0%, #166534 40%, #1a7a4a 70%, #228756 100%)",
        position: "relative",
        overflow: "hidden",
        paddingTop: isMobile ? "48px" : "70px",
        paddingBottom: isMobile ? "120px" : "140px",
      }}>
        {/* Background pattern */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        {/* Glow blobs */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(34,135,86,0.5) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "300px", height: "300px", background: "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "40px", flexDirection: isMobile ? "column" : "row" }}>

            {/* LEFT — Text */}
            <div style={{ flex: 1, animation: "fadeUp 0.7s ease both" }}>
              {/* Pill badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "50px", padding: "6px 16px", marginBottom: "20px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 6px #4ade80" }}></span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.5px" }}>
                  {userCity ? `Therapists in ${userCity}` : "India's Most Trusted Therapy Platform"}
                </span>
              </div>

              {/* Heading */}
              <h1 style={{
                fontSize: isMobile ? "2.4rem" : "3.8rem",
                fontWeight: 900,
                color: "#ffffff",
                margin: 0,
                marginBottom: "16px",
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
                fontFamily: "'Inter', sans-serif",
              }}>
                Your Mental Health<br />
                <span style={{
                  background: "linear-gradient(90deg, #86efac, #4ade80)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>Matters.</span>
              </h1>

              <p style={{ fontSize: isMobile ? "14px" : "17px", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: 0, marginBottom: "32px", maxWidth: "460px", fontWeight: 400 }}>
                Connect with verified therapists across India. Book online or in-person sessions for anxiety, depression, stress & more.
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <Link href="/view-all-therapist" className="hero-browse-btn">
                  Find a Therapist <ArrowForward sx={{ fontSize: 18 }} />
                </Link>
                <button className="hero-consult-btn" onClick={() => setIsConsultationOpen(true)}>
                  Free Consult
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: isMobile ? "20px" : "32px", flexWrap: "wrap", marginTop: "36px" }}>
                {stats.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 500, marginTop: "3px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Floating therapist cards (desktop only) */}
            {!isMobile && topTherapists.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", animation: "fadeUp 0.9s ease both", flexShrink: 0 }}>
                {topTherapists.slice(0, 3).map((t, i) => {
                  const avgRating = t.reviews?.length > 0
                    ? (t.reviews.reduce((a, r) => a + (r.rating || 5), 0) / t.reviews.length).toFixed(1)
                    : null;
                  return (
                    <div key={i} className="hero-card" style={{ animationDelay: `${i * 1.3}s`, cursor: "pointer" }} onClick={() => { setSelectedTherapist(t); setIsProfileOpen(true); }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Avatar src={t.user?.profile ? `${imagePath}/${t.user.profile}` : undefined} alt={t.user?.name} sx={{ width: 46, height: 46, border: "2px solid rgba(255,255,255,0.4)" }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: "13px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px" }}>{t.user?.name || "Therapist"}</div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "1px" }}>{t.profile_type || "Therapist"}</div>
                          {avgRating && (
                            <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "3px" }}>
                              <Star sx={{ fontSize: 11, color: "#fbbf24" }} />
                              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>{avgRating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── THERAPIST STRIP (overlapping hero) ── */}
      <div style={{ background: "#f8fafc", paddingTop: "0", paddingBottom: "32px" }}>
        <div className="container">
          <div style={{
            marginTop: isMobile ? "-80px" : "-90px",
            background: "#fff",
            borderRadius: "20px",
            padding: isMobile ? "16px" : "20px 24px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.10)",
            border: "1px solid #f1f5f9",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>Top Therapists</span>
              <Link href="/view-all-therapist" style={{ fontSize: "13px", fontWeight: 700, color: "#228756", textDecoration: "none" }}>View All →</Link>
            </div>
            <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "none" }}>
              {topTherapists.length > 0 ? topTherapists.slice(0, 10).map((t, i) => {
                const avgRating = t.reviews?.length > 0
                  ? (t.reviews.reduce((a, r) => a + (r.rating || 5), 0) / t.reviews.length).toFixed(1)
                  : null;
                return (
                  <div key={i} className="t-strip-card" onClick={() => { setSelectedTherapist(t); setIsProfileOpen(true); }}>
                    <div style={{ height: "150px", background: "#f8fafc", overflow: "hidden" }}>
                      <Avatar
                        src={t.user?.profile ? `${imagePath}/${t.user.profile}` : undefined}
                        alt={t.user?.name}
                        variant="square"
                        sx={{ width: "100%", height: "100%", borderRadius: 0, "& img": { objectFit: "cover", objectPosition: "top center" } }}
                      />
                    </div>
                    <div style={{ padding: "10px 10px 8px" }}>
                      <div style={{ fontWeight: 800, fontSize: "13px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.user?.name || "Therapist"}</div>
                      <div style={{ fontSize: "10px", color: "#228756", fontWeight: 600, marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.profile_type}</div>
                      {avgRating && (
                        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <Star sx={{ fontSize: 11, color: "#f59e0b" }} />
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>{avgRating}</span>
                        </div>
                      )}
                      {t.state && (
                        <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "3px" }}>
                          <LocationOn sx={{ fontSize: 11, color: "#94a3b8" }} />
                          <span style={{ fontSize: "10px", color: "#94a3b8" }}>{t.state}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/view-profile/${t._id}`} className="strip-book-btn" onClick={e => e.stopPropagation()}>
                      View Profile
                    </Link>
                  </div>
                );
              }) : (
                [0,1,2,3,4].map(i => (
                  <div key={i} style={{ minWidth: 170, height: 260, background: "#f1f5f9", borderRadius: 14, flexShrink: 0 }} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      <Dialog open={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ style: { borderRadius: "20px", margin: isMobile ? "12px" : "32px" } }}>
        <Box sx={{ background: "linear-gradient(135deg, #0d3320 0%, #228756 100%)", px: 3, pt: 3, pb: 3.5, position: "relative", textAlign: "center" }}>
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

      {/* Quick View Modal */}
      <Dialog open={isProfileOpen} onClose={() => setIsProfileOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "20px", m: isMobile ? 2 : 3 } }}>
        <Box sx={{ p: 3, position: "relative" }}>
          <IconButton onClick={() => setIsProfileOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
          {selectedTherapist && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Avatar src={selectedTherapist.user?.profile ? `${imagePath}/${selectedTherapist.user.profile}` : undefined} sx={{ width: 68, height: 68 }} />
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
              <Link href={`/view-profile/${selectedTherapist._id}`} style={{ display: "block", textAlign: "center", background: "#228756", color: "#fff", fontWeight: 700, fontSize: "14px", padding: "13px", borderRadius: "12px", textDecoration: "none" }}>
                View Full Profile
              </Link>
            </Box>
          )}
        </Box>
      </Dialog>
    </>
  );
}

import { useState, useEffect } from "react";
import { Shield, Favorite, Spa, ArrowForward, LocationOn, Close, QuestionAnswer, CalendarMonth, HeadsetMic } from "@mui/icons-material";
import { Avatar, Box, Typography, IconButton, Dialog, Button } from "@mui/material";
import Link from "next/link";
import { imagePath } from "../../utils/url";
import ConsultationForm from "./consultation-form";
import { useRouter } from "next/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function Banner({ topTherapists = [], userCity = null }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const tq = window.matchMedia("(max-width: 960px)");
    setIsMobile(mq.matches);
    setIsTablet(tq.matches);
    const hm = (e) => setIsMobile(e.matches);
    const ht = (e) => setIsTablet(e.matches);
    mq.addListener(hm); tq.addListener(ht);
    return () => { mq.removeListener(hm); tq.removeListener(ht); };
  }, []);

  const trustItems = [
    { icon: <Shield sx={{ fontSize: 22, color: "#228756" }} />, title: "Safe &", sub: "Confidential" },
    { icon: <Favorite sx={{ fontSize: 22, color: "#228756" }} />, title: "Verified &", sub: "Experienced" },
    { icon: <Spa sx={{ fontSize: 22, color: "#228756" }} />, title: "Personalized", sub: "Care" },
  ];

  const bottomStats = [
    { icon: <CalendarMonth sx={{ fontSize: 28, color: "#228756" }} />, title: "Flexible Appointments", sub: "Online & In-Person" },
    { icon: <Shield sx={{ fontSize: 28, color: "#228756" }} />, title: "100% Confidential", sub: "Your privacy is our priority" },
    { icon: <HeadsetMic sx={{ fontSize: 28, color: "#228756" }} />, title: "We're Here to Help", sub: "Every step of the way" },
  ];

  const displayTherapists = topTherapists.slice(0, 10);

  return (
    <>
      <style jsx global>{`
        @keyframes leafFloat {
          0%,100% { transform: translateY(0) rotate(-5deg); }
          50%      { transform: translateY(-12px) rotate(0deg); }
        }
        @keyframes leafFloat2 {
          0%,100% { transform: translateY(0) rotate(8deg); }
          50%      { transform: translateY(10px) rotate(2deg); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .banner-left-anim > * { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .banner-left-anim > *:nth-child(1) { animation-delay: 0.08s; }
        .banner-left-anim > *:nth-child(2) { animation-delay: 0.2s; }
        .banner-left-anim > *:nth-child(3) { animation-delay: 0.32s; }
        .banner-left-anim > *:nth-child(4) { animation-delay: 0.44s; }
        .banner-left-anim > *:nth-child(5) { animation-delay: 0.56s; }
        .banner-left-anim > *:nth-child(6) { animation-delay: 0.68s; }
        .therapist-banner-card { animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both; transition: transform 0.3s ease, box-shadow 0.3s ease !important; }
        .therapist-banner-card:hover { transform: translateY(-8px) !important; box-shadow: 0 20px 48px rgba(34,135,86,0.14) !important; }
        .browse-btn:hover { background: #1a6b44 !important; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(34,135,86,0.35) !important; }
      `}</style>

      <section style={{
        background: "linear-gradient(135deg, #f5f2ed 0%, #faf8f4 40%, #f0ede7 100%)",
        position: "relative",
        overflow: "hidden",
        paddingTop: isMobile ? "32px" : "60px",
        paddingBottom: isMobile ? "40px" : "0",
      }}>

        {/* Decorative leaf — top left */}
        <div style={{ position: "absolute", top: isMobile ? "-10px" : "-20px", left: isMobile ? "-20px" : "-30px", zIndex: 0, pointerEvents: "none", animation: "leafFloat 7s ease-in-out infinite" }}>
          <svg width={isMobile ? "120" : "200"} height={isMobile ? "120" : "200"} viewBox="0 0 200 200" fill="none">
            <path d="M20,180 Q60,20 180,10 Q160,80 120,120 Q80,160 20,180Z" fill="rgba(34,135,86,0.10)" />
            <path d="M30,170 Q65,35 170,20" stroke="rgba(34,135,86,0.20)" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        {/* Decorative leaf — top right */}
        <div style={{ position: "absolute", top: "-10px", right: "-20px", zIndex: 0, pointerEvents: "none", animation: "leafFloat2 9s ease-in-out infinite" }}>
          <svg width={isMobile ? "100" : "160"} height={isMobile ? "100" : "160"} viewBox="0 0 160 160" fill="none">
            <path d="M140,20 Q100,10 20,140 Q80,130 120,90 Q155,55 140,20Z" fill="rgba(34,135,86,0.08)" />
            <path d="M130,30 Q95,20 25,130" stroke="rgba(34,135,86,0.15)" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        {/* Organic blob — bottom left */}
        <div style={{ position: "absolute", bottom: "-60px", left: "-40px", width: "320px", height: "320px", background: "radial-gradient(ellipse, rgba(34,135,86,0.08) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }} />

        {/* Rounded white shape — right side (like reference) */}
        {!isMobile && (
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "50%", height: "100%",
            background: "rgba(255,255,255,0.45)",
            borderRadius: "60% 0 0 60% / 50% 0 0 50%",
            zIndex: 0, pointerEvents: "none",
          }} />
        )}

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: isMobile ? 0 : "40px",
            flexDirection: isMobile ? "column" : "row",
          }}>

            {/* ── LEFT ── */}
            <div className="banner-left-anim" style={{ flex: "0 0 auto", width: isMobile ? "100%" : "50%", paddingTop: isMobile ? 0 : "20px", paddingBottom: isMobile ? 0 : "80px", paddingRight: isMobile ? 0 : "40px" }}>

              {/* Main Heading */}
              <h1 style={{
                fontSize: isMobile ? "2.6rem" : isTablet ? "3rem" : "3.8rem",
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                color: "#1a2e1a",
                margin: 0,
                marginBottom: "12px",
                fontFamily: "'Inter', sans-serif",
              }}>
                Find the Right<br />Therapist for<br />
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: "#228756",
                  fontSize: isMobile ? "2.8rem" : "inherit",
                }}>
                  Your Journey
                </span>
              </h1>

              {/* Subtext */}
              <p style={{
                fontSize: isMobile ? "14px" : "15px",
                color: "#6b7280",
                lineHeight: 1.7,
                margin: 0,
                marginBottom: "28px",
                maxWidth: "340px",
              }}>
                Every person&apos;s journey is unique.<br />
                Choose a therapist who understands you<br />
                and supports you every step of the way.
              </p>

              {/* Trust items */}
              <div style={{ display: "flex", gap: isMobile ? "16px" : "20px", marginBottom: "32px", flexWrap: "wrap" }}>
                {trustItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "12px",
                      background: "rgba(34,135,86,0.08)",
                      border: "1px solid rgba(34,135,86,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", lineHeight: 1.3 }}>{item.title}</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", lineHeight: 1.3 }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href="/view-all-therapist" className="browse-btn" style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                background: "#228756",
                color: "white", fontWeight: 800,
                fontSize: isMobile ? "13px" : "14px",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                padding: isMobile ? "14px 28px" : "16px 36px",
                borderRadius: "50px", textDecoration: "none",
                boxShadow: "0 8px 24px rgba(34,135,86,0.28)",
                transition: "all 0.3s ease",
                marginBottom: isMobile ? "32px" : "0",
              }}>
                Browse Therapists <ArrowForward sx={{ fontSize: 18 }} />
              </Link>

              {/* Cursive quote — desktop only */}
              {!isMobile && (
                <div style={{ marginTop: "48px" }}>
                  <p style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "18px",
                    color: "#4b7a5a",
                    lineHeight: 1.8,
                    margin: 0,
                  }}>
                    You deserve support.<br />
                    You deserve to feel better.
                  </p>
                  <span style={{ fontSize: "20px", color: "#228756", marginTop: "4px", display: "block" }}>♡</span>
                </div>
              )}
            </div>

            {/* ── RIGHT ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Choose Your Therapist heading */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: isMobile ? "1.6rem" : "2rem",
                  fontWeight: 700,
                  color: "#1a2e1a",
                  margin: 0, marginBottom: "6px",
                }}>
                  Choose Your Therapist
                </h2>
                {/* Lotus divider */}
                <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                  <path d="M20,22 Q14,14 8,10 Q14,8 20,12 Q26,8 32,10 Q26,14 20,22Z" fill="rgba(34,135,86,0.5)" />
                  <path d="M20,18 Q18,10 20,4 Q22,10 20,18Z" fill="rgba(34,135,86,0.4)" />
                </svg>
              </div>

              {/* Therapist Cards — Swiper 2 at a time */}
              <style jsx global>{`
                .banner-swiper .swiper-button-next,
                .banner-swiper .swiper-button-prev {
                  width: 34px; height: 34px;
                  background: #228756; border-radius: 50%;
                  color: white !important;
                  box-shadow: 0 4px 14px rgba(34,135,86,0.35);
                  top: auto; bottom: -44px;
                }
                .banner-swiper .swiper-button-prev { left: calc(50% - 44px); }
                .banner-swiper .swiper-button-next { right: calc(50% - 44px); }
                .banner-swiper .swiper-button-next::after,
                .banner-swiper .swiper-button-prev::after { font-size: 13px !important; font-weight: 900 !important; }
              `}</style>
              <div style={{ paddingBottom: "64px" }}>
              {displayTherapists.length > 0 ? (
                <Swiper
                  className="banner-swiper"
                  modules={[Autoplay, Navigation]}
                  slidesPerView={isMobile ? 1 : 2}
                  spaceBetween={16}
                  loop={displayTherapists.length > 2}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  navigation={true}
                  style={{ paddingBottom: "8px" }}
                >
                  {displayTherapists.map((t, i) => {
                    const specialties = t.experties
                      ? t.experties.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3)
                      : t.services?.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3) || [];

                    return (
                      <SwiperSlide key={i}>
                        <div
                          className="therapist-banner-card"
                          style={{
                            background: "#ffffff",
                            borderRadius: "20px",
                            overflow: "hidden",
                            border: "1px solid #ede9e3",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                            animationDelay: `${0.3 + i * 0.15}s`,
                            cursor: "pointer",
                          }}
                          onClick={() => { setSelectedTherapist(t); setIsProfileOpen(true); }}
                        >
                          {/* Photo */}
                          <div style={{ position: "relative", height: isMobile ? "200px" : "220px", overflow: "hidden", background: "#f0ede7" }}>
                            <Avatar
                              src={t.user?.profile ? `${imagePath}/${t.user.profile}` : undefined}
                              alt={t.user?.name || "Therapist"}
                              sx={{
                                width: "100%", height: "100%",
                                borderRadius: 0,
                                "& img": { objectFit: "cover", objectPosition: "top center" }
                              }}
                              variant="square"
                            />
                            {t.year_of_exp && (
                              <div style={{
                                position: "absolute", bottom: "10px", right: "10px",
                                background: "rgba(34,135,86,0.92)",
                                color: "white", fontSize: "11px", fontWeight: 700,
                                padding: "5px 10px", borderRadius: "8px",
                                textAlign: "center", lineHeight: 1.3,
                                backdropFilter: "blur(4px)",
                              }}>
                                {t.year_of_exp}<br />Exp.
                              </div>
                            )}
                          </div>

                          {/* Card Body */}
                          <div style={{ padding: "16px" }}>
                            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#1a2e1a", margin: 0, marginBottom: "2px" }}>
                              {t.user?.name || "Therapist"}
                            </h3>
                            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, marginBottom: "4px", fontWeight: 500 }}>
                              {t.profile_type || "Mental Health Professional"}
                            </p>
                            <div style={{ width: "32px", height: "2px", background: "#228756", borderRadius: "2px", marginBottom: "10px" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "14px" }}>
                              {specialties.map((spec, si) => (
                                <div key={si} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                  <span style={{ fontSize: "13px", color: "#228756" }}>✦</span>
                                  <span style={{ fontSize: "12px", color: "#4b5563", fontWeight: 500 }}>{spec}</span>
                                </div>
                              ))}
                            </div>
                            <Link
                              href={`/view-profile/${t._id}`}
                              onClick={e => e.stopPropagation()}
                              style={{
                                display: "block", textAlign: "center",
                                background: "#228756", color: "white", fontWeight: 700,
                                fontSize: "12px", letterSpacing: "0.8px",
                                textTransform: "uppercase",
                                padding: "11px", borderRadius: "50px",
                                textDecoration: "none", transition: "all 0.3s ease",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#1a6b44"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#228756"; }}
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: "16px" }}>
                  {[0,1].map(i => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.6)", borderRadius: "20px", height: "340px", border: "1px solid #ede9e3", animation: "fadeUp 0.6s ease both", animationDelay: `${0.3+i*0.1}s` }} />
                  ))}
                </div>
              )}
              </div>

              {/* Bottom Stats Bar */}
              <div style={{
                display: "flex",
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: "1px solid #ede9e3",
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                marginBottom: isMobile ? 0 : "20px",
              }}>
                {bottomStats.map((s, i) => (
                  <div key={i} style={{
                    flex: 1,
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: isMobile ? "14px 10px" : "16px 18px",
                    borderRight: i < 2 ? "1px solid #ede9e3" : "none",
                  }}>
                    <div style={{ flexShrink: 0 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: isMobile ? "11px" : "13px", fontWeight: 700, color: "#1a2e1a", lineHeight: 1.3 }}>{s.title}</div>
                      {!isMobile && <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 400, marginTop: "2px" }}>{s.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Modal */}
      <Dialog open={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} maxWidth="xs" fullWidth style={{ zIndex: 99999 }}
        PaperProps={{ style: { borderRadius: "24px", margin: isMobile ? "12px" : "32px", overflow: "hidden" } }}>
        <Box sx={{ background: "linear-gradient(135deg, #166534 0%, #22c55e 100%)", px: 3, pt: 3.5, pb: 4, position: "relative", textAlign: "center" }}>
          <IconButton onClick={() => setIsConsultationOpen(false)} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "rgba(255,255,255,0.8)" }}>
            <Close fontSize="small" />
          </IconButton>
          <Box sx={{ width: 50, height: 50, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
            <QuestionAnswer sx={{ fontSize: 24, color: "#fff" }} />
          </Box>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "20px", mb: 0.5 }}>Free Consultation</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "13px" }}>Talk to a therapist — no commitment needed</Typography>
        </Box>
        <Box sx={{ px: 3, py: 3, overflowY: "auto", maxHeight: "65vh" }}>
          <ConsultationForm showHeading={false} showLocation={false} showSource={false} />
        </Box>
      </Dialog>

      {/* Therapist Quick View Modal */}
      <Dialog open={isProfileOpen} onClose={() => setIsProfileOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "24px", m: isMobile ? 2 : 3, maxHeight: "90vh" } }}>
        <Box sx={{ position: "relative", p: isMobile ? 3 : 4 }}>
          <IconButton onClick={() => setIsProfileOpen(false)} sx={{ position: "absolute", right: 8, top: 8, bgcolor: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <Close />
          </IconButton>
          {selectedTherapist && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                <Avatar src={selectedTherapist.user?.profile ? `${imagePath}/${selectedTherapist.user.profile}` : undefined} alt={selectedTherapist.user?.name} sx={{ width: 86, height: 86, border: "3px solid #f0fdf4" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b" }}>{selectedTherapist.user?.name}</Typography>
                  <Typography sx={{ color: "#228756", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: 1 }}>{selectedTherapist.profile_type}</Typography>
                  {selectedTherapist.state && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <LocationOn sx={{ fontSize: 14, color: "#94a3b8" }} />
                      <Typography sx={{ fontSize: "13px", color: "#64748b" }}>{selectedTherapist.state}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              <Typography sx={{ color: "#475569", lineHeight: 1.65, fontSize: "14px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {selectedTherapist.user?.bio || selectedTherapist.about_me || "Verified mental health professional."}
              </Typography>
              <Button variant="contained" fullWidth onClick={() => { setIsProfileOpen(false); router.push(`/view-profile/${selectedTherapist._id}`); }}
                sx={{ py: 1.7, borderRadius: "12px", bgcolor: "#228756", textTransform: "none", fontSize: "15px", fontWeight: 700, "&:hover": { bgcolor: "#1a6b44" } }}>
                View Full Profile
              </Button>
            </Box>
          )}
        </Box>
      </Dialog>
    </>
  );
}

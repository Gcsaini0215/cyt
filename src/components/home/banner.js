import { useState, useEffect } from "react";
import { Star, LocationOn, ArrowForward, Close, QuestionAnswer, Search } from "@mui/icons-material";
import { Avatar, Box, Typography, IconButton, Dialog } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { getTherapistProfiles, imagePath } from "../../utils/url";
import ConsultationForm from "./consultation-form";

const TABS = ["City / State", "Name", "Specialization"];

export default function Banner({ topTherapists = [], userCity = null }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchVal, setSearchVal] = useState("");
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    const paramMap = ["city", "search", "specialization"];
    router.push(`/view-all-therapist?${paramMap[activeTab]}=${encodeURIComponent(searchVal.trim())}`);
  };

  const placeholders = ["Search by city or state...", "Search by therapist name...", "Search by specialization..."];

  const stats = [
    { value: therapistCount ? `${therapistCount}+` : "500+", label: "Verified Therapists" },
    { value: "10,000+", label: "Sessions" },
    { value: "4.9★", label: "Rating" },
  ];

  return (
    <>
      <style jsx global>{`
        .banner-tab { background: none; border: none; cursor: pointer; padding: 10px 20px; font-size: 14px; font-weight: 600; color: #64748b; border-bottom: 2px solid transparent; transition: all 0.2s; font-family: inherit; }
        .banner-tab.active { color: #228756; border-bottom-color: #228756; }
        .banner-tab:hover { color: #228756; }
        .banner-search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 15px; color: #1e293b; padding: 0 12px; font-family: inherit; }
        .banner-search-btn { background: #228756; color: #fff; border: none; border-radius: 8px; padding: 10px 22px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 6px; transition: background 0.2s; white-space: nowrap; }
        .banner-search-btn:hover { background: #1a6b44; }
        .banner-consult-link { display: inline-flex; align-items: center; gap: 6px; color: #228756; font-size: 14px; font-weight: 700; text-decoration: none; border: none; background: none; cursor: pointer; font-family: inherit; padding: 0; }
        .banner-consult-link:hover { text-decoration: underline; }
        .strip-card { background: #fff; border-radius: 12px; overflow: hidden; min-width: 160px; max-width: 160px; flex-shrink: 0; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border: 1px solid #e8f5e9; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .strip-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(34,135,86,0.14); }
        .strip-view-btn { display: block; text-align: center; background: #228756; color: #fff; font-size: 11px; font-weight: 700; padding: 8px; text-decoration: none; letter-spacing: 0.4px; }
        .strip-view-btn:hover { background: #1a6b44; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", paddingTop: isMobile ? "28px" : "56px", paddingBottom: isMobile ? "28px" : "56px" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 0 : "48px", flexDirection: isMobile ? "column" : "row" }}>

            {/* LEFT */}
            <div style={{ flex: "0 0 auto", width: isMobile ? "100%" : "52%" }}>

              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "50px", padding: "5px 14px", marginBottom: "16px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#228756", display: "inline-block" }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#228756" }}>
                  {userCity ? `Therapists in ${userCity}` : "India's Trusted Therapy Platform"}
                </span>
              </div>

              {/* Heading */}
              <h1 style={{ fontSize: isMobile ? "2.2rem" : "3.2rem", fontWeight: 900, color: "#0f172a", margin: 0, marginBottom: "14px", lineHeight: 1.12, letterSpacing: "-0.03em", fontFamily: "'Inter', sans-serif" }}>
                Find a Therapist<br />
                <span style={{ color: "#228756" }}>That&apos;s Right for You</span>
              </h1>

              <p style={{ fontSize: isMobile ? "14px" : "15px", color: "#64748b", lineHeight: 1.7, margin: 0, marginBottom: "28px", maxWidth: "480px" }}>
                Whether you need temporary support or long-term care, our verified therapists are here to help. Start your journey today.
              </p>

              {/* Search Box */}
              <div style={{ background: "#fff", borderRadius: "12px", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: "20px" }}>
                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", paddingLeft: "4px" }}>
                  {TABS.map((t, i) => (
                    <button key={i} className={`banner-tab${activeTab === i ? " active" : ""}`} onClick={() => { setActiveTab(i); setSearchVal(""); }}>
                      {t}
                    </button>
                  ))}
                </div>
                {/* Input row */}
                <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: "8px" }}>
                  <Search sx={{ fontSize: 20, color: "#94a3b8", flexShrink: 0 }} />
                  <input
                    className="banner-search-input"
                    type="text"
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    placeholder={placeholders[activeTab]}
                  />
                  <button type="submit" className="banner-search-btn">
                    Search <ArrowForward sx={{ fontSize: 16 }} />
                  </button>
                </form>
              </div>

              {/* Bottom row */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                <button className="banner-consult-link" onClick={() => setIsConsultationOpen(true)}>
                  <QuestionAnswer sx={{ fontSize: 16 }} /> Free Consultation
                </button>
                <span style={{ color: "#e2e8f0" }}>|</span>
                {stats.map((s, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a", lineHeight: 1 }}>{s.value}</span>
                    <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500, marginTop: "2px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Image */}
            {!isMobile && (
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <div style={{ borderRadius: "24px", overflow: "hidden", background: "#f0fdf4", position: "relative" }}>
                  <img
                    src="/assets/img/therapysessioncyt.png"
                    alt="Therapy session"
                    style={{ width: "100%", height: "420px", objectFit: "cover", objectPosition: "top center", display: "block" }}
                    onError={e => { e.target.src = "/assets/img/bannerimage.jpeg"; }}
                  />
                  {/* Overlay badge */}
                  <div style={{ position: "absolute", bottom: "20px", left: "20px", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>✓ 100% Confidential</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Your privacy is our priority</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── THERAPIST STRIP ── */}
      <section style={{ background: "#f8fafc", paddingTop: "24px", paddingBottom: "28px", borderBottom: "1px solid #f1f5f9" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>Top Therapists</span>
            <Link href="/view-all-therapist" style={{ fontSize: "13px", fontWeight: 700, color: "#228756", textDecoration: "none" }}>View All →</Link>
          </div>
          <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
            {topTherapists.length > 0 ? topTherapists.slice(0, 12).map((t, i) => {
              const avgRating = t.reviews?.length > 0
                ? (t.reviews.reduce((a, r) => a + (r.rating || 5), 0) / t.reviews.length).toFixed(1)
                : null;
              return (
                <div key={i} className="strip-card" onClick={() => { setSelectedTherapist(t); setIsProfileOpen(true); }}>
                  <div style={{ height: "140px", background: "#f0fdf4", overflow: "hidden" }}>
                    <Avatar variant="square" src={t.user?.profile ? `${imagePath}/${t.user.profile}` : undefined} alt={t.user?.name}
                      sx={{ width: "100%", height: "100%", borderRadius: 0, "& img": { objectFit: "cover", objectPosition: "top center" } }} />
                  </div>
                  <div style={{ padding: "9px 10px 6px" }}>
                    <div style={{ fontWeight: 800, fontSize: "12px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.user?.name || "Therapist"}</div>
                    <div style={{ fontSize: "10px", color: "#228756", fontWeight: 600, marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.profile_type}</div>
                    {avgRating && (
                      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <Star sx={{ fontSize: 10, color: "#f59e0b" }} />
                        <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>{avgRating}</span>
                      </div>
                    )}
                    {t.state && (
                      <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                        <LocationOn sx={{ fontSize: 10, color: "#94a3b8" }} />
                        <span style={{ fontSize: "10px", color: "#94a3b8" }}>{t.state}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/view-profile/${t._id}`} className="strip-view-btn" onClick={e => e.stopPropagation()}>
                    View Profile
                  </Link>
                </div>
              );
            }) : [0,1,2,3,4,5].map(i => (
              <div key={i} style={{ minWidth: 160, height: 240, background: "#f1f5f9", borderRadius: 12, flexShrink: 0 }} />
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Modal */}
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

      {/* Quick View Modal */}
      <Dialog open={isProfileOpen} onClose={() => setIsProfileOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "20px", m: isMobile ? 2 : 3 } }}>
        <Box sx={{ p: 3, position: "relative" }}>
          <IconButton onClick={() => setIsProfileOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}><Close /></IconButton>
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

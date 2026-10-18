import React, { useState, useEffect, useRef } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import { Dialog, DialogContent, Button, Typography, Box } from "@mui/material";
import { postData, fetchData } from "../../utils/actions";
import { SubmitReviewUrl, getTherapistProfile } from "../../utils/url";

/* Client reviews on the profile: rating summary, the reviews, and a "Write a review" form that opens on
   demand — or by itself for links ending in #write-review (client portal "Leave a review", therapist's
   "ask for a review" link). */

const PAGE = 4;
const dateOf = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "");
const initialOf = (n) => (String(n || "").trim()[0] || "C").toUpperCase();

const Stars = ({ value, size = 16 }) => (
  <span className="prv-stars" aria-label={`${value} out of 5`}>
    {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} style={{ fontSize: size, color: i < Math.round(value) ? "#d4a12f" : "#dbe3df" }} />)}
  </span>
);

export default function ProfileReview({ profile: initialProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [rating, setRating] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formErr, setFormErr] = useState("");
  const formRef = useRef(null);

  useEffect(() => { setProfile(initialProfile); setVisibleCount(PAGE); }, [initialProfile]);

  // #write-review links open the form straight away
  useEffect(() => {
    const check = () => { if (window.location.hash === "#write-review") setFormOpen(true); };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  useEffect(() => {
    if (formOpen) setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }, [formOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr("");
    if (rating === 0) { setFormErr("Please choose a star rating."); return; }
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setSubmitting(true);
    const reviewData = { therapistId: profile?._id, name, email, rating, description: reviewText };
    try {
      const res = await postData(SubmitReviewUrl, reviewData);
      if (res && (res.status === true || res.status === "success" || res.status === 200 || res.success)) {
        setOpenSuccess(true);
        setFormOpen(false);
        setRating(0); setReviewText(""); setName(""); setEmail("");
        try {
          const resUpdated = await fetchData(getTherapistProfile + profile?._id);
          if (resUpdated?.data) setProfile(resUpdated.data);
        } catch (err) { /* the list refreshes on the next visit */ }
      } else {
        setFormErr(res?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setFormErr(err?.response?.data?.message || "Couldn't submit the review. Please check your connection and try again.");
    }
    setSubmitting(false);
  };

  const reviews = [...(profile?.reviews || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const count = reviews.length;
  const avg = count ? reviews.reduce((n, r) => n + (Number(r.rating) || 5), 0) / count : 0;
  const first = (profile?.user?.name || "this therapist").replace(/^(dr|mr|ms|mrs)\.?\s+/i, "").split(" ")[0];

  return (
    <section className="prv" id="write-review" aria-labelledby="prv-h">
      <style dangerouslySetInnerHTML={{ __html: PRV_CSS }} />
      <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 20, padding: 20, textAlign: "center" } }}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 72, color: "#0f3d24", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: "#122019" }}>Thank you!</Typography>
            <Typography variant="body1" sx={{ color: "#4a5568", mb: 3 }}>Your review has been submitted and will be visible after approval.</Typography>
            <Button onClick={() => setOpenSuccess(false)} variant="contained"
              sx={{ backgroundColor: "#0f3d24", "&:hover": { backgroundColor: "#16512f" }, borderRadius: "12px", px: 4, py: 1.5, fontWeight: 700, textTransform: "none", fontSize: "16px" }}>
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <div className="prv-w">
        <div className="prv-head">
          <div>
            <h2 id="prv-h">Client reviews</h2>
            {count > 0 ? (
              <div className="prv-sum"><b>{avg.toFixed(1)}</b><Stars value={avg} size={18} /><span>{count} review{count === 1 ? "" : "s"}</span></div>
            ) : (
              <p className="prv-sub">No reviews yet — be the first to share your experience with {first}.</p>
            )}
          </div>
          {!formOpen && (
            <button type="button" className="prv-btn outline" onClick={() => setFormOpen(true)}><RateReviewRoundedIcon /> Write a review</button>
          )}
        </div>

        {formOpen && (
          <form className="prv-form" onSubmit={handleSubmit} ref={formRef}>
            <div className="prv-form-h">
              <h3>Review {profile?.user?.name || "this therapist"}</h3>
              <button type="button" className="prv-x" onClick={() => setFormOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="prv-rate" onMouseLeave={() => setHover(0)}>
              <span className="prv-l">Your rating</span>
              <div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button type="button" key={i} aria-label={`${i} star${i > 1 ? "s" : ""}`} onClick={() => { setRating(i); setFormErr(""); }} onMouseEnter={() => setHover(i)}>
                    {i <= (hover || rating) ? <StarIcon style={{ color: "#d4a12f", fontSize: 32 }} /> : <StarBorderIcon style={{ color: "#cbd5e1", fontSize: 32 }} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="prv-2">
              <label><span className="prv-l">Full name</span>
                <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label><span className="prv-l">Email <small>(not shown publicly)</small></span>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
            </div>
            <label><span className="prv-l">Your experience</span>
              <textarea rows={4} placeholder={`How did your sessions with ${first} help you?`} value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
            </label>
            {formErr && <div className="prv-err" role="alert">{formErr}</div>}
            <div className="prv-acts">
              <button type="submit" className="prv-btn" disabled={submitting}>{submitting ? "Submitting…" : "Submit review"}</button>
              <button type="button" className="prv-btn ghost" onClick={() => setFormOpen(false)}>Cancel</button>
            </div>
          </form>
        )}

        {count > 0 && (
          <>
            <div className="prv-grid">
              {reviews.slice(0, visibleCount).map((r, i) => (
                <article key={r._id || i} className="prv-card">
                  <div className="prv-top">
                    <span className="prv-av" aria-hidden="true">{initialOf(r.name)}</span>
                    <div className="prv-who"><b>{r.name || "Verified client"}</b><Stars value={r.rating || 5} size={15} /></div>
                    {r.createdAt && <time dateTime={new Date(r.createdAt).toISOString()}>{dateOf(r.createdAt)}</time>}
                  </div>
                  {r.description && <p>{r.description}</p>}
                </article>
              ))}
            </div>
            {visibleCount < count && (
              <div className="prv-moreW">
                <button type="button" className="prv-btn outline" onClick={() => setVisibleCount((n) => n + PAGE)}>Show more reviews ({count - visibleCount})</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

const PRV_CSS = `
.prv { padding: 26px 0 8px; font-family: inherit; scroll-margin-top: 90px; }
.prv-w { max-width: 1180px; margin: 0 auto; padding: 0 32px; }
.prv-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.prv-head h2 { font-family: inherit; font-size: 22px; font-weight: 800; color: #0f2a1d; margin: 0; letter-spacing: -.2px; }
.prv-sum { display: flex; align-items: center; gap: 8px; margin-top: 6px; font-size: 14px; color: #64748b; }
.prv-sum b { font-size: 20px; font-weight: 800; color: #0f2a1d; }
.prv-stars { display: inline-flex; line-height: 1; }
.prv-sub { margin: 4px 0 0; font-size: 14.5px; color: #64748b; }
.prv-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 44px; padding: 0 20px; border-radius: 10px; border: 1.5px solid #0f3d24;
  background: #0f3d24; color: #fff; font-family: inherit; font-size: 14.5px; font-weight: 800; cursor: pointer; transition: background .15s, color .15s; }
.prv-btn svg { font-size: 19px; }
.prv-btn:hover { background: #166534; border-color: #166534; }
.prv-btn:disabled { opacity: .65; cursor: default; }
.prv-btn.outline { background: #fff; color: #0f3d24; }
.prv-btn.outline:hover { background: #ecfdf3; }
.prv-btn.ghost { background: none; border-color: transparent; color: #64748b; }
.prv-btn.ghost:hover { background: #f1f5f9; }
.prv-form { background: #fbfdfc; border: 1px solid #cfe6d8; border-radius: 16px; padding: 20px 22px; margin-bottom: 18px; display: grid; gap: 14px; }
.prv-form-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.prv-form-h h3 { font-family: inherit; font-size: 17px; font-weight: 800; color: #0f2a1d; margin: 0; }
.prv-x { width: 34px; height: 34px; border-radius: 50%; border: 0; background: #eef2f0; color: #334155; font-size: 22px; line-height: 1; cursor: pointer; }
.prv-rate button { background: none; border: 0; padding: 0 2px; cursor: pointer; }
.prv-l { display: block; font-size: 13.5px; font-weight: 700; color: #0f2a1d; margin-bottom: 6px; }
.prv-l small { font-weight: 500; color: #94a3b8; }
.prv-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.prv-form label { display: block; margin: 0; }
.prv-form input, .prv-form textarea { width: 100%; border: 1.5px solid #dbe3df; border-radius: 10px; background: #fff; padding: 0 14px; font-family: inherit; font-size: 15px; color: #0f172a; }
.prv-form input { height: 46px; }
.prv-form textarea { padding: 12px 14px; resize: vertical; min-height: 110px; line-height: 1.5; }
.prv-form input::placeholder, .prv-form textarea::placeholder { color: #94a3b8; opacity: 1; }
.prv-form input:focus, .prv-form textarea:focus { outline: none; border-color: #166534; box-shadow: 0 0 0 3px rgba(22,101,52,.12); }
.prv-err { font-size: 13.5px; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 9px 12px; }
.prv-acts { display: flex; gap: 8px; }
.prv-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.prv-card { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(15,61,36,.05); min-width: 0; }
.prv-top { display: flex; align-items: center; gap: 12px; }
.prv-av { flex: 0 0 40px; height: 40px; border-radius: 50%; background: linear-gradient(145deg, #dcf3e5, #bfe5cd); color: #166534; display: grid; place-items: center; font-size: 16px; font-weight: 800; }
.prv-who { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.prv-who b { font-size: 15px; font-weight: 800; color: #0f2a1d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prv-top time { flex-shrink: 0; font-size: 12.5px; color: #94a3b8; align-self: flex-start; padding-top: 2px; }
.prv-card p { margin: 12px 0 0; font-size: 15px; line-height: 1.65; color: #334155; overflow-wrap: anywhere; }
.prv-moreW { text-align: center; margin-top: 18px; }
@media (max-width: 767px) { .prv-grid { grid-template-columns: 1fr; gap: 12px; } }
@media (max-width: 599px) {
  .prv { padding-top: 20px; }
  .prv-w { padding: 0 14px; }
  .prv-head { align-items: flex-start; }
  .prv-head h2 { font-size: 20px; }
  .prv-head .prv-btn { width: 100%; }
  .prv-form { padding: 16px; }
  .prv-2 { grid-template-columns: 1fr; }
  .prv-acts .prv-btn:first-child { flex: 1; }
  .prv-card { padding: 16px; border-radius: 14px; }
  .prv-card p { font-size: 14.5px; }
}
`;

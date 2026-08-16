import React, { useState, useEffect, useRef } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  Button, 
  Typography, 
  Box,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { postData, fetchData } from "../../utils/actions";
import { SubmitReviewUrl, getTherapistProfile } from "../../utils/url";

export default function ProfileReview({ profile: initialProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [rating, setRating] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const glassCard = {
    background: "#fff",
    borderRadius: "6px",
    padding: "28px 30px",
    marginBottom: "20px",
    boxShadow: "0 4px 20px rgba(15,61,36,0.08)",
  };

  const inputStyle = {
    borderRadius: "4px",
    border: "1px solid #dbe3df",
    padding: "12px 15px",
    fontSize: "15px",
    width: "100%",
    marginBottom: "15px"
  };

  const btnStyle = {
    padding: "12px 30px",
    borderRadius: "4px",
    background: "#0f3d24",
    color: "#fff",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s",
    marginTop: "10px"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { alert("Please select a rating"); return; }
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setSubmitting(true);
    const reviewData = { therapistId: profile?._id, name, email, rating, description: reviewText };
    try {
      const res = await postData(SubmitReviewUrl, reviewData);
      if (res && (res.status === true || res.status === "success" || res.status === 200 || res.success)) {
        setOpenSuccess(true);
        setRating(0); setReviewText(""); setName(""); setEmail("");
        try {
          const resUpdated = await fetchData(getTherapistProfile + profile?._id);
          if (resUpdated?.data) setProfile(resUpdated.data);
        } catch (err) {}
      } else {
        alert(res?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Failed to submit review. Please check your connection and try again.");
    }
    setSubmitting(false);
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
  };

  return (
    <div className="container pb--60">
      <div className="row">
        <div className="col-lg-10 offset-lg-1">
          <Dialog
            open={openSuccess}
            onClose={handleCloseSuccess}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              style: {
                borderRadius: "20px",
                padding: "20px",
                textAlign: "center"
              }
            }}
          >
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: '#0f3d24', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#122019' }}>
                  Thank You!
                </Typography>
                <Typography variant="body1" sx={{ color: '#4a5568', mb: 3 }}>
                  Your review has been submitted successfully and will be visible after approval.
                </Typography>
                <Button 
                  onClick={handleCloseSuccess}
                  variant="contained"
                  sx={{ 
                    backgroundColor: '#0f3d24', 
                    '&:hover': { backgroundColor: '#16512f' },
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '16px'
                  }}
                >
                  Close
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
          <div style={glassCard}>
            <h4 className="rbt-title-style-3 mb-4" style={{ fontWeight: 800, color: '#122019' }}>
              Leave a Review for {profile?.user?.name || "Therapist"}
            </h4>

            <form onSubmit={handleSubmit} ref={formRef}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: 600, color: '#4a5568' }}>Full Name</label>
                    <input type="text" className="form-control" style={inputStyle} placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: 600, color: '#4a5568' }}>Email Address</label>
                    <input type="email" className="form-control" style={inputStyle} placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label d-block" style={{ fontWeight: 600, color: '#4a5568' }}>Rating</label>
                <div className="star-rating">
                  {[...Array(5)].map((star, index) => {
                    index += 1;
                    return (
                      <button type="button" key={index} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", outline: "none" }}
                        onClick={() => setRating(index)} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(rating)}>
                        {index <= (hover || rating) ? <StarIcon style={{ color: "#c9962c", fontSize: 30 }} /> : <StarBorderIcon style={{ color: "#cbd5e0", fontSize: 30 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 600, color: '#4a5568' }}>Review Description</label>
                <textarea className="form-control" rows="4" placeholder="Share your experience with this therapist..." value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                  style={{ borderRadius: "4px", border: "1px solid #dbe3df", padding: "15px", fontSize: "15px", resize: "none" }} required />
              </div>
              <button type="submit" style={{ ...btnStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          {/* Display existing reviews if any */}
          {profile?.reviews && profile.reviews.length > 0 && (
            <div className="mt--40">
              <h4 className="rbt-title-style-3 mb-4" style={{ fontWeight: 800, color: '#122019' }}>
                Client Feedback ({profile.reviews.length})
              </h4>
              <div className="row g-4">
                {[...profile.reviews]
                  .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                  .slice(0, visibleCount)
                  .map((rev, index) => (
                    <div key={index} className="col-12">
                      <div style={{
                        ...glassCard,
                        padding: '25px',
                        marginBottom: '15px'
                      }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="mb-1" style={{ fontSize: '16px', fontWeight: 700 }}>{rev.name}</h5>
                            <div className="rating">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} style={{ 
                                  color: i < rev.rating ? "#c9962c" : "#cbd5e0", 
                                  fontSize: 18 
                                }} />
                              ))}
                            </div>
                          </div>
                          {rev.createdAt && (
                            <span style={{ fontSize: '13px', color: '#718096' }}>
                              {new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                            </span>
                          )}
                        </div>
                        <p style={{ 
                          fontSize: '15px', 
                          lineHeight: '1.6', 
                          color: '#4a5568',
                          margin: 0
                        }}>
                          {rev.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Load More Button */}
              {visibleCount < profile.reviews.length && (
                <div className="text-center mt--30">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 2)}
                    style={{
                      ...btnStyle,
                      background: 'transparent',
                      color: '#0f3d24',
                      border: '2px solid #0f3d24',
                      boxShadow: 'none',
                      padding: '10px 25px'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#0f3d24';
                      e.target.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#0f3d24';
                    }}
                  >
                    Load More Reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

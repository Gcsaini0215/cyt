import React, { useState, useEffect, useRef } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { postData, fetchData } from "../../utils/actions";
import { probonoReviewUrl } from "../../utils/url";

export default function ProbonoProfileReview({ probonoIntern, onReviewSubmitted }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});

  const toggleExpand = (id) => setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));

  const formRef = useRef(null);
  const internId = probonoIntern?._id;

  useEffect(() => {
    if (!internId) return;
    fetchData(`${probonoReviewUrl}/${internId}/reviews`)
      .then((res) => { if (res?.status) setReviews(res.data || []); })
      .catch(() => {});
  }, [internId]);

  const glassCard = {
    background: "#fff",
    borderRadius: "6px",
    padding: "30px",
    marginBottom: "20px",
    border: "1px solid #dbe3df",
  };

  const inputStyle = {
    borderRadius: "4px",
    border: "1px solid #e2e8f0",
    padding: "12px 15px",
    fontSize: "15px",
    width: "100%",
    marginBottom: "15px",
    boxSizing: "border-box",
  };

  const btnStyle = {
    padding: "12px 30px",
    borderRadius: "6px",
    background: "#2ecc71",
    color: "#fff",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 15px rgba(46, 204, 113, 0.2)",
    marginTop: "10px",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!internId) return;
    if (rating === 0) { alert("Please select a rating"); return; }
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setSubmitting(true);
    try {
      const res = await postData(`${probonoReviewUrl}/${internId}/review`, {
        name, email, rating, description: reviewText,
      });
      if (res?.status) {
        setOpenSuccess(true);
        setRating(0); setReviewText(""); setName(""); setEmail("");
        if (typeof res.rating === "number") onReviewSubmitted?.(res.rating);
        try {
          const resUpdated = await fetchData(`${probonoReviewUrl}/${internId}/reviews`);
          if (resUpdated?.status) setReviews(resUpdated.data || []);
        } catch (err) {}
      } else {
        alert(res?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Failed to submit review. Please check your connection and try again.");
    }
    setSubmitting(false);
  };

  const handleCloseSuccess = () => setOpenSuccess(false);

  return (
    <Box sx={{ mt: 4 }}>
      <Dialog
        open={openSuccess}
        onClose={handleCloseSuccess}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { borderRadius: "20px", padding: "20px", textAlign: "center" } }}
      >
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: "#2ecc71", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: "#1a202c" }}>Thank You!</Typography>
            <Typography variant="body1" sx={{ color: "#4a5568", mb: 3 }}>
              Your review has been submitted successfully and will be visible after approval.
            </Typography>
            <Button
              onClick={handleCloseSuccess}
              variant="contained"
              sx={{ backgroundColor: "#2ecc71", "&:hover": { backgroundColor: "#27ae60" }, borderRadius: "12px", px: 4, py: 1.5, fontWeight: 700, textTransform: "none", fontSize: "16px" }}
            >
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <div style={glassCard}>
        <h4 style={{ fontWeight: 800, color: "#1a202c", marginBottom: 20 }}>
          Leave a Review for {probonoIntern?.name || "this Trainee Psychologist"}
        </h4>

        <form onSubmit={handleSubmit} ref={formRef}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 600, color: "#4a5568" }}>Full Name</label>
                <input type="text" className="form-control" style={inputStyle} placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 600, color: "#4a5568" }}>Email Address</label>
                <input type="email" className="form-control" style={inputStyle} placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label d-block" style={{ fontWeight: 600, color: "#4a5568" }}>Rating</label>
            <div>
              {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                  <button type="button" key={index} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", outline: "none" }}
                    onClick={() => setRating(index)} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(rating)}>
                    {index <= (hover || rating) ? <StarIcon style={{ color: "#ffb400", fontSize: 30 }} /> : <StarBorderIcon style={{ color: "#cbd5e0", fontSize: 30 }} />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, color: "#4a5568" }}>Review Description</label>
            <textarea className="form-control" rows="4" placeholder="Share your experience with this trainee psychologist..." value={reviewText} onChange={(e) => setReviewText(e.target.value)}
              style={{ borderRadius: "12px", border: "1px solid #e2e8f0", padding: "15px", fontSize: "15px", resize: "none", width: "100%", boxSizing: "border-box" }} required />
          </div>
          <button type="submit" style={{ ...btnStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      {reviews.length > 0 && (
        <div>
          <h4 style={{ fontWeight: 800, color: "#1a202c", marginBottom: 20 }}>
            Client Feedback ({reviews.length})
          </h4>
          <div className="row g-4">
            {reviews.slice(0, visibleCount).map((rev, index) => (
              <div key={rev._id || index} className="col-12">
                <div style={{ ...glassCard, padding: "25px", marginBottom: "15px" }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1" style={{ fontSize: "16px", fontWeight: 700 }}>{rev.name}</h5>
                      <div>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} style={{ color: i < rev.rating ? "#ffb400" : "#cbd5e0", fontSize: 18 }} />
                        ))}
                      </div>
                    </div>
                    {rev.createdAt && (
                      <span style={{ fontSize: "13px", color: "#718096" }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "15px",
                      lineHeight: "1.6",
                      color: "#4a5568",
                      margin: 0,
                      textAlign: "justify",
                      ...(expandedReviews[rev._id || index]
                        ? {}
                        : {
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }),
                    }}
                  >
                    {rev.description}
                  </p>
                  {rev.description && rev.description.length > 160 && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(rev._id || index)}
                      style={{ background: "none", border: "none", padding: 0, marginTop: 6, color: "#2ecc71", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      {expandedReviews[rev._id || index] ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {visibleCount < reviews.length && (
            <div className="text-center mt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 2)}
                style={{ ...btnStyle, background: "transparent", color: "#2ecc71", border: "2px solid #2ecc71", boxShadow: "none", padding: "10px 25px" }}
              >
                Load More Reviews
              </button>
            </div>
          )}
        </div>
      )}
    </Box>
  );
}

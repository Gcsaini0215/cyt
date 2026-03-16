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
    backdropFilter: "blur(10px)",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "20px",
    boxShadow: "0 10px 40px 0 rgba(0, 0, 0, 0.05)",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  };

  const inputStyle = {
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "12px 15px",
    fontSize: "15px",
    width: "100%",
    marginBottom: "15px"
  };

  const btnStyle = {
    padding: "12px 30px",
    borderRadius: "12px",
    background: "#2ecc71",
    color: "#fff",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 15px rgba(46, 204, 113, 0.2)",
    transition: "all 0.3s ease",
    marginTop: "10px"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    
    // Blur all active inputs to fix mobile zoom/keyboard issues
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    setSubmitting(true);
    // Prepare data for backend
    const reviewData = {
      therapistId: profile?._id,
      name,
      email,
      rating,
      description: reviewText
    };

    try {
      const res = await postData(SubmitReviewUrl, reviewData);
      if (res && (res.status === true || res.status === "success" || res.status === 200 || res.success)) {
        setOpenSuccess(true);
        setRating(0);
        setReviewText("");
        setName("");
        setEmail("");

        // Refresh profile data to show the new review (if backend returns it)
        try {
          const resUpdated = await fetchData(getTherapistProfile + profile?._id);
          if (resUpdated && resUpdated.data) {
            setProfile(resUpdated.data);
          }
        } catch (err) {
          console.error("Error refreshing profile after review:", err);
        }
      } else {
        alert(res?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
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
                <CheckCircleIcon sx={{ fontSize: 80, color: '#2ecc71', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#1a202c' }}>
                  Thank You!
                </Typography>
                <Typography variant="body1" sx={{ color: '#4a5568', mb: 3 }}>
                  Your review has been submitted successfully and will be visible after approval.
                </Typography>
                <Button 
                  onClick={handleCloseSuccess}
                  variant="contained"
                  sx={{ 
                    backgroundColor: '#2ecc71', 
                    '&:hover': { backgroundColor: '#27ae60' },
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
            <h4 className="rbt-title-style-3 mb-4" style={{ fontWeight: 800, color: '#1a202c' }}>
              Leave a Review for {profile?.user?.name || "Therapist"}
            </h4>
            <form onSubmit={handleSubmit} ref={formRef}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: 600, color: '#4a5568' }}>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      style={inputStyle}
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: 600, color: '#4a5568' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      style={inputStyle}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label d-block" style={{ fontWeight: 600, color: '#4a5568' }}>Rating</label>
                <div className="star-rating">
                  {[...Array(5)].map((star, index) => {
                    index += 1;
                    return (
                      <button
                        type="button"
                        key={index}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0 2px",
                          outline: "none"
                        }}
                        onClick={() => setRating(index)}
                        onMouseEnter={() => setHover(index)}
                        onMouseLeave={() => setHover(rating)}
                      >
                        {index <= (hover || rating) ? (
                          <StarIcon style={{ color: "#ffb400", fontSize: 30 }} />
                        ) : (
                          <StarBorderIcon style={{ color: "#cbd5e0", fontSize: 30 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontWeight: 600, color: '#4a5568' }}>Review Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Share your experience with this therapist..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    padding: "15px",
                    fontSize: "15px",
                    resize: "none"
                  }}
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                style={{
                  ...btnStyle,
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? "not-allowed" : "pointer"
                }}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          {/* Display existing reviews if any */}
          {profile?.reviews && profile.reviews.length > 0 && (
            <div className="mt--40">
              <h4 className="rbt-title-style-3 mb-4" style={{ fontWeight: 800, color: '#1a202c' }}>
                Client Feedback ({profile.reviews.length})
              </h4>
              <div className="row g-4">
                {profile.reviews.map((rev, index) => (
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
                                color: i < rev.rating ? "#ffb400" : "#cbd5e0", 
                                fontSize: 18 
                              }} />
                            ))}
                          </div>
                        </div>
                        {rev.createdAt && (
                          <span style={{ fontSize: '13px', color: '#718096' }}>
                            {new Date(rev.createdAt).toLocaleDateString()}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

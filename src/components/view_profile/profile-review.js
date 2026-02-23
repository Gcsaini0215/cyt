import React, { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

export default function ProfileReview({ profile }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    // Prepare data for backend
    const reviewData = {
      therapistId: profile?._id,
      name,
      email,
      rating,
      review: reviewText
    };
    console.log("Review data to send:", reviewData);
    alert("Thank you for your review! It will be visible after approval.");
    setRating(0);
    setReviewText("");
    setName("");
    setEmail("");
  };

  return (
    <div className="container pb--60">
      <div className="row">
        <div className="col-lg-10 offset-lg-1">
          <div style={glassCard}>
            <h4 className="rbt-title-style-3 mb-4" style={{ fontWeight: 800, color: '#1a202c' }}>
              Leave a Review for {profile?.user?.name || "Therapist"}
            </h4>
            <form onSubmit={handleSubmit}>
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

              <button type="submit" style={btnStyle}>
                Submit Review
              </button>
            </form>
          </div>


        </div>
      </div>
    </div>
  );
}

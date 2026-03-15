import React, { useEffect, useState } from "react";
import { fetchData, postData } from "../../../utils/actions";
import { GetReviewsUrl, UpdateReviewStatusUrl } from "../../../utils/url";

export default function ReviewsSidebar() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const getReviews = async () => {
    try {
      const res = await fetchData(GetReviewsUrl);
      if (res && res.data) {
        setReviews(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    getReviews();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await postData(UpdateReviewStatusUrl, { id, status });
      if (res && (res.status === "success" || res.success)) {
        alert(`Review ${status} successfully`);
        getReviews(); // Refresh list
      } else {
        alert(res?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating review status:", err);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">All Reviews</h4>
          </div>
          
          <div className="rbt-dashboard-table table-responsive mobile-table-750">
            <table className="rbt-table table table-borderless">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Therapist</th>
                  <th>Rating</th>
                  <th>Feedback</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">Loading reviews...</td>
                  </tr>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <tr key={review._id}>
                      <td>{review.name}</td>
                      <td>{review.therapistId?.user?.name || "N/A"}</td>
                      <td>
                        <div className="rbt-review">
                          <div className="rating">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fa${i < review.rating ? "s" : "r"} fa-star`} style={{ color: i < review.rating ? "#ffb400" : "#cbd5e0" }}></i>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="b3" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={review.review}>
                          {review.review}
                        </p>
                      </td>
                      <td>
                        <span className={`badge ${review.status === 'approved' ? 'bg-success' : review.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                          {review.status || 'pending'}
                        </span>
                      </td>
                      <td>
                        <div className="rbt-button-group">
                          {review.status !== 'approved' && (
                            <button 
                              className="rbt-btn btn-gradient btn-sm me-2" 
                              style={{ height: '30px', lineHeight: '28px', padding: '0 15px', fontSize: '12px' }}
                              onClick={() => handleStatusUpdate(review._id, 'approved')}
                            >
                              Approve
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button 
                              className="rbt-btn btn-border btn-sm"
                              style={{ height: '30px', lineHeight: '28px', padding: '0 15px', fontSize: '12px' }}
                              onClick={() => handleStatusUpdate(review._id, 'rejected')}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No reviews found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

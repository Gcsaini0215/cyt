import { Link } from "react-router-dom";
const DeepakImg = "/assets/img/dpk.jpeg";
import ImageTag from "../utils/image-tag";

import useMediaQuery from "@mui/material/useMediaQuery";
export default function TherapistCard() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.down("md"));
  return (
    <div className="swiper-slide swiper-slide-visible swiper-slide-fully-visible swiper-slide-active">
      <div className="rbt-card variation-01">
        <div className="rbt-card-img">
          <Link to="#">
            <ImageTag alt="Card" height={"488"} width={"710"} src={DeepakImg} />
          </Link>
        </div>
        <div className="rbt-card-body">
          <ul className="rbt-meta">
            <li style={{ fontSize: 16 }}>
              <i className="feather-message-circle"></i>Hindi, English
            </li>
            <li style={{ fontSize: 16 }}>
              <i className="feather-award"></i>3 Year Experience
            </li>
          </ul>
          <div className="rbt-review" style={{ marginTop: 12 }}>
            <div className="rating">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <span className="rating-count">(15 Reviews)</span>
          </div>
          <h4 className="rbt-card-title">
            <Link to="#">Deepak Kumar</Link>
          </h4>
          <div style={{ marginTop: 7, display: "flex" }}>
            <span>
              <i className="feather-user"></i>
            </span>
            <span style={{ fontSize: 16, marginLeft: 5 }}>
              Counseling Psychologist
            </span>
          </div>

          <div style={{ marginTop: 5, display: "flex" }}>
            <span>
              <i className="feather-heart"></i>
            </span>
            <span style={{ fontSize: 16, marginLeft: 5 }}>
              Individual Counselling, Couple Counselling, Teen Counselling
            </span>
          </div>

          <div
            style={{
              marginTop: 24,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Link
              className="view-btn view-btn-border"
              to="#"
              style={{ padding: isMobile ? "0 30px" : "0 22px" }}
            >
              View Profile
            </Link>
            <Link
              className="rbt-btn btn-gradient book-btn"
              to="#"
              style={{
                display: "flex",
                justifyContent: "center",
                padding: isTablet ? "0 24px" : "0 30px",
              }}
            >
              <span>&nbsp;&nbsp;Book Now&nbsp;&nbsp;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import ImageTag from "../../utils/image-tag";
import { imagePath } from "../../utils/url";

export default function FavTherapistCard({ data, removeFav }) {
  return (
    <div className="swiper-slide swiper-slide-visible swiper-slide-fully-visible swiper-slide-active">
      <div className="rbt-card variation-01">
        <div className="rbt-card-img">
          <Link href={`/view-profile/${data.therapist._id}`} style={{ cursor: "pointer" }} target="_blank">
            <ImageTag
              alt={data.therapist.user.name}
              style={{ height: "250px" }}
              src={`${imagePath}/${data.therapist.user.profile}`}
            />
          </Link>
          <div
            style={{
              position: "absolute",
              height: 40,
              width: 40,
              top: 0,
              right: 0,
              marginRight: 10,
              marginTop: 10,
              background: "#fff",
              borderRadius: "50%",
              border: "1px solid red",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => removeFav(data.therapist._id)}
          >
            <button
              className="rbt-btn btn-xs bg-color-danger-opacity radius-round color-danger"
              title="Delete"
              type="button"

            >
              <i className="feather-trash-2 pl--0"></i>
            </button>
          </div>
        </div>
        <div className="rbt-card-body">
          <ul className="rbt-meta">
            <li style={{ fontSize: 16 }}>
              <i className="feather-message-circle"></i>
              {data.therapist.language_spoken}
            </li>
            <li style={{ fontSize: 16 }}>
              <i className="feather-map-pin"></i>
              {data.therapist.state}
            </li>
          </ul>

          <h4 className="rbt-card-title">
            <Link href={`/view-profile/${data.therapist._id}`} style={{ cursor: "pointer" }} target="_blank">
              {data.therapist.user.name}
            </Link>
          </h4>
          <div style={{ marginTop: 7, display: "flex" }}>
            <span>
              <i className="feather-user"></i>
            </span>
            <span style={{ fontSize: 16, marginLeft: 5 }}>
              {data.therapist.profile_type}
            </span>
          </div>

          <div style={{ marginTop: 5, display: "flex" }}>
            <span>
              <i className="feather-eye"></i>
            </span>
            <span style={{ fontSize: 16, marginLeft: 5 }}>
              {data.serve_type}
            </span>
          </div>

          <div
            style={{
              marginTop: 24,
              marginBottom: 10,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Link className="rbt-btn btn-gradient book-btn" href={`/therapist-checkout/${data.therapist._id}`}>
              <span>&nbsp;&nbsp;Book Now&nbsp;&nbsp;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

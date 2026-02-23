import Link from "next/link";
import ImageTag from "../../../utils/image-tag";
import DeleteIcon from "@mui/icons-material/Delete";
import { truncateString } from "../../../utils/helpers";
import { useEffect, useState } from "react";
import { fetchById } from "../../../utils/actions";
import { disableWorkshopUrl, imagePath } from "../../../utils/url";
export default function WorkshopCard({ data, onDelete }) {
  const [isActive, setIsActive] = useState(false);
  const handleToggle = (value) => {
    setIsActive(!value);
    updateWorkshop(!value);
  };

  const updateWorkshop = async (value) => {
    try {
      await fetchById(disableWorkshopUrl, {
        id: data._id,
        is_active: value === true ? 1 : 0,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setIsActive(data.is_active === 1 ? true : false);
  }, [data.is_active]);

  return (
    <div className="col-lg-4 col-md-6 col-12">
      <div className="rbt-card variation-01 rbt-hover">
        <div className="rbt-card-img">
          <Link href="">
            <ImageTag
              alt={truncateString(data.title, 20)}
              loading="lazy"
              style={{ height: 200 }}
              src={`${imagePath}/${data.workshop_image}`}
            />
          </Link>
        </div>
        <div className="rbt-card-body">
          <div className="rbt-card-top">
            <div className="rbt-price">
              <span className="current-price">₹{data.price}</span>
              <span className="off-price">₹{data.mrp}</span>
            </div>
            <div className="rbt-bookmark-btn">
              <a
                style={{ cursor: "pointer" }}
                className="rbt-round-btn"
                title="Bookmark"
                onClick={() => onDelete(data._id)}
              >
                <DeleteIcon sx={{ fontSize: 22, color: "#bb2124" }} />
              </a>
            </div>
          </div>
          <h4 className="rbt-card-title" style={{ fontSize: 16 }}>
            <a href="">{truncateString(data.title, 60)}</a>
          </h4>
          <ul className="rbt-meta mt--5">
            <li>
              <i className="feather-book"></i>
              {data.language}
            </li>
            <li>
              <i className="feather-users"></i> {data.level}
            </li>
          </ul>
          <ul className="rbt-meta">
            <li>
              <i className="feather-book"></i> {data.event_date}
            </li>
            <li>
              <i className="feather-book"></i> {data.event_time}
            </li>
          </ul>
          <ul className="rbt-meta">
            <li>
              <i className="feather-book"></i>
              <Link href={`${imagePath}/${data.content_pdf}`} target="_blank">
                Content PDF
              </Link>
            </li>
          </ul>
          <div className="rbt-card-bottom mt--15">
            <div className="rbt-price">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                  checked={isActive}
                  onChange={() => handleToggle(isActive)}
                />
              </div>
            </div>
            <Link
              className="rbt-btn-link left-icon"
              href={`/update-workshop/${data._id}`}
            >
              <i className="feather-edit"></i> Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

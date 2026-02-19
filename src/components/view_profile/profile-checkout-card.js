import ImageTag from "../../utils/image-tag";
import { imagePath } from "../../utils/url";

export default function ProfileCheckoutCard({ pageData }) {
  return (
    <div className="mini-therapist-card">
      <div className="mini-card-img-wrapper">
        <ImageTag
          alt={pageData.user.name}
          src={`${imagePath}/${pageData.user.profile}`}
          className="mini-card-img"
          style={{ width: "85px", height: "85px", borderRadius: "50%", objectFit: "cover" }}
        />
        <div className="verified-badge">
          <i className="feather-check"></i>
        </div>
      </div>
      
      <div className="mini-card-info">
        <h4 className="mini-card-name">
          {pageData.user.name}
        </h4>
        <div className="mini-card-type">{pageData.profile_type}</div>
        
        <ul className="mini-card-meta">
          <li className="mini-meta-item">
            <i className="feather-award"></i>
            {pageData.year_of_exp} Experience
          </li>
          <li className="mini-meta-item">
            <i className="feather-globe"></i>
            {pageData.language_spoken}
          </li>
        </ul>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import ImageTag from "../../../utils/image-tag";
import { imagePath } from "../../../utils/url";
export default function WorkshopCheckoutCard({ pageData }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 600px)");
    setIsMobile(query.matches);
    const handle = (e) => setIsMobile(e.matches);
    query.addListener(handle);
    return () => query.removeListener(handle);
  }, []);
  return (
    <div className="col-12 sal-animate">
      <div className="rbt-card variation-01 rbt-hover card-list-2">
        <div className="rbt-card-img" style={{ flexBasis: "33%" }}>
          <ImageTag
            alt="workshop image"
            src={`${imagePath}/${pageData.workshop_image}`}
            style={{ height: isMobile ? 255 : 150 }}
          />
        </div>
        <div className="rbt-card-body" style={{ flexBasis: "90%" }}>
          <div className="rbt-card-top">
            <div className="rbt-review">
              <h4 className="rbt-card-title">
                {pageData.title}&nbsp;
                <span style={{ fontSize: 15, color: "rgb(89, 89, 89)" }}>
                  ({pageData.category})
                </span>
              </h4>
            </div>
          </div>
          <ul className="rbt-meta" style={{ marginTop: 0 }}>
           {/*  <li style={listStyle}>
              <strong>Description:</strong>{pageData.short_desc}
            </li>
            <li style={listStyle}>
              Level:{pageData.level}
            </li>
            <li style={listStyle}>
             
              <span style={{ lineHeight: "2rem" }}>{pageData.event_time}</span>
            </li>
            <li style={listStyle}>
              <i className="feather-eye"></i>
              <span style={{ lineHeight: "2rem" }}>
                {pageData.qualification}
              </span>
            </li> */}
            {/* <li style={listStyle}>
              <i className="feather-eye"></i>
              <span style={{ lineHeight: "2rem" }}>
                {getMinMaxPrice(pageData)}
              </span>
            </li> */}
            {/* <li style={listStyle}>
              <i className="feather-eye"></i>
              <span style={{ lineHeight: "1rem" }}>
                {pageData.year_of_exp} of experience
              </span>
            </li> */}
          </ul>
        </div>
      </div>
    </div>
  );
}

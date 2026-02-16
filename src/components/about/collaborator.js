import ImageTag from "../../utils/image-tag";
const TeamImg = "/assets/img/neha.png";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Link } from "react-router-dom";
export default function Collaborator() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  return (
    <div className="rbt-author-area bg-gradient-8 rbt-section-gap">
      <div className="container">
        <div className="row mb--60">
          <div className="col-lg-12"></div>
        </div>
        <div className="rbt-instructor">
          <div className="single-course-author">
            <div className="media row align-items-center g-5">
              <div className="col-lg-3 col-xl-3 offset-xl-2">
                <div className="thumbnail">
                  <Link
                    to="#"
                    style={{
                      display: isMobile ? "flex" : "",
                      justifyContent: isMobile ? "center" : "normal",
                    }}
                  >
                    <ImageTag
                      alt="Author Images"
                      style={{
                        width: isMobile ? "90%" : "100%",
                        height: isMobile ? 350 : "auto",
                        borderRadius: "20px",
                      }}
                      src={TeamImg}
                    />
                  </Link>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="media-body ml--15">
                  <div className="author-info text-left">
                    <h2 className="title color-white mb--0">Ms. Neha Sharma</h2>
                    <span className="b3 color-white">
                      Collaboration Team Member, Noida
                    </span>
                  </div>
                  <div className="content mt--20">
                    <p className="description color-white">
                      I look forward to contributing to an environment where
                      professionals can thrive and clients can receive the
                      highest quality care.
                    </p>
                    <ul className="social-icon color-white social-default transparent-with-border justify-content-start mt--15">
                      <li>
                        <a href="https://www.facebook.com/">
                          <i className="feather-facebook"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.twitter.com">
                          <i className="feather-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.instagram.com/">
                          <i className="feather-instagram"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.linkdin.com/">
                          <i className="feather-linkedin"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

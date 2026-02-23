import Link from "next/link";
export default function NotAuthorizedPage() {
  return (
    <div className="rbt-error-area bg-gradient-11 rbt-section-gap">
      <div className="error-area">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-10">
              <h1 className="title">401!</h1>
              <h3 className="sub-title">Not Authorized</h3>
              <p>Please login First.</p>
              <Link
                className="rbt-btn btn-gradient icon-hover"
                href="/login"
                style={{ cursor: "pointer" }}
              >
                <span className="btn-text">Login Now</span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

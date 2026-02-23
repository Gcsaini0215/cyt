import Link from "next/link";

export default function ComingSoon() {
  return (
    <div className="rbt-error-area bg-gradient-11 rbt-section-gap">
      <div className="error-area">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-10">
              <h1 className="title">Coming Soon</h1>
              <h3 className="sub-title">We’re working on something amazing 🚀</h3>
              <p>Our website/page is under construction. Stay tuned for updates!</p>
              <Link className="rbt-btn btn-gradient icon-hover" href="/">
                <span className="btn-text">Back To Home</span>
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

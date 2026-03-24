import Link from "next/link";

export default function BlogHeader() {
  return (
    <div className="rbt-breadcrumb-default ptb--15 bg-gradient-1 border-bottom">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-md-6 col-12">
            <h6 className="title mb--0 color-black" style={{ fontSize: '1.4rem' }}>Expert Therapist Insights</h6>
          </div>
          <div className="col-lg-6 col-md-6 col-12">
            <div className="breadcrumb-inner text-start text-md-end">
              <ul className="page-list justify-content-start justify-content-md-end color-black">
                <li className="rbt-breadcrumb-item">
                  <Link href="/" className="color-black">Home</Link>
                </li>
                <li>
                  <div className="icon-right color-black">
                    <i className="feather-chevron-right"></i>
                  </div>
                </li>
                <li className="rbt-breadcrumb-item active color-black">Articles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

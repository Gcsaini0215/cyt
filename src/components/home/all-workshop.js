import { Link } from "react-router-dom";
const demoPhoto = "/assets/img/2.png";
export default function AllWorkshops() {
  return (
    <>
      <div className="rbt-page-banner-wrapper">
        <div className="rbt-banner-image"></div>
        <div className="rbt-banner-content">
          <div className="rbt-banner-content-top">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <ul className="page-list">
                    <li className="rbt-breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li>
                      <div className="icon-right">
                        <i className="feather-chevron-right"></i>
                      </div>
                    </li>
                    <li className="rbt-breadcrumb-item active">All Event</li>
                  </ul>
                  <div className=" title-wrapper">
                    <h1 className="title mb--0">All Event</h1>
                    <Link className="rbt-badge-2" to="#">
                      <div className="image">🎉</div> 9 Events
                    </Link>
                  </div>
                  <p className="description">
                    Event that help beginner designers become true unicorns.{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rbt-counterup-area rbt-section-overlayping-top rbt-section-gapBottom">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6 col-md-6 col-12">
              <div className="rbt-card card-list-2 event-list-card variation-01 rbt-hover">
                <div className="rbt-card-img">
                  <Link to={"/new-workshop"}>
                    <img
                      alt="Card image"
                      fetchpriority="high"
                      width="355"
                      height="240"
                      decoding="async"
                      data-nimg="1"
                      src={demoPhoto}
                      style={{ color: "transparent" }}
                    />
                    <div className="rbt-badge-3 bg-white">
                      <span>11 Jan</span>
                      <span>2024</span>
                    </div>
                  </Link>
                </div>
                <div className="rbt-card-body">
                  <ul className="rbt-meta">
                    <li>
                      <i className="feather-map-pin"></i>IAC
                    </li>
                    <li>
                      <i className="feather-clock"></i>8:00 am - 5:00 pm
                    </li>
                  </ul>
                  <h4 className="rbt-card-title">
                    <Link to="/new-workshop">
                      International Education Fair 2024
                    </Link>
                  </h4>
                  <div className="read-more-btn">
                    <Link
                      className="rbt-btn btn-border hover-icon-reverse btn-sm radius-round"
                      to="#"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Get Ticket</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="rbt-card card-list-2 event-list-card variation-01 rbt-hover">
                <div className="rbt-card-img">
                  <Link to="#">
                    <img
                      alt="Card image"
                      fetchpriority="high"
                      width="355"
                      height="240"
                      decoding="async"
                      data-nimg="1"
                      src="/assets/img/grid-type-02ed6c.jpg"
                      style={{ color: "transparent" }}
                    />
                    <div className="rbt-badge-3 bg-white">
                      <span>9 Mar</span>
                      <span>2024</span>
                    </div>
                  </Link>
                </div>
                <div className="rbt-card-body">
                  <ul className="rbt-meta">
                    <li>
                      <i className="feather-map-pin"></i>Vancouver
                    </li>
                    <li>
                      <i className="feather-clock"></i>8:00 am - 5:00 pm
                    </li>
                  </ul>
                  <h4 className="rbt-card-title">
                    <Link to="#">
                      Painting Art Contest 2020
                    </Link>
                  </h4>
                  <div className="read-more-btn">
                    <Link
                      className="rbt-btn btn-border hover-icon-reverse btn-sm radius-round"
                      to="#"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Get Ticket</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="rbt-card card-list-2 event-list-card variation-01 rbt-hover">
                <div className="rbt-card-img">
                  <Link to="#">
                    <img
                      alt="Card image"
                      fetchpriority="high"
                      width="355"
                      height="240"
                      decoding="async"
                      data-nimg="1"
                      src="/assets/img/grid-type-033752.jpg"
                      style={{ color: "transparent" }}
                    />
                    <div className="rbt-badge-3 bg-white">
                      <span>10 Oct</span>
                      <span>2024</span>
                    </div>
                  </Link>
                </div>
                <div className="rbt-card-body">
                  <ul className="rbt-meta">
                    <li>
                      <i className="feather-map-pin"></i>Paris
                    </li>
                    <li>
                      <i className="feather-clock"></i>8:00 am - 5:00 pm
                    </li>
                  </ul>
                  <h4 className="rbt-card-title">
                    <Link to="#">
                      Histudy Education Fair 2024
                    </Link>
                  </h4>
                  <div className="read-more-btn">
                    <Link
                      className="rbt-btn btn-border hover-icon-reverse btn-sm radius-round"
                      to="#"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Get Ticket</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="rbt-card card-list-2 event-list-card variation-01 rbt-hover">
                <div className="rbt-card-img">
                  <Link to="#">
                    <img
                      alt="Card image"
                      fetchpriority="high"
                      width="355"
                      height="240"
                      decoding="async"
                      data-nimg="1"
                      src="/assets/img/grid-type-04a743.jpg"
                      style={{ color: "transparent" }}
                    />
                    <div className="rbt-badge-3 bg-white">
                      <span>8 Jan</span>
                      <span>2024</span>
                    </div>
                  </Link>
                </div>
                <div className="rbt-card-body">
                  <ul className="rbt-meta">
                    <li>
                      <i className="feather-map-pin"></i>IAC Building
                    </li>
                    <li>
                      <i className="feather-clock"></i>8:00 am - 5:00 pm
                    </li>
                  </ul>
                  <h4 className="rbt-card-title">
                    <Link to="#">
                      Elegant Light Box Paper Cut Dioramas
                    </Link>
                  </h4>
                  <div className="read-more-btn">
                    <Link
                      className="rbt-btn btn-border hover-icon-reverse btn-sm radius-round"
                      to="#"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Get Ticket</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="rbt-card card-list-2 event-list-card variation-01 rbt-hover">
                <div className="rbt-card-img">
                  <Link to="#">
                    <img
                      alt="Card image"
                      fetchpriority="high"
                      width="355"
                      height="240"
                      decoding="async"
                      data-nimg="1"
                      src="/assets/img/grid-type-05073e.jpg"
                      style={{ color: "transparent" }}
                    />
                    <div className="rbt-badge-3 bg-white">
                      <span>12 Mar</span>
                      <span>2024</span>
                    </div>
                  </Link>
                </div>
                <div className="rbt-card-body">
                  <ul className="rbt-meta">
                    <li>
                      <i className="feather-map-pin"></i>Vancouver
                    </li>
                    <li>
                      <i className="feather-clock"></i>8:00 am - 5:00 pm
                    </li>
                  </ul>
                  <h4 className="rbt-card-title">
                    <Link to="#">
                      Most Effective Ways Education's Problem.
                    </Link>
                  </h4>
                  <div className="read-more-btn">
                    <Link
                      className="rbt-btn btn-border hover-icon-reverse btn-sm radius-round"
                      to="#"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Get Ticket</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12">
              <div className="rbt-card card-list-2 event-list-card variation-01 rbt-hover">
                <div className="rbt-card-img">
                  <Link to="#">
                    <img
                      alt="Card image"
                      fetchpriority="high"
                      width="355"
                      height="240"
                      decoding="async"
                      data-nimg="1"
                      src="/assets/img/grid-type-069af9.jpg"
                      style={{ color: "transparent" }}
                    />
                    <div className="rbt-badge-3 bg-white">
                      <span>11 Oct</span>
                      <span>2024</span>
                    </div>
                  </Link>
                </div>
                <div className="rbt-card-body">
                  <ul className="rbt-meta">
                    <li>
                      <i className="feather-map-pin"></i>Paris
                    </li>
                    <li>
                      <i className="feather-clock"></i>8:00 am - 5:00 pm
                    </li>
                  </ul>
                  <h4 className="rbt-card-title">
                    <Link to="#">
                      Top 7 Common About Education.
                    </Link>
                  </h4>
                  <div className="read-more-btn">
                    <Link
                      className="rbt-btn btn-border hover-icon-reverse btn-sm radius-round"
                      to="#"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Get Ticket</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12 mt--60">
              <nav>
                <div className="nav-links">
                  <ul className="rbt-pagination">
                    <li className="disabled">
                      <Link aria-label="Previous" to="/pages/event-list#">
                        <i className="feather-chevron-left"></i>
                      </Link>
                    </li>
                    <li className="active">
                      <Link to="/pages/event-list#">1</Link>
                    </li>
                    <li className="">
                      <Link to="/pages/event-list#">2</Link>
                    </li>
                    <li className="">
                      <Link aria-label="Next" to="/pages/event-list#">
                        <i className="feather-chevron-right"></i>
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

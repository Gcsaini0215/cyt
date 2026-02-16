import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
export default function Success() {
  return (
    <>
      <MyNavbar />
      <div className="rbt-newsletter-area bg-color-white rbt-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h2 className="title">
                  Profile has been submitted <br />
                  Please wait for approval
                </h2>
                <form
                  action="#"
                  className="newsletter-form-1 mt--50 radius-round"
                >
                  <input
                    className="rbt-border"
                    type="email"
                    placeholder="Enter Your E-Email"
                  />
                  <button
                    type="submit"
                    className="rbt-btn btn-md btn-gradient hover-icon-reverse radius-round"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Subscribe</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

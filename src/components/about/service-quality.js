import LazyImage from "../../utils/lazy-image";
const BulbImg = "/assets/img/001-bulbf434.png";
const HatImg = "/assets/img/002-hat387c.png";
const IdCard = "/assets/img/003-id-cardae63.png";
const PassImg = "/assets/img/004-pass56c5.png";
export default function ServiceQuality() {
  return (
    <div className="rbt-rbt-card-area bg-color-white rbt-section-gap">
      <div className="container">
        <div className="row mb--60">
          <div className="col-lg-12">
            <div className="section-title text-center">
              <h2 className="title">
                We're committed to making your mental health our top priority.
              </h2>
            </div>
          </div>
        </div>
        <div className="row row--15 mt_dec--30">
          <div className="col-lg-4 col-xl-3 col-xxl-3 col-md-6 col-sm-6 col-12 mt--30">
            <div className="service-card service-card-6">
              <div className="inner">
                <div className="icon">
                  <LazyImage alt="icons" dim={"60"} src={BulbImg} />
                </div>
                <div className="content">
                  <h6 className="title">
                    <a href="/pages/about-us-02#">Holistic wellness</a>
                  </h6>
                  <p className="description">
                    We take a holistic approach to mental health, considering
                    all aspects of your life and well-being to provide
                    comprehensive care.
                  </p>
                </div>
                <span className="number-text">1</span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-xl-3 col-xxl-3 col-md-6 col-sm-6 col-12 mt--30">
            <div className="service-card service-card-6">
              <div className="inner">
                <div className="icon">
                  <LazyImage alt="icons" dim={"60"} src={HatImg} />
                </div>
                <div className="content">
                  <h6 className="title">
                    <a href="/pages/about-us-02#">Easy to Access</a>
                  </h6>
                  <p className="description">
                    We offer convenient access to therapy through our online
                    platform, making it easier for you to get the help you need.
                  </p>
                </div>
                <span className="number-text">2</span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-xl-3 col-xxl-3 col-md-6 col-sm-6 col-12 mt--30">
            <div className="service-card service-card-6">
              <div className="inner">
                <div className="icon">
                  <LazyImage alt="icons" dim={"60"} src={IdCard} />
                </div>
                <div className="content">
                  <h6 className="title">
                    <a href="/pages/about-us-02#">Personalized Care</a>
                  </h6>
                  <p className="description">
                    We tailor our services to meet your individual needs,
                    ensuring you receive personalized care that addresses your
                    specific concerns.
                  </p>
                </div>
                <span className="number-text">3</span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-xl-3 col-xxl-3 col-md-6 col-sm-6 col-12 mt--30">
            <div className="service-card service-card-6">
              <div className="inner">
                <div className="icon">
                  <LazyImage alt="icons" dim={"60"} src={PassImg} />
                </div>
                <div className="content">
                  <h6 className="title">
                    <a href="/pages/about-us-02#">Qualified Experts</a>
                  </h6>
                  <p className="description">
                    Our platform offers a diverse range of therapists with
                    expertise in various modalities and specialties,allowing you
                    to find a therapist that best fits your needs.
                  </p>
                </div>
                <span className="number-text">4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function StoryCyt() {
  return (
    <div className="rbt-about-area about-style-1 bg-color-extra2 rbt-section-gap">
      <div className="container">
         
          <div className="row g-5 align-items-start"></div><div
            className="col-lg-6 sal-animate"
            data-sal="slide-up"
            data-sal-duration="700"
          >
            <p className="mb--40 mb_sm--20">
             Choose Your Therapist LLP was born out of an idea during the COVID-19 pandemic in 2020, when the need for accessible and trusted mental health care became more evident than ever. What began as a simple initiative through an Instagram page and late-night website experiments gradually took shape into a structured platform.
On 16th July 2021, Choose Your Therapist LLP was officially incorporated, making the vision a registered reality. Today, CYT operates under the legal frameworks of the Ministry of Corporate Affairs (MCA) and MSME (Micro, Small, and Medium Enterprises).
Rather than being “just a platform,” Choose Your Therapist is a continuing journey — connecting individuals with mental health professionals, fostering awareness, and creating safe spaces where therapy is approachable and trusted.
            </p>
            <div className="readmore-btn">
              <Link
                style={{ cursor: "pointer" }}
                className="rbt-moderbt-btn"
                href={"/therapist-registration"}
              >
                <span className="moderbt-btn-text">Join us</span>
                <i className="feather-arrow-right"></i>
              </Link>
            </div>
          </div>
        <div className="row g-5 align-items-start">
          <div className="col-lg-6">
            <div className="content">
              <h2
                className="title mb--0 sal-animate"
                data-sal="slide-up"
                data-sal-duration="700"
              >
             The Story of Choose Your Therapist LLP
              </h2>
            </div>
          </div>
         
        </div>
      </div>
    </div>
  );
}

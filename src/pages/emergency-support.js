import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import Head from "next/head";
import Newsletter from "../components/home/newsletter";
import PageBreadCrumb from "../components/global/page-breadcrumb";
import Link from "next/link";

export default function EmergencySupport() {
  return (
    <div id="__next">
      <Head>
        <title>Emergency Support | 24/7 Mental Health Helplines India | Choose Your Therapist</title>
        <meta name="description" content="In a mental health crisis? Access immediate support with 24/7 emergency helplines across India. Find contacts for Tele Manas, Vandrevala Foundation, and more." />
        <meta name="keywords" content="Emergency Mental Health Support, Suicide Helpline India, Tele Manas, 24/7 Crisis Support" />
        <link rel="canonical" href="https://chooseyourtherapist.in/emergency-support" />
        
        <meta property="og:title" content="Emergency Support | 24/7 Mental Health Helplines India | Choose Your Therapist" />
        <meta property="og:description" content="Immediate help and crisis support resources for mental health emergencies." />
        <meta property="og:url" content="https://chooseyourtherapist.in/emergency-support" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Emergency Support | 24/7 Mental Health Helplines India | Choose Your Therapist" />
        <meta name="twitter:description" content="Find immediate help for mental health crises." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Head>
      <MyNavbar />
      <PageBreadCrumb title="Emergency Support" linkTitle="Get Help When You Need It Most" />

      {/* Emergency Alert Section */}
      <div className="rbt-section-gap bg-color-danger">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="emergency-alert text-center">
                <div className="alert-icon">
                  <i className="feather-alert-triangle"></i>
                </div>
                <h2 className="title text-white">If You're in Crisis</h2>
                <p className="description text-white mt--20">
                  If you or someone you know is in immediate danger or experiencing a mental health emergency,
                  please contact emergency services immediately.
                </p>
                <div className="emergency-contacts mt--30">
                  <div className="row justify-content-center">
                    <div className="col-lg-4 col-md-6">
                      <div className="emergency-card">
                        <h4>Emergency Services</h4>
                        <a href="tel:112" className="emergency-btn">
                          <i className="feather-phone"></i>
                          Call 112 (India)
                        </a>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6">
                      <div className="emergency-card">
                        <h4>Mental Health Helpline</h4>
                        <a href="tel:18008914416" className="emergency-btn">
                          <i className="feather-phone"></i>
                          Tele Manas: 1800 89 14416
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Resources Section */}
      <div className="rbt-section-gap bg-color-white">
        <div className="container">
          <div className="row mb--40">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h2 className="title">Mental Health Support Resources</h2>
                <p className="description mt--20">
                  Access professional help and support services available 24/7 across India
                </p>
              </div>
            </div>
          </div>

          <div className="row g-5">
            {/* National Helplines */}
            <div className="col-lg-6">
              <div className="support-card">
                <div className="card-header">
                  <h4>National Mental Health Helplines</h4>
                </div>
                <div className="card-body">
                  <ul className="helpline-list">
                    <li>
                      <strong>Tele Manas:</strong>
                      <a href="tel:18008914416">1800 89 14416</a>
                      <span className="text-muted">(24/7, Toll-free)</span>
                    </li>
                    <li>
                      <strong>Vandrevala Foundation:</strong>
                      <a href="tel:9999666555">9999 666 555</a>
                      <span className="text-muted">(24/7)</span>
                    </li>
                    <li>
                      <strong>AASRA:</strong>
                      <a href="tel:9820466726">98204 66726</a>
                      <span className="text-muted">(24/7)</span>
                    </li>
                    <li>
                      <strong>Connecting NGO:</strong>
                      <a href="tel:9922004305">99220 04305</a>
                      <span className="text-muted">(24/7)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* State Helplines */}
            <div className="col-lg-6">
              <div className="support-card">
                <div className="card-header">
                  <h4>State Mental Health Helplines</h4>
                </div>
                <div className="card-body">
                  <ul className="helpline-list">
                    <li>
                      <strong>Delhi:</strong>
                      <a href="tel:01123389090">011-23389090</a>
                    </li>
                    <li>
                      <strong>Maharashtra:</strong>
                      <a href="tel:02225521111">022-25521111</a>
                    </li>
                    <li>
                      <strong>Karnataka:</strong>
                      <a href="tel:08046110007">080-46110007</a>
                    </li>
                    <li>
                      <strong>Tamil Nadu:</strong>
                      <a href="tel:04428411800">044-28411800</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Online Resources */}
            <div className="col-lg-6">
              <div className="support-card">
                <div className="card-header">
                  <h4>Online Mental Health Resources</h4>
                </div>
                <div className="card-body">
                  <ul className="resource-list">
                    <li>
                      <a href="https://www.nimhans.ac.in/" target="_blank" rel="noopener noreferrer">
                        NIMHANS (National Institute of Mental Health and Neurosciences)
                      </a>
                    </li>
                    <li>
                      <a href="https://www.aiims.edu/" target="_blank" rel="noopener noreferrer">
                        AIIMS Mental Health Services
                      </a>
                    </li>
                    <li>
                      <a href="https://www.who.int/health-topics/mental-disorders" target="_blank" rel="noopener noreferrer">
                        WHO Mental Health Resources
                      </a>
                    </li>
                    <li>
                      <a href="https://www.mohfw.gov.in/" target="_blank" rel="noopener noreferrer">
                        Ministry of Health and Family Welfare
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* When to Seek Help */}
            <div className="col-lg-6">
              <div className="support-card">
                <div className="card-header">
                  <h4>When to Seek Emergency Help</h4>
                </div>
                <div className="card-body">
                  <ul className="warning-list">
                    <li>Suicidal thoughts or self-harm</li>
                    <li>Severe depression or anxiety</li>
                    <li>Psychotic episodes or hallucinations</li>
                    <li>Substance abuse emergencies</li>
                    <li>Domestic violence situations</li>
                    <li>Child abuse concerns</li>
                  </ul>
                  <div className="warning-note">
                    <strong>Remember:</strong> If someone is in immediate danger, call emergency services (112) first.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="rbt-section-gap bg-color-extra2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="contact-section text-center">
                <h3 className="title">Need Non-Emergency Support?</h3>
                <p className="description mt--20">
                  For non-emergency mental health concerns, our platform connects you with licensed therapists.
                  Professional help is available through scheduled consultations.
                </p>
                <div className="contact-options mt--30">
                  <div className="row justify-content-center">
                    <div className="col-lg-4 col-md-6">
                      <Link className="rbt-btn btn-border-gradient radius-round" href="/view-all-therapist">
                        <span className="btn-text">Find a Therapist</span>
                      </Link>
                    </div>
                    <div className="col-lg-4 col-md-6">
                      <a className="rbt-btn btn-gradient hover-icon-reverse" href="tel:+918077757951">
                        <div className="icon-reverse-wrapper">
                          <span className="btn-text">Call Support</span>
                          <span className="btn-icon">
                            <i className="feather-phone"></i>
                          </span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Newsletter />
      <Footer />
    </div>
  );
}
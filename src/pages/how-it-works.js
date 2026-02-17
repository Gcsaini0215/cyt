import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import { Helmet } from "react-helmet";
import Newsletter from "../components/home/newsletter";
import PageBreadCrumb from "../components/global/page-breadcrumb";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <div id="__next">
      <Helmet>
        <title>How It Works | Find Your Perfect Therapist | Choose Your Therapist</title>
        <meta name="description" content="Discover how Choose Your Therapist simplifies finding and booking sessions with verified psychologists in India. Three simple steps to start your mental health journey." />
        <meta name="keywords" content="How to Book Therapist, Therapy Process, Verified Psychologists India, Mental Health Journey" />
        <link rel="canonical" href="https://chooseyourtherapist.in/how-it-works" />
        
        <meta property="og:title" content="How It Works | Find Your Perfect Therapist | Choose Your Therapist" />
        <meta property="og:description" content="A simple 3-step process to connect with verified mental health professionals." />
        <meta property="og:url" content="https://chooseyourtherapist.in/how-it-works" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How It Works | Find Your Perfect Therapist | Choose Your Therapist" />
        <meta name="twitter:description" content="Learn how easy it is to start your therapy journey with us." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Helmet>
      <MyNavbar />
      <PageBreadCrumb title="How It Works" linkTitle="Find Your Perfect Therapist" />

      {/* How It Works Section */}
      <div className="rbt-section-gap bg-color-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h2 className="title">How Choose Your Therapist Works</h2>
                <p className="description mt--20">
                  Finding the right therapist has never been easier. Our platform connects you with verified mental health professionals in just a few simple steps.
                </p>
              </div>
            </div>
          </div>

          <div className="row g-5 mt--30">
            {/* Step 1 */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="service-card service-card-3 hover-action">
                <div className="inner">
                  <div className="content">
                    <div className="step-number">
                      <span className="number">01</span>
                    </div>
                    <h4 className="title">Browse & Choose</h4>
                    <p className="description">
                      Explore our directory of verified therapists. Filter by specialization, location, experience, and consultation fees to find the perfect match for your needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="service-card service-card-3 hover-action">
                <div className="inner">
                  <div className="content">
                    <div className="step-number">
                      <span className="number">02</span>
                    </div>
                    <h4 className="title">Book Consultation</h4>
                    <p className="description">
                      Schedule your consultation at a convenient time. Choose from various session formats including online, in-person, or phone consultations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="service-card service-card-3 hover-action">
                <div className="inner">
                  <div className="content">
                    <div className="step-number">
                      <span className="number">03</span>
                    </div>
                    <h4 className="title">Start Your Journey</h4>
                    <p className="description">
                      Begin your therapeutic journey with confidence. Our platform ensures secure, confidential sessions with licensed professionals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="rbt-section-gap bg-color-extra2">
        <div className="container">
          <div className="row mb--40">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h2 className="title">Why Choose Our Platform?</h2>
                <p className="description mt--20">
                  We prioritize your mental health journey with these key features
                </p>
              </div>
            </div>
          </div>

          <div className="row g-5">
            <div className="col-lg-6">
              <div className="feature-card">
                <div className="icon">
                  <i className="feather-shield"></i>
                </div>
                <div className="content">
                  <h4>Verified Professionals</h4>
                  <p>All therapists are licensed and verified. We conduct thorough background checks to ensure quality care.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="feature-card">
                <div className="icon">
                  <i className="feather-lock"></i>
                </div>
                <div className="content">
                  <h4>Secure & Confidential</h4>
                  <p>Your privacy is our priority. All consultations are conducted through secure, encrypted platforms.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="feature-card">
                <div className="icon">
                  <i className="feather-dollar-sign"></i>
                </div>
                <div className="content">
                  <h4>Transparent Pricing</h4>
                  <p>No hidden fees. Clear pricing for all consultation types with flexible payment options.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="feature-card">
                <div className="icon">
                  <i className="feather-clock"></i>
                </div>
                <div className="content">
                  <h4>Flexible Scheduling</h4>
                  <p>Book sessions at your convenience with 24/7 availability and easy rescheduling options.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rbt-section-gap bg-gradient-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="call-to-action-content text-center">
                <h3 className="title">Ready to Start Your Healing Journey?</h3>
                <p className="description">
                  Take the first step towards better mental health. Browse our therapist directory and book your consultation today.
                </p>
                <div className="call-to-action-btn mt--30">
                  <Link className="rbt-btn btn-gradient hover-icon-reverse" to="/view-all-therapist">
                    <div className="icon-reverse-wrapper">
                      <span className="btn-text">Find Your Therapist</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </div>
                  </Link>
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
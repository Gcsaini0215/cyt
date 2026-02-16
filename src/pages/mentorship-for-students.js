import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import Newsletter from "../components/home/newsletter";
import PageBreadCrumb from "../components/global/page-breadcrumb";
import { Link } from "react-router-dom";

export default function MentorshipForStudents() {
  return (
    <div id="__next">
      <MyNavbar />
      <PageBreadCrumb title="Mentorship for Students" linkTitle="Guidance for Future Mental Health Professionals" />

      {/* Hero Section */}
      <div className="rbt-section-gap bg-gradient-2">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="hero-content">
                <h1 className="title">Shape Your Future in Mental Health</h1>
                <p className="description mt--20">
                  Our comprehensive mentorship program connects aspiring mental health professionals with experienced practitioners.
                  Gain practical insights, build your network, and develop essential skills for your career.
                </p>
                <div className="hero-btns mt--30">
                  <Link className="rbt-btn btn-gradient hover-icon-reverse" to="/therapist-registration">
                    <div className="icon-reverse-wrapper">
                      <span className="btn-text">Join as Mentor</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </div>
                  </Link>
                  <a className="rbt-btn btn-border-gradient radius-round ml--20" href="#mentorship-programs">
                    <span className="btn-text">Explore Programs</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="hero-image">
                <img src="/assets/images/mentorship-hero.png" alt="Student Mentorship" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div id="mentorship-programs" className="rbt-section-gap bg-color-white">
        <div className="container">
          <div className="row mb--40">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h2 className="title">Our Mentorship Programs</h2>
                <p className="description mt--20">
                  Comprehensive guidance across different stages of your mental health career journey
                </p>
              </div>
            </div>
          </div>

          <div className="row g-5">
            {/* Internship & Practical Training */}
            <div className="col-lg-4 col-md-6">
              <div className="program-card">
                <div className="card-icon">
                  <i className="feather-briefcase"></i>
                </div>
                <h4 className="card-title">Internship & Practical Training</h4>
                <p className="card-description">
                  Hands-on experience in clinical settings, case studies, and therapeutic techniques under expert supervision.
                </p>
                <ul className="program-features">
                  <li>Clinical observation sessions</li>
                  <li>Case study analysis</li>
                  <li>Therapeutic technique workshops</li>
                  <li>Professional development seminars</li>
                </ul>
              </div>
            </div>

            {/* Career Mentorship */}
            <div className="col-lg-4 col-md-6">
              <div className="program-card">
                <div className="card-icon">
                  <i className="feather-trending-up"></i>
                </div>
                <h4 className="card-title">Career Mentorship</h4>
                <p className="card-description">
                  Personalized guidance for career planning, specialization choices, and professional growth in mental health.
                </p>
                <ul className="program-features">
                  <li>Career path planning</li>
                  <li>Specialization guidance</li>
                  <li>Resume and portfolio support</li>
                  <li>Job search assistance</li>
                </ul>
              </div>
            </div>

            {/* Research Guidance */}
            <div className="col-lg-4 col-md-6">
              <div className="program-card">
                <div className="card-icon">
                  <i className="feather-search"></i>
                </div>
                <h4 className="card-title">Research Guidance</h4>
                <p className="card-description">
                  Support for academic research, thesis development, and publication in mental health and psychology.
                </p>
                <ul className="program-features">
                  <li>Research methodology training</li>
                  <li>Thesis and dissertation guidance</li>
                  <li>Publication support</li>
                  <li>Academic writing workshops</li>
                </ul>
              </div>
            </div>

            {/* Workshops & Webinars */}
            <div className="col-lg-4 col-md-6">
              <div className="program-card">
                <div className="card-icon">
                  <i className="feather-video"></i>
                </div>
                <h4 className="card-title">Workshops & Webinars</h4>
                <p className="card-description">
                  Interactive sessions on current trends, therapeutic approaches, and professional development topics.
                </p>
                <ul className="program-features">
                  <li>Latest therapeutic techniques</li>
                  <li>Industry trends and updates</li>
                  <li>Professional ethics discussions</li>
                  <li>Networking opportunities</li>
                </ul>
              </div>
            </div>

            {/* Networking Opportunities */}
            <div className="col-lg-4 col-md-6">
              <div className="program-card">
                <div className="card-icon">
                  <i className="feather-users"></i>
                </div>
                <h4 className="card-title">Networking Opportunities</h4>
                <p className="card-description">
                  Connect with professionals, join communities, and build relationships that support your career growth.
                </p>
                <ul className="program-features">
                  <li>Professional networking events</li>
                  <li>Alumni connections</li>
                  <li>Industry conferences</li>
                  <li>Peer learning groups</li>
                </ul>
              </div>
            </div>

            {/* Case Study Discussions */}
            <div className="col-lg-4 col-md-6">
              <div className="program-card">
                <div className="card-icon">
                  <i className="feather-file-text"></i>
                </div>
                <h4 className="card-title">Case Study Discussions</h4>
                <p className="card-description">
                  Analyze real-world cases, discuss treatment approaches, and learn from experienced practitioners.
                </p>
                <ul className="program-features">
                  <li>Real case analysis</li>
                  <li>Treatment planning discussions</li>
                  <li>Ethical dilemma scenarios</li>
                  <li>Group learning sessions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="rbt-section-gap bg-color-extra2">
        <div className="container">
          <div className="row mb--40">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h2 className="title">Why Choose Our Mentorship Program?</h2>
              </div>
            </div>
          </div>

          <div className="row g-5">
            <div className="col-lg-6">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="feather-award"></i>
                </div>
                <div className="benefit-content">
                  <h4>Expert Guidance</h4>
                  <p>Learn from licensed professionals with years of clinical experience and academic expertise.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="feather-target"></i>
                </div>
                <div className="benefit-content">
                  <h4>Personalized Learning</h4>
                  <p>Tailored mentorship programs that align with your career goals and learning pace.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="feather-globe"></i>
                </div>
                <div className="benefit-content">
                  <h4>Industry Connections</h4>
                  <p>Build valuable professional networks and access exclusive career opportunities.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="feather-book-open"></i>
                </div>
                <div className="benefit-content">
                  <h4>Practical Skills</h4>
                  <p>Gain hands-on experience and develop essential clinical and professional skills.</p>
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
                <h3 className="title">Ready to Start Your Journey?</h3>
                <p className="description">
                  Join our mentorship program and take the first step towards becoming a mental health professional.
                  Connect with experienced mentors and begin your transformative learning experience.
                </p>
                <div className="call-to-action-btn mt--30">
                  <Link className="rbt-btn btn-gradient hover-icon-reverse" to="/contact-us">
                    <div className="icon-reverse-wrapper">
                      <span className="btn-text">Get Started Today</span>
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
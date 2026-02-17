import React from "react";
import { Helmet } from "react-helmet-async";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import Newsletter from "../components/home/newsletter";
import Faqs from "../components/home/faqs";
import PageBreadCrumb from "../components/global/page-breadcrumb";
export default function FaqPage() {
  return (
    <div id="__next">
      <Helmet>
        <title>Frequently Asked Questions | Help & Support | Choose Your Therapist</title>
        <meta name="description" content="Find answers to common questions about therapy, booking sessions, verified psychologists, and how Choose Your Therapist works to support your mental health." />
        <meta name="keywords" content="Therapy FAQ, Psychology Support India, Mental Health Questions, Choose Your Therapist Help" />
        <link rel="canonical" href="https://chooseyourtherapist.in/faqs" />
        
        <meta property="og:title" content="Frequently Asked Questions | Help & Support | Choose Your Therapist" />
        <meta property="og:description" content="Find answers to common questions about therapy, booking sessions, and verified psychologists." />
        <meta property="og:url" content="https://chooseyourtherapist.in/faqs" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Frequently Asked Questions | Help & Support | Choose Your Therapist" />
        <meta name="twitter:description" content="Find answers to common questions about Choose Your Therapist." />
        <meta name="twitter:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
      </Helmet>
      <MyNavbar />
      <PageBreadCrumb title="Frequently Asked Questions (FAQ)" linkTitle="Help and Support for Clients"/>
      <Faqs />

      <div className="rbt-contact-me bg-color-extra2 rbt-section-gap">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="content">
                <div className="section-title text-start">
                  <h2 className="title">
                    Want to Stay Informed About New Services &amp; Mental Health
                    Resources?
                  </h2>
                  <p className="description mt--20">
                    Stay connected with Choose Your Therapist to receive updates
                    on our latest services, mental health resources, and special
                    offers.
                  </p>
                  <div className="social-share-wrapper mt--30">
                    <h5>You can also follow us on:</h5>
                    <ul className="social-icon social-default transparent-with-border justify-content-start mt--30">
                      <li>
                        <a href="https://www.facebook.com/">
                          <i className="feather-facebook"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.twitter.com">
                          <i className="feather-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.instagram.com/">
                          <i className="feather-instagram"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.linkdin.com/">
                          <i className="feather-linkedin"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 offset-xl-1">
              <div className="rbt-contact-form contact-form-style-1 max-width-auto">
                <form id="contact-form" className="w-100">
                  <div className="form-group">
                    <input name="con_name" type="text" placeholder="Name" />
                    <span className="focus-border"></span>
                  </div>
                  <div className="form-group">
                    <input name="con_email" type="email" placeholder="Email" />
                    <span className="focus-border"></span>
                  </div>
                  <div className="form-group">
                    <input type="text" placeholder="Phone" />
                    <span className="focus-border"></span>
                  </div>
                  <div className="form-group">
                    <textarea placeholder="Message"></textarea>
                    <span className="focus-border"></span>
                  </div>
                  <div className="form-submit-group">
                    <button
                      type="submit"
                      className="rbt-btn radius-round btn-gradient hover-icon-reverse"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">GET IT NOW</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </button>
                  </div>
                </form>
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

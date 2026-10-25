import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import JoinHeader from "../components/joinus/header";
import Content from "../components/joinus/content";
import ServiceBenefits from "../components/joinus/service-benefits";

import CallToAction from "../components/home/call-to-action";
import FAQs from "../components/home/faqs";
import ServiceQuality from "../components/about/service-quality";
export default function JoinUs() {
  return (
    <div id="__next">
      {/* older version of the therapist sign-up page — /therapist-registration is the one to index */}
      <Head>
        <title>Join as a Therapist | Choose Your Therapist</title>
        <meta name="description" content="Psychologists and counsellors: join Choose Your Therapist, get a verified profile and get booked online or in person." />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/therapist-registration" />
      </Head>
      <MyNavbar />
      <div className="rbt-overlay-page-wrapper mt--60">
        <JoinHeader />
        <div className="rbt-putchase-guide-area breadcrumb-style-max-width rbt-section-gapBottom">
          <ServiceBenefits />
          <Content />
          <ServiceQuality />
        </div>
      </div>
      <CallToAction />
      <FAQs />
      <Footer />
    </div>
  );
}

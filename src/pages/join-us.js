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

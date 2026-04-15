import MyNavbar from "../components/navbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import Head from "next/head";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
export default function TermsCondition() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const styles = {
    container: {
      padding: "20px",
      marginTop: isMobile ? 60 : 80,
      fontFamily: "Arial, sans-serif",
    },
  };
  return (
    <>
      <Head>
        <title>Terms and Conditions | Choose Your Therapist</title>
        <meta name="description" content="Review the terms and conditions for using the Choose Your Therapist platform. Understand our service nature, user responsibilities, and booking policies." />
        <meta name="keywords" content="Terms and Conditions, User Agreement, Therapy Service Terms, Choose Your Therapist" />
        
        <meta property="og:title" content="Terms and Conditions | Choose Your Therapist" />
        <meta property="og:description" content="Our platform's terms of service and user agreement." />
        <meta property="og:url" content="https://chooseyourtherapist.in/terms-conditions" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms and Conditions | Choose Your Therapist" />
        <meta name="twitter:description" content="Review our platform's terms of service." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Head>
      <MyNavbar />
      <div className="container" style={{ ...styles.container, maxWidth: '1000px', margin: 'auto' }}>
        <div className="section-title text-center mb--50">
          <h1 className="title">Terms and Conditions</h1>
          <p className="description">Effective Date: <strong>01-10-2024</strong></p>
        </div>

        <div className="rbt-shadow-box p--40 mb--50" style={{ border: '1px solid #eee', borderRadius: '15px' }}>
          <p className="mb--30">
            Welcome to <strong>Choose Your Therapist</strong>! By accessing or using our website,
            <a href="https://www.chooseyourtherapist.in" className="color-primary fw-bold"> www.chooseyourtherapist.in </a>
            (the “Site”), you agree to be bound by the following Terms and Conditions. These terms govern your use of our services, including booking sessions with therapists listed on our platform.
          </p>

          <div className="terms-content">
            {/* Section 1 */}
            <div className="single-term mb--40 pb--30" style={{ borderBottom: '1px solid #f1f1f1' }}>
              <h3 className="title mb--20"><i className="feather-info mr--10 color-primary"></i> 1. Nature of Our Services</h3>
              <p>
                <strong>Choose Your Therapist</strong> provides a platform where users can book therapy sessions with independent, qualified therapists. While we do not offer therapy services ourselves, we are committed to ensuring that all therapists listed on our platform have accurate and verified profiles.
              </p>
              <p className="mb-0">
                Once a booking is made, the therapist is responsible for the quality and delivery of the therapy session. We facilitate the connection but do not directly supervise the therapist-client relationship.
              </p>
            </div>

            {/* Section 2 */}
            <div className="single-term mb--40 pb--30" style={{ borderBottom: '1px solid #f1f1f1' }}>
              <h3 className="title mb--20"><i className="feather-user mr--10 color-primary"></i> 2. User Responsibilities</h3>
              <p>
                When booking a session, you agree to provide accurate information and use the platform in good faith. You understand that therapists are independent professionals.
              </p>
              <p className="mb-0">
                It is your responsibility to engage with therapists respectfully. Any concerns about a specific session should be addressed directly with the therapist, and we will assist where appropriate.
              </p>
            </div>

            {/* Section 3 */}
            <div className="single-term mb--40 pb--30" style={{ borderBottom: '1px solid #f1f1f1' }}>
              <h3 className="title mb--20"><i className="feather-credit-card mr--10 color-primary"></i> 3. Bookings and Payment</h3>
              <p>
                You enter into an agreement with the therapist under the terms outlined in their profile. <strong>Choose Your Therapist</strong> acts as an intermediary for facilitating bookings and providing a secure payment process.
              </p>
              <p className="mb-0">
                Payments are processed through secure third-party gateways. Any payment issues must be communicated to us immediately.
              </p>
            </div>

            {/* Section 4 */}
            <div className="single-term mb--40 pb--30" style={{ borderBottom: '1px solid #f1f1f1' }}>
              <h3 className="title mb--20"><i className="feather-shield mr--10 color-primary"></i> 4. Data and Security</h3>
              <p className="mb-0">
                We are committed to ensuring the security of your personal information. Data provided during booking is protected by appropriate security measures and is only used for the purposes for which it was collected.
              </p>
            </div>

            {/* Section 5 */}
            <div className="single-term mb--40 pb--30" style={{ borderBottom: '1px solid #f1f1f1' }}>
              <h3 className="title mb--20"><i className="feather-check-circle mr--10 color-primary"></i> 5. Therapist Accountability</h3>
              <p>
                We vet therapists by checking qualifications and credentials before listing. However, the therapist is solely responsible for the professionalism of the services delivered.
              </p>
              <p className="mb-0">
                If you encounter issues, please reach out to both the therapist and our team. We are here to support the resolution process.
              </p>
            </div>

            {/* Section 6 */}
            <div className="single-term mb--40 pb--30" style={{ borderBottom: '1px solid #f1f1f1' }}>
              <h3 className="title mb--20"><i className="feather-alert-triangle mr--10 color-primary"></i> 6. Limitation of Liability</h3>
              <p className="mb-0">
                Agreements for therapy services are between you and the therapist. <strong>Choose Your Therapist</strong> is not liable for any actions taken by the therapist during sessions, nor do we guarantee the specific outcomes of therapy.
              </p>
            </div>

            {/* Section 7 */}
            <div className="single-term mb--40 pb--30" style={{ borderBottom: '1px solid #f1f1f1' }}>
              <h3 className="title mb--20"><i className="feather-edit mr--10 color-primary"></i> 7. Modification of Terms</h3>
              <p className="mb-0">
                We reserve the right to update these Terms at any time. Continued use of the site after changes constitutes your acceptance of the updated terms.
              </p>
            </div>

            {/* Section 8 */}
            <div className="single-term mb--0">
              <h3 className="title mb--20"><i className="feather-mail mr--10 color-primary"></i> 8. Contact Information</h3>
              <p className="mb-0">
                If you have questions, please contact us at: <br/>
                <strong>Email:</strong> <a href="mailto:support@chooseyourtherapist.in" className="color-primary">support@chooseyourtherapist.in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <NewsLetter />

      <div className="rbt-progress-parent">
        <svg
          className="rbt-back-circle svg-inner"
          width="100%"
          height="100%"
          viewBox="-1 -1 102 102"
        >
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"></path>
        </svg>
      </div>
      <Footer />
    </>
  );
}

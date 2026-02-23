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
        <link rel="canonical" href="https://chooseyourtherapist.in/terms-conditions" />
        
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
      <div style={styles.container}>
        <h1>Terms and Conditions for Using Choose Your Therapist</h1>
        <p>
          <strong>Last updated:</strong> 01-10-2024
        </p>
        <p>
          Welcome to <strong>Choose Your Therapist</strong>! By accessing or
          using our website,
          <a href="https://www.chooseyourtherapist.in">
            {" "}
            www.chooseyourtherapist.in
          </a>{" "}
          (the “Site”), you agree to be bound by the following Terms and
          Conditions. These terms govern your use of our services, including
          booking sessions with therapists listed on our platform. Please read
          them carefully, and if you do not agree to these terms, kindly refrain
          from using the site.
        </p>

        <h3>Nature of Our Services</h3>
        <p>
          <strong>Choose Your Therapist</strong> provides a platform where users
          can book therapy sessions with independent, qualified therapists.
          While we do not offer therapy services ourselves, we are committed to
          ensuring that all therapists listed on our platform have accurate and
          verified profiles. Our team reviews therapist credentials and
          qualifications before they are made available to users, helping you
          find a therapist that best suits your needs.
        </p>
        <p>
          However, once a booking is made, the therapist is responsible for the
          quality and delivery of the therapy session.
          <strong>Choose Your Therapist</strong> facilitates the connection and
          booking process to make therapy accessible but does not directly
          supervise the therapist-client relationship or services rendered.
        </p>

        <h3>User Responsibilities</h3>
        <p>
          When booking a session through <strong>Choose Your Therapist</strong>,
          you agree to provide accurate and complete information about yourself
          and to use the platform in good faith. You understand that the
          therapists available on the platform are independent professionals who
          have been vetted based on the information they provide. It is your
          responsibility to engage with therapists respectfully and in
          accordance with the terms agreed upon at the time of booking.
        </p>
        <p>
          You also agree that the information provided by the therapist in their
          profile is correct to the best of our verification process, but the
          responsibility of fulfilling therapy services lies with the therapist.
          Any concerns about a specific session should be addressed directly
          with the therapist, and we will assist where appropriate to resolve
          any issues.
        </p>

        <h3>Bookings and Payment</h3>
        <p>
          When booking a session with a therapist, you enter into an agreement
          with the therapist under the terms outlined in their profile.
          <strong>Choose Your Therapist</strong> acts as an intermediary for
          facilitating bookings and providing a secure payment process. All fees
          related to therapy sessions will be charged according to the
          therapist’s rate, and payments are processed through third-party
          payment gateways.
        </p>
        <p>
          We take every measure to ensure the integrity of the booking process.
          Any issues related to payments must be communicated directly with us,
          and we will work with the payment processor to resolve disputes if
          necessary.
        </p>

        <h3>Data and Security</h3>
        <p>
          We are committed to ensuring the security of your personal
          information. The data you provide when booking through our platform is
          protected by appropriate security measures.{" "}
          <strong>Choose Your Therapist</strong> follows strict procedures for
          safeguarding personal data, ensuring that it is only used for the
          purposes for which it was collected. For more information on how we
          handle your data, please refer to our Privacy Policy.
        </p>

        <h3>Therapist Profile and Accountability</h3>
        <p>
          At <strong>Choose Your Therapist</strong>, we take the process of
          vetting therapists seriously. We ensure that each therapist’s profile
          is complete, accurate, and verified before they are listed on our
          site. We check their qualifications, experience, and credentials to
          the best of our ability. Our goal is to provide you with a trustworthy
          selection of professionals to choose from.
        </p>
        <p>
          While we ensure therapists meet our platform standards, the therapist
          is responsible for the quality and professionalism of the services
          they deliver. Should you encounter any issues with the services
          received, we encourage you to reach out to both the therapist and our
          team. We are here to support the resolution process and will take
          steps to investigate concerns or disputes.
        </p>

        <h3>Limitation of Liability</h3>
        <p>
          <strong>Choose Your Therapist</strong> ensures that all therapists are
          vetted, and their profiles accurately represent their services.
          However, the responsibility for the therapy services themselves rests
          with the therapist. By using our platform, you acknowledge that any
          agreements for therapy services are between you and the therapist, and{" "}
          <strong>Choose Your Therapist</strong> is not liable for any actions
          taken by the therapist during your sessions.
        </p>
        <p>
          While we will assist in resolving any issues or disputes, we do not
          guarantee the outcomes or effectiveness of the therapy services
          provided.
        </p>

        <h3>Intellectual Property</h3>
        <p>
          All content on the <strong>Choose Your Therapist</strong> website,
          including design, branding, and text, is the property of the platform
          or its licensors and is protected under intellectual property laws.
          You may access and use the content for personal, non-commercial
          purposes only.
        </p>
        <p>
          You may not reproduce, distribute, or use any content for commercial
          purposes without our prior written consent.
        </p>

        <h3>Third-Party Links</h3>
        <p>
          Our website may contain links to third-party websites, including those
          of independent therapists. <strong>Choose Your Therapist</strong>
          is not responsible for the content, privacy policies, or practices of
          these external sites. We encourage you to review their terms and
          conditions before engaging with third-party services.
        </p>

        <h3>Modification of Terms</h3>
        <p>
          We reserve the right to update or modify these Terms and Conditions at
          any time. Any changes will be posted on this page, and the "Last
          Updated" date will reflect the most recent changes. Continued use of
          the site after changes have been posted constitutes your acceptance of
          the updated terms.
        </p>

        <h3>Termination</h3>
        <p>
          We may suspend or terminate your access to the platform at our
          discretion, particularly if we believe you have violated these Terms
          and Conditions. Termination may occur without prior notice or
          liability to you.
        </p>

        <h3>Contact Information</h3>
        <p>
          If you have any questions regarding these Terms and Conditions, please
          contact us at:
        </p>
        <p>
          <strong>Choose Your Therapist</strong>
          <br />
          Email: support@chooseyourtherapist.in
        </p>
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

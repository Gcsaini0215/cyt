import MyNavbar from "../components/navbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Helmet } from "react-helmet";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
export default function CancellationPolicy() {
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
      <Helmet>
        <title>Cancellation Policy | Refund & Rescheduling | Choose Your Therapist</title>
        <meta name="description" content="Review our cancellation and refund policy. Understand the terms for rescheduling or canceling your therapy sessions with independent therapists." />
        <meta name="keywords" content="Cancellation Policy, Refund Policy, Reschedule Therapy Session, Choose Your Therapist" />
        <link rel="canonical" href="https://chooseyourtherapist.in/cancellation-policy" />
        
        <meta property="og:title" content="Cancellation Policy | Refund & Rescheduling | Choose Your Therapist" />
        <meta property="og:description" content="Our terms for canceling or rescheduling therapy sessions." />
        <meta property="og:url" content="https://chooseyourtherapist.in/cancellation-policy" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cancellation Policy | Refund & Rescheduling | Choose Your Therapist" />
        <meta name="twitter:description" content="Review our cancellation and refund terms." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Helmet>
      <MyNavbar />
      <br />
      <div style={styles.container}>
        <h1>Cancellation Policy</h1>
        <p>
          <strong>Last updated:</strong> 01-10-2024
        </p>
        <h3>
          We understand that plans can change. Please review our cancellation
          terms below:
        </h3>
        <p>
          1. Cancellations must be made at least 24 hours before the scheduled
          session.
          <br /> 2. Sessions canceled within 24 hours will incur a 50% charge.
          <br />
          3. No-shows or same-day cancellations will be charged the full session
          fee.
          <br /> 4. Clients can cancel through our platform or by directly
          contacting their therapist.
          <br /> 5. Refunds are processed within 5-7 business days.
          <br /> 6. Emergency cancellations (e.g., illness) may be considered
          for exceptions.
          <br /> 7. Therapists reserve the right to cancel sessions if
          necessary.
          <br /> 8. In the event of therapist cancellations, clients will be
          informed and offered rescheduling options.
          <br /> 9. Repeated cancellations may result in service suspension or
          additional fees.
          <br /> 10. Cancellations for package-based services adhere to specific
          terms outlined at the time of purchase.
        </p>
        <p>
          <strong>Disclaimer:</strong> This cancellation policy may be updated
          at any time. Please review the terms before each session to stay
          informed.
        </p>
        <br />
        <br />
        <br />
        <br />
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

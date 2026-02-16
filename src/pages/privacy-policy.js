import MyNavbar from "../components/navbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
export default function PrivacyPolicy() {
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
      <MyNavbar />
      <div style={styles.container}>
        <h1>Privacy and Policy</h1>
        <p>
          <strong>Last updated:</strong> 01-10-2024
        </p>
        <p>
          At <strong>Choose Your Therapist</strong>, we are committed to
          safeguarding your privacy and handling your personal information with
          care. This Privacy Policy explains how we collect, use, and protect
          the data you provide when you book a session through our website,{" "}
          <a href="https://www.chooseyourtherapist.in">
            www.chooseyourtherapist.in
          </a>{" "}
          (the “Site”). By using the Site, you agree to the terms outlined here.
        </p>
        <h3>Information We Collect</h3>
        <p>
          We collect personal identification information when you interact with
          our booking services. This may include your name, contact details
          (such as email address and phone number), and any other information
          you voluntarily provide while filling out booking forms or subscribing
          to our communications. This information helps us facilitate your
          bookings with the therapists listed on our platform.
        </p>
        <p>
          We also collect non-personal identification information automatically
          when you visit our website. This data includes your browser type,
          device information, IP address, pages visited, and time spent on the
          site. This helps us optimize our platform and improve the user
          experience.
        </p>
        <h3>How We Use Your Information</h3>
        <p>
          The information you provide is primarily used to facilitate the
          booking of therapy sessions. <strong>Choose Your Therapist</strong>
          acts as a platform to help connect you with independent therapists. We
          do not provide therapy services ourselves, nor do we control or
          supervise the services rendered by the therapists. Our role is
          strictly to handle the booking process and redirect you to the
          appropriate therapist of your choice.
        </p>
        <p>
          Additionally, we may use your contact information to send you
          notifications about bookings, provide customer support, and deliver
          relevant updates or promotional materials. You have the option to
          opt-out of such communications at any time.
        </p>
        <h3>Sharing Your Information</h3>
        <p>
          We work as a team and collaborate with independent therapists, but we
          do not share, sell, or rent your personal information for marketing
          purposes. When you book a session, your details are shared only with
          the therapist you choose to ensure that the service can be arranged.
          The therapists on our platform are independent professionals and are
          responsible for managing the privacy and confidentiality of any
          information you provide directly to them during your sessions.
        </p>
        <h3>Data Security</h3>
        <p>
          We take your security seriously and implement a range of technical and
          organizational measures to protect your personal information from
          unauthorized access, alteration, disclosure, or destruction. While we
          strive to keep your data secure, it is important to remember that no
          system is entirely foolproof, and we cannot guarantee complete
          security, especially for information transmitted over the internet.
        </p>
        <h3>Cookies and Tracking Technologies</h3>
        <p>
          Our website uses cookies to enhance your experience by remembering
          your preferences and tracking site usage. Cookies are small data files
          that are stored on your device when you visit our site. You can
          disable cookies through your browser settings, although this may
          affect certain functionalities of the website.
        </p>
        <h3>Your Data Rights</h3>
        <p>
          You have the right to access, correct, or delete any personal
          information we hold about you. To exercise these rights or inquire
          about your personal data, please contact us at the email provided
          below. We will respond to your request in accordance with applicable
          data protection laws and aim to respect your privacy in all
          interactions.
        </p>
        <h3>Changes to This Privacy Policy</h3>
        <p>
          We reserve the right to update this Privacy Policy at any time.
          Changes will be posted on this page, and the "Last Updated" date will
          be revised accordingly. We encourage you to review this policy
          periodically to stay informed about how we protect your data.
        </p>
        <h3>Contact Us</h3>
        <p>
          If you have any questions or concerns about this Privacy Policy or
          your personal information, please contact us at:
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

import Footer from "../components/footer";
import AllWorkshops from "../components/home/all-workshop";
import MyNavbar from "../components/navbar";
import { Helmet } from "react-helmet";

export default function AllWorkshop() {
  return (
    <div id="__next">
      <Helmet>
        <title>Workshops & Events | Mental Health Training | Choose Your Therapist</title>
        <meta name="description" content="Explore and join our upcoming mental health workshops, training sessions, and internships. Led by expert psychologists to enhance your well-being and professional skills." />
        <meta name="keywords" content="Mental Health Workshops, Psychology Training India, Wellness Events, Internship for Psychology Students" />
        <link rel="canonical" href="https://chooseyourtherapist.in/allworkshop" />
        
        <meta property="og:title" content="Workshops & Events | Mental Health Training | Choose Your Therapist" />
        <meta property="og:description" content="Join our upcoming workshops and training sessions led by expert psychologists." />
        <meta property="og:url" content="https://chooseyourtherapist.in/allworkshop" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Workshops & Events | Mental Health Training | Choose Your Therapist" />
        <meta name="twitter:description" content="Explore upcoming events and training opportunities." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Helmet>
      <main className="">
        <MyNavbar />
        <main className="rbt-main-wrapper">
          <AllWorkshops />
        </main>
        <Footer />
      </main>
    </div>
  );
}

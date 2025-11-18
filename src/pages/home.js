import { Helmet } from "react-helmet"; // SEO ke liye
import Footer from "../components/footer";
import Banner from "../components/home/banner";
import State from "../components/home/state";
import Blogs from "../components/home/blogs";
import CallToAction from "../components/home/call-to-action";
import Counter from "../components/home/counter";
import NewsLetter from "../components/home/newsletter";
import ProfileCard from "../components/home/profile-card";
import PromationalBanner from "../components/home/promational-banner";
import Services from "../components/home/services";
import HomeWorkshop from "../components/home/workshops";
import MyNavbar from "../components/navbar";
import BottomNavigation from "../components/bottom-navigation";

import Brands from "../components/about/brands";
import HorTherapistCards from "../components/home/HorTherapistCard";


export default function HomePage() {
  // const [showPopup, setShowPopup] = useState(false); // agar popup use karna ho

  return (
    <div id="__next" style={{ overflowX: 'hidden', width: '100%' }}>
      {/* SEO Meta Tags with Local SEO & Keywords */}
      <Helmet>
        <title>
          India's Growing Network of Verified Therapists Connecting You to Trusted Counselling Support | Choose Your Therapist
        </title>
        <meta
          name="description"
          content="Connect with our trusted network of psychologists through Choose Your Therapist. Book affordable in-person or online therapy sessions, mental health counseling, and expert support from local psychologists near you."
        />
        <meta
          name="keywords"
          content="Affordable Psychologists, Network of Psychologists, Online Therapy, In-Person Therapy, Mental Health Counseling, Expert Psychologists, Choose Your Therapist, Psychologists in Noida, Local Therapy Noida"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://chooseyourtherapist.in/" />
      </Helmet>

      <main className="">
        {/* Navbar */}
        <MyNavbar />

        <main className="rbt-main-wrapper">
          {/* Homepage Sections */}
          <Banner />
          <HorTherapistCards/>
          <Services />
          <State />
          <PromationalBanner />
          <ProfileCard />
          <Counter />
          <HomeWorkshop isWhite={false} />
          <Blogs />

          
         
          
          
          <CallToAction />
          <NewsLetter />

          {/* Payment Success Modal (Optional) */}
          {/* <PaymentSuccessModal open={showPopup} onClose={() => setShowPopup(false)} /> */}
        </main>

        {/* Footer */}
        <Footer />

        {/* Bottom Navigation for Mobile */}
        <BottomNavigation />
      </main>
    </div>
  );
}

import Footer from "../components/footer";
import AllWorkshops from "../components/home/all-workshop";
import MyNavbar from "../components/navbar";
import Head from "next/head";

export default function AllWorkshop() {
  return (
    <div id="__next">
      <Head>
        <title>Mental Health Workshops &amp; Events | Choose Your Therapist</title>
        <meta name="description" content="Join upcoming mental health workshops, training sessions and internships, led by expert psychologists — for your well-being and your skills." />
        <meta name="keywords" content="Mental Health Workshops, Psychology Training India, Wellness Events, Internship for Psychology Students" />
        
        <meta property="og:title" content="Workshops & Events | Mental Health Training | Choose Your Therapist" />
        <meta property="og:description" content="Join our upcoming workshops and training sessions led by expert psychologists." />
        <meta property="og:url" content="https://www.chooseyourtherapist.in/allworkshop" />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:image" property="og:image" content="https://www.chooseyourtherapist.in/api/og/site.jpg?page=home" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Workshops & Events | Mental Health Training | Choose Your Therapist" />
        <meta name="twitter:description" content="Explore upcoming events and training opportunities." />
        <meta name="twitter:image" content="https://www.chooseyourtherapist.in/api/og/site.jpg?page=home" />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/allworkshop" />
      </Head>
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

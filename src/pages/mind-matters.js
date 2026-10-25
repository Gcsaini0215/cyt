import React from "react";
import Head from "next/head";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import AllWorkshop from "../components/home/all-workshop";

export default function MindMatters() {
  return (
    <div id="__next">
      {/* same workshop list as /allworkshop, so that page is the one search engines should index */}
      <Head>
        <title>Mental Health Programs &amp; Workshops | Choose Your Therapist</title>
        <meta name="description" content="Mental health programs and workshops by verified psychologists — for students, professionals and anyone who wants to look after their well-being." />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/allworkshop" />
      </Head>
      <MyNavbar />
      <div className="rbt-banner-area rbt-banner-1" style={{ paddingTop: "30px", paddingBottom: "30px", backgroundColor: "#f8f9fa" }}>
        <div className="container mt--20">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-12 col-sm-12 col-12 text-center">
              <p className="title h1" style={{ fontSize: "3rem", marginBottom: "20px", color: "#228756" }}>
                Mind Matters Programs
              </p>
              <p className="description" style={{ fontSize: "1.2rem", color: "#666", marginBottom: "30px" }}>
                Discover our comprehensive mental health programs designed to support your well-being journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AllWorkshop />

      <Footer />
    </div>
  );
}
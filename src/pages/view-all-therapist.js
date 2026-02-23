import React from "react";
import Head from "next/head";
import ViewAllTherapist from "../components/View-All-Therapist/view-all-therapist";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import MyNavbar from "../components/navbar";

export default function ViewAllTherapistPage() {
  return (
    <div id="__next">
      <Head>
        <title>Therapist Directory | Find Verified Psychologists in India | Choose Your Therapist</title>
        <meta name="description" content="Browse our directory of verified psychologists and therapists in India. Filter by expertise, state, and profile type to find the right mental health professional for your needs." />
        <meta name="keywords" content="Therapist Directory, Find Psychologist India, Verified Therapists, Mental Health Professionals, Counseling India" />
        <link rel="canonical" href="https://chooseyourtherapist.in/view-all-therapist" />
        
        <meta property="og:title" content="Therapist Directory | Find Verified Psychologists in India" />
        <meta property="og:description" content="Browse our directory of verified psychologists and therapists in India. Find the right mental health professional for your needs." />
        <meta property="og:url" content="https://chooseyourtherapist.in/view-all-therapist" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Therapist Directory | Find Verified Psychologists in India" />
        <meta name="twitter:description" content="Browse our directory of verified psychologists and therapists in India." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Head>
      <main className="">
        <MyNavbar />
        <main className="rbt-main-wrapper">
          <ViewAllTherapist />
          <NewsLetter />
        </main>
        <Footer />
      </main>
    </div>
  );
}

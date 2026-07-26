import React from "react";
import Head from "next/head";
import ProbonoProfiles from "../../components/probono/probono-profiles";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";

const PAGE_URL = "https://www.chooseyourtherapist.in/probono-therapist/profiles";

export default function ProbonoProfilesPage() {
  return (
    <div id="__next">
      <Head>
        <title>Meet Our Probono Psychologists | Choose Your Therapist</title>
        <meta
          name="description"
          content="Browse verified probono psychologists working under supervision and connect with someone who fits your needs."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={PAGE_URL} />
      </Head>
      <MyNavbar />
      <ProbonoProfiles />
      <NewsLetter />
      <Footer />
    </div>
  );
}

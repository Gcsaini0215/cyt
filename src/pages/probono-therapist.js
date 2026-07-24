import React from "react";
import Head from "next/head";
import ProbonoTherapist from "../components/probono/probono-therapist";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";

const PAGE_URL = "https://www.chooseyourtherapist.in/probono-therapist";

export default function ProbonoTherapistPage() {
  return (
    <div id="__next">
      <Head>
        <title>Probono Psychologists | Choose Your Therapist</title>
        <meta
          name="description"
          content="Connect with verified probono psychologists offering free and low-cost therapy sessions."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={PAGE_URL} />
      </Head>
      <main className="">
        <MyNavbar />
        <main className="rbt-main-wrapper">
          <ProbonoTherapist />
        </main>
        <Footer />
      </main>
    </div>
  );
}

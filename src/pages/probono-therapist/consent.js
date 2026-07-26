import React from "react";
import Head from "next/head";
import ProbonoConsent from "../../components/probono/probono-consent";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";

const PAGE_URL = "https://www.chooseyourtherapist.in/probono-therapist/consent";

export default function ProbonoConsentPage() {
  return (
    <div id="__next">
      <Head>
        <title>Informed Consent | Pro Bono Support | Choose Your Therapist</title>
        <meta
          name="description"
          content="Please read the informed consent information before continuing with the Pro Bono Support Program."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={PAGE_URL} />
      </Head>
      <MyNavbar />
      <ProbonoConsent />
      <NewsLetter />
      <Footer />
    </div>
  );
}

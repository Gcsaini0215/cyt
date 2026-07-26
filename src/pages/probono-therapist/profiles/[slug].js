import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import ProbonoProfileDetail from "../../../components/probono/probono-profile-detail";
import Footer from "../../../components/footer";
import MyNavbar from "../../../components/navbar";
import NewsLetter from "../../../components/home/newsletter";
import { PSYCHOLOGISTS } from "../../../components/probono/probono-data";

const PAGE_BASE_URL = "https://www.chooseyourtherapist.in/probono-therapist/profiles";

export default function ProbonoProfileDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  if (!router.isReady) {
    return null;
  }

  const psychologist = PSYCHOLOGISTS.find((p) => p.slug === slug);

  if (!psychologist) {
    return (
      <div id="__next">
        <MyNavbar />
        <div className="container" style={{ padding: "80px 0", textAlign: "center", minHeight: "50vh" }}>
          <h2>Profile not found</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div id="__next">
      <Head>
        <title>{psychologist.name} | Probono Psychologist | Choose Your Therapist</title>
        <meta name="description" content={psychologist.intro} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${PAGE_BASE_URL}/${psychologist.slug}`} />
      </Head>
      <MyNavbar />
      <ProbonoProfileDetail psychologist={psychologist} />
      <NewsLetter />
      <Footer />
    </div>
  );
}

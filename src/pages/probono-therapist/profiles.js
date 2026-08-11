import React from "react";
import Head from "next/head";
import ProbonoProfiles from "../../components/probono/probono-profiles";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { PSYCHOLOGISTS } from "../../components/probono/probono-data";
import { fetchData } from "../../utils/actions";
import { getProbonoInternsUrl, baseApi } from "../../utils/url";

const PAGE_URL = "https://www.chooseyourtherapist.in/probono-therapist/profiles";

const fixImageUrl = (url) => {
  if (!url) return url;
  if (url.includes("api.chooseyourtherapist.in")) {
    return url.replace("https://api.chooseyourtherapist.in", baseApi);
  }
  return url;
};

export async function getServerSideProps() {
  try {
    const res = await fetchData(getProbonoInternsUrl);
    if (res?.status && res?.data?.length > 0) {
      const interns = res.data.map((item) => ({ ...item, photo: fixImageUrl(item.photo) }));
      return { props: { interns } };
    }
  } catch (err) {
    console.error("Error fetching probono interns for SSR:", err);
  }
  return { props: { interns: PSYCHOLOGISTS } };
}

export default function ProbonoProfilesPage({ interns }) {
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
      <ProbonoProfiles interns={interns} />
      <NewsLetter />
      <Footer />
    </div>
  );
}

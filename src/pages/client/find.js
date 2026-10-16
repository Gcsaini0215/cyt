import React from "react";
import Head from "next/head";
import ClientShell from "../../components/client/client-shell";
import ViewAllTherapist from "../../components/View-All-Therapist/view-all-therapist";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles } from "../../utils/url";
import { slimTherapist } from "../../utils/therapist-directory";

/* "Find a Therapist" inside the client portal — the same directory as /view-all-therapist, but the
   portal's menu (and the phone's bottom bar) stay on screen, so Home is always one tap away. */

const FILTER_KEYS = ["profile_type", "services", "year_of_exp", "language_spoken", "state", "search", "concern", "mode", "gender", "sort", "fee"];

export async function getServerSideProps(context) {
  const filter = { page: 1, pageSize: 1000 };
  FILTER_KEYS.forEach((k) => { filter[k] = typeof context.query[k] === "string" ? context.query[k] : ""; });
  let initialAllData = [];
  try {
    const res = await fetchData(getTherapistProfiles, { page: 1, pageSize: 1000 });
    if (res?.data) initialAllData = res.data.map(slimTherapist);
  } catch (err) {
    console.error("client/find getServerSideProps:", err);
  }
  return { props: { initialAllData, initialFilters: filter } };
}

export default function ClientFind({ initialAllData, initialFilters }) {
  return (
    <ClientShell title="Find My Therapist">
      {/* the public /view-all-therapist is the page for search engines */}
      <Head><meta name="robots" content="noindex, follow" /></Head>
      <ViewAllTherapist initialAllData={initialAllData} initialFilters={initialFilters} embedded />
    </ClientShell>
  );
}

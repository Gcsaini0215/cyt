import React from "react";
import Head from "next/head";
import ClientShell from "../../components/client/client-shell";
import AbhaLink from "../../components/abha/abha-link";

// Client "My ABHA" (ABDM M1). Not in the menu yet — added once NHA sandbox keys are live and tested.
export default function MyAbhaPage() {
  return (
    <ClientShell title="My ABHA">
      <Head>
        <title>My ABHA | Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={{ padding: "8px 0 40px" }}>
        <AbhaLink />
      </div>
    </ClientShell>
  );
}

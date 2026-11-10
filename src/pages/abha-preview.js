import React from "react";
import Head from "next/head";
import Link from "next/link";
import AbhaLink from "../components/abha/abha-link";

// Internal preview of "My ABHA" on demo data (no login, no API calls) while NHA sandbox keys are pending.
// Not linked anywhere and noindex. The real page is /client/abha.
export default function AbhaPreview() {
  return (
    <>
      <Head>
        <title>My ABHA (preview) | Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={{ minHeight: "100vh", background: "#f4f8f5", padding: "0 16px 48px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "18px 0 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Link href="/" aria-label="Choose Your Therapist home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/img/logo-nav.webp" alt="Choose Your Therapist" height={44} style={{ height: 44, width: "auto" }} />
          </Link>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#5b6b63" }}>Client account · My ABHA</span>
        </div>
        <AbhaLink demo />
      </div>
    </>
  );
}

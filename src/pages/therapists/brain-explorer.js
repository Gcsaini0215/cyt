import React from "react";
import Head from "next/head";
import MainLayout from "../../components/therapists/main-layout";
import BrainExplorer from "../../components/toolkit/brain-explorer";

// Brain Explorer — psychoeducation resource for therapists (components/toolkit/brain-explorer.js)
export default function BrainExplorerPage() {
  return (
    <MainLayout>
      <Head><title>Brain Explorer | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <BrainExplorer />
    </MainLayout>
  );
}

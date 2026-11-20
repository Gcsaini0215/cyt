import React from "react";
import Head from "next/head";
import MainLayout from "../../components/therapists/main-layout";
import ReflectionJournal from "../../components/therapists/reflection/reflection-journal";

// Therapist's private reflection journal — countertransference self-help (components/therapists/reflection)
export default function TherapistReflectionPage() {
  return (
    <MainLayout>
      <Head><title>Reflection journal | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <ReflectionJournal />
    </MainLayout>
  );
}

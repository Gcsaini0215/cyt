import React from "react";
import Head from "next/head";
import MainLayout from "../../components/therapists/main-layout";
import CycleCare from "../../components/cycle/cycle-care";

// Cycle & Mood Care for therapists themselves — the same private tracker as clients (components/cycle/cycle-care.js)
export default function TherapistCyclePage() {
  return (
    <MainLayout>
      <Head><title>Cycle & Mood | Choose Your Therapist</title></Head>
      <CycleCare portal="therapist" />
    </MainLayout>
  );
}

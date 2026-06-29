import React from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import AppointmentForm from "../components/appointment/appointment-form";

export default function AppointmentPage() {
  return (
    <div id="__next">
      <Head>
        <title>Book an Appointment | Choose Your Therapist</title>
        <meta name="description" content="Request a therapy appointment at Choose Your Therapist. Fill in your details and we will confirm your session time via WhatsApp." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://chooseyourtherapist.in/appointment" />
        <meta property="og:title" content="Book an Appointment | Choose Your Therapist" />
        <meta property="og:description" content="Request a therapy appointment. We will confirm your session time via WhatsApp." />
        <meta property="og:url" content="https://chooseyourtherapist.in/appointment" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
      </Head>
      <MyNavbar />
      <AppointmentForm />
      <Footer />
    </div>
  );
}

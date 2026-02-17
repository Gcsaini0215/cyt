import React from "react";
import { Helmet } from "react-helmet";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import ContactForm from "../components/contact/form";
import Header from "../components/contact/header";
import NewsLetter from "../components/home/newsletter";
export default function ContactUs() {
  return (
    <div id="__next">
      <Helmet>
        <title>Contact Us | Get in Touch with Choose Your Therapist</title>
        <meta name="description" content="Have questions? Contact Choose Your Therapist for support, inquiries, or assistance with finding the right psychologist in India. We're here to help." />
        <meta name="keywords" content="Contact Choose Your Therapist, Therapy Support India, Mental Health Inquiries" />
        <link rel="canonical" href="https://chooseyourtherapist.in/contact-us" />
        
        <meta property="og:title" content="Contact Us | Get in Touch with Choose Your Therapist" />
        <meta property="og:description" content="Have questions? Contact Choose Your Therapist for support, inquiries, or assistance." />
        <meta property="og:url" content="https://chooseyourtherapist.in/contact-us" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us | Get in Touch with Choose Your Therapist" />
        <meta name="twitter:description" content="Contact Choose Your Therapist for support or inquiries." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Helmet>
      <MyNavbar />
      <Header />
      <ContactForm />
      <NewsLetter />
      <Footer />
    </div>
  );
}

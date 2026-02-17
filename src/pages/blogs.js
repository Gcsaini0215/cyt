import React from "react";
import { Helmet } from "react-helmet";
import BlogHeader from "../components/blogs/header";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import Blogs from "../components/blogs/all-blogs";
import NewsLetter from "../components/home/newsletter";
export default function AllBlogs() {
  return (
    <div id="__next">
      <Helmet>
        <title>Mental Health Blog | Articles & Resources | Choose Your Therapist</title>
        <meta name="description" content="Read our latest articles on mental health, therapy, emotional well-being, and expert advice from verified psychologists in India. Stay informed and empowered." />
        <meta name="keywords" content="Mental Health Blog, Psychology Articles India, Therapy Resources, Well-being Tips, Choose Your Therapist Blog" />
        <link rel="canonical" href="https://chooseyourtherapist.in/blogs" />
        
        <meta property="og:title" content="Mental Health Blog | Articles & Resources | Choose Your Therapist" />
        <meta property="og:description" content="Read expert articles on mental health and emotional well-being from verified psychologists." />
        <meta property="og:url" content="https://chooseyourtherapist.in/blogs" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mental Health Blog | Articles & Resources | Choose Your Therapist" />
        <meta name="twitter:description" content="Explore our mental health resources and expert articles." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Helmet>
      <MyNavbar />
      <BlogHeader />
      <Blogs />
      <NewsLetter />
      <Footer />
    </div>
  );
}

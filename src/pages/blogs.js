import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, Container, Breadcrumbs, Typography } from "@mui/material";
import { ChevronRight } from "lucide-react";
import BlogHeader from "../components/blogs/header";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import Blogs from "../components/blogs/all-blogs";
import NewsLetter from "../components/home/newsletter";

export default function AllBlogs() {
  return (
    <div id="__next">
      <Head>
        <title>Mental Health Blog | Articles & Resources | Choose Your Therapist</title>
        <meta name="description" content="Read our latest articles on mental health, therapy, emotional well-being, and expert advice from verified psychologists in India. Stay informed and empowered." />
        <meta name="keywords" content="Mental Health Blog, Psychology Articles India, Therapy Resources, Well-being Tips, Choose Your Therapist Blog" />
        
        <meta property="og:title" content="Mental Health Blog | Articles & Resources | Choose Your Therapist" />
        <meta property="og:description" content="Read expert articles on mental health and emotional well-being from verified psychologists." />
        <meta property="og:url" content="https://chooseyourtherapist.in/blogs" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mental Health Blog | Articles & Resources | Choose Your Therapist" />
        <meta name="twitter:description" content="Explore our mental health resources and expert articles." />
        <meta name="twitter:image" content="https://i.postimg.cc/gj1yngrd/choose.png" />
      </Head>
      <MyNavbar />
      
      {/* Secondary Header / Breadcrumb Bar - Dark Mode Version */}
      <Box sx={{ bgcolor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 }}>
        <Container maxWidth="lg">
          <Breadcrumbs 
            separator={<ChevronRight size={16} color="#ffffff" />} 
            aria-label="breadcrumb"
            sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, fontWeight: 600 }}
          >
            <Link href="/" style={{ color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              Home
            </Link>
            <Typography color="#ffffff" sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, fontWeight: 800 }}>
              BLOGS
            </Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Blogs />
      <NewsLetter />
      <Footer />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import Head from "next/head";
import ProfileHeader from "../../components/view_profile/header";
import ProfileInfoTab from "../../components/view_profile/profile-info-tab";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { fetchById, fetchData } from "../../utils/actions";
import {
  GetFavoriteTherapistListUrl,
  getTherapistProfile,
  imagePath,
  frontendUrl
} from "../../utils/url";
import ErrorPage from "../error-page";
import PageProgressBar from "../../components/global/page-progress";
import ProfileWorkshop from "../../components/view_profile/profile-workshop";
import ProfileReview from "../../components/view_profile/profile-review";
import SocialShare from "../../components/global/social-share";
import { useRouter } from "next/router";
import { getDecodedToken } from "../../utils/jwt";

export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const res = await fetchData(getTherapistProfile + id);
    if (res && res.data && Object.keys(res.data).length > 0) {
      return {
        props: {
          initialProfile: res.data,
          id: id
        }
      };
    }
  } catch (err) {
    console.error("Error in getServerSideProps:", err);
  }

  return {
    props: {
      initialProfile: null,
      id: id,
      error: true
    }
  };
}

export default function ViewProfile({ initialProfile, id, error: serverError }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [error, setError] = useState(serverError || false);
  const [loading, setLoading] = useState(!initialProfile && !serverError);
  const [favrioutes, setFavrioutes] = useState([]);

  useEffect(() => {
    if (initialProfile) return;
    if (!router.isReady || !id) return;

    const getData = async () => {
      try {
        const res = await fetchData(getTherapistProfile + id);
        if (res && res.data && Object.keys(res.data).length > 0) {
          setProfile(res.data);
        } else {
          setError(true);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(true);
      }
    };

    getData();
  }, [router.isReady, id, initialProfile]);

  useEffect(() => {
    const getFavrioutes = async () => {
      try {
        const res = await fetchById(GetFavoriteTherapistListUrl);
        if (res && res.data) {
          setFavrioutes(res.data.therapists || []);
        }
      } catch (err) {
        console.log(err);
      }
    };

    const data = getDecodedToken();
    if (data && data.role !== 1) {
      getFavrioutes();
    }
  }, []);

  if (error) {
    return <ErrorPage />;
  }

  const profileName = profile?.user?.name || "Expert Therapist";
  const profileType = profile?.profile_type || "Psychologist";
  const profileLocation = profile?.user?.state ? `in ${profile.user.state}` : "in India";
  
  // Ensure absolute image URL for OG tags
  const profileImage = profile?.user?.profile 
    ? (profile.user.profile.startsWith('http') ? profile.user.profile : `${imagePath}/${profile.user.profile}`)
    : "https://i.postimg.cc/gj1yngrd/choose.png";
  
  // Clean and truncate bio for description
  const rawBio = profile?.user?.bio ? profile.user.bio.replace(/<[^>]*>/g, '').trim() : "";
  const profileBio = rawBio.length > 160 ? rawBio.substring(0, 157) + "..." : rawBio || `Book a session with ${profileName}, a verified ${profileType} ${profileLocation} on Choose Your Therapist.`;

  const currentUrl = `${frontendUrl}/view-profile/${id}`;
  const seoTitle = `${profileName} | ${profileType} | ${profileLocation.replace('in ', '')} | View Profile with ChooseYourTherapist`;
  const seoDescription = profileBio;

  return loading ? (
    <PageProgressBar />
  ) : (
    <div id="__next">
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`${profileName}, ${profileType}, psychologist, therapist, mental health counseling, therapy, online therapy, in-person therapy, verified therapist, ${profile.user.state || "India"}`} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Choose Your Therapist" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="English" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={profileImage} />
        <meta property="og:image:secure_url" content={profileImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${profileName} - ${profileType}`} />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={profileImage} />
        <meta name="twitter:site" content="@chooseyourtherapist" />

        {/* Additional SEO */}
        <meta name="theme-color" content="#228756" />
        <meta name="application-name" content="Choose Your Therapist" />

        {/* Canonical */}
        <link rel="canonical" href={currentUrl} />
      </Head>
      <MyNavbar />
      {profile && (
        <>
          <ProfileHeader pageData={profile} favrioutes={favrioutes} />
          <ProfileInfoTab pageData={profile} />
          <ProfileReview profile={profile} />
        </>
      )}
      <NewsLetter />
      <Footer />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams } from "next/router";
import Head from "next/head";
import ProfileHeader from "../../components/view_profile/header";
import ProfileInfoTab from "../../components/view_profile/profile-info-tab";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { fetchById, fetchData } from "../../utils/actions";
import {
  GetFavriouteTherapistListUrl,
  getTherapistProfile,
  imagePath,
  frontendUrl
} from "../../utils/url";
import ErrorPage from "../error-page";
import PageProgressBar from "../../components/global/page-progress";
import ProfileWorkshop from "../../components/view_profile/profile-workshop";
import ProfileReview from "../../components/view_profile/profile-review";
import { useRouter } from "next/router";
import { getDecodedToken } from "../../utils/jwt";

export default function ViewProfile() {
  const router = useRouter();
  const { id  } = router.query;
  const [profile, setProfile] = useState();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favrioutes, setFavrioutes] = useState([]);

  useEffect(() => {
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

    const getFavrioutes = async () => {
      try {
        const res = await fetchById(GetFavriouteTherapistListUrl);
        if (res && res.data) {
          setFavrioutes(res.data.therapists || []);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getData();
    const data = getDecodedToken();
    if (data && data.role !== 1) {
      getFavrioutes();
    }
  }, [router.isReady, id]);

  if (error) {
    return <ErrorPage />;
  }

  const profileName = profile?.user?.name || "Therapist";
  const profileType = profile?.profile_type || "Professional";
  const profileImage = profile?.user?.profile ? `${imagePath}/${profile.user.profile}` : "https://i.postimg.cc/gj1yngrd/choose.png";
  const profileBio = profile?.user?.bio ? profile.user.bio.replace(/<[^>]*>/g, '').substring(0, 150) : "Professional therapist providing mental health support";
  const currentUrl = `${frontendUrl}/view-profile/${id}`;
  const seoTitle = `${profileName} | ${profileType} | Choose Your Therapist - Online & In-Person Therapy`;
  const seoDescription = `${profileBio} Book a session with ${profileName} on Choose Your Therapist. Verified professional therapist offering confidential mental health counseling.`;

  return loading ? (
    <PageProgressBar />
  ) : (
    <div id="__next">
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`${profileName}, ${profileType}, psychologist, therapist, mental health counseling, therapy, online therapy, in-person therapy, verified therapist`} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Choose Your Therapist" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={profileImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
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
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
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

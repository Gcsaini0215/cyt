import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { getDecodedToken } from "../../utils/jwt";

export default function ViewProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favrioutes, setFavrioutes] = useState([]);

  useEffect(() => {
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
  }, [id]);

  if (error) {
    return <ErrorPage />;
  }

  const profileName = profile?.user?.name || "Therapist";
  const profileType = profile?.profile_type || "Professional";
  const profileImage = profile?.user?.profile ? `${imagePath}/${profile.user.profile}` : "https://i.postimg.cc/gj1yngrd/choose.png";
  const currentUrl = `${frontendUrl}/view-profile/${id}`;
  const seoTitle = `${profileName} | ${profileType} | Choose Your Therapist`;
  const seoDescription = `Book a session with ${profileName}, a verified ${profileType} specializing in mental health support. Connect with trusted therapists across India on Choose Your Therapist.`;

  return loading ? (
    <PageProgressBar />
  ) : (
    <div id="__next">
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={profileImage} />
        <meta property="og:site_name" content="Choose Your Therapist" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={profileImage} />

        {/* Canonical */}
        <link rel="canonical" href={currentUrl} />
      </Head>
      <MyNavbar />
      <ProfileHeader pageData={profile} favrioutes={favrioutes} />
      <ProfileInfoTab pageData={profile} />
       {profile && profile.workshops.length > 0 && (
        <ProfileWorkshop data={profile.workshops} />
      )}
      <NewsLetter />
      <Footer />
    </div>
  );
}

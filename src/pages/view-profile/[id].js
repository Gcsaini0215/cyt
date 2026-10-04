import React, { useEffect, useState } from "react";
import Head from "next/head";
import ProfileHeader from "../../components/view_profile/header";
import ProfileInfoTab from "../../components/view_profile/profile-info-tab";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import { fetchById, fetchData } from "../../utils/actions";
import {
  GetFavoriteTherapistListUrl,
  getTherapistProfile,
  getTherapistProfiles,
  imagePath
} from "../../utils/url";
import { therapistSlug, nameSlug, isObjectId } from "../../utils/therapist-slug";
import ErrorPage from "../error-page";
import PageProgressBar from "../../components/global/page-progress";
import ProfileWorkshop from "../../components/view_profile/profile-workshop";
import ProfileReview from "../../components/view_profile/profile-review";
import SocialShare from "../../components/global/social-share";
import { useRouter } from "next/router";
import { getDecodedToken } from "../../utils/jwt";

// URL slug <-> _id maps of the publicly listed therapists, cached per server
// process so a profile view doesn't refetch the whole list every time.
let slugCache = { at: 0, maps: null };
const SLUG_TTL_MS = 10 * 60 * 1000;

async function getSlugMaps(force = false) {
  if (!force && slugCache.maps && Date.now() - slugCache.at < SLUG_TTL_MS) return slugCache.maps;
  const res = await fetchData(getTherapistProfiles);
  const list = (res?.data || [])
    .filter((t) => t._id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const bySlug = {};  // "counselling-psychologist-teesta-joshi-uttar-pradesh" -> _id
  const slugById = {}; // _id -> "counselling-psychologist-teesta-joshi-uttar-pradesh"
  const byName = {};  // "teesta-joshi" -> [_id, ...]
  // on a slug clash the oldest profile keeps it; the others stay on their _id URL
  list.forEach((t) => {
    const slug = therapistSlug(t);
    if (slug && !bySlug[slug]) {
      bySlug[slug] = t._id;
      slugById[t._id] = slug;
    }
    const name = nameSlug(t);
    if (name) (byName[name] = byName[name] || []).push(t._id);
  });
  slugCache = { at: Date.now(), maps: { bySlug, slugById, byName } };
  return slugCache.maps;
}

// A slug that isn't current — an older URL format, or an old type/location after
// the therapist changed it — still points at one therapist if their name is in
// it and matches uniquely.
function currentSlugFor(param, { slugById, byName }) {
  const name = Object.keys(byName)
    .filter((n) => `-${param}-`.includes(`-${n}-`))
    .sort((a, b) => b.length - a.length)[0];
  const ids = name ? byName[name] : [];
  return ids.length === 1 ? slugById[ids[0]] : null;
}

export async function getServerSideProps(context) {
  const param = context.params.id;
  const query = context.resolvedUrl.includes("?") ? context.resolvedUrl.slice(context.resolvedUrl.indexOf("?")) : "";
  const moved = (slug) => ({ redirect: { destination: `/view-profile/${slug}${query}`, statusCode: 301 } });
  try {
    let id = param;
    let slug = null;

    if (!isObjectId(param)) {
      let maps = await getSlugMaps();
      if (!maps.bySlug[param]) maps = await getSlugMaps(true); // newly listed / just edited
      if (!maps.bySlug[param]) {
        const current = currentSlugFor(param, maps);
        return current ? moved(current) : { notFound: true };
      }
      id = maps.bySlug[param];
      slug = param;
    }

    const res = await fetchData(getTherapistProfile + id);
    if (res && res.data && Object.keys(res.data).length > 0) {
      if (!slug) {
        // old /view-profile/<_id> link: send it (and its search ranking) to the name URL
        const { slugById } = await getSlugMaps();
        if (slugById[id]) return moved(slugById[id]);
      }
      return {
        props: {
          initialProfile: res.data,
          id,
          urlKey: slug || id
        }
      };
    }
  } catch (err) {
    console.error("Error in getServerSideProps:", err);
  }

  return {
    props: {
      initialProfile: null,
      id: param,
      urlKey: param,
      error: true
    }
  };
}

export default function ViewProfile({ initialProfile, id, urlKey, error: serverError }) {
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

  /* ── Profile View Tracking ── */
  useEffect(() => {
    if (!id || !profile) return;
    try {
      const KEY = "cyt_views";
      const existing = JSON.parse(localStorage.getItem(KEY) || "{}");
      const prev = existing[id] || { count: 0 };
      existing[id] = {
        count:       prev.count + 1,
        name:        profile.user?.name        || prev.name        || "",
        specialty:   profile.profile_type      || prev.specialty   || "",
        photo:       profile.user?.profile     || prev.photo       || null,
        lastViewed:  new Date().toISOString(),
        firstViewed: prev.firstViewed          || new Date().toISOString(),
      };
      localStorage.setItem(KEY, JSON.stringify(existing));
    } catch {}
  }, [id, profile]);

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

  // Review stats
  const reviews = profile?.reviews || [];
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviewCount).toFixed(1)
    : null;

  // Extract top keywords from review text
  const stopwords = new Set(["this","that","with","have","from","they","will","been","were","their","what","when","which","there","about","would","could","very","just","also","more","some","than","then","into","your","like","time","only","over","such","after","most","well","much","good","great","really","helped","highly","thank","very","session","sessions","sessions"]);
  const reviewKeywords = reviews
    .flatMap(r => (r.description || "").toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/))
    .filter(w => w.length > 4 && !stopwords.has(w))
    .reduce((acc, w) => { acc[w] = (acc[w] || 0) + 1; return acc; }, {});
  const topReviewKeywords = Object.entries(reviewKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w)
    .join(", ");

  // Clean bio
  const rawBio = profile?.user?.bio ? profile.user.bio.replace(/<[^>]*>/g, '').trim() : "";
  const profileBio = rawBio || `Book a session with ${profileName}, a verified ${profileType} ${profileLocation} on Choose Your Therapist.`;

  // SEO description — include rating for click-through boost
  const ratingSnippet = avgRating ? `⭐ ${avgRating}/5 · ${reviewCount} review${reviewCount > 1 ? "s" : ""} — ` : "";
  const seoDescriptionRaw = ratingSnippet + profileBio;
  const seoDescription = seoDescriptionRaw.length > 160 ? seoDescriptionRaw.substring(0, 157) + "..." : seoDescriptionRaw;

  // Keywords — base + review-extracted
  const baseKeywords = `${profileName}, ${profileType}, psychologist, therapist, mental health counseling, therapy, online therapy, verified therapist, ${profile?.state || profile?.user?.state || "India"}`;
  const seoKeywords = topReviewKeywords ? `${baseKeywords}, ${topReviewKeywords}` : baseKeywords;

  // always the www host: the bare domain 301s to www, so it can't be the canonical
  const currentUrl = `https://www.chooseyourtherapist.in/view-profile/${urlKey || id}`;
  const seoTitle = `${profileName} | ${profileType} | ${profileLocation.replace('in ', '')} | Choose Your Therapist`;

  // Parse specializations / expertise areas
  const expertiseAreas = (() => {
    const raw = profile?.service_experties;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") return raw.split(",").map(s => s.trim()).filter(Boolean);
    return [];
  })();

  // Languages
  const languagesList = (() => {
    const raw = profile?.languages;
    if (!raw) return ["English", "Hindi"];
    if (Array.isArray(raw)) return raw;
    return raw.split(",").map(l => l.trim());
  })();

  // Credentials / qualifications
  const credentialList = [];
  if (profile?.qualification) {
    credentialList.push({
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "degree",
      "name": profile.qualification
    });
  }
  if (profile?.rci_number) {
    credentialList.push({
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "license",
      "name": `RCI Registration No: ${profile.rci_number}`,
      "recognizedBy": {
        "@type": "Organization",
        "name": "Rehabilitation Council of India",
        "url": "https://www.rehabcouncil.nic.in"
      }
    });
  }

  // --- Schema 1: Psychologist / Physician (Person) ---
  const psychologistSchema = {
    "@context": "https://schema.org",
    "@type": ["Person", "Physician"],
    "@id": `${currentUrl}#psychologist`,
    "name": profileName,
    "jobTitle": profileType,
    "description": profileBio.substring(0, 500),
    "image": {
      "@type": "ImageObject",
      "url": profileImage,
      "width": 400,
      "height": 400
    },
    "url": currentUrl,
    "knowsLanguage": languagesList,
    "medicalSpecialty": profileType,
    "worksFor": {
      "@type": "MedicalOrganization",
      "name": "Choose Your Therapist",
      "url": "https://www.chooseyourtherapist.in"
    },
    ...(expertiseAreas.length > 0 && { "knowsAbout": expertiseAreas }),
    ...(credentialList.length > 0 && { "hasCredential": credentialList }),
    ...(profile?.experience_years && {
      "hasOccupation": {
        "@type": "Occupation",
        "name": profileType,
        "experienceRequirements": `${profile.experience_years} years`
      }
    }),
    "address": {
      "@type": "PostalAddress",
      "addressRegion": profile?.state || profile?.user?.state || "India",
      "addressLocality": profile?.city || profile?.user?.city || undefined,
      "addressCountry": "IN"
    },
    ...(avgRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating,
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    }),
    ...(reviewCount > 0 && {
      "review": reviews.slice(0, 5).map(r => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": r.name || "Verified Client" },
        "reviewRating": { "@type": "Rating", "ratingValue": r.rating || 5, "bestRating": "5" },
        "reviewBody": (r.description || "").substring(0, 300),
        ...(r.createdAt && { "datePublished": new Date(r.createdAt).toISOString().split("T")[0] })
      }))
    })
  };

  // --- Schema 2: MedicalBusiness (for the therapist's practice listing) ---
  const practiceSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${currentUrl}#practice`,
    "name": `${profileName} | ${profileType}`,
    "description": `Book an online or in-person session with ${profileName}, a verified ${profileType} ${profileLocation} on Choose Your Therapist.`,
    "image": profileImage,
    "url": currentUrl,
    "medicalSpecialty": profileType,
    "availableService": expertiseAreas.map(area => ({
      "@type": "MedicalTherapy",
      "name": area
    })),
    "address": {
      "@type": "PostalAddress",
      "addressRegion": profile?.state || profile?.user?.state || "India",
      "addressLocality": profile?.city || profile?.user?.city || undefined,
      "addressCountry": "IN"
    },
    ...(profile?.fee_per_session && {
      "priceRange": `₹${profile.fee_per_session} per session`
    }),
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "09:00",
      "closes": "21:00"
    },
    "parentOrganization": {
      "@type": "MedicalOrganization",
      "name": "Choose Your Therapist",
      "url": "https://www.chooseyourtherapist.in"
    },
    ...(avgRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating,
        "reviewCount": reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    })
  };

  // --- Schema 3: BreadcrumbList ---
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${currentUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" },
      { "@type": "ListItem", "position": 2, "name": "Find a Psychologist", "item": "https://www.chooseyourtherapist.in/view-all-therapist" },
      { "@type": "ListItem", "position": 3, "name": `${profileName} — ${profileType}`, "item": currentUrl }
    ]
  };

  // --- Schema 4: ProfilePage (GEO signal — helps AI cite this page directly) ---
  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": seoTitle,
    "description": seoDescription,
    "url": currentUrl,
    "dateModified": new Date().toISOString().split("T")[0],
    "mainEntity": { "@id": `${currentUrl}#psychologist` },
    "breadcrumb": { "@id": `${currentUrl}#breadcrumb` },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "h2", ".therapist-bio"]
    }
  };

  const schemaData = [psychologistSchema, practiceSchema, breadcrumbSchema, profilePageSchema];

  return loading ? (
    <PageProgressBar />
  ) : (
    <div id="__next">
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Choose Your Therapist" />
        <meta name="language" content="English" />

        {/* Open Graph */}
        <meta key="og:type" property="og:type" content="profile" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={profileImage} />
        <meta property="og:image:secure_url" content={profileImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${profileName} - ${profileType}`} />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta key="og:locale" property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={profileImage} />
        <meta name="twitter:site" content="@chooseyourtherapist" />

        {/* Additional */}
        <meta name="theme-color" content="#228756" />
        <meta name="application-name" content="Choose Your Therapist" />
        <link rel="canonical" href={currentUrl} />

        {/* Schema.org — Psychologist + MedicalBusiness + BreadcrumbList + ProfilePage */}
        {schemaData.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </Head>
      <MyNavbar />
      {profile && (
        <>
          <ProfileHeader pageData={profile} favrioutes={favrioutes} />
          <ProfileInfoTab pageData={profile} />
          {/* the site body is dark green — give the reviews their own white page background so the footer starts below them */}
          <div style={{ background: "#fff" }}>
            <ProfileReview profile={profile} />
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}

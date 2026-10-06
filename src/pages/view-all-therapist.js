import React from "react";
import Head from "next/head";
import ViewAllTherapist from "../components/View-All-Therapist/view-all-therapist";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import { fetchData } from "../utils/actions";
import { getTherapistProfiles } from "../utils/url";
import { filterTherapists } from "../utils/filterTherapists";
import { profilePath } from "../utils/therapist-slug";
import { slimTherapist, feeBand, directoryFaqs, CONCERNS } from "../utils/therapist-directory";

const PAGE_URL = "https://www.chooseyourtherapist.in/view-all-therapist";
const OG_IMAGE = "https://i.postimg.cc/gj1yngrd/choose.png";

// Schema: MedicalOrganization — the directory itself is a medical org listing
const medicalOrgSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "@id": "https://www.chooseyourtherapist.in#medicalorg",
  "name": "Choose Your Therapist — Verified Psychologist Directory",
  "description": "India's trusted directory of verified counselling psychologists, clinical psychologists, and special educators offering online and in-person therapy sessions.",
  "url": PAGE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.chooseyourtherapist.in/logo.png"
  },
  "medicalSpecialty": [
    "Counselling Psychology",
    "Clinical Psychology",
    "Child & Adolescent Psychology",
    "Relationship Counselling",
    "Trauma Therapy",
    "Anxiety & Depression Treatment",
    "OCD Therapy",
    "Special Education"
  ],
  "areaServed": {
    "@type": "Country",
    "name": "India"
  },
  "availableService": [
    { "@type": "MedicalTherapy", "name": "Online Counselling" },
    { "@type": "MedicalTherapy", "name": "In-Person Therapy" },
    { "@type": "MedicalTherapy", "name": "Couples Counselling" },
    { "@type": "MedicalTherapy", "name": "Child Therapy" },
    { "@type": "MedicalTherapy", "name": "Anxiety & Depression Therapy" },
    { "@type": "MedicalTherapy", "name": "Trauma & PTSD Counselling" },
    { "@type": "MedicalTherapy", "name": "OCD Treatment" }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-8077757951",
    "contactType": "customer service",
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi"]
  },
  "sameAs": [
    "https://www.instagram.com/chooseyourtherapist",
    "https://www.facebook.com/chooseyourtherapist",
    "https://twitter.com/CYT_India"
  ]
};

// Schema: CollectionPage — the directory page as a collection
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Find Verified Psychologists & Therapists in India",
  "description": "Browse our directory of verified psychologists, counselling psychologists, clinical psychologists, and special educators across India. Filter by specialty, state, language, and experience.",
  "url": PAGE_URL,
  "provider": { "@id": "https://www.chooseyourtherapist.in#medicalorg" },
  "about": {
    "@type": "MedicalCondition",
    "name": "Mental Health Disorders",
    "description": "Conditions including anxiety, depression, OCD, PTSD, relationship issues, and learning disabilities"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" },
      { "@type": "ListItem", "position": 2, "name": "Find a Psychologist", "item": PAGE_URL }
    ]
  }
};

// Schema: Service — searchable therapist directory as a service
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Therapist Matching & Directory Service",
  "description": "Search and book verified psychologists and therapists in India based on specialization, location, language, and experience.",
  "provider": { "@id": "https://www.chooseyourtherapist.in#medicalorg" },
  "serviceType": "Mental Health Therapist Directory",
  "areaServed": { "@type": "Country", "name": "India" },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Psychologist Specializations",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Counselling Psychology" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Clinical Psychology" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Special Education" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Child & Adolescent Therapy" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Couples & Relationship Counselling" } }
    ]
  }
};

const allSchemas = [medicalOrgSchema, collectionPageSchema, serviceSchema];

function getDynamicMeta(query) {
  const { profile_type, state, services, concern } = query || {};
  if (concern) {
    const label = CONCERNS.find((c) => c.value === concern)?.label || concern;
    return {
      title: `Therapists for ${label}${state ? ` in ${state}` : ""} | Choose Your Therapist`,
      description: `Find verified psychologists who help with ${label.toLowerCase()}${state ? ` in ${state}` : " across India"}. Compare expertise, languages and fees, and book online or in-person.`,
    };
  }
  if (profile_type && state) {
    return {
      title: `${profile_type}s in ${state} | Choose Your Therapist`,
      description: `Find verified ${profile_type}s in ${state}. Browse profiles, check specializations, and book online or in-person therapy sessions.`,
    };
  }
  if (profile_type) {
    return {
      title: `Find ${profile_type}s in India | Choose Your Therapist`,
      description: `Browse verified ${profile_type}s across India. Filter by location, language, and experience. Book online or in-person sessions today.`,
    };
  }
  if (state) {
    return {
      title: `Psychologists & Therapists in ${state} | Choose Your Therapist`,
      description: `Find verified psychologists and counsellors in ${state}. Book online or in-person therapy sessions for anxiety, depression, relationships, and more.`,
    };
  }
  if (services) {
    return {
      title: `${services} — Verified Therapists in India | Choose Your Therapist`,
      description: `Find therapists specialising in ${services} across India. Browse verified psychologists and book a session online or in-person.`,
    };
  }
  return {
    title: "Find Verified Psychologists & Therapists in India | Choose Your Therapist",
    description: "Browse India's largest directory of verified counselling psychologists, clinical psychologists, and therapists. Filter by specialty, city, language, and experience. Book online or in-person sessions.",
  };
}

export async function getServerSideProps(context) {
  const q = (k) => (typeof context.query[k] === "string" ? context.query[k] : "");
  const [profile_type, services, year_of_exp, language_spoken, state, search, concern, mode, gender, sort, fee] =
    ["profile_type", "services", "year_of_exp", "language_spoken", "state", "search", "concern", "mode", "gender", "sort", "fee"].map(q);

  const filter = {
    profile_type, services, year_of_exp, language_spoken, state, search, concern, mode, gender, sort, fee,
    page: 1, pageSize: 1000,
  };

  // Fetch the full unfiltered pool (the backend doesn't support state/services
  // filtering at all, and we want one client-side re-filterable dataset for
  // interactive use) — then apply the same predicate used client-side to get
  // the actual filtered set a crawler landing on this URL should see.
  let initialAllData = [];
  try {
    const res = await fetchData(getTherapistProfiles, { page: 1, pageSize: 1000 });
    // only the fields the directory shows — the full documents made the HTML ~250 KB heavier
    if (res?.data) initialAllData = res.data.map(slimTherapist);
  } catch (err) {
    console.error("Error in view-all-therapist getServerSideProps:", err);
  }
  // just what the ItemList schema needs (not a second copy of the therapists)
  const listed = filterTherapists(initialAllData, filter).slice(0, 30)
    .map((t) => ({ path: profilePath(t), name: `${t.user?.name || "Therapist"} — ${t.profile_type || "Therapist"}` }));

  // Only state/profile_type produce a finite, meaningful set of indexable
  // combinations (mirrors the JustDial city x category pattern). Other
  // filters (search, language, experience) are left as thin/noindex
  // variants that still canonicalize back to the clean combination.
  const seoParams = new URLSearchParams();
  if (profile_type) seoParams.set("profile_type", profile_type);
  if (state) seoParams.set("state", state);
  const canonical = seoParams.toString()
    ? `${PAGE_URL}?${seoParams.toString()}`
    : PAGE_URL;
  const hasThinFilter = Boolean(services || year_of_exp || language_spoken || search || concern || mode || gender || sort || fee);
  const robots = hasThinFilter ? "noindex, follow" : "index, follow";

  return {
    props: {
      initialAllData,
      listed,
      initialFilters: filter,
      seo: { canonical, robots },
    },
  };
}

export default function ViewAllTherapistPage({ initialAllData, listed, initialFilters, seo }) {
  const { title, description } = getDynamicMeta(initialFilters);

  // ItemList schema — lets Google see the actual therapists on this
  // combination of filters, not just the generic directory description.
  const itemListSchema = listed?.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": listed.map((t, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `https://www.chooseyourtherapist.in${t.path}`,
      "name": t.name,
    })),
  } : null;
  // FAQPage — the same questions shown at the bottom of the directory
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": directoryFaqs(feeBand(initialAllData)).map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  };
  const pageSchemas = [...allSchemas, ...(itemListSchema ? [itemListSchema] : []), faqSchema];

  return (
    <div id="__next">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="find psychologist India, verified therapists India, counselling psychologist near me, online therapy India, best psychologist India, therapist directory, clinical psychologist, mental health counseling, book therapist online" />
        <meta name="robots" content={seo.robots} />
        <link rel="canonical" href={seo.canonical} />
        <link rel="preload" as="image" href="/assets/img/therapist-directory-banner-1600.webp"
          imageSrcSet="/assets/img/therapist-directory-banner-800.webp 800w, /assets/img/therapist-directory-banner-1600.webp 1600w" imageSizes="100vw" />

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={seo.canonical} />
        <meta key="og:type" property="og:type" content="website" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta key="og:locale" property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:site" content="@CYT_India" />

        {/* Schema.org — MedicalOrganization + CollectionPage + Service + ItemList */}
        {pageSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </Head>
      <main className="">
        <MyNavbar />
        <main className="rbt-main-wrapper">
          <ViewAllTherapist initialAllData={initialAllData} initialFilters={initialFilters} />
        </main>
        <Footer />
      </main>
    </div>
  );
}

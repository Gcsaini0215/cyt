import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Box, Typography, Button, Stack } from "@mui/material";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ProbonoProfileDetail from "../../../components/probono/probono-profile-detail";
import Footer from "../../../components/footer";
import MyNavbar from "../../../components/navbar";
import NewsLetter from "../../../components/home/newsletter";
import { PSYCHOLOGISTS } from "../../../components/probono/probono-data";
import { fetchData } from "../../../utils/actions";
import { getProbonoInternsUrl, baseApi } from "../../../utils/url";

const PAGE_BASE_URL = "https://www.chooseyourtherapist.in/probono-therapist/profiles";

const fixImageUrl = (url) => {
  if (!url) return url;
  if (url.includes("api.chooseyourtherapist.in")) {
    return url.replace("https://api.chooseyourtherapist.in", baseApi);
  }
  return url;
};

function ProfileNotFound() {
  return (
    <div className="rbt-section-gap" style={{ paddingTop: 40, background: "#f8faf9", minHeight: "60vh" }}>
      <div className="container">
        <Box
          sx={{
            maxWidth: 520,
            mx: "auto",
            textAlign: "center",
            p: { xs: 4, md: 6 },
            borderRadius: "24px",
            background: "#ffffff",
            border: "1px solid #eef2f0",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <Box
            sx={{
              width: 84,
              height: 84,
              mx: "auto",
              mb: 3,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#e8f5ee",
            }}
          >
            <SearchOffRoundedIcon sx={{ fontSize: 40, color: "#228756" }} />
          </Box>

          <Typography sx={{ fontWeight: 900, fontSize: 22, color: "#1e293b", mb: 1 }}>
            Profile Not Found
          </Typography>

          <Typography sx={{ fontSize: 14.5, color: "#64748b", lineHeight: 1.7, mb: 4 }}>
            This probono therapist profile doesn't exist or may have been moved.
            Please check the link, or browse our full list of therapists below.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
            <Link href="/probono-therapist/profiles" passHref legacyBehavior>
              <Button
                component="a"
                startIcon={<ArrowBackIcon />}
                fullWidth
                sx={{
                  borderRadius: "12px",
                  py: 1.3,
                  background: "linear-gradient(135deg,#166534,#16a34a)",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 14.5,
                  textTransform: "none",
                  boxShadow: "0 8px 18px rgba(22,101,52,0.25)",
                  "&:hover": { opacity: 0.92 },
                }}
              >
                Browse All Profiles
              </Button>
            </Link>
            <Link href="/" passHref legacyBehavior>
              <Button
                component="a"
                startIcon={<HomeRoundedIcon />}
                fullWidth
                sx={{
                  borderRadius: "12px",
                  py: 1.3,
                  border: "1.5px solid #e2e8f0",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: 14.5,
                  textTransform: "none",
                  "&:hover": { background: "#f8faf9", borderColor: "#cbd5e1" },
                }}
              >
                Back to Home
              </Button>
            </Link>
          </Stack>
        </Box>
      </div>
    </div>
  );
}

export default function ProbonoProfileDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [psychologist, setPsychologist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !slug) return;

    const staticMatch = PSYCHOLOGISTS.find((p) => p.slug === slug);
    if (staticMatch) {
      setPsychologist(staticMatch);
      setLoading(false);
      return;
    }

    fetchData(getProbonoInternsUrl)
      .then((res) => {
        const match = res?.data?.find((p) => p.slug === slug);
        if (match) {
          setPsychologist({ ...match, photo: fixImageUrl(match.photo) });
        }
      })
      .catch(() => {
        // stay null -> not found state below
      })
      .finally(() => setLoading(false));
  }, [router.isReady, slug]);

  if (!router.isReady || loading) {
    return null;
  }

  if (!psychologist) {
    return (
      <div id="__next">
        <MyNavbar />
        <ProfileNotFound />
        <Footer />
      </div>
    );
  }

  return (
    <div id="__next">
      <Head>
        <title>{psychologist.name} | Probono Psychologist | Choose Your Therapist</title>
        <meta name="description" content={psychologist.intro} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${PAGE_BASE_URL}/${psychologist.slug}`} />
      </Head>
      <MyNavbar />
      <ProbonoProfileDetail psychologist={psychologist} />
      <NewsLetter />
      <Footer />
    </div>
  );
}

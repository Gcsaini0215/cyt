import React, { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import ProfileCardHor from "./profile-card-hor";
import { Container, Box, CircularProgress } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import Link from "next/link";
import { fetchData } from "../../utils/actions";
import { getTherapistProfiles } from "../../utils/url";
import ErrorPage from "../../pages/error-page";

const HorTherapistCards = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  // Temporary fallback data for testing
  const fallbackData = [
    {
      _id: "1",
      user: { name: "Dr. Test Therapist", profile: "default-profile.png" },
      profile_type: "Clinical Psychologist",
      language_spoken: "English, Hindi",
      state: "Delhi",
      year_of_exp: "5",
      services_offered: "Anxiety, Depression, Couples Therapy",
      priority: 1
    }
  ];

  console.log("HorTherapistCard state - therapists:", therapists, "loading:", loading, "error:", error);

  useEffect(() => {
    const getData = async () => {
      try {
        console.log("Fetching therapist profiles...");
        const res = await fetchData(getTherapistProfiles);
        console.log("HorTherapistCard API Response:", res);
        if (res && res.data) {
          // Filter to only show recommended therapists (priority === 1)
          const recommendedTherapists = (res.data || []).filter(therapist => therapist.priority === 1);
          setTherapists(recommendedTherapists);
          console.log("Recommended therapists data:", recommendedTherapists);
        } else {
          setError(true);
          console.log("API returned error or empty data");
        }
      } catch (err) {
        console.log("API Error:", err);
        console.log("Using fallback data for testing");
        // Filter fallback data to only show recommended (assuming priority 1)
        const recommendedFallback = fallbackData.filter(therapist => therapist.priority === 1);
        setTherapists(recommendedFallback);
        // setError(true); // Comment out to show fallback data
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (error) {
    return <ErrorPage />;
  }

  if (loading) {
    return (
      <Box sx={{ py: 8, backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{
      padding: isMobile ? '40px 0' : '60px 0',
      backgroundColor: '#ffffff',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `0 ${isMobile ? '16px' : '24px'}`,
        position: 'relative'
      }}>

        {/* Recommended Therapists Heading */}
        <div style={{
          marginBottom: isMobile ? 24 : 32,
          paddingLeft: isMobile ? '16px' : '20px',
          paddingRight: isMobile ? '16px' : '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: isMobile ? '16px' : '20px'
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                background: 'linear-gradient(135deg, #228756 0%, #007f99 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: isMobile ? "28px" : "42px",
                fontWeight: "800",
                marginBottom: isMobile ? "12px" : "16px",
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}>
                Recommended Therapists
              </h2>
              <p style={{
                color: "#64748b",
                fontSize: isMobile ? "15px" : "17px",
                marginBottom: "0",
                lineHeight: 1.6,
                fontWeight: "400"
              }}>
                Explore our carefully curated list of highly recommended therapists, selected for their expertise and proven track record in mental health support.
              </p>
            </div>
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link
                  href="/view-all-therapist"
                  style={{
                    background: 'linear-gradient(135deg, #228756 0%, #1a6b45 100%)',
                    color: '#fff',
                    padding: '14px 28px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 15px rgba(34, 135, 86, 0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #1a6b45 0%, #228756 100%)';
                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                    e.target.style.boxShadow = '0 8px 25px rgba(34, 135, 86, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #228756 0%, #1a6b45 100%)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(34, 135, 86, 0.3)';
                  }}
                >
                  View All Therapists
                  <span style={{ fontSize: '18px', transition: 'transform 0.3s ease' }}>→</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {therapists.length>0 && <Swiper
            modules={[Autoplay]}
            spaceBetween={isMobile ? 12 : 16}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: isMobile ? 1 : 2,
                spaceBetween: isMobile ? 12 : 16,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={therapists.length > 2}
            speed={1000}
            grabCursor={true}
            style={{
              padding: '0'
            }}
          >
            {therapists.map((therapist) => (
              <SwiperSlide key={therapist._id} style={{
                display: 'flex',
                justifyContent: 'center',
                padding: isMobile ? '8px 16px' : '12px 24px'
              }}>
                <Box sx={{
                  width: '100%',
                  maxWidth: isMobile ? '100%' : '550px',
                  transform: 'translateZ(0)', // Hardware acceleration
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.3s ease'
                  }
                }}>
                  <ProfileCardHor pageData={therapist} favrioutes={[]} showOnlyBookButton={true} />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>}
{/* 
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Showing {therapists.length} of 500+ therapists.
            <Box
              component="button"
              sx={{
                color: '#228756',
                fontWeight: 500,
                ml: 1,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              View all therapists
            </Box>
          </Typography>
        </Box> */}
      </div>
    </div>
  );
};

export default HorTherapistCards;

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { fetchData } from "../../utils/actions";
import { getTherapistProfile } from "../../utils/url";
import ErrorPage from "../error-page";
import PageProgressBar from "../../components/global/page-progress";
import TherapistCheckout from "../../components/view_profile/checkout";
import PageBreadCrumb from "../../components/global/page-breadcrumb";
const CheckoutBanner = () => (
  <div style={{ background: '#228756', padding: '22px 0 18px' }}>
    <div className="container">
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2 }}>
          Confirm Your Booking
        </h1>
        <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 'clamp(.88rem, 2vw, 1rem)', margin: '0', fontWeight: 500, lineHeight: 1.6 }}>
          Take the next step in your wellness journey with a verified therapist.
        </p>
      </div>
    </div>
  </div>
);

export default function TherapistCheckoutPage() {
  const router = useRouter();
  const { id  } = router.query;
  const [profile, setProfile] = useState();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const getData = useCallback(async () => {
    if (!id) return;
    
    try {
      const res = await fetchData(getTherapistProfile + id);

      if (res.status && res.data && Object.keys(res.data).length > 0) {
        setProfile(res.data);
        setLoading(false);
      } else {
        setError(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching therapist profile:", err);
      setLoading(false);
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    if (router.isReady && id) {
      getData();
    }
  }, [router.isReady, id, getData]);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {loading ? <PageProgressBar /> : (
    <div id="__next">
      <MyNavbar />
      <CheckoutBanner />
      <div className="ptb--60 ptb_sm--20">
        {Object.keys(profile).length > 0 && <TherapistCheckout profile={profile} />}
      </div>
      <NewsLetter />
      <Footer />
    </div>
      )}
    </>
  );
}

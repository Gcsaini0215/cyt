import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
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
  <div className="checkout-banner-area" style={{
    background: 'linear-gradient(135deg, #228756 0%, #1a6b44 100%)',
    padding: '60px 0',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Decorative Elements */}
    <div style={{
      position: 'absolute',
      top: '-50px',
      right: '-50px',
      width: '200px',
      height: '200px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '50%',
      pointerEvents: 'none'
    }}></div>
    
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          <div className="checkout-banner-inner text-center">
            <h1 className="checkout-banner-title" style={{ 
              color: '#ffffff', 
              fontSize: '3rem', 
              fontWeight: 900,
              marginBottom: '20px'
            }}>
              Confirm Your Booking
            </h1>
            <p className="checkout-banner-subtitle" style={{ 
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '40px',
              maxWidth: '800px',
              margin: '0 auto 40px'
            }}>
              Take the next step in your wellness journey with our expert therapists.
            </p>
            
            <div className="trust-badges-row" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              <div className="trust-badge-item" style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '12px 28px',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <i className="feather-shield" style={{ fontSize: '18px' }}></i>
                <span>100% Confidential</span>
              </div>
              <div className="trust-badge-item" style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '12px 28px',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <i className="feather-check-circle" style={{ fontSize: '18px' }}></i>
                <span>Verified Professional</span>
              </div>
              <div className="trust-badge-item" style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '12px 28px',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <i className="feather-lock" style={{ fontSize: '18px' }}></i>
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
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

  return loading ? (
    <PageProgressBar />
  ) : (
    <div id="__next">
      <MyNavbar />
      <CheckoutBanner />
      <div className="ptb--100 ptb_md--50 ptb_sm--40">
        {Object.keys(profile).length > 0 && <TherapistCheckout profile={profile} />}
      </div>
      <NewsLetter />
      <Footer />
    </div>
  );
}

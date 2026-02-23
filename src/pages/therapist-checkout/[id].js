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
  <div className="checkout-banner-area">
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          <div className="checkout-banner-inner text-center">
            <h1 className="checkout-banner-title">Confirm Booking</h1>
            <p className="checkout-banner-subtitle">Ready to start your wellness journey.</p>
            <div className="trust-badges-row">
              <div className="trust-badge-item">
                <i className="feather-shield"></i>
                <span>100% Confidential</span>
              </div>
              <div className="trust-badge-item">
                <i className="feather-check-circle"></i>
                <span>Verified Professional</span>
              </div>
              <div className="trust-badge-item">
                <i className="feather-lock"></i>
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

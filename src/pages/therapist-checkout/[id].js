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
    position: 'relative',
    overflow: 'hidden'
  }}>
    <style>{`
      .ck-ban-wrap { padding: 40px 0 36px; }
      .ck-ban-title { color:#fff; font-size:2rem; font-weight:900; margin-bottom:10px; }
      .ck-ban-sub { color:rgba(255,255,255,.9); font-size:1rem; font-weight:600; margin:0 auto 28px; max-width:700px; }
      .ck-badges { display:flex; justify-content:center; gap:10px; flex-wrap:wrap; padding:0 10px; }
      .ck-badge { background:rgba(255,255,255,.15); backdrop-filter:blur(10px); padding:7px 14px; border-radius:50px; display:flex; align-items:center; gap:6px; color:#fff; font-size:12px; font-weight:700; border:1px solid rgba(255,255,255,.3); }
      @media(min-width:768px){
        .ck-ban-wrap { padding:60px 0 52px; }
        .ck-ban-title { font-size:2.8rem; margin-bottom:16px; }
        .ck-ban-sub { font-size:1.15rem; margin-bottom:36px; }
        .ck-badge { font-size:13px; padding:8px 18px; }
      }
    `}</style>
    <div style={{ position:'absolute', top:'-50px', right:'-50px', width:'200px', height:'200px', background:'rgba(255,255,255,.05)', borderRadius:'50%', pointerEvents:'none' }}></div>
    <div className="container">
      <div className="ck-ban-wrap text-center">
        <h1 className="ck-ban-title">Confirm Your Booking</h1>
        <p className="ck-ban-sub">Take the next step in your wellness journey with our expert therapists.</p>
        <div className="ck-badges">
          {[['feather-shield','100% Confidential'],['feather-check-circle','Verified Specialist'],['feather-lock','Secure Payment']].map(([icon, label]) => (
            <div className="ck-badge" key={label}>
              <i className={icon} style={{ fontSize:'14px' }}></i>
              <span>{label}</span>
            </div>
          ))}
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
      <div className="ptb--60 ptb_sm--20">
        {Object.keys(profile).length > 0 && <TherapistCheckout profile={profile} />}
      </div>
      <NewsLetter />
      <Footer />
    </div>
  );
}

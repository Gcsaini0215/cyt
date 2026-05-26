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
  <div style={{ background: 'linear-gradient(140deg,#0a4a2e 0%,#186840 40%,#228756 100%)', position: 'relative', overflow: 'hidden' }}>
    <style>{`
      /* dot grid overlay */
      .ckb-dots { position:absolute; inset:0; background-image:radial-gradient(circle,rgba(255,255,255,.07) 1px,transparent 1px); background-size:26px 26px; pointer-events:none; }
      /* blobs */
      .ckb-blob { position:absolute; border-radius:50%; pointer-events:none; }
      /* layout */
      .ckb-inner { position:relative; padding:34px 0 30px; display:flex; flex-direction:column; gap:0; }
      .ckb-left { flex:1; }
      /* session tag */
      .ckb-tag { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.22); border-radius:50px; padding:5px 14px 5px 10px; font-size:11.5px; font-weight:800; color:#fff; letter-spacing:.6px; text-transform:uppercase; margin-bottom:14px; }
      .ckb-tag-dot { width:8px; height:8px; border-radius:50%; background:#4ade80; box-shadow:0 0 6px rgba(74,222,128,.7); flex-shrink:0; }
      /* heading */
      .ckb-title { color:#fff; font-size:1.7rem; font-weight:900; line-height:1.18; margin:0 0 10px; }
      .ckb-title span { color:#86efac; }
      /* sub */
      .ckb-sub { color:rgba(255,255,255,.78); font-size:.9rem; font-weight:500; line-height:1.65; margin:0 0 20px; max-width:460px; }
      /* trust badges */
      .ckb-badges { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:22px; }
      .ckb-badge { background:rgba(255,255,255,.12); backdrop-filter:blur(10px); padding:6px 13px; border-radius:50px; display:flex; align-items:center; gap:6px; color:#fff; font-size:11.5px; font-weight:700; border:1px solid rgba(255,255,255,.2); }
      /* steps */
      .ckb-steps { display:flex; align-items:center; gap:0; }
      .ckb-step { display:flex; align-items:center; gap:7px; }
      .ckb-snum { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900; flex-shrink:0; }
      .ckb-snum.cur { background:#fff; color:#228756; box-shadow:0 0 0 3px rgba(255,255,255,.25); }
      .ckb-snum.fut { background:rgba(255,255,255,.18); color:rgba(255,255,255,.6); }
      .ckb-slbl { font-size:12px; font-weight:700; }
      .ckb-slbl.cur { color:#fff; }
      .ckb-slbl.fut { color:rgba(255,255,255,.45); }
      .ckb-sline { height:2px; background:rgba(255,255,255,.18); margin:0 8px; flex:1; min-width:18px; max-width:50px; border-radius:2px; }
      /* stat cards — desktop only */
      .ckb-stats { display:none; }
      @media(min-width:992px){
        .ckb-inner { flex-direction:row; align-items:center; padding:58px 0 52px; gap:48px; }
        .ckb-title { font-size:2.65rem; margin-bottom:14px; }
        .ckb-sub { font-size:1rem; margin-bottom:24px; }
        .ckb-tag { font-size:12px; margin-bottom:18px; }
        .ckb-badge { font-size:12.5px; padding:7px 15px; }
        .ckb-stats { display:flex; flex-direction:column; gap:11px; flex-shrink:0; }
        .ckb-stat { background:rgba(255,255,255,.11); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.18); border-radius:18px; padding:16px 22px; display:flex; align-items:center; gap:15px; min-width:200px; }
        .ckb-stat-ico { width:40px; height:40px; background:rgba(255,255,255,.18); border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ckb-stat-ico i { color:#fff; font-size:19px; }
        .ckb-stat-val { font-size:21px; font-weight:900; color:#fff; line-height:1; }
        .ckb-stat-lbl { font-size:11.5px; color:rgba(255,255,255,.65); font-weight:600; margin-top:3px; }
      }
    `}</style>

    {/* dot overlay */}
    <div className="ckb-dots"></div>
    {/* blobs */}
    <div className="ckb-blob" style={{ width:320, height:320, background:'radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%)', top:-90, right:'8%' }}></div>
    <div className="ckb-blob" style={{ width:180, height:180, background:'radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%)', bottom:-50, left:'4%' }}></div>

    <div className="container">
      <div className="ckb-inner">

        {/* ── Left: content ─────────────────────────── */}
        <div className="ckb-left">

          <div className="ckb-tag">
            <div className="ckb-tag-dot"></div>
            Session Booking
          </div>

          <h1 className="ckb-title">
            Book Your <span>Therapy</span><br/>Session Today
          </h1>

          <p className="ckb-sub">
            Connect with a verified therapist and take the first step towards a healthier, happier you.
          </p>

          <div className="ckb-badges">
            {[
              ['feather-shield', '100% Confidential'],
              ['feather-check-circle', 'Verified Therapist'],
              ['feather-lock', 'Secure Payment'],
            ].map(([icon, label]) => (
              <div className="ckb-badge" key={label}>
                <i className={icon} style={{ fontSize: 13 }}></i>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Step progress */}
          <div className="ckb-steps">
            <div className="ckb-step">
              <div className="ckb-snum cur">1</div>
              <span className="ckb-slbl cur">Details</span>
            </div>
            <div className="ckb-sline"></div>
            <div className="ckb-step">
              <div className="ckb-snum fut">2</div>
              <span className="ckb-slbl fut">Verify</span>
            </div>
            <div className="ckb-sline"></div>
            <div className="ckb-step">
              <div className="ckb-snum fut">3</div>
              <span className="ckb-slbl fut">Payment</span>
            </div>
          </div>
        </div>

        {/* ── Right: stats (desktop only via CSS) ───── */}
        <div className="ckb-stats">
          {[
            { icon: 'feather-users', val: '500+', lbl: 'Verified Therapists' },
            { icon: 'feather-star', val: '4.9 ★', lbl: 'Average Rating' },
            { icon: 'feather-heart', val: '10k+', lbl: 'Happy Clients' },
          ].map(({ icon, val, lbl }) => (
            <div className="ckb-stat" key={lbl}>
              <div className="ckb-stat-ico">
                <i className={icon}></i>
              </div>
              <div>
                <div className="ckb-stat-val">{val}</div>
                <div className="ckb-stat-lbl">{lbl}</div>
              </div>
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

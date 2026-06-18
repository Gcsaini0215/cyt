import React from "react";
import Head from "next/head";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import ConsultationForm from "../components/home/consultation-form";

const G  = "#1a5c38";
const GL = "#228756";
const GB = "#f0fdf4";

export default function TherapyBooking() {
  return (
    <>
      <Head>
        <title>Free 15-Min Consultation | Choose Your Therapist</title>
        <meta name="description" content="Book a free 15-minute discovery call with our verified psychologists. Confidential, no commitment required." />
        <link rel="canonical" href="https://chooseyourtherapist.in/therapy-booking" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes _fd  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _fd2 { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }

        .tb-hero { background: linear-gradient(135deg, #0d3d25 0%, ${G} 60%, #1a7a48 100%); position: relative; overflow: hidden; }
        .tb-hero::before { content:""; position:absolute; top:-80px; right:-80px; width:320px; height:320px; border-radius:50%; background:rgba(255,255,255,.04); }
        .tb-hero::after  { content:""; position:absolute; bottom:-60px; left:-60px; width:240px; height:240px; border-radius:50%; background:rgba(255,255,255,.03); }

        .tb-badge { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); border-radius:50px; padding:6px 16px; margin-bottom:20px; }
        .tb-badge span { font-size:11px; font-weight:800; color:#fff; letter-spacing:1px; text-transform:uppercase; }

        .tb-headline { font-size:clamp(28px,4.5vw,48px); font-weight:900; color:#fff; line-height:1.18; letter-spacing:-.5px; margin:0 0 16px; }
        .tb-headline em { color:#4ade80; font-style:normal; }
        .tb-sub { font-size:16px; color:rgba(255,255,255,.78); line-height:1.65; margin:0 0 28px; font-weight:500; }

        .tb-pills { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:0; }
        .tb-pill  { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18); border-radius:50px; padding:7px 14px; font-size:12px; font-weight:700; color:#fff; }
        .tb-pill i { font-size:12px; color:#4ade80; }

        .tb-form-card { background:#fff; border-radius:24px; box-shadow:0 20px 60px rgba(0,0,0,.15); padding:36px 32px; animation:_fd .5s ease; }

        .tb-trust { background:#fff; border-top:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9; }
        .tb-trust-inner { max-width:1100px; margin:0 auto; padding:28px 20px; display:flex; justify-content:center; align-items:center; gap:40px; flex-wrap:wrap; }
        .tb-trust-item { display:flex; align-items:center; gap:10px; }
        .tb-trust-num  { font-size:22px; font-weight:900; color:${G}; line-height:1; }
        .tb-trust-lbl  { font-size:12px; color:#64748b; font-weight:600; line-height:1.4; }

        .tb-how { background:#f8fafc; padding:80px 20px; }
        .tb-how-inner { max-width:960px; margin:0 auto; }
        .tb-sec-label { font-size:12px; font-weight:800; color:${GL}; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px; }
        .tb-sec-title { font-size:clamp(24px,3.5vw,36px); font-weight:900; color:#0f172a; margin:0 0 8px; line-height:1.2; letter-spacing:-.3px; }
        .tb-sec-sub   { font-size:15px; color:#64748b; margin:0 0 48px; }

        .tb-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        .tb-step  { background:#fff; border-radius:20px; padding:32px 24px; border:1.5px solid #f1f5f9; box-shadow:0 4px 20px rgba(0,0,0,.05); position:relative; text-align:center; }
        .tb-step-num { width:44px; height:44px; border-radius:12px; background:${G}; color:#fff; font-size:18px; font-weight:900; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; }
        .tb-step-icon { font-size:28px; margin-bottom:14px; display:block; }
        .tb-step-title { font-size:16px; font-weight:800; color:#0f172a; margin:0 0 8px; }
        .tb-step-desc  { font-size:13px; color:#64748b; line-height:1.6; margin:0; }
        .tb-step-line  { position:absolute; top:54px; right:-13px; width:26px; height:2px; background:linear-gradient(90deg,${G},#4ade80); border-radius:2px; z-index:1; }

        .tb-reviews { background:#fff; padding:80px 20px; }
        .tb-reviews-inner { max-width:960px; margin:0 auto; }
        .tb-review-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .tb-review-card { background:#f8fafc; border-radius:20px; padding:28px 24px; border:1.5px solid #f1f5f9; }
        .tb-stars { color:#f59e0b; font-size:14px; margin-bottom:14px; letter-spacing:2px; }
        .tb-review-text { font-size:14px; color:#374151; line-height:1.7; margin:0 0 20px; font-style:italic; }
        .tb-reviewer { display:flex; align-items:center; gap:10px; }
        .tb-reviewer-av { width:38px; height:38px; border-radius:10px; background:${G}; color:#fff; font-size:15px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .tb-reviewer-name { font-size:13px; font-weight:800; color:#0f172a; }
        .tb-reviewer-loc  { font-size:11px; color:#94a3b8; font-weight:600; }

        .tb-cta { background:linear-gradient(135deg,#0d3d25,${G}); padding:72px 20px; text-align:center; }
        .tb-cta-title { font-size:clamp(22px,3.5vw,34px); font-weight:900; color:#fff; margin:0 0 12px; }
        .tb-cta-sub   { font-size:15px; color:rgba(255,255,255,.75); margin:0 0 28px; }
        .tb-cta-btn   { display:inline-flex; align-items:center; gap:8px; background:#4ade80; color:#0d3d25; padding:15px 36px; border-radius:50px; font-size:15px; font-weight:900; text-decoration:none; box-shadow:0 8px 28px rgba(74,222,128,.35); transition:all .2s; }
        .tb-cta-btn:hover { transform:translateY(-3px); box-shadow:0 14px 36px rgba(74,222,128,.45); color:#0d3d25; }

        @media(max-width:900px) {
          .tb-steps { grid-template-columns:1fr; }
          .tb-step-line { display:none; }
          .tb-review-grid { grid-template-columns:1fr; }
          .tb-trust-inner { gap:24px; }
        }
        @media(max-width:767px) {
          .tb-form-card { padding:24px 20px; }
          .tb-how, .tb-reviews { padding:56px 16px; }
        }
      `}</style>

      <div id="__next">
        <MyNavbar />

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="tb-hero">
          <div style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 24px 80px", position: "relative", zIndex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 60, alignItems: "center" }}>

              {/* Left — copy */}
              <div style={{ animation: "_fd .5s ease" }}>
                <div className="tb-badge">
                  <i className="feather-phone-call" style={{ fontSize: 13, color: "#4ade80" }}></i>
                  <span>Free 15-Min Discovery Call</span>
                </div>

                <h1 className="tb-headline">
                  Feeling lost?<br />
                  <em>We'll help you find</em><br />
                  the right therapist.
                </h1>

                <p className="tb-sub">
                  Talk to one of our mental health experts — free, confidential, and zero pressure. We'll understand your needs and match you with the perfect therapist.
                </p>

                <div className="tb-pills">
                  {[
                    { icon: "feather-shield",     t: "100% Confidential"    },
                    { icon: "feather-check-circle",t: "Verified Experts"     },
                    { icon: "feather-clock",       t: "Response in 24 hrs"   },
                    { icon: "feather-heart",       t: "No Commitment"        },
                  ].map(p => (
                    <div key={p.t} className="tb-pill">
                      <i className={p.icon}></i>{p.t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — form */}
              <div className="tb-form-card" style={{ animation: "_fd2 .6s ease" }}>
                <div style={{ marginBottom: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: G, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    Book Your Free Call
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>Fill in details — we'll reach out on WhatsApp</div>
                </div>
                <ConsultationForm showHeading={false} />
              </div>

            </div>
          </div>
        </section>

        {/* ══ TRUST BAR ═════════════════════════════════════════════════ */}
        <div className="tb-trust">
          <div className="tb-trust-inner">
            {[
              { num: "500+",  lbl: "Clients Helped"       },
              { num: "100+",  lbl: "Verified Therapists"  },
              { num: "4.9★",  lbl: "Average Rating"       },
              { num: "15 min",lbl: "Free Discovery Call"  },
              { num: "24 hrs",lbl: "Response Time"        },
            ].map(t => (
              <div key={t.lbl} className="tb-trust-item">
                <div>
                  <div className="tb-trust-num">{t.num}</div>
                  <div className="tb-trust-lbl">{t.lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
        <section className="tb-how">
          <div className="tb-how-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="tb-sec-label">Simple Process</div>
              <h2 className="tb-sec-title">How it works</h2>
              <p className="tb-sec-sub">Three simple steps to start your healing journey</p>
            </div>
            <div className="tb-steps">
              {[
                { n: "1", icon: "feather-edit-3",   title: "Fill the Form",         desc: "Share your name, contact and a brief about what you're going through." },
                { n: "2", icon: "feather-phone",    title: "Get a Call Back",       desc: "Our team reaches out on WhatsApp within 24 hours to schedule your free 15-min call.", line: true },
                { n: "3", icon: "feather-heart",    title: "Start Your Journey",    desc: "Get matched with the right therapist and begin sessions at your own pace." },
              ].map((s, i) => (
                <div key={s.n} className="tb-step">
                  <div className="tb-step-num">{s.n}</div>
                  <i className={`${s.icon} tb-step-icon`} style={{ color: G }}></i>
                  <div className="tb-step-title">{s.title}</div>
                  <p className="tb-step-desc">{s.desc}</p>
                  {s.line && <div className="tb-step-line" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
        <section className="tb-reviews">
          <div className="tb-reviews-inner">
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="tb-sec-label">Real Stories</div>
              <h2 className="tb-sec-title">What our clients say</h2>
              <p className="tb-sec-sub">Thousands have taken this step — here's what they found</p>
            </div>
            <div className="tb-review-grid">
              {[
                {
                  text: "I was nervous about reaching out but the team was so warm and understanding. They matched me with a therapist who truly gets me. Best decision I ever made.",
                  name: "Priya S.", loc: "Delhi", init: "P",
                },
                {
                  text: "The free consultation call was super helpful. No pressure at all. Within a week I was having my first therapy session and I already feel so much lighter.",
                  name: "Rahul M.", loc: "Noida", init: "R",
                },
                {
                  text: "I'd been struggling with anxiety for years but never knew where to start. This team guided me through everything. Highly recommend to anyone on the fence.",
                  name: "Ananya K.", loc: "Bangalore", init: "A",
                },
              ].map(r => (
                <div key={r.name} className="tb-review-card">
                  <div className="tb-stars">★★★★★</div>
                  <p className="tb-review-text">"{r.text}"</p>
                  <div className="tb-reviewer">
                    <div className="tb-reviewer-av">{r.init}</div>
                    <div>
                      <div className="tb-reviewer-name">{r.name}</div>
                      <div className="tb-reviewer-loc">{r.loc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BOTTOM CTA ════════════════════════════════════════════════ */}
        <section className="tb-cta">
          <h2 className="tb-cta-title">Ready to take the first step?</h2>
          <p className="tb-cta-sub">It's free, it's confidential, and it could change everything.</p>
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="tb-cta-btn">
            <i className="feather-phone-call" style={{ fontSize: 16 }}></i>
            Book My Free Call
          </a>
        </section>

        <Footer />
      </div>
    </>
  );
}

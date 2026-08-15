import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/router";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import { checkTherapistStatusUrl, verifyTherapistSubscriptionUrl } from "../utils/url";
import { postData } from "../utils/actions";

const G    = "#0f3d24";
const GOLD = "#d4af37";
const GRAD = `linear-gradient(135deg, ${G}, #175c37)`;

const PLANS = [
  {
    id: "3_month", label: "3 Months", amount: 1999, months: 3,
    tag: null,
    benefits: [
      "Profile listed & discoverable by clients",
      "Verified badge on your public profile",
      "Booking & appointment management",
      "Professional invoice generation",
    ],
  },
  {
    id: "6_month", label: "6 Months", amount: 4999, months: 6,
    tag: "Most Popular",
    benefits: [
      "Everything in the 3-month plan",
      "Priority placement in directory search results",
      "Client records & session notes storage",
      "Priority email support",
    ],
  },
  {
    id: "annual", label: "12 Months", amount: 9500, months: 12,
    tag: "Best Value",
    benefits: [
      "Everything in the 6-month plan",
      "Featured “Top Pick” badge on your profile",
      "Uninterrupted year-long visibility — no renewal mid-year",
      "Dedicated account support",
    ],
  },
];

const GENERAL_BENEFITS = [
  { icon: "feather-eye",           title: "Discoverable Profile",  desc: "Your profile appears in our therapist directory, searchable by specialization, location, and language." },
  { icon: "feather-shield",        title: "Verified Badge",         desc: "A verified badge builds instant trust with prospective clients browsing your profile." },
  { icon: "feather-calendar",      title: "Booking Management",     desc: "Clients can book and pay for sessions directly through your CYT dashboard." },
  { icon: "feather-file-text",     title: "Invoicing & Records",    desc: "Generate professional invoices and keep client session notes organized in one place." },
];

const GROWTH_POINTS = [
  "Appear in client searches filtered by specialization, location, and language",
  "Build credibility with a verified badge and visible client reviews",
  "Get featured through our therapist directory, blog, and outreach campaigns",
  "Convert profile views into bookings with a streamlined appointment flow",
  "Stay consistently visible instead of losing your spot when a listing lapses",
];

const TERMS = [
  "Subscription fees are non-refundable once your profile goes live under the selected plan.",
  "Plans do not auto-renew — you'll need to manually renew before expiry to remain listed.",
  "Subscriptions are available only to admin-approved therapist profiles.",
  "Choose Your Therapist reserves the right to suspend listings that violate platform guidelines.",
  "For billing questions, contact hello@chooseyourtherapist.in.",
];

const INSTRUCTIONS = [
  "Enter the email address you registered with.",
  "We'll verify that your application has been approved by our team.",
  "Choose a subscription plan that fits your needs.",
  "Complete payment securely via Razorpay.",
  "Your profile goes live immediately after successful payment.",
];

function fmtINR(n) { return `₹${n.toLocaleString("en-IN")}`; }
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function SectionCard({ icon, title, children }) {
  return (
    <div className="section-card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1.5px solid #f1f5f9" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#eef5f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <i className={icon} style={{ fontSize: 14, color: G }}></i>
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#132a1c" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function TherapistPayment() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkErr, setCheckErr] = useState("");
  const [profile, setProfile] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState("");
  const [paySuccess, setPaySuccess] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (router.isReady && router.query.email) {
      setEmail(String(router.query.email));
    }
  }, [router.isReady, router.query.email]);

  const checkStatus = async () => {
    setCheckErr(""); setProfile(null); setPaySuccess(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setCheckErr("Enter a valid email address"); return; }
    setChecking(true);
    try {
      const res = await postData(checkTherapistStatusUrl, { email });
      setProfile(res.data);
      if (res.data.subscription) setSelectedPlan(null);
    } catch (e) {
      setCheckErr(e.response?.data?.message || "No application found for this email");
    }
    setChecking(false);
  };

  async function openRazorpay(plan) {
    setPayErr("");
    setPaying(true);
    try {
      const orderRes = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: plan.amount, bookingId: `sub_${email}_${Date.now()}` }),
      });
      const { orderId, error } = await orderRes.json();
      if (!orderId) {
        setPayErr(error || "Payment init failed. Please try again.");
        setPaying(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(plan.amount * 100),
        currency: "INR",
        order_id: orderId,
        name: "Choose Your Therapist",
        description: `Therapist Subscription — ${plan.label}`,
        handler: async function (response) {
          try {
            const verifyRes = await postData(verifyTherapistSubscriptionUrl, {
              email,
              plan: plan.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.status) {
              setPaySuccess(verifyRes.data);
              setProfile(p => ({ ...p, subscription: verifyRes.data }));
            } else {
              setPayErr(verifyRes.message || "Payment verification failed. Please contact support.");
            }
          } catch (e) {
            setPayErr(e.response?.data?.message || "Payment verification failed. Please contact support.");
          }
          setPaying(false);
        },
        prefill: { name: profile?.name || "", email, contact: profile?.phone || "" },
        theme: { color: G },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setPayErr("Payment failed to initialize. Please try again.");
      setPaying(false);
    }
  }

  const inputStyle = {
    width: "100%", background: "#fff", border: "1.5px solid #cbd5c9",
    borderRadius: 3, padding: "11px 14px", fontSize: 14, color: "#1e293b",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <>
      <Head>
        <title>Therapist Subscription Plans | Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Activate your therapist subscription plan on Choose Your Therapist and go live on our platform." />
      </Head>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <style dangerouslySetInnerHTML={{ __html: `
        input:focus { border-color: ${G} !important; box-shadow: 0 0 0 3px rgba(15,61,36,0.08) !important; }
        .section-card { background: #fff; border: 1px solid #dbe3df; border-radius: 4px; padding: 24px 26px; margin-bottom: 20px; }
        @media (max-width: 767px) { .section-card { padding: 18px 16px; } }
        .af-doc { border: 1px solid #dbe3df; border-radius: 4px; background: #fff; overflow: hidden; }
        .af-titlebar { background: ${G}; padding: 18px 24px; border-radius: 4px 4px 0 0; border-bottom: 3px solid ${GOLD}; }
        @keyframes tpspin { to { transform: rotate(360deg); } }
      ` }} />

      <MyNavbar />

      <div className="container" style={{ padding: isMobile ? "28px 16px" : "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <div className="af-doc" style={{ marginBottom: 24 }}>
            <div className="af-titlebar">
              <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.65)", margin: "0 0 4px" }}>Choose Your Therapist</p>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", margin: 0, color: "#fff" }}>Therapist Subscription</h1>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", margin: "6px 0 0" }}>Activate your plan to go live on our platform</p>
            </div>
          </div>

          {/* ── Email gate ── */}
          <div className="section-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#eef5f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="feather-mail" style={{ fontSize: 14, color: G }}></i>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#132a1c" }}>Verify Your Approval Status</span>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
              Enter the email address you registered with. Payment is only available once your application has been approved by our team.
            </p>
            <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
              <input
                type="email" value={email} placeholder="you@example.com"
                onChange={e => { setEmail(e.target.value); setCheckErr(""); }}
                onKeyDown={e => e.key === "Enter" && checkStatus()}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" onClick={checkStatus} disabled={checking} style={{
                padding: "11px 24px", borderRadius: 3, border: "none", background: GRAD,
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: checking ? "not-allowed" : "pointer",
                opacity: checking ? 0.7 : 1, whiteSpace: "nowrap",
              }}>
                {checking ? "Checking…" : "Check & Continue"}
              </button>
            </div>
            {checkErr && (
              <p style={{ fontSize: 13, color: "#dc2626", marginTop: 10, fontWeight: 600 }}>{checkErr}</p>
            )}
          </div>

          {/* ── Not approved yet ── */}
          {profile && profile.stage !== "approved" && (
            <div className="section-card" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <i className="feather-clock" style={{ fontSize: 18, color: "#b45309", marginTop: 2 }}></i>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#78350f", margin: "0 0 4px" }}>
                    {profile.stage === "email_pending" ? "Email verification pending" : "Application under review"}
                  </p>
                  <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
                    {profile.stage === "email_pending"
                      ? "Please verify your email with the OTP sent during registration before payment can be activated."
                      : "Your application is still with our team for review. Once approved, come back here to activate your subscription."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Approved: profile summary + plans ── */}
          {profile && profile.stage === "approved" && !paySuccess && (
            <>
              <SectionCard icon="feather-user" title="Your Registration Details">
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px 24px" }}>
                  {[
                    ["Full Name", profile.name],
                    ["Email", profile.email],
                    ["Phone", profile.phone],
                    ["Profile Type", profile.profileType],
                    ["Service Mode", profile.mode === "1" ? "Virtual" : profile.mode === "2" ? "In-Person" : profile.mode === "3" ? "Both" : "—"],
                    ["Services", profile.services],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b", margin: "3px 0 0" }}>{val || "—"}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {profile.subscription && (
                <div className="section-card" style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <i className="feather-check-circle" style={{ fontSize: 18, color: "#166534" }}></i>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#166534", margin: "0 0 2px" }}>You already have an active subscription</p>
                      <p style={{ fontSize: 12.5, color: "#3f6212", margin: 0 }}>
                        Valid until <strong>{fmtDate(profile.subscription.expiresAt)}</strong>. You can renew or upgrade below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Plans ── */}
              <SectionCard icon="feather-award" title="Choose a Subscription Plan">
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14 }}>
                  {PLANS.map(plan => {
                    const on = selectedPlan === plan.id;
                    return (
                      <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} style={{
                        border: `2px solid ${on ? G : "#e2e8f0"}`, borderRadius: 6, padding: "18px 16px",
                        cursor: "pointer", background: on ? "#f0fdf4" : "#fff", position: "relative",
                        transition: "all 0.15s",
                      }}>
                        {plan.tag && (
                          <span style={{
                            position: "absolute", top: -11, left: 16, background: GOLD, color: G,
                            fontSize: 10, fontWeight: 800, padding: "2px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.4,
                          }}>{plan.tag}</span>
                        )}
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", margin: "6px 0 4px" }}>{plan.label}</p>
                        <p style={{ fontSize: 26, fontWeight: 900, color: G, margin: "0 0 14px" }}>{fmtINR(plan.amount)}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                          {plan.benefits.map((b, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                              <i className="feather-check" style={{ fontSize: 11, color: G, marginTop: 3, flexShrink: 0 }}></i>
                              <span style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{b}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{
                          width: "100%", textAlign: "center", padding: "8px", borderRadius: 3, fontSize: 12.5, fontWeight: 800,
                          border: `1.5px solid ${on ? G : "#cbd5c9"}`, color: on ? "#fff" : "#64748b", background: on ? G : "transparent",
                        }}>
                          {on ? "Selected" : "Select Plan"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {payErr && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                  <i className="feather-alert-circle" style={{ marginRight: 6 }}></i>{payErr}
                </div>
              )}

              <button
                type="button"
                disabled={!selectedPlan || paying}
                onClick={() => openRazorpay(PLANS.find(p => p.id === selectedPlan))}
                style={{
                  width: "100%", padding: "16px", borderRadius: 4, border: "none",
                  background: selectedPlan ? GRAD : "#e2e8f0", color: selectedPlan ? "#fff" : "#94a3b8",
                  fontSize: 15, fontWeight: 800, cursor: selectedPlan && !paying ? "pointer" : "not-allowed",
                  marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                {paying ? (
                  <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "tpspin 0.8s linear infinite" }}></span> Processing…</>
                ) : (
                  <><i className="feather-credit-card"></i> Pay Now{selectedPlan ? ` — ${fmtINR(PLANS.find(p => p.id === selectedPlan).amount)}` : ""}</>
                )}
              </button>
            </>
          )}

          {/* ── Payment success ── */}
          {paySuccess && (
            <div className="section-card" style={{ textAlign: "center", padding: "36px 24px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#1b5e20,#2ecc71)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <i className="feather-check" style={{ fontSize: 28, color: "#fff" }}></i>
              </div>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Subscription Activated</h2>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 4 }}>
                Your <strong>{PLANS.find(p => p.id === paySuccess.plan)?.label}</strong> plan is now active.
              </p>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>
                Valid until <strong>{fmtDate(paySuccess.expiresAt)}</strong>. Your profile is now live on the platform.
              </p>
              <Link href="/login" style={{
                display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
                padding: "13px 28px", borderRadius: 8, background: GRAD, color: "#fff", fontWeight: 700, fontSize: 14,
              }}>
                <i className="feather-log-in"></i> Go to Login
              </Link>
            </div>
          )}

          {/* ── Benefits ── */}
          <SectionCard icon="feather-star" title="Why List on Choose Your Therapist">
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              {GENERAL_BENEFITS.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={b.icon} style={{ fontSize: 14, color: G }}></i>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 2px" }}>{b.title}</p>
                    <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── How your profile will grow ── */}
          <SectionCard icon="feather-trending-up" title="How Your Profile Will Grow">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {GROWTH_POINTS.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: G, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{p}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Instructions ── */}
          <SectionCard icon="feather-list" title="How It Works">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {INSTRUCTIONS.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 5, background: "#eef5f1", color: G, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{p}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Terms ── */}
          <SectionCard icon="feather-file-text" title="Terms & Conditions">
            <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 8 }}>
              {TERMS.map((t, i) => (
                <li key={i} style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>{t}</li>
              ))}
            </ul>
          </SectionCard>

        </div>
      </div>

      <NewsLetter />
      <Footer />
    </>
  );
}

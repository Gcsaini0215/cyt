import React from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import CycleCarePromo, { CYCLE_URL, useShareCycle } from "../components/home/cycle-care-promo";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

/* Public page for Cycle & Mood Care — what the home section's Share button links to (share card:
   /api/og/cycle-care.jpg). The tracker itself lives in the client portal (/client/cycle). */

const TITLE = "Period & Mood Tracker with Therapy Support for Women | Choose Your Therapist";
const DESCRIPTION = "Track your period and mood privately, spot PMS early, and get support from women therapists for PMS, PMDD, period pain and PCOS. Free on Choose Your Therapist.";
const OG_IMAGE = "https://www.chooseyourtherapist.in/api/og/cycle-care.jpg";

const STEPS = [
  ["Tell us it's for you", "One quick question, then agree to how your data is kept — private to you."],
  ["Set up in a minute", "When your last period started and how long your cycle usually is. Not sure? Keep 28."],
  ["Log a few taps a day", "Flow, mood and how your body feels. See your phase and next period."],
  ["Get support when it's heavy", "If your mood dips before periods, talk to a woman therapist who understands."],
];
const FAQS = [
  { q: "Is Cycle & Mood Care free?", a: "Yes — it's free at launch for everyone with a Choose Your Therapist account. Therapy sessions are booked and paid separately, only if you want one." },
  { q: "Who can see my cycle data?", a: "Only you. Therapists and Choose Your Therapist staff cannot see your cycle, symptoms or notes. You can turn it off and delete everything in one tap." },
  { q: "Can it help with PMS or PMDD?", a: "It helps you see the pattern — for example, low mood or irritability in the days before your period. If the pattern is strong, the tracker suggests talking to a therapist, which is an effective treatment for PMS and PMDD-related mood changes." },
  { q: "Is it medical advice or birth control?", a: "No. Dates are estimates from what you log. For severe pain, very heavy bleeding or missed periods, please see a doctor." },
];
const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function CycleMoodCarePage() {
  const { share, msg } = useShareCycle();
  return (
    <div id="__next" style={{ overflowX: "clip" }}>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={CYCLE_URL} />
        <meta key="og:title" property="og:title" content="Cycle & Mood Care — your cycle, your mood, your care" />
        <meta key="og:description" property="og:description" content="Track your period and mood privately — and get support for PMS, PMDD, period pain and PCOS. Free." />
        <meta key="og:url" property="og:url" content={CYCLE_URL} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:image" property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Cycle & Mood Care — a period calendar with hearts and a cycle ring" />
        <meta key="og:site_name" property="og:site_name" content="Choose Your Therapist" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cycle & Mood Care — Choose Your Therapist" />
        <meta name="twitter:description" content="Track your period and mood privately — and get support for PMS, PMDD, period pain and PCOS." />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      <MyNavbar />
      <main>
        <CycleCarePromo as="section" heading="h1" />
        <section className="cmp-sec">
          <style dangerouslySetInnerHTML={{ __html: CMP_CSS }} />
          <div className="container">
            <h2>How it works</h2>
            <ol className="cmp-steps">
              {STEPS.map(([t, s], i) => <li key={t}><i>{i + 1}</i><b>{t}</b><span>{s}</span></li>)}
            </ol>
            <h2>Questions</h2>
            <div className="cmp-faq">
              {FAQS.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
            <div className="cmp-end">
              <b>Know someone who&apos;d find this useful?</b>
              <div>
                <button type="button" className="ccp-btn line" onClick={share}><IosShareRoundedIcon /> Share</button>
                <Link href="/client/cycle" className="ccp-btn">Start tracking — free <ArrowForwardRoundedIcon /></Link>
              </div>
              {msg && <p className="ccp-msg">{msg}</p>}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const CMP_CSS = `
.cmp-sec { padding: clamp(40px, 6vw, 72px) 0; background: #fff; }
.cmp-sec h2 { font-size: clamp(24px, 3vw, 32px); font-weight: 800; color: #2a0b17; margin: 0 0 18px; letter-spacing: -.02em; }
.cmp-steps { list-style: none; margin: 0 0 44px; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.cmp-steps li { display: grid; gap: 6px; align-content: start; padding: 18px; border-radius: 20px; background: #fff8fa; border: 1px solid #f7dbe3; }
.cmp-steps i { width: 36px; height: 36px; border-radius: 12px; display: grid; place-items: center; font-style: normal; font-weight: 800; color: #fff; background: linear-gradient(160deg, #f0668a, #c22d58); }
.cmp-steps b { font-size: 16px; color: #2a0b17; } .cmp-steps span { font-size: 14px; color: #6b5a61; line-height: 1.5; }
.cmp-faq { display: grid; gap: 10px; max-width: 860px; margin-bottom: 40px; }
.cmp-faq details { border: 1px solid #f0e2e7; border-radius: 16px; padding: 14px 18px; background: #fff; }
.cmp-faq summary { cursor: pointer; font-size: 16px; font-weight: 800; color: #2a0b17; }
.cmp-faq p { margin: 10px 0 0; font-size: 14.5px; line-height: 1.6; color: #4b3a41; }
.cmp-end { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; padding: 22px; border-radius: 22px; background: linear-gradient(135deg, #fff0f4, #fff8f1); border: 1px solid #f7dbe3; }
.cmp-end b { font-size: 18px; color: #2a0b17; }
.cmp-end > div { display: flex; flex-wrap: wrap; gap: 10px; }
@media (max-width: 991px) { .cmp-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 575px) { .cmp-steps { grid-template-columns: minmax(0, 1fr); } .cmp-end > div, .cmp-end .ccp-btn { width: 100%; } }
`;

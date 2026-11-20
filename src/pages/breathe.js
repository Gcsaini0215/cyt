import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { BreatheApp, BY } from "../components/breathe/breathe-app";

/* /breathe — public guided breathing (no sign-up). Box breathing and 4-7-8 are free for everyone; the other
   techniques live in the client's Calm corner (/client/calm: 7 days free, then ₹100 a month). */
const FREE = ["box", "478"];

export default function BreathePage() {
  const router = useRouter();
  const key = typeof router.query.p === "string" ? router.query.p : "";
  const t = BY[key] || null;
  const locked = (k) => !FREE.includes(k);
  const toCalm = (k) => router.push(`/client/calm?p=${k}`);
  const lockedView = t && (
    <div className="br-panel" style={{ marginTop: "8vh", textAlign: "center" }}>
      <span style={{ fontSize: 40 }} aria-hidden="true">🌿</span>
      <h1 style={{ fontSize: 26 }}>{t.name} is in your Calm corner</h1>
      <p>All nine breathing exercises, nature scenes and sounds, grounding and calming sounds — <b>free for 7 days</b>, then ₹100 a month.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
        <button type="button" className="br-main" onClick={() => toCalm(t.key)}>Open the Calm corner</button>
        <Link href="/breathe?p=box" className="br-ghost" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Try box breathing free</Link>
      </div>
    </div>
  );
  return (
    <>
      <Head>
        <title>{t ? `${t.name} — guided breathing | Choose Your Therapist` : "Guided breathing exercises | Choose Your Therapist"}</title>
        <meta name="description" content="Free guided breathing — box breathing and 4-7-8 with calming nature scenes. Seven more techniques, including Anulom Vilom and Bhramari, in the Calm corner." />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/breathe" />
        <meta name="theme-color" content={t?.night && !locked(t.key) ? "#2c2f63" : "#f4efe6"} />
      </Head>
      <BreatheApp
        basePath="/breathe" home="/" locked={locked} onLocked={toCalm} lockedView={lockedView}
        intro="Box breathing and 4-7-8 are free — pick one and follow the circle. 🔒 ones open in your Calm corner (7 days free)."
      />
    </>
  );
}

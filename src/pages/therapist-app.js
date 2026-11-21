import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { getDecodedToken } from "../utils/jwt";

/* Launch page of the "CYT Therapist" app (manifest-therapist.json start_url, also the Play Store app's
   start page) — 2026-11-21. Signed-in therapist → dashboard; signed out → therapist login, back to the
   dashboard after; a signed-in client → their own My Space. Shows the app splash for the split second. */
export default function TherapistAppLaunch() {
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;
    const d = getDecodedToken();
    const live = d && (!d.exp || d.exp * 1000 > Date.now());
    if (live && d.role === 1) router.replace("/therapist-dashboard");
    else if (live && d.role === 0) router.replace("/my-dashboard");
    else router.replace("/login?as=therapist&next=%2Ftherapist-dashboard");
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ta">
      <Head>
        <title>CYT Therapist</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content="#14532d" />
      </Head>
      <style>{CSS}</style>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/cyt-therapist-192.png" alt="" width="96" height="96" />
      <h1>CYT Therapist</h1>
      <p>Opening your dashboard…</p>
      <span className="ta-dot" aria-hidden="true"><i /><i /><i /></span>
    </div>
  );
}

const CSS = `
.ta { position: fixed; inset: 0; z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  background: linear-gradient(180deg, #22824f, #14532d); color: #fff; font-family: inherit; text-align: center; padding: 24px; }
.ta img { border-radius: 24px; box-shadow: 0 18px 40px -18px rgba(0,0,0,.6); margin-bottom: 10px; }
.ta h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -.01em; color: #fff; }
.ta p { margin: 0; font-size: 14.5px; color: rgba(255,255,255,.8); }
.ta-dot { display: flex; gap: 6px; margin-top: 14px; }
.ta-dot i { width: 8px; height: 8px; border-radius: 50%; background: #ecc66a; animation: taB 1s infinite ease-in-out; }
.ta-dot i:nth-child(2) { animation-delay: .15s; } .ta-dot i:nth-child(3) { animation-delay: .3s; }
@keyframes taB { 0%, 80%, 100% { opacity: .3; transform: scale(.8); } 40% { opacity: 1; transform: scale(1); } }
`;

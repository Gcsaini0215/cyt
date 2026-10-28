import React from "react";
import Head from "next/head";
import Link from "next/link";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import { apiUrl } from "../../utils/url";
import { profilePath } from "../../utils/therapist-slug";

/* Public page a certificate's QR / code opens: is this CYT achievement real, who earned it, and when. */
export async function getServerSideProps({ params }) {
  const code = String(params.code || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
  try {
    const r = await fetch(`${apiUrl}/achievements/verify/${encodeURIComponent(code)}`);
    const j = await r.json();
    if (r.ok && j?.status) { const { qr, ...data } = j.data; return { props: { code, data } }; }
  } catch (e) { /* treated as not found */ }
  return { props: { code, data: null } };
}

const day = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

export default function VerifyAchievement({ code, data }) {
  const SITE = "https://www.chooseyourtherapist.in";
  const title = data ? `${data.title} — ${data.therapist.name} | Choose Your Therapist` : "Certificate not found | Choose Your Therapist";
  const img = data ? `${SITE}/api/certificate/${data.code}.png` : null;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex, follow" />
        {data && <meta name="description" content={`${data.therapist.name} earned the ${data.title} on Choose Your Therapist ${data.line}.`} />}
        {img && <meta key="og:image" property="og:image" content={img} />}
        {data && <meta property="og:title" content={`${data.therapist.name} — ${data.title}`} />}
      </Head>
      <MyNavbar />
      <main className="va">
        <style dangerouslySetInnerHTML={{ __html: VA_CSS }} />
        {data ? (
          <>
            <div className="va-ok"><span>✓</span><div><b>Verified certificate</b><small>Issued by Choose Your Therapist · code {data.code}</small></div></div>
            <h1>{data.title}</h1>
            <p className="va-who"><b>{data.therapist.name}</b>{data.therapist.profile_type ? ` · ${data.therapist.profile_type}` : ""}</p>
            <p className="va-line">Awarded on {day(data.unlockedAt)} {data.line}.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`${data.title} certificate for ${data.therapist.name}`} />
            <div className="va-acts">
              <Link href={profilePath(data.therapist)} className="va-btn">View {data.therapist.name.split(" ")[0]}&apos;s profile</Link>
              <Link href="/view-all-therapist" className="va-link">Find a verified psychologist →</Link>
            </div>
          </>
        ) : (
          <div className="va-no"><h1>Certificate not found</h1><p>No Choose Your Therapist certificate has the code <b>{code || "—"}</b>. Check the code on the certificate and try again.</p></div>
        )}
      </main>
      <Footer />
    </>
  );
}

const VA_CSS = `
.va { max-width: 980px; margin: 0 auto; padding: 32px 16px 48px; font-family: inherit; background: #fff; }
.va-ok { display: inline-flex; align-items: center; gap: 12px; padding: 10px 16px 10px 10px; border-radius: 14px; background: #ecfdf3; border: 1px solid #bbf7d0; }
.va-ok span { width: 34px; height: 34px; border-radius: 50%; background: #16a34a; color: #fff; display: grid; place-items: center; font-weight: 900; }
.va-ok b { display: block; color: #14532d; } .va-ok small { color: #475569; }
.va h1 { margin: 18px 0 6px; font-size: 30px; font-weight: 800; color: #0f2a1d; }
.va-who { margin: 0; font-size: 17px; color: #334155; } .va-line { margin: 4px 0 16px; color: #64748b; }
.va img { width: 100%; height: auto; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px -30px rgba(0,0,0,.4); }
.va-acts { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 16px; }
.va-btn { padding: 11px 18px; border-radius: 11px; background: #166534; color: #fff !important; font-weight: 800; text-decoration: none !important; }
.va-link { color: #166534 !important; font-weight: 700; }
.va-no { padding: 40px 0; } .va-no p { color: #475569; }
`;

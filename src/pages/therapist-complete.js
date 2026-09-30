import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import { apiUrl } from "../utils/url";
import { fetchData, postFormData } from "../utils/actions";

// Landing page for the "please complete your profile" email sent from admin. Shows only the
// missing items; fees and availability are set in the therapist dashboard after login.
const MAX_MB = 5;
const ACCEPT = {
  photo: ".jpg,.jpeg,.png",
  resume: ".pdf,.doc,.docx",
  qualification_certificate: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  id_card: ".jpg,.jpeg,.png,.pdf",
};
const HINT = {
  photo: "A clear, recent, professional headshot (JPG or PNG).",
  bio: "Who you help, the issues you work with, your approach, and what a first session looks like.",
  qualification: "e.g. M.A. Clinical Psychology, RCI registered",
  experience: "Years of practice, e.g. 5",
  languages: "e.g. Hindi, English, Punjabi",
  location: "e.g. Noida, Uttar Pradesh",
  specialisation: "e.g. Anxiety, relationships, stress, adolescent issues",
};
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;

export default function TherapistComplete() {
  const router = useRouter();
  const token = typeof router.query.token === "string" ? router.query.token : "";
  const [req, setReq] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | invalid | sending | done
  const [vals, setVals] = useState({});
  const [files, setFiles] = useState({});
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    if (!token) { setState("invalid"); return; }
    fetchData(`${apiUrl}/therapist-complete/${token}`)
      .then((r) => { if (r?.status) { setReq(r.data); setVals(r.data.current || {}); setState("ready"); } else setState("invalid"); })
      .catch(() => setState("invalid"));
  }, [router.isReady, token]);

  const pick = (key, f) => {
    setErr("");
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) { setErr(`That file is ${(f.size / 1048576).toFixed(1)}MB — please use one under ${MAX_MB}MB.`); return; }
    setFiles((p) => ({ ...p, [key]: f }));
  };

  const fillable = req ? req.items.filter((i) => i.kind !== "dashboard") : [];
  const dashboardItems = req ? req.items.filter((i) => i.kind === "dashboard") : [];

  const submit = async () => {
    for (const i of fillable) {
      if (i.kind === "file" && !files[i.key]) return setErr(`Please choose your ${i.label.toLowerCase()}.`);
      if (i.kind === "text" && !String(vals[i.key] || "").trim()) return setErr(`Please fill in: ${i.label}.`);
      if (i.key === "bio") { const n = words(vals.bio); if (n < 50 || n > 250) return setErr(`About you should be 50–250 words (now ${n}).`); }
    }
    const data = new FormData();
    fillable.forEach((i) => (i.kind === "file" ? data.append(i.key, files[i.key]) : data.append(i.key, vals[i.key])));
    setState("sending");
    try {
      const r = await postFormData(`${apiUrl}/therapist-complete/${token}`, data);
      if (r?.status) setState("done");
      else { setErr(r?.message || "Saving failed. Please try again."); setState("ready"); }
    } catch (e) {
      setErr(e?.response?.data?.message || "Saving failed. Please try again.");
      setState("ready");
    }
  };

  return (
    <>
      <Head>
        <title>Complete your profile | Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <MyNavbar />
      <div style={{ background: "#fff" }}>
        <div className="container" style={{ padding: "40px 16px 64px", maxWidth: 680 }}>
          <style>{`
            .cp-card { border: 1px solid #dbe3df; border-radius: 16px; padding: 26px 24px; box-shadow: 0 10px 30px -14px rgba(15,61,36,.2); }
            .cp-card h1 { font-size: 22px; font-weight: 800; color: #0f3d24; margin: 0 0 6px; }
            .cp-sub { font-size: 14px; color: #64748b; margin: 0 0 18px; line-height: 1.6; }
            .cp-note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 10px 14px; font-size: 13.5px; color: #78350f; margin-bottom: 18px; }
            .cp-field { margin-bottom: 16px; }
            .cp-field label { display: block; font-size: 13.5px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
            .cp-hint { font-size: 12px; color: #64748b; margin: 0 0 6px; }
            .cp-in { width: 100%; box-sizing: border-box; border: 1.5px solid #cbd5c9; border-radius: 10px; padding: 11px 13px; font-size: 14.5px; font-family: inherit; outline: none; }
            .cp-in:focus { border-color: #166534; box-shadow: 0 0 0 3px rgba(22,101,52,.1); }
            .cp-count { font-size: 12px; margin-top: 4px; color: #64748b; } .cp-count.bad { color: #b45309; font-weight: 700; } .cp-count.ok { color: #166534; font-weight: 700; }
            .cp-doc { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border: 2px dashed #cbd5c9; border-radius: 12px; padding: 14px; }
            .cp-doc.has { border-style: solid; border-color: #86efac; background: #f0fdf4; }
            .cp-doc-name { flex: 1; min-width: 160px; font-size: 12.5px; color: #64748b; word-break: break-all; }
            .cp-pick { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 9px; background: #166534; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; margin: 0; text-decoration: none; }
            .cp-dash { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 14px; margin: 4px 0 16px; font-size: 13.5px; color: #1e3a8a; line-height: 1.6; }
            .cp-go { width: 100%; margin-top: 6px; padding: 14px; border: none; border-radius: 10px; background: linear-gradient(135deg,#1b5e20,#228756); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; }
            .cp-go:disabled { opacity: .7; cursor: wait; }
            .cp-err { color: #dc2626; font-size: 13px; font-weight: 600; margin: 6px 0 0; }
          `}</style>

          <div className="cp-card">
            {state === "loading" && <p className="cp-sub">Loading…</p>}

            {state === "invalid" && (
              <>
                <h1>This link has expired</h1>
                <p className="cp-sub">Profile links work for 14 days and only once. Please reply to our email or contact us and we&rsquo;ll send a new one.</p>
                <a href="https://wa.me/918077757951" target="_blank" rel="noreferrer" className="cp-pick">WhatsApp us</a>
              </>
            )}

            {state === "done" && (
              <>
                <h1>Thank you!</h1>
                <p className="cp-sub">Your profile was updated. Our team will check it and email you if anything else is needed.</p>
                {dashboardItems.length > 0 && (
                  <div className="cp-dash">One more step: log in and set your <b>{dashboardItems.map((d) => d.label.replace(/ \(.*\)/, "").toLowerCase()).join(" and ")}</b> in your dashboard.</div>
                )}
                <Link href="/login" className="cp-pick">Go to login</Link>
              </>
            )}

            {(state === "ready" || state === "sending") && req && (
              <>
                <h1>Hi {req.name?.split(" ")[0] || "there"}, let&rsquo;s complete your profile</h1>
                <p className="cp-sub">
                  {req.live ? "Your profile is live — these details are missing. Complete profiles are shown higher and get more enquiries." : "Please add these details so we can review and publish your profile."}
                </p>
                {req.note && <div className="cp-note"><b>Note from our team:</b> {req.note}</div>}

                {fillable.map((i) => (
                  <div key={i.key} className="cp-field">
                    <label htmlFor={`cp-${i.key}`}>{i.label}</label>
                    {HINT[i.key] && <p className="cp-hint">{HINT[i.key]}</p>}
                    {i.kind === "file" ? (
                      <div className={`cp-doc ${files[i.key] ? "has" : ""}`}>
                        <span className="cp-doc-name">{files[i.key] ? `${files[i.key].name} · ready` : "No file chosen"}</span>
                        <label className="cp-pick">
                          <input id={`cp-${i.key}`} type="file" hidden accept={ACCEPT[i.key]} onChange={(e) => { pick(i.key, e.target.files?.[0]); e.target.value = ""; }} />
                          {files[i.key] ? "Change" : "Choose file"}
                        </label>
                      </div>
                    ) : i.key === "bio" ? (
                      <>
                        <textarea id="cp-bio" className="cp-in" rows={7} value={vals.bio || ""} onChange={(e) => setVals((v) => ({ ...v, bio: e.target.value }))} />
                        <div className={`cp-count ${words(vals.bio) < 50 || words(vals.bio) > 250 ? "bad" : "ok"}`}>{words(vals.bio)} / 50–250 words</div>
                      </>
                    ) : (
                      <input id={`cp-${i.key}`} className="cp-in" value={vals[i.key] || ""} onChange={(e) => setVals((v) => ({ ...v, [i.key]: e.target.value }))} />
                    )}
                  </div>
                ))}

                {dashboardItems.length > 0 && (
                  <div className="cp-dash">
                    <b>Also missing:</b> {dashboardItems.map((d) => d.label.replace(/ \(.*\)/, "")).join(", ")}. Set {dashboardItems.length > 1 ? "these" : "this"} after logging in to your therapist dashboard — clients can only book you once your fees and weekly availability are set.
                  </div>
                )}

                {err && <p className="cp-err" role="alert">{err}</p>}
                {fillable.length > 0 ? (
                  <button type="button" className="cp-go" onClick={submit} disabled={state === "sending"}>
                    {state === "sending" ? "Saving…" : "Save my profile"}
                  </button>
                ) : (
                  <Link href="/login" className="cp-pick" style={{ width: "100%", justifyContent: "center", padding: 14 }}>Log in to your dashboard</Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

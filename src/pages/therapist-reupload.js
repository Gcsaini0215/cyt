import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import { apiUrl } from "../utils/url";
import { fetchData, postFormData } from "../utils/actions";

// Landing page for the "please re-upload a document" email sent from admin review.
const MAX_MB = 5;
const ACCEPT = {
  resume: ".pdf,.doc,.docx",
  qualification_certificate: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  id_card: ".jpg,.jpeg,.png,.pdf",
};

export default function TherapistReupload() {
  const router = useRouter();
  const token = typeof router.query.token === "string" ? router.query.token : "";
  const [req, setReq] = useState(null);        // { name, docs:[{key,label}], note }
  const [state, setState] = useState("loading"); // loading | ready | invalid | sending | done
  const [files, setFiles] = useState({});
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    if (!token) { setState("invalid"); return; }
    fetchData(`${apiUrl}/therapist-reupload/${token}`)
      .then((r) => { if (r?.status) { setReq(r.data); setState("ready"); } else setState("invalid"); })
      .catch(() => setState("invalid"));
  }, [router.isReady, token]);

  const pick = (key, f) => {
    setErr("");
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) { setErr(`That file is ${(f.size / 1048576).toFixed(1)}MB — please use one under ${MAX_MB}MB.`); return; }
    setFiles((p) => ({ ...p, [key]: f }));
  };

  const submit = async () => {
    const missing = req.docs.find((d) => !files[d.key]);
    if (missing) { setErr(`Please choose your ${missing.label.toLowerCase()}.`); return; }
    const data = new FormData();
    req.docs.forEach((d) => data.append(d.key, files[d.key]));
    setState("sending");
    try {
      const r = await postFormData(`${apiUrl}/therapist-reupload/${token}`, data);
      if (r?.status) setState("done");
      else { setErr(r?.message || "Upload failed. Please try again."); setState("ready"); }
    } catch (e) {
      setErr(e?.response?.data?.message || "Upload failed. Please try again.");
      setState("ready");
    }
  };

  return (
    <>
      <Head>
        <title>Re-upload documents | Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <MyNavbar />
      <div style={{ background: "#fff" }}>
        <div className="container" style={{ padding: "48px 16px 64px", maxWidth: 620 }}>
          <style>{`
            .ru-card { border: 1px solid #dbe3df; border-radius: 16px; padding: 26px 24px; box-shadow: 0 10px 30px -14px rgba(15,61,36,.2); }
            .ru-card h1 { font-size: 22px; font-weight: 800; color: #0f3d24; margin: 0 0 6px; }
            .ru-sub { font-size: 14px; color: #64748b; margin: 0 0 18px; line-height: 1.6; }
            .ru-note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 10px 14px; font-size: 13.5px; color: #78350f; margin-bottom: 18px; }
            .ru-doc { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border: 2px dashed #cbd5c9; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
            .ru-doc.has { border-style: solid; border-color: #86efac; background: #f0fdf4; }
            .ru-doc-name { flex: 1; min-width: 160px; }
            .ru-doc-name b { display: block; font-size: 14px; color: #1e293b; }
            .ru-doc-name span { font-size: 12px; color: #64748b; word-break: break-all; }
            .ru-pick { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 9px; background: #166534; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; margin: 0; }
            .ru-go { width: 100%; margin-top: 8px; padding: 14px; border: none; border-radius: 10px; background: linear-gradient(135deg,#1b5e20,#228756); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; }
            .ru-go:disabled { opacity: .7; cursor: wait; }
            .ru-err { color: #dc2626; font-size: 13px; font-weight: 600; margin: 6px 0 0; }
          `}</style>

          <div className="ru-card">
            {state === "loading" && <p className="ru-sub">Loading…</p>}

            {state === "invalid" && (
              <>
                <h1>This link has expired</h1>
                <p className="ru-sub">Re-upload links work for 7 days and only once. Please reply to our email or contact us and we&rsquo;ll send a new one.</p>
                <a href="https://wa.me/918077757951" target="_blank" rel="noreferrer" className="ru-pick" style={{ textDecoration: "none" }}>WhatsApp us</a>
              </>
            )}

            {state === "done" && (
              <>
                <h1>Thank you!</h1>
                <p className="ru-sub">Your documents were uploaded. Our team will review them and email you soon.</p>
                <Link href="/" className="ru-pick" style={{ textDecoration: "none" }}>Go to home</Link>
              </>
            )}

            {(state === "ready" || state === "sending") && req && (
              <>
                <h1>Hi {req.name?.split(" ")[0] || "there"}, please re-upload</h1>
                <p className="ru-sub">Upload a clear, valid copy of the document{req.docs.length > 1 ? "s" : ""} below (PDF, JPG or PNG, up to {MAX_MB}MB each).</p>
                {req.note && <div className="ru-note"><b>Note from our team:</b> {req.note}</div>}
                {req.docs.map((d) => (
                  <div key={d.key} className={`ru-doc ${files[d.key] ? "has" : ""}`}>
                    <div className="ru-doc-name">
                      <b>{d.label}</b>
                      <span>{files[d.key] ? `${files[d.key].name} · ready` : "No file chosen"}</span>
                    </div>
                    <label className="ru-pick">
                      <input type="file" hidden accept={ACCEPT[d.key]} onChange={(e) => { pick(d.key, e.target.files?.[0]); e.target.value = ""; }} />
                      {files[d.key] ? "Change" : "Choose file"}
                    </label>
                  </div>
                ))}
                {err && <p className="ru-err" role="alert">{err}</p>}
                <button type="button" className="ru-go" onClick={submit} disabled={state === "sending"}>
                  {state === "sending" ? "Uploading…" : "Submit documents"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

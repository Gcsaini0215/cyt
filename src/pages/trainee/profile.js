import React, { useEffect, useState } from "react";
import TraineeLayout, { useTraineePortal } from "../../components/trainee/trainee-layout";
import { tApi, fileUrl } from "../../utils/trainee-api";
import { setTraineeToken } from "../../utils/trainee-auth";

/* Edit profile: photo, contact, study details and a short bio. Email is the sign-in, so it can't change here. */
const EMPTY = { firstName: "", lastName: "", phone: "", gender: "", dob: "", city: "", college: "", course: "", year: "", bio: "", linkedin: "" };
const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "5th year", "Graduated", "Post-graduate", "Working professional"];

function Profile() {
  const { profile, setProfile, me } = useTraineePortal();
  const [f, setF] = useState(null);
  const [photo, setPhoto] = useState(null); // new File
  const [preview, setPreview] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    tApi("/trainee-portal/profile").then((r) => {
      if (r.status) { setF({ ...EMPTY, ...r.data }); setProfile(r.data); } else setMsg({ bad: true, text: r.message || "Couldn't load your profile" });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  if (!f) return msg ? <div className="tl-err">{msg.text}</div> : <div className="tp-load">Loading your profile…</div>;
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpe?g|png)$/.test(file.type)) { setMsg({ bad: true, text: "Please choose a JPG or PNG photo." }); return; }
    if (file.size > 5 * 1024 * 1024) { setMsg({ bad: true, text: "The photo should be under 5 MB." }); return; }
    setMsg(null); setPhoto(file); setRemovePhoto(false);
    setPreview(URL.createObjectURL(file));
  };
  const shownPhoto = preview || (!removePhoto && f.photo ? fileUrl(f.photo) : "");
  const initials = [f.firstName, f.lastName].filter(Boolean).map((w) => w[0]).join("").toUpperCase() || "T";

  const save = async (e) => {
    e.preventDefault();
    if (f.firstName.trim().length < 2) { setMsg({ bad: true, text: "Please enter your first name." }); return; }
    setBusy(true); setMsg(null);
    const fd = new FormData();
    Object.keys(EMPTY).forEach((k) => fd.append(k, f[k] || ""));
    if (photo) fd.append("photo", photo);
    if (removePhoto) fd.append("removePhoto", "1");
    const r = await tApi("/trainee-portal/profile", { method: "PUT", form: fd });
    setBusy(false);
    if (!r.status) { setMsg({ bad: true, text: r.message || "Couldn't save" }); return; }
    if (r.token) setTraineeToken(r.token);
    setF({ ...EMPTY, ...r.data }); setProfile(r.data);
    setPhoto(null); setPreview(""); setRemovePhoto(false);
    setMsg({ text: "Profile saved" });
  };

  return (
    <form onSubmit={save} noValidate>
      <div className="tp-h">
        <div>
          <h1>Edit profile</h1>
          <p>Keep your details up to date — your supervisor sees them.</p>
        </div>
      </div>
      <div className="pf-grid">
        <aside className="tp-card pf-side">
          <div className="pf-photo">
            {shownPhoto
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={shownPhoto} alt="Your profile" />
              : <span>{initials}</span>}
          </div>
          <b className="pf-name">{[f.firstName, f.lastName].filter(Boolean).join(" ") || "Your name"}</b>
          <span className="pf-mail">{f.email || me?.email}</span>
          <label className="tl-btn ghost sm pf-up">
            <i className="feather-camera" aria-hidden="true" /> {shownPhoto ? "Change photo" : "Upload photo"}
            <input type="file" accept="image/png,image/jpeg" onChange={pickPhoto} hidden />
          </label>
          {shownPhoto && <button type="button" className="pf-rm" onClick={() => { setPhoto(null); setPreview(""); setRemovePhoto(true); }}>Remove photo</button>}
          <small className="pf-hint">JPG or PNG, up to 5 MB. A clear face photo works best.</small>
        </aside>

        <div className="pf-main">
          <section className="tp-card">
            <h3>Personal details</h3>
            <div className="pf-row">
              <Field id="pf-first" label="First name *"><input id="pf-first" value={f.firstName} onChange={set("firstName")} maxLength={60} autoComplete="given-name" /></Field>
              <Field id="pf-last" label="Last name"><input id="pf-last" value={f.lastName} onChange={set("lastName")} maxLength={60} autoComplete="family-name" /></Field>
            </div>
            <div className="pf-row">
              <Field id="pf-mail" label="Email" hint="Used to sign in — contact us to change it"><div className="pf-ro" id="pf-mail"><i className="feather-lock" aria-hidden="true" /> {f.email}</div></Field>
              <Field id="pf-phone" label="Mobile number"><input id="pf-phone" type="tel" inputMode="tel" value={f.phone} onChange={set("phone")} maxLength={16} autoComplete="tel" /></Field>
            </div>
            <div className="pf-row three">
              <Field id="pf-gender" label="Gender">
                <select id="pf-gender" value={f.gender} onChange={set("gender")}>
                  <option value="">Select</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
                </select>
              </Field>
              <Field id="pf-dob" label="Date of birth"><input id="pf-dob" type="date" value={f.dob} onChange={set("dob")} /></Field>
              <Field id="pf-city" label="City"><input id="pf-city" value={f.city} onChange={set("city")} maxLength={60} autoComplete="address-level2" /></Field>
            </div>
          </section>

          <section className="tp-card">
            <h3>Study details</h3>
            <div className="pf-row">
              <Field id="pf-college" label="College / University"><input id="pf-college" value={f.college} onChange={set("college")} maxLength={120} /></Field>
              <Field id="pf-course" label="Course"><input id="pf-course" value={f.course} onChange={set("course")} maxLength={120} placeholder="e.g. M.A. Clinical Psychology" /></Field>
            </div>
            <div className="pf-row">
              <Field id="pf-year" label="Year">
                <select id="pf-year" value={f.year} onChange={set("year")}>
                  <option value="">Select</option>
                  {[...new Set([...YEARS, ...(f.year && !YEARS.includes(f.year) ? [f.year] : [])])].map((y) => <option key={y}>{y}</option>)}
                </select>
              </Field>
              <Field id="pf-in" label="LinkedIn"><input id="pf-in" type="url" value={f.linkedin} onChange={set("linkedin")} maxLength={120} placeholder="https://linkedin.com/in/…" /></Field>
            </div>
            <Field id="pf-bio" label="About you" hint={`${(f.bio || "").length}/600`}>
              <textarea id="pf-bio" rows={4} value={f.bio} onChange={set("bio")} maxLength={600} placeholder="Your interests in psychology, what you hope to learn…" />
            </Field>
          </section>

          <div className="pf-bar">
            {msg && <span className={msg.bad ? "pf-bad" : "pf-ok"} role="status">{msg.bad ? "" : "✓ "}{msg.text}</span>}
            <button type="submit" className="tl-btn" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </form>
  );
}

function Field({ id, label, hint, children }) {
  return (
    <div className="pf-f">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

const CSS = `
.pf-grid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 16px; align-items: start; }
.pf-side { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; position: sticky; top: 84px; }
.pf-photo { width: 120px; height: 120px; border-radius: 28px; overflow: hidden; background: linear-gradient(135deg, #14532d, #1e7a4c); display: grid; place-items: center; margin-bottom: 10px; box-shadow: 0 10px 24px rgba(20,83,45,.18); }
.pf-photo img { width: 100%; height: 100%; object-fit: cover; }
.pf-photo span { font-size: 38px; font-weight: 800; color: #ecc77d; }
.pf-name { font-size: 17px; font-weight: 800; color: #0f172a; }
.pf-mail { font-size: 13px; color: #64748b; overflow-wrap: anywhere; }
.pf-up { margin-top: 12px; cursor: pointer; }
.pf-rm { border: none; background: none; font: inherit; font-size: 12.5px; font-weight: 700; color: #dc2626; cursor: pointer; margin-top: 4px; }
.pf-hint { font-size: 12px; color: #94a3b8; margin-top: 8px; line-height: 1.5; }
.pf-main { display: grid; gap: 16px; }
.pf-main h3 { margin: 0 0 14px; font-size: 16px; font-weight: 800; color: #0f172a; }
.pf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.pf-row.three { grid-template-columns: 1fr 1fr 1fr; }
.pf-f { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; min-width: 0; }
.pf-f label { font-size: 13px; font-weight: 800; color: #1e293b; }
.pf-f small { font-size: 12px; color: #94a3b8; }
.pf-f input, .pf-f select, .pf-f textarea { width: 100%; box-sizing: border-box; height: 44px; border: 1.5px solid #dbe5df; border-radius: 12px; padding: 0 12px; font: inherit; font-size: 14.5px; color: #0f172a; background: #fff; outline: none; }
.pf-f textarea { height: auto; padding: 10px 12px; resize: vertical; line-height: 1.55; }
.pf-f input:focus, .pf-f select:focus, .pf-f textarea:focus { border-color: #15803d; box-shadow: 0 0 0 3px rgba(21,128,61,.12); }
.pf-ro { height: 44px; box-sizing: border-box; display: flex; align-items: center; gap: 8px; border: 1.5px solid #e6ece8; border-radius: 12px; padding: 0 12px; background: #f6f8f7; color: #475569; font-size: 14.5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.pf-ro i { color: #94a3b8; font-size: 13px; }
.pf-bar { position: sticky; bottom: 0; display: flex; align-items: center; justify-content: flex-end; gap: 14px; padding: 12px 0; background: linear-gradient(180deg, rgba(243,246,244,0), #f3f6f4 40%); }
.pf-bar .tl-btn { height: 46px; padding: 0 26px; }
.pf-ok { font-size: 13.5px; font-weight: 700; color: #166534; }
.pf-bad { font-size: 13.5px; font-weight: 700; color: #b91c1c; }
@media (max-width: 900px) { .pf-grid { grid-template-columns: 1fr; } .pf-side { position: static; } }
@media (max-width: 640px) { .pf-row, .pf-row.three { grid-template-columns: 1fr; gap: 0; } .pf-bar .tl-btn { flex: 1; } .pf-bar { flex-wrap: wrap; } }
`;

export default function ProfilePage() {
  return <TraineeLayout title="Edit profile"><Profile /></TraineeLayout>;
}

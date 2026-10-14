import React, { useEffect, useRef, useState } from "react";
import ClientShell from "../components/client/client-shell";
import { fetchById, postFormData } from "../utils/actions";
import { getUserUrl, updateUserUrl, imagePath } from "../utils/url";
import { stateList } from "../utils/static-lists";
import { getAge } from "../utils/time";
import useUserStore from "../store/userStore";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";

/* Client profile: photo, name, contact, a few optional details. Login is by email OTP, so no password. */

const clean = (v) => (v == null || v === "null" || v === "undefined" ? "" : String(v));
const STATES = stateList.filter((s) => s !== "Select");

export default function ClientProfile() {
  const { setInfo } = useUserStore();
  const [data, setData] = useState(null);
  const [f, setF] = useState({ name: "", nickname: "", phone: "", anumber: "", dob: "", gender: "", state: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [errs, setErrs] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    fetchById(getUserUrl).then((r) => {
      if (!r?.status) { setMsg(["err", r?.message || "Couldn't load your profile"]); return; }
      const d = r.data || {};
      setData(d);
      setF({ name: clean(d.name), nickname: clean(d.nickname), phone: clean(d.phone), anumber: clean(d.anumber), dob: clean(d.dob).slice(0, 10), gender: clean(d.gender), state: clean(d.state) === "Select" ? "" : clean(d.state) });
    }).catch(() => setMsg(["err", "Couldn't load your profile — please refresh"]));
  }, []);

  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); if (errs[k]) setErrs((e) => ({ ...e, [k]: "" })); setMsg(null); };
  const pick = (e) => {
    const x = e.target.files?.[0];
    e.target.value = "";
    if (!x) return;
    if (!/^image\//.test(x.type)) { setMsg(["err", "Please choose an image (JPG or PNG)"]); return; }
    if (x.size > 2 * 1024 * 1024) { setMsg(["err", "Photo is larger than 2 MB — please choose a smaller one"]); return; }
    setFile(x);
    setPreview(URL.createObjectURL(x));
  };

  const save = async () => {
    const e = {};
    if (!f.name.trim()) e.name = "Please enter your name";
    const d = f.phone.replace(/\D/g, "");
    if (!d) e.phone = "Please enter your phone number";
    else if (d.length < 10 || d.length > 13) e.phone = "Enter a valid 10-digit mobile number";
    if (f.anumber && f.anumber.replace(/\D/g, "").length < 10) e.anumber = "Enter a valid number or leave it empty";
    if (Object.keys(e).length) { setErrs(e); return; }
    const fd = new FormData();
    if (file) fd.append("file", file);
    fd.append("name", f.name.trim());
    fd.append("nickname", f.nickname.trim());
    fd.append("phone", f.phone.trim());
    fd.append("anumber", f.anumber.trim());
    fd.append("dob", f.dob);
    fd.append("state", f.state || "Select");
    fd.append("gender", f.gender);
    fd.append("age", f.dob ? getAge(f.dob) : "");
    setSaving(true);
    try {
      const r = await postFormData(updateUserUrl, fd);
      if (r?.status) {
        setInfo("name", f.name.trim());
        if (r.data?.profile) { setInfo("profile", r.data.profile); setData((x) => ({ ...x, profile: r.data.profile })); }
        setFile(null);
        setMsg(["ok", "Profile saved"]);
      } else setMsg(["err", r?.message || "Something went wrong"]);
    } catch (err) {
      setMsg(["err", err?.response?.data?.message || "Couldn't save — please try again"]);
    }
    setSaving(false);
  };

  const photo = preview || (clean(data?.profile) && !/^https?:/.test(data.profile) ? `${imagePath}/${data.profile}` : "");

  return (
    <ClientShell title="Profile">
      <style dangerouslySetInnerHTML={{ __html: CP_CSS }} />
      <div className="cp">
        <h1>Profile</h1>
        <p className="cp-sub">Your details help your therapist reach you. You log in with a one-time code sent to your email — there&apos;s no password.</p>

        {!data && !msg ? <div className="cp-skel" /> : (
          <div className="cp-card">
            <div className="cp-photo">
              <div className="cp-av">{photo ? <img src={photo} alt="" /> : (f.name || "U").charAt(0).toUpperCase()}</div>
              <div>
                <b>{f.name || "Your name"}</b>
                <span>{clean(data?.email)}</span>
                <button type="button" className="cp-btn soft" onClick={() => fileRef.current?.click()}><PhotoCameraRoundedIcon /> {photo ? "Change photo" : "Add photo"}</button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
              </div>
            </div>

            <div className="cp-grid">
              <label className={errs.name ? "err" : ""}><span>Full name</span><input value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />{errs.name && <em>{errs.name}</em>}</label>
              <label><span>What should we call you? <small>optional</small></span><input value={f.nickname} onChange={(e) => set("nickname", e.target.value)} /></label>
              <label className={errs.phone ? "err" : ""}><span>Phone (WhatsApp)</span><input type="tel" inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />{errs.phone && <em>{errs.phone}</em>}</label>
              <label className={errs.anumber ? "err" : ""}><span>Alternate number <small>optional</small></span><input type="tel" inputMode="tel" value={f.anumber} onChange={(e) => set("anumber", e.target.value)} />{errs.anumber && <em>{errs.anumber}</em>}</label>
              <label><span>Email</span><input value={clean(data?.email)} readOnly /><small className="hint">Contact support to change your login email.</small></label>
              <label><span>Date of birth <small>optional</small></span><input type="date" value={f.dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set("dob", e.target.value)} /></label>
              <label><span>Gender <small>optional</small></span>
                <select value={f.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Prefer not to say</option><option>Male</option><option>Female</option><option>Non-binary</option><option>Other</option>
                </select>
              </label>
              <label><span>State <small>optional</small></span>
                <select value={f.state} onChange={(e) => set("state", e.target.value)}>
                  <option value="">Select</option>{STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>

            <div className="cp-foot">
              {msg && <span className={`cp-msg ${msg[0]}`} role="status">{msg[1]}</span>}
              <button type="button" className="cp-btn primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
            </div>
          </div>
        )}
      </div>
    </ClientShell>
  );
}

const CP_CSS = `
.cp { max-width: 860px; }
.cp h1 { font-size: clamp(21px, 2.4vw, 26px); font-weight: 800; margin: 0; letter-spacing: -.3px; font-family: inherit; }
.cp-sub { margin: 4px 0 14px; font-size: 13.5px; color: #64748b; line-height: 1.5; }
.cp-skel { height: 420px; border-radius: 16px; background: linear-gradient(90deg,#eef2f0 0%,#f7f9f8 40%,#eef2f0 80%); background-size: 600px 100%; animation: cpsk 1.3s infinite linear; }
@keyframes cpsk { from { background-position: -300px 0; } to { background-position: 300px 0; } }
.cp-card { background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 18px 20px; }
.cp-photo { display: flex; align-items: center; gap: 16px; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid #eef2f0; }
.cp-av { width: 84px; height: 84px; border-radius: 22px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-size: 30px; font-weight: 800; overflow: hidden; flex-shrink: 0; }
.cp-av img { width: 100%; height: 100%; object-fit: cover; }
.cp-photo b { display: block; font-size: 16px; } .cp-photo span { display: block; font-size: 12.5px; color: #64748b; margin: 2px 0 8px; word-break: break-all; }
.cp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
.cp-grid label { display: flex; flex-direction: column; gap: 6px; margin: 0; min-width: 0; }
.cp-grid label > span { font-size: 12.5px; font-weight: 700; color: #334155; }
.cp-grid small { font-weight: 600; color: #94a3b8; }
.cp-grid small.hint { font-size: 12px; }
.cp-grid input, .cp-grid select { height: 44px; border: 1px solid #d6e0da; border-radius: 10px; padding: 0 12px; font-size: 14.5px; font-family: inherit; color: #0f172a; background: #fff; width: 100%; }
.cp-grid input[readonly] { background: #f6f8f7; color: #64748b; }
.cp-grid input:focus, .cp-grid select:focus { outline: none; border-color: #166534; box-shadow: 0 0 0 3px rgba(22,101,52,.12); }
.cp-grid label.err input { border-color: #ef4444; }
.cp-grid em { font-style: normal; font-size: 12px; color: #dc2626; font-weight: 600; }
.cp-foot { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 18px; flex-wrap: wrap; }
.cp-msg { font-size: 13px; font-weight: 600; } .cp-msg.ok { color: #166534; } .cp-msg.err { color: #dc2626; }
.cp-btn { display: inline-flex; align-items: center; gap: 6px; height: 42px; padding: 0 18px; border-radius: 11px; font-size: 14px; font-weight: 700; cursor: pointer; border: 1px solid transparent; font-family: inherit; }
.cp-btn svg { font-size: 18px; }
.cp-btn.primary { background: linear-gradient(135deg, #14532d, #16a34a); color: #fff; }
.cp-btn.primary:disabled { opacity: .65; cursor: default; }
.cp-btn.soft { background: #fff; color: #166534; border-color: #cfe3d6; height: 38px; font-size: 13px; }
@media (max-width: 767px) {
  .cp-card { padding: 14px; }
  .cp-grid { grid-template-columns: 1fr; }
  .cp-grid input, .cp-grid select { font-size: 16px; }
  .cp-foot .cp-btn.primary { width: 100%; justify-content: center; }
}
`;

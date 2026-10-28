import {
  EducationList,
  ExpList,
  languageSpoken,
  sessionFormatsList,
  stateList,
} from "../../../utils/static-lists";
import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../../utils/cropImage";
import { Dialog, Slider } from "@mui/material";
import { imagePath, updateTherapistProfileUrl } from "../../../utils/url";
import ImageTag from "../../../utils/image-tag";
import { postFormData } from "../../../utils/actions";
import useTherapistStore from "../../../store/therapistStore";
import Select from "react-select";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import { Section, Field, SaveBar, scrollToFirstError, toList } from "./settings-ui";
import PracticeLocation from "./practice-location";

const OTHER_EDU = "Other (Please specify)";
const STATES = stateList.filter((s) => s !== "Select");
const BIO_MIN = 300;
const BIO_MAX = 2000;

const isCustomEdu = (q) => !!q && (q === OTHER_EDU || !EducationList.includes(q));
const clean = (v) => (v == null || v === "null" || v === "undefined" ? "" : String(v));

/* "Noida, Uttar Pradesh" -> { city: "Noida", state: "Uttar Pradesh" }; "Delhi" -> { city: "", state: "Delhi" } */
export const splitLocation = (raw) => {
  const s = clean(raw).trim();
  if (!s) return { city: "", state: "" };
  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) return STATES.includes(parts[0]) ? { city: "", state: parts[0] } : { city: parts[0], state: "" };
  const state = parts.pop();
  return { city: parts.join(", "), state };
};
const joinLocation = (city, state) => [clean(city).trim(), clean(state).trim()].filter(Boolean).join(", ");

const FORMAT_META = {
  "In-Person": { Icon: PersonRoundedIcon, sub: "At your clinic" },
  "Audio call": { Icon: MicRoundedIcon, sub: "Phone / voice" },
  "Video Call": { Icon: VideocamRoundedIcon, sub: "Online video" },
};

// the fields this tab edits — used for the unsaved-changes check and Discard
const snapshotOf = (t) => ({
  name: clean(t.user?.name), phone: clean(t.user?.phone), gender: clean(t.user?.gender), bio: clean(t.user?.bio),
  qualification: clean(t.qualification), license_number: clean(t.license_number),
  state: clean(t.state), office_address: clean(t.office_address), year_of_exp: clean(t.year_of_exp),
  language_spoken: toList(t.language_spoken).map((o) => (typeof o === "object" ? o.value : o)),
  session_formats: toList(t.session_formats).filter(Boolean),
});

const Skeleton = () => (
  <div className="stg-skel">
    {[120, 260, 200].map((h, i) => <div key={i} style={{ height: h }} />)}
    <style dangerouslySetInnerHTML={{ __html: `
      .stg-skel > div { border-radius: 16px; margin-bottom: 14px; background: linear-gradient(90deg,#eef2f0 0%,#f7f9f8 40%,#eef2f0 80%); background-size: 600px 100%; animation: stgsk 1.3s infinite linear; }
      @keyframes stgsk { from { background-position: -300px 0; } to { background-position: 300px 0; } }` }} />
  </div>
);

export default function Profile({ onDirty }) {
  const { therapistInfo, setInfo, setSessionFormats } = useTherapistStore();
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [base, setBase] = useState(null); // last saved values

  // Cropping
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [otherEdu, setOtherEdu] = useState(false); // "Other" picked -> free-text qualification

  const loaded = !!therapistInfo?.user?.email;
  useEffect(() => {
    if (loaded && !base) {
      setBase(snapshotOf(therapistInfo));
      setOtherEdu(isCustomEdu(clean(therapistInfo.qualification)));
    }
  }, [loaded, base, therapistInfo]);

  const current = useMemo(() => (loaded ? snapshotOf(therapistInfo) : null), [loaded, therapistInfo]);
  const dirty = !!(base && current && (JSON.stringify(base) !== JSON.stringify(current) || selectedImage));
  useEffect(() => { onDirty && onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => { if (dirty && success) setSuccess(""); }, [dirty, success]);

  const loc = splitLocation(therapistInfo?.state);
  const stateOptions = loc.state && !STATES.includes(loc.state) ? [loc.state, ...STATES] : STATES;

  const onCropComplete = useCallback((_a, px) => setCroppedAreaPixels(px), []);

  const showCroppedImage = useCallback(async () => {
    try {
      const blob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setSelectedImage(new File([blob], "profile-picture.jpg", { type: "image/jpeg" }));
      setPreviewImage(URL.createObjectURL(blob));
      setIsCropModalOpen(false);
    } catch (e) {
      console.error(e);
      setError("Couldn't crop the photo — please try another image");
    }
  }, [imageToCrop, croppedAreaPixels]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\//.test(file.type)) { setError("Please choose an image file (JPG or PNG)"); return; }
    if (file.size / (1024 * 1024) > 2) { setError("Photo is larger than 2 MB — please choose a smaller one"); return; }
    setError("");
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageToCrop(reader.result);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setIsCropModalOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const clearErr = (k) => fieldErrors[k] && setFieldErrors((p) => ({ ...p, [k]: "" }));

  const handleLanguageSelect = (opts) => {
    const list = (opts || []).slice(0, 2).map((o) => ({ value: String(o.value).trim(), label: String(o.label).trim() }));
    setInfo("language_spoken", list);
    clearErr("languages");
  };

  const toggleFormat = (item) => {
    const cur = toList(therapistInfo.session_formats).filter(Boolean);
    const next = cur.includes(item) ? cur.filter((v) => v !== item) : [...cur, item];
    setSessionFormats(next.join(","));
    clearErr("formats");
  };

  const handleEducation = (value) => {
    if (value === OTHER_EDU) {
      setOtherEdu(true);
      setInfo("othEducation", true);
      setInfo("qualification", "");
    } else {
      setOtherEdu(false);
      setInfo("othEducation", false);
      setInfo("qualification", value);
    }
    clearErr("qualification");
  };

  const setLocation = (city, state) => { setInfo("state", joinLocation(city, state)); clearErr("state"); };

  const discard = () => {
    if (!base) return;
    setInfo("user", { ...therapistInfo.user, name: base.name, phone: base.phone, gender: base.gender, bio: base.bio });
    setOtherEdu(isCustomEdu(base.qualification));
    ["qualification", "license_number", "state", "office_address", "year_of_exp"].forEach((k) => setInfo(k, base[k]));
    setInfo("language_spoken", base.language_spoken.map((v) => ({ value: v, label: v })));
    setSessionFormats(base.session_formats.join(","));
    setSelectedImage(null);
    setPreviewImage(undefined);
    setFieldErrors({});
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    const t = therapistInfo;
    const errors = {};
    if (!clean(t.user.name).trim()) errors.name = "Please enter your full name";
    const digits = clean(t.user.phone).replace(/\D/g, "");
    if (!digits) errors.phone = "Please enter your phone number";
    else if (digits.length < 10 || digits.length > 13) errors.phone = "Enter a valid 10-digit mobile number";
    if (otherEdu && (!clean(t.qualification).trim() || clean(t.qualification) === OTHER_EDU)) errors.qualification = "Please type your qualification";
    if (clean(t.user.bio).length > BIO_MAX) errors.bio = `Please keep this under ${BIO_MAX} characters`;
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields");
      scrollToFirstError();
      return;
    }
    setFieldErrors({});

    const formData = new FormData();
    formData.append("name", clean(t.user.name).trim());
    formData.append("phone", clean(t.user.phone).trim());
    formData.append("qualification", clean(t.qualification).trim());
    formData.append("license_number", clean(t.license_number));
    formData.append("bio", clean(t.user.bio));
    formData.append("state", clean(t.state));
    formData.append("gender", clean(t.user.gender));
    formData.append("office_address", clean(t.office_address));
    formData.append("year_of_exp", clean(t.year_of_exp));
    if (selectedImage) formData.append("file", selectedImage);
    formData.append("language_spoken", toList(t.language_spoken).map((o) => (typeof o === "object" ? o.value : o)).join(", "));
    formData.append("session_formats", toList(t.session_formats).filter(Boolean).join(", "));

    setSaving(true);
    try {
      const response = await postFormData(updateTherapistProfileUrl, formData);
      if (response.status) {
        if (response.data?.profile) setInfo("user", { ...useTherapistStore.getState().therapistInfo.user, profile: response.data.profile });
        setSelectedImage(null);
        setBase(snapshotOf(useTherapistStore.getState().therapistInfo));
        setSuccess(response.message || "Profile saved");
        setTimeout(() => setSuccess(""), 3500);
      } else {
        setError(response.message || "Something went wrong — please try again");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't save — check your connection and try again");
    }
    setSaving(false);
  };

  if (!loaded) return <Skeleton />;

  const t = therapistInfo;
  const photo = previewImage || (clean(t.user.profile) ? `${imagePath}/${t.user.profile}` : "");
  const bioLen = clean(t.user.bio).length;
  const formats = toList(t.session_formats);
  const langValue = toList(t.language_spoken).map((o) => (typeof o === "object" ? o : { value: o, label: o }));
  const eduValue = otherEdu ? OTHER_EDU : EducationList.includes(clean(t.qualification)) ? clean(t.qualification) : "";

  return (
    <div>
      <Section title="Profile photo" sub="Clients see this first — a clear, friendly face photo gets more bookings.">
        <div className="stg-photo">
          {photo ? (
            <ImageTag className="stg-photo-img" alt={t.user.name || "Profile photo"} src={photo} />
          ) : (
            <div className="stg-photo-img" aria-hidden="true">{(clean(t.user.name).trim()[0] || "?").toUpperCase()}</div>
          )}
          <div className="stg-photo-txt">
            <b>{photo ? "Your photo" : "No photo yet"}{selectedImage && <span className="stg-new">New · not saved</span>}</b>
            <p>Square JPG or PNG, up to 2 MB.</p>
            <button type="button" className="stg-btn outline" onClick={() => fileInputRef.current?.click()}>
              <PhotoCameraRoundedIcon /> {photo ? "Change photo" : "Upload photo"}
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
          </div>
        </div>
      </Section>

      <Section title="Basic info" sub="Your contact details stay private — only your name is shown publicly.">
        <div className="stg-grid">
          <Field label="Full name" htmlFor="st-name" error={fieldErrors.name}>
            <input id="st-name" type="text" autoComplete="name" value={clean(t.user.name)}
              onChange={(e) => { setInfo("user.name", e.target.value); clearErr("name"); }} />
          </Field>
          <Field label="Phone number" htmlFor="st-phone" error={fieldErrors.phone}>
            <input id="st-phone" type="tel" inputMode="tel" autoComplete="tel" value={clean(t.user.phone)}
              onChange={(e) => { setInfo("user.phone", e.target.value); clearErr("phone"); }} />
          </Field>
          <Field label="Email" htmlFor="st-email" hint="Contact support to change your login email.">
            <input id="st-email" type="email" value={clean(t.user.email)} readOnly />
          </Field>
          <Field label="Gender" htmlFor="st-gender">
            <select id="st-gender" value={clean(t.user.gender)} onChange={(e) => setInfo("user.gender", e.target.value)}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="City" htmlFor="st-city" hint="Shown on your profile, e.g. Noida">
            <input id="st-city" type="text" autoComplete="address-level2" value={loc.city}
              onChange={(e) => setLocation(e.target.value.replace(/,/g, " "), loc.state)} />
          </Field>
          <Field label="State" htmlFor="st-state">
            <select id="st-state" value={loc.state} onChange={(e) => setLocation(loc.city, e.target.value)}>
              <option value="">Select</option>
              {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Professional details" sub="These build trust and decide which searches you appear in.">
        <div className="stg-grid">
          <Field label="Highest qualification" htmlFor="st-edu" error={!otherEdu ? fieldErrors.qualification : ""}>
            <select id="st-edu" value={eduValue} onChange={(e) => handleEducation(e.target.value)}>
              <option value="">Select</option>
              {EducationList.filter((i) => i !== "Select").map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          {otherEdu ? (
            <Field label="Your qualification" htmlFor="st-edu-oth" error={fieldErrors.qualification}>
              <input id="st-edu-oth" type="text" placeholder="e.g. M.A. Applied Psychology" value={clean(t.qualification) === OTHER_EDU ? "" : clean(t.qualification)}
                onChange={(e) => { setInfo("qualification", e.target.value); clearErr("qualification"); }} />
            </Field>
          ) : (
            <Field label="Years of experience" htmlFor="st-exp">
              <select id="st-exp" value={clean(t.year_of_exp)} onChange={(e) => setInfo("year_of_exp", e.target.value)}>
                <option value="">Select</option>
                {ExpList.filter((i) => i !== "Select").map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
          )}
          {otherEdu && (
            <Field label="Years of experience" htmlFor="st-exp">
              <select id="st-exp" value={clean(t.year_of_exp)} onChange={(e) => setInfo("year_of_exp", e.target.value)}>
                <option value="">Select</option>
                {ExpList.filter((i) => i !== "Select").map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
          )}
          <Field label="License / RCI number" htmlFor="st-lic" right={<small>Optional</small>}>
            <input id="st-lic" type="text" value={clean(t.license_number)} onChange={(e) => setInfo("license_number", e.target.value)} />
          </Field>
          <Field label="Languages" right={<small>{langValue.length}/2</small>} error={fieldErrors.languages}>
            <Select
              isMulti
              inputId="st-lang"
              className="stg-rs"
              classNamePrefix="select"
              value={langValue}
              onChange={handleLanguageSelect}
              options={languageSpoken}
              isOptionDisabled={() => langValue.length >= 2}
              placeholder="Pick up to 2"
              menuPlacement="auto"
            />
          </Field>
          <Field label="Clinic / office address" htmlFor="st-office" right={<small>Optional</small>}>
            <input id="st-office" type="text" autoComplete="street-address" value={clean(t.office_address)} onChange={(e) => setInfo("office_address", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Session formats" sub="How can clients meet you? Pick all that apply.">
        <div className="stg-cards" role="group" aria-label="Session formats">
          {sessionFormatsList.map((item) => {
            const on = formats.includes(item);
            const { Icon, sub } = FORMAT_META[item] || { Icon: PersonRoundedIcon, sub: "" };
            return (
              <button type="button" key={item} className={`stg-card${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggleFormat(item)}>
                <span className="stg-card-ic"><Icon /></span>
                <span><b>{item}</b><small>{sub}</small></span>
                <span className="stg-card-tick" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Section>

      {/* in-person: the pin for the map clients see (saved on its own) */}
      {formats.includes("In-Person") && <PracticeLocation />}

      <Section title="About me" sub="Write to a client, not a recruiter — who you help and how a session with you feels.">
        <Field htmlFor="st-bio" error={fieldErrors.bio}>
          <textarea id="st-bio" rows={8} maxLength={BIO_MAX + 200} value={clean(t.user.bio)}
            placeholder="I work with adults dealing with anxiety, stress and relationship concerns…"
            onChange={(e) => { setInfo("user.bio", e.target.value); clearErr("bio"); }} />
        </Field>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="stg-tip" style={{ flex: "1 1 260px" }}>
            Tip: mention the concerns you help with, your approach (e.g. CBT), and what a first session looks like. {BIO_MIN}+ characters works best.
          </div>
          <span className={`stg-count ${bioLen > BIO_MAX ? "warn" : bioLen >= BIO_MIN ? "ok" : ""}`}>{bioLen.toLocaleString("en-IN")} / {BIO_MAX.toLocaleString("en-IN")}</span>
        </div>
      </Section>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSubmit} onDiscard={discard} error={error} success={success} label="Save profile" />

      <Dialog open={isCropModalOpen} onClose={() => setIsCropModalOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ style: { borderRadius: 18, overflow: "hidden", margin: 16, width: "calc(100% - 32px)" } }}>
        <div className="stg-dlg" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #e4ece7" }}>
            <b style={{ fontSize: 16 }}>Adjust your photo</b>
            <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>Drag to position, pinch or use the slider to zoom.</div>
          </div>
          <div style={{ position: "relative", width: "100%", height: "min(60vh, 380px)", background: "#0f172a" }}>
            <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
              onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <div style={{ padding: "12px 18px 4px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#64748b" }}>Zoom</span>
            <Slider value={zoom} min={1} max={3} step={0.05} aria-label="Zoom" onChange={(e, z) => setZoom(z)} sx={{ color: "#166534" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "8px 18px 18px" }}>
            <button type="button" className="stg-btn ghost" onClick={() => setIsCropModalOpen(false)}>Cancel</button>
            <button type="button" className="stg-btn primary" onClick={showCroppedImage}>Use photo</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

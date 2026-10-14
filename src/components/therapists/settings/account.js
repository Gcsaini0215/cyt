import React, { useState } from "react";
import { useRouter } from "next/router";
import { postData } from "../../../utils/actions";
import { changePasswordUrl } from "../../../utils/url";
import { removeToken } from "../../../utils/jwt";
import { profilePath } from "../../../utils/therapist-slug";
import useTherapistStore from "../../../store/therapistStore";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { Section, Field, scrollToFirstError } from "./settings-ui";

const SITE = "https://www.chooseyourtherapist.in";

function PasswordInput({ id, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="stg-inputwrap">
      <input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} value={value}
        onChange={(e) => onChange(e.target.value)} style={{ paddingRight: 44 }} />
      <button type="button" className="stg-eye" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
      </button>
    </div>
  );
}

export default function Account() {
  const router = useRouter();
  const { therapistInfo } = useTherapistStore();
  const [pw, setPw] = useState({ password: "", npassword: "", cpassword: "" });
  const [errs, setErrs] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const path = therapistInfo?._id ? profilePath(therapistInfo) : "";
  const url = path ? `${SITE}${path}` : "";

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); }
    catch { const i = document.getElementById("acc-link"); i?.select(); document.execCommand?.("copy"); }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const setField = (k, v) => { setPw((p) => ({ ...p, [k]: v })); if (errs[k]) setErrs((e) => ({ ...e, [k]: "" })); setMsg({ type: "", text: "" }); };

  const changePassword = async () => {
    const e = {};
    if (pw.password.length < 6) e.password = "Enter your current password";
    if (pw.npassword.length < 6) e.npassword = "Use at least 6 characters";
    else if (pw.npassword === pw.password) e.npassword = "New password must be different";
    if (!e.npassword && pw.cpassword !== pw.npassword) e.cpassword = "Passwords don't match";
    if (Object.keys(e).length) { setErrs(e); scrollToFirstError(); return; }
    setSaving(true);
    try {
      const res = await postData(changePasswordUrl, pw);
      if (res.status) {
        setMsg({ type: "ok", text: "Password changed — please log in again. Redirecting…" });
        removeToken();
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setMsg({ type: "err", text: res.message || "Something went wrong" });
      }
    } catch (err) {
      setMsg({ type: "err", text: err?.response?.data?.message || "Couldn't change password — try again" });
    }
    setSaving(false);
  };

  const logout = () => { removeToken(); router.push("/login"); };

  return (
    <div>
      <Section title="Your public profile" sub="Share this link on WhatsApp, Instagram or your visiting card.">
        {url ? (
          <>
            <div className="stg-linkrow stg-field">
              <input id="acc-link" type="text" readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Public profile link" />
              <button type="button" className="stg-btn outline" onClick={copy}><ContentCopyRoundedIcon /> {copied ? "Copied" : "Copy"}</button>
            </div>
            <a className="stg-btn ghost" href={path} target="_blank" rel="noopener noreferrer" style={{ marginTop: 10 }}>
              <OpenInNewRoundedIcon /> Open profile
            </a>
          </>
        ) : <div className="stg-empty">Your link appears once your profile loads.</div>}
      </Section>

      <Section title="Account">
        <dl className="stg-kv">
          <dt>Login email</dt><dd>{therapistInfo?.user?.email || "—"}</dd>
          <dt>Phone</dt><dd>{therapistInfo?.user?.phone || "—"}</dd>
          {therapistInfo?.profile_type && (<><dt>Profile type</dt><dd>{therapistInfo.profile_type}</dd></>)}
        </dl>
      </Section>

      <Section title="Change password" sub="You'll be logged out on all devices after changing it.">
        <div className="stg-grid">
          <Field label="Current password" htmlFor="acc-cur" error={errs.password} full>
            <PasswordInput id="acc-cur" autoComplete="current-password" value={pw.password} onChange={(v) => setField("password", v)} />
          </Field>
          <Field label="New password" htmlFor="acc-new" error={errs.npassword} hint="At least 6 characters">
            <PasswordInput id="acc-new" autoComplete="new-password" value={pw.npassword} onChange={(v) => setField("npassword", v)} />
          </Field>
          <Field label="Confirm new password" htmlFor="acc-new2" error={errs.cpassword}>
            <PasswordInput id="acc-new2" autoComplete="new-password" value={pw.cpassword} onChange={(v) => setField("cpassword", v)} />
          </Field>
        </div>
        {msg.text && (
          <div role="status" style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: msg.type === "ok" ? "#166534" : "#dc2626" }}>{msg.text}</div>
        )}
        <button type="button" className="stg-btn primary" style={{ marginTop: 14 }} onClick={changePassword} disabled={saving}>
          {saving && <span className="stg-spin" aria-hidden="true" />} Update password
        </button>
      </Section>

      <Section title="Sign out" sub="Log out of the therapist portal on this device.">
        <button type="button" className="stg-btn danger" onClick={logout}><LogoutRoundedIcon /> Log out</button>
      </Section>
    </div>
  );
}

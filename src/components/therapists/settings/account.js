import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { removeToken } from "../../../utils/jwt";
import { fetchById, putData } from "../../../utils/actions";
import { commsPrefsUrl } from "../../../utils/url";
import { profilePath } from "../../../utils/therapist-slug";
import useTherapistStore from "../../../store/therapistStore";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Section } from "./settings-ui";

const SITE = "https://www.chooseyourtherapist.in";

const PREFS = [
  { key: "notice_email", label: "Notices from the CYT team", sub: "Important updates, timings, policy changes" },
  { key: "action_email", label: "Requests to update something", sub: "e.g. upload a certificate, update fees" },
  { key: "payout_email", label: "Payout sent", sub: "Amount and reference when we pay you" },
  { key: "reply_email", label: "Replies to your messages", sub: "When the team answers in Help & support" },
];

function EmailPrefs() {
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    fetchById(commsPrefsUrl).then((r) => setPrefs(r?.status ? r.data : {})).catch(() => setPrefs({}));
  }, []);
  const toggle = async (key) => {
    const next = !(prefs?.[key] !== false);
    setPrefs((p) => ({ ...p, [key]: next }));
    setSaving(key); setErr("");
    try {
      const r = await putData(commsPrefsUrl, { [key]: next });
      if (r?.status) setPrefs(r.data); else throw new Error();
    } catch (e) {
      setPrefs((p) => ({ ...p, [key]: !next }));
      setErr("Couldn't save — please try again.");
    }
    setSaving("");
  };
  return (
    <Section title="Email notifications" sub="Choose which emails you get. Changes save instantly.">
      <ul className="stg-prefs">
        <li>
          <span><b>New bookings</b><small>Always on — they carry the session details and PIN</small></span>
          <span className="stg-switch on locked" aria-label="Always on"><i /></span>
        </li>
        {PREFS.map((p) => {
          const on = prefs ? prefs[p.key] !== false : true;
          return (
            <li key={p.key}>
              <span><b>{p.label}</b><small>{p.sub}</small></span>
              <button type="button" role="switch" aria-checked={on} aria-label={p.label} disabled={!prefs || saving === p.key}
                className={`stg-switch${on ? " on" : ""}`} onClick={() => toggle(p.key)}><i /></button>
            </li>
          );
        })}
      </ul>
      {err && <div className="stg-err" style={{ marginTop: 8 }}>{err}</div>}
    </Section>
  );
}

export default function Account() {
  const router = useRouter();
  const { therapistInfo } = useTherapistStore();
  const [copied, setCopied] = useState(false);

  const path = therapistInfo?._id ? profilePath(therapistInfo) : "";
  const url = path ? `${SITE}${path}` : "";

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); }
    catch { const i = document.getElementById("acc-link"); i?.select(); document.execCommand?.("copy"); }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
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

      <Section title="Account" sub="You sign in with a one-time code (OTP) sent to your email — no password needed.">
        <dl className="stg-kv">
          <dt>Login email</dt><dd>{therapistInfo?.user?.email || "—"}</dd>
          <dt>Phone</dt><dd>{therapistInfo?.user?.phone || "—"}</dd>
          {therapistInfo?.profile_type && (<><dt>Profile type</dt><dd>{therapistInfo.profile_type}</dd></>)}
        </dl>
      </Section>

      <EmailPrefs />

      <Section title="Sign out" sub="Log out of the therapist portal on this device.">
        <button type="button" className="stg-btn danger" onClick={logout}><LogoutRoundedIcon /> Log out</button>
      </Section>
    </div>
  );
}

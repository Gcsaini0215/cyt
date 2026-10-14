import React, { useState } from "react";
import { useRouter } from "next/router";
import { removeToken } from "../../../utils/jwt";
import { profilePath } from "../../../utils/therapist-slug";
import useTherapistStore from "../../../store/therapistStore";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Section } from "./settings-ui";

const SITE = "https://www.chooseyourtherapist.in";

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

      <Section title="Sign out" sub="Log out of the therapist portal on this device.">
        <button type="button" className="stg-btn danger" onClick={logout}><LogoutRoundedIcon /> Log out</button>
      </Section>
    </div>
  );
}

import MainLayout from "../components/therapists/main-layout";
import Profile from "../components/therapists/settings/profile";
import PaymentDetails from "../components/therapists/settings/payment-details";
import ServicesAndExperties from "../components/therapists/settings/services-and-experties";
import Account from "../components/therapists/settings/account";
import { STG_CSS, profileChecks, toList, langLabels } from "../components/therapists/settings/settings-ui";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import useTherapistStore from "../store/therapistStore";
import { Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageTag from "../utils/image-tag";
import { imagePath } from "../utils/url";
import { profilePath } from "../utils/therapist-slug";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";

const TABS = [
  { id: "profile", label: "Profile", Icon: PersonRoundedIcon },
  { id: "offerings", label: "Offerings", Icon: SpaRoundedIcon },
  { id: "payments", label: "Payments", Icon: AccountBalanceWalletRoundedIcon },
  { id: "account", label: "Account", Icon: ShieldRoundedIcon },
];
const LEAVE_MSG = "You have unsaved changes. Leave without saving?";

const clean = (v) => (v == null || v === "null" || v === "undefined" ? "" : String(v));
const minFee = (t) => {
  const fees = (Array.isArray(t?.fees) ? t.fees : []).flatMap((f) => (f?.formats || []).map((x) => Number(x?.fee) || 0)).filter((n) => n > 0);
  return fees.length ? Math.min(...fees) : 0;
};

export default function ProfileSettings() {
  const router = useRouter();
  const { therapistInfo, fetchTherapistInfo } = useTherapistStore();
  const [tab, setTab] = useState("profile");
  const [dirty, setDirty] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;

  const loaded = !!therapistInfo?.user?.email;
  useEffect(() => { if (!loaded) fetchTherapistInfo(); }, [loaded, fetchTherapistInfo]);

  // ?tab=payments etc.
  useEffect(() => {
    if (!router.isReady) return;
    const q = String(router.query.tab || "");
    if (TABS.some((t) => t.id === q)) setTab(q);
  }, [router.isReady, router.query.tab]);

  // warn before leaving the page with unsaved edits
  useEffect(() => {
    const onUnload = (e) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = ""; } };
    const onRoute = (url) => {
      if (!dirtyRef.current || url.startsWith("/settings")) return;
      if (!window.confirm(LEAVE_MSG)) {
        router.events.emit("routeChangeError");
        throw "Route change aborted (unsaved settings)"; // eslint-disable-line no-throw-literal
      }
      fetchTherapistInfo(); // drop the unsaved edits from the shared store
    };
    window.addEventListener("beforeunload", onUnload);
    router.events.on("routeChangeStart", onRoute);
    return () => { window.removeEventListener("beforeunload", onUnload); router.events.off("routeChangeStart", onRoute); };
  }, [router, fetchTherapistInfo]);

  const onDirty = useCallback((d) => setDirty(d), []);

  const goTab = (id) => {
    if (id === tab) return;
    if (dirtyRef.current) {
      if (!window.confirm(LEAVE_MSG)) return;
      if (tab === "profile") fetchTherapistInfo(); // restore the saved profile
    }
    setDirty(false);
    setTab(id);
    router.replace({ pathname: "/settings", query: id === "profile" ? {} : { tab: id } }, undefined, { shallow: true, scroll: false });
    if (typeof window !== "undefined" && window.scrollY > 200) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const checks = profileChecks(therapistInfo);
  const done = checks.filter((c) => c.done).length;
  const pct = checks.length ? Math.round((done / checks.length) * 100) : 0;
  const missing = checks.filter((c) => !c.done);
  const t = therapistInfo || {};
  const name = clean(t.user?.name) || "Your name";
  const photo = clean(t.user?.profile) ? `${imagePath}/${t.user.profile}` : "";
  const publicPath = t._id ? profilePath(t) : "";

  return (
    <MainLayout>
      <Head><title>Settings | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: STG_CSS }} />
      <div className="stg">
        <header className="stg-head">
          {photo ? <ImageTag className="stg-ava" alt={name} src={photo} /> : <div className="stg-ava" aria-hidden="true">{name[0].toUpperCase()}</div>}
          <div className="stg-head-main">
            <h1>{loaded ? name : "Settings"}</h1>
            <div className="stg-mail">{loaded ? [clean(t.profile_type), clean(t.user?.email)].filter(Boolean).join(" · ") : "Loading your profile…"}</div>
            {loaded && (
              <>
                <div className="stg-prog">
                  <div className="stg-prog-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness"><i style={{ width: `${pct}%` }} /></div>
                  <span className={`stg-prog-txt${pct < 100 ? " warn" : ""}`}>{pct === 100 ? "Profile complete ✓" : `Profile ${pct}% complete`}</span>
                </div>
                {missing.length > 0 && (
                  <div className="stg-missing">
                    {missing.map((m) => (
                      <button type="button" key={m.key} onClick={() => goTab(m.tab)} title={`Add ${m.label.toLowerCase()}`}>+ {m.label}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="stg-head-act">
            <button type="button" className="stg-btn outline" onClick={() => setPreviewOpen(true)} disabled={!loaded}><VisibilityRoundedIcon /> Preview</button>
            {publicPath && <a className="stg-btn ghost" href={publicPath} target="_blank" rel="noopener noreferrer"><OpenInNewRoundedIcon /> Public profile</a>}
          </div>
        </header>

        <nav className="stg-tabs" aria-label="Settings sections">
          <div className="stg-tabs-in" role="tablist">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} className={`stg-tab${tab === id ? " active" : ""}`} onClick={() => goTab(id)}>
                <Icon /> {label}
                {tab === id && dirty && <span className="dot" title="Unsaved changes" />}
              </button>
            ))}
          </div>
        </nav>

        {tab === "profile" && (
          <div className="stg-info">
            <InfoRoundedIcon />
            <span>Looking for your weekly hours or session fees? They live in <Link href="/my-schedule?tab=availability">My Schedule</Link>.</span>
          </div>
        )}
        {tab !== "profile" && <div style={{ height: 6 }} />}

        <div role="tabpanel">
          {tab === "profile" && <Profile onDirty={onDirty} />}
          {tab === "offerings" && <ServicesAndExperties onDirty={onDirty} />}
          {tab === "payments" && <PaymentDetails onDirty={onDirty} />}
          {tab === "account" && <Account />}
        </div>
      </div>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ style: { borderRadius: 18, margin: 16, width: "calc(100% - 32px)" } }}>
        <div className="stg-pv" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".5px", textTransform: "uppercase", color: "#94a3b8" }}>How clients see you</span>
            <IconButton onClick={() => setPreviewOpen(false)} size="small" aria-label="Close preview"><CloseIcon fontSize="small" /></IconButton>
          </div>
          <PreviewCard t={t} photo={photo} name={name} />
          {publicPath && (
            <a className="stg-btn primary" href={publicPath} target="_blank" rel="noopener noreferrer" style={{ width: "100%", marginTop: 16, color: "#fff", background: "#166534" }}>
              Open full profile
            </a>
          )}
        </div>
      </Dialog>
    </MainLayout>
  );
}

function PreviewCard({ t, photo, name }) {
  const langs = langLabels(t.language_spoken);
  const formats = toList(t.session_formats).filter(Boolean);
  const tags = toList(t.experties);
  const city = clean(t.state).split(",")[0].trim();
  const fee = minFee(t);
  const Miss = ({ children }) => <span className="miss">{children}</span>;
  return (
    <div>
      <div className="stg-pv-top">
        {photo ? <ImageTag className="stg-pv-img" alt={name} src={photo} /> : <div className="stg-pv-img">{name[0].toUpperCase()}</div>}
        <div style={{ minWidth: 0 }}>
          <h3>{name}</h3>
          {clean(t.profile_type) && <div className="t">{t.profile_type}</div>}
          <div className="q">{clean(t.year_of_exp) ? `${t.year_of_exp} experience` : <Miss>Experience not added</Miss>}</div>
        </div>
      </div>
      <ul>
        <li><SchoolRoundedIcon /><span>{clean(t.qualification) || <Miss>Qualification not added</Miss>}</span></li>
        <li><TranslateRoundedIcon /><span>{langs.length ? langs.join(", ") : <Miss>Languages not added</Miss>}</span></li>
        <li><VideocamRoundedIcon /><span>{formats.length ? formats.join(" · ") : <Miss>Session formats not set</Miss>}</span></li>
        <li><PlaceRoundedIcon /><span>{city || <Miss>Location not added</Miss>}</span></li>
        {fee > 0 && <li><CurrencyRupeeRoundedIcon /><span>From ₹{fee.toLocaleString("en-IN")} / session</span></li>}
        {clean(t.license_number) && <li><WorkspacePremiumRoundedIcon /><span>License {t.license_number}</span></li>}
      </ul>
      {tags.length > 0 && (
        <div className="tags">{tags.slice(0, 5).map((x) => <span key={x}>{x}</span>)}{tags.length > 5 && <span>+{tags.length - 5}</span>}</div>
      )}
      <p className="bio">{clean(t.user?.bio) || <Miss>Add an “About me” so clients know how you work.</Miss>}</p>
    </div>
  );
}

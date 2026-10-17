import React from "react";
import { toast } from "react-toastify";
import useTherapistStore from "../../store/therapistStore";
import useCommsStore, { newReviewsCount } from "../../store/commsStore";
import { profilePct } from "../../utils/profile-checks";
import { profilePath } from "../../utils/therapist-slug";
import { imagePath, defaultProfile, apiUrl } from "../../utils/url";

/* Shared by the side rail, the phone "More" sheet and the top bar: menu badges,
   the therapist's listing status and the "share my profile" action. */

const SITE = "https://www.chooseyourtherapist.in";

// badgeKey -> number (count) | "dot" | 0
// "Upgrade" tag on the Assessments menu item while the Clinical Assessments add-on isn't active
const UPG_KEY = "cyt_addon_upgrade";
export function useAssessmentsUpgrade() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    try {
      const c = JSON.parse(sessionStorage.getItem(UPG_KEY) || "null");
      if (c && Date.now() - c.at < 10 * 60 * 1000) { setShow(c.show); return; }
    } catch (e) { /* storage blocked */ }
    const token = (() => { try { return localStorage.getItem("token"); } catch (e) { return null; } })();
    if (!token) return;
    fetch(`${apiUrl}/therapist-addon`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => {
        const v = j?.data?.assessments ? !j.data.assessments.active : false;
        setShow(v);
        try { sessionStorage.setItem(UPG_KEY, JSON.stringify({ show: v, at: Date.now() })); } catch (e) { /* ignore */ }
      })
      .catch(() => {});
  }, []);
  return show;
}
export const clearAssessmentsUpgrade = () => { try { sessionStorage.removeItem(UPG_KEY); } catch (e) { /* ignore */ } };
export const NavTag = ({ item, upgrade, className = "" }) => (item.tag && upgrade ? <em className={`nx-tag ${className}`}>{item.tag}</em> : null);

export function useNavBadges() {
  const { notificationCount, therapistInfo } = useTherapistStore();
  const unread = useCommsStore((s) => s.unread);
  const reviews = useCommsStore(newReviewsCount);
  const loaded = !!therapistInfo?.user?.email;
  return {
    bookings: notificationCount || 0,
    inbox: unread || 0,
    reviews,
    settings: loaded && profilePct(therapistInfo) < 100 ? "dot" : 0,
  };
}

export function NavBadge({ value, className = "" }) {
  if (!value) return null;
  if (value === "dot") return <span className={`nx-dot ${className}`} aria-label="Needs attention" />;
  return <span className={`nx-badge ${className}`}>{value > 99 ? "99+" : value}</span>;
}

export function listingOf(t) {
  if (!t?.user) return null;
  const exp = t.subscription_expires_at ? new Date(t.subscription_expires_at) : null;
  const live = t.show_to_page === 1 || t.show_to_page === true;
  if (exp && !isNaN(exp)) {
    const days = Math.ceil((exp - Date.now()) / 86400000);
    if (days < 0) return { label: "Listing expired", tone: "off" };
    return { label: days <= 7 ? `Live · ${days} day${days === 1 ? "" : "s"} left` : "Live", tone: days <= 7 ? "warn" : "ok" };
  }
  return live ? { label: "Live", tone: "ok" } : { label: "Not live yet", tone: "warn" };
}

export const profileUrlOf = (t) => (t?._id ? `${SITE}${profilePath(t)}` : "");
export const avatarOf = (t) => (t?.user?.profile && t.user.profile !== "null" ? `${imagePath}/${t.user.profile}` : defaultProfile);

export async function shareProfile(t) {
  const url = profileUrlOf(t);
  if (!url) return;
  const name = t?.user?.name || "my profile";
  try {
    if (navigator.share) {
      await navigator.share({ title: `${name} — Choose Your Therapist`, text: `Book a session with ${name} on Choose Your Therapist`, url });
      return;
    }
  } catch (e) {
    if (e?.name === "AbortError") return;
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Profile link copied", { autoClose: 2000 });
  } catch (e) {
    window.prompt("Copy your profile link", url);
  }
}

export const NX_CSS = `
.nx-tag { font-style: normal; font-size: 9.5px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; color: #92400e; background: #fde68a; border-radius: 999px; padding: 1px 6px; margin-left: 6px; white-space: nowrap; }
.nx-tag.tn-dr-tag { display: block; width: fit-content; margin: 3px auto 0; }
.nx-badge { margin-left: auto; min-width: 19px; height: 19px; padding: 0 6px; border-radius: 10px; background: #ef4444; color: #fff;
  font-size: 10.5px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; line-height: 1; font-style: normal; }
.nx-dot { margin-left: auto; width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 0 2px #fff; flex-shrink: 0; }
.nx-tone { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; border-radius: 999px; padding: 2px 9px; white-space: nowrap; }
.nx-tone::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.nx-tone.ok { background: #e7f6ec; color: #166534; }
.nx-tone.warn { background: #fef3c7; color: #92400e; }
.nx-tone.off { background: #fee2e2; color: #b91c1c; }
`;

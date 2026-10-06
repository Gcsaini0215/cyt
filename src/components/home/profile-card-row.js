import Link from "next/link";
import React, { useState, useEffect } from "react";
import ImageTag from "../../utils/image-tag";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import StarIcon from "@mui/icons-material/Star";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import { postData } from "../../utils/actions";
import { imagePath, InsertFavriouteTherapistUrl, RemoveFavriouteTherapistUrl } from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";
import { profilePath } from "../../utils/therapist-slug";
import { thumb, thumbSet } from "../../utils/thumb";
import { split, getMinFee, sessionModes, nextAvailable } from "../../utils/therapist-directory";

function expLabel(raw) {
  if (!raw) return "";
  const v = String(raw).trim();
  return /year|yr/i.test(v) ? v.replace(/years?/i, "yrs") : `${v} yrs`;
}

// first sentence of the bio, kept short enough for one or two lines
function bioLine(raw) {
  const txt = String(raw || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!txt) return "";
  const first = txt.match(/^.{20,170}?[.!?](\s|$)/);
  if (first) return first[0].trim();
  return txt.length > 150 ? `${txt.slice(0, 150).replace(/\s+\S*$/, "")}…` : txt;
}

/* Directory list row (Practo-style): photo · details · fees + actions, so therapists are easy
   to compare. Styles live in CARD_CSS, rendered once by the directory (not once per card).
   highlight: the concern being filtered on — shown first in the expertise chips.
   now: Date.now() once the page has mounted (null during SSR), for "next available". */
export default function ProfileCardRow({ data, favrioutes, highlight = "", now = null }) {
  const [bookmark, setBookmark] = useState(favrioutes?.includes(data._id) || false);
  const [showBookmark, setShowBookmark] = useState(true);

  useEffect(() => {
    const token = getDecodedToken();
    if (token && token.role === 1) setShowBookmark(false);
    setBookmark(favrioutes?.includes(data._id) || false);
  }, [data, favrioutes]);

  const handleBookmark = () => {
    const was = bookmark;
    setBookmark(!was);
    postData(was ? RemoveFavriouteTherapistUrl : InsertFavriouteTherapistUrl, { therapistId: data._id }).catch(() => {});
  };

  const name = data.user?.name || "Therapist";
  const reviews = (data.reviews || []).filter((r) => typeof r.rating === "number");
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;
  const langs = split(data.language_spoken);
  let expertise = split(data.experties);
  if (highlight && expertise.includes(highlight)) expertise = [highlight, ...expertise.filter((s) => s !== highlight)];
  const fee = getMinFee(data.fees);
  const exp = expLabel(data.year_of_exp);
  const modes = sessionModes(data);
  const next = nextAvailable(data, now);
  const bio = bioLine(data.user?.bio);
  const profileHref = profilePath(data);

  return (
    <article className="pcr">
      <Link href={profileHref} className="pcr-photo" aria-label={`${name} — view profile`}>
        <ImageTag alt={name} src={thumb(`${imagePath}/${data.user?.profile}`, 256)} srcSet={thumbSet(`${imagePath}/${data.user?.profile}`, 128, 256)} width="124" height="124" />
        {data.priority === 1 && <span className="pcr-badge top" title="Handpicked by the CYT team">★ Top Pick</span>}
        {data.priority === 2 && <span className="pcr-badge ver" title="Documents checked by our team">✓ Verified</span>}
      </Link>

      <div className="pcr-main">
        <Link href={profileHref} className="pcr-name">
          <span>{name}</span>
          <VerifiedRounded sx={{ fontSize: 18, color: "#1d9bf0", flexShrink: 0 }} />
        </Link>
        {data.profile_type && <div className="pcr-role">{data.profile_type}</div>}
        <div className="pcr-meta">
          {avg && (
            <span className="pcr-rate">
              <StarIcon sx={{ color: "#d4a24c", fontSize: 16 }} /> <b>{avg}</b> <small>({reviews.length})</small>
            </span>
          )}
          {exp && <span><i className="feather-briefcase" /> {exp} exp.</span>}
          {langs.length > 0 && <span><i className="feather-globe" /> {langs.slice(0, 3).join(", ")}</span>}
          {data.state && <span><i className="feather-map-pin" /> {data.state}</span>}
        </div>
        {(modes.online || modes.inPerson) && (
          <div className="pcr-modes" aria-label="Session modes">
            {modes.video && <span><i className="feather-video" /> Video</span>}
            {modes.audio && <span><i className="feather-phone" /> Audio</span>}
            {modes.inPerson && <span className="ip"><i className="feather-home" /> In-person</span>}
          </div>
        )}
      </div>

      {bio && <p className="pcr-bio">{bio}</p>}
      {expertise.length > 0 && (
        <div className="pcr-specs" aria-label="Areas of expertise">
          {expertise.slice(0, 4).map((s, i) => (
            <span key={s} className={`pcr-spec${s === highlight ? " hit" : ""}${i >= 2 ? " lg" : ""}`}>{s}</span>
          ))}
          {expertise.length > 4 && <Link href={profileHref} className="pcr-spec more">+{expertise.length - 4} more</Link>}
        </div>
      )}

      <div className="pcr-side">
        <div className="pcr-fee">
          {fee ? <>From ₹{fee.toLocaleString("en-IN")}<small>per session</small></> : <>Fees on request<small>ask while booking</small></>}
        </div>
        {next && (
          <div className={`pcr-next${next.days === 0 ? " today" : ""}`}>
            <i aria-hidden="true" /> Available {next.days < 2 ? next.label.toLowerCase() : next.label}
            <small>from {next.time}</small>
          </div>
        )}
        <div className="pcr-acts">
          <Link href={`/book/${data._id}`} className="pcr-book">Book Now</Link>
          <Link href={profileHref} className="pcr-view">View Profile</Link>
        </div>
      </div>

      {showBookmark && (
        <button type="button" className={`pcr-bk${bookmark ? " on" : ""}`} onClick={handleBookmark}
          aria-label={bookmark ? "Remove from saved therapists" : "Save therapist"} aria-pressed={bookmark}>
          {bookmark
            ? <BookmarkAddedIcon sx={{ fontSize: 17, color: "#d4a24c" }} />
            : <BookmarkBorderIcon sx={{ fontSize: 17, color: "#94a3b8" }} />}
        </button>
      )}
    </article>
  );
}

// Desktop: photo | details (name, meta, modes, bio, expertise) | fee + actions.
// Mobile: photo + name block, then bio / expertise full width, then fee + buttons.
export const CARD_CSS = `
.pcr {
  position: relative; display: grid; grid-template-columns: 124px minmax(0, 1fr) 216px;
  grid-template-areas: "photo main side" "photo bio side" "photo specs side"; grid-template-rows: auto auto 1fr;
  column-gap: 20px; row-gap: 6px;
  background: #fff; border: 1px solid #e3ebe6; border-radius: 16px; padding: 16px;
  box-shadow: 0 2px 10px rgba(20,83,45,.04); transition: box-shadow .2s ease, border-color .2s ease, transform .2s ease;
}
.pcr:hover { box-shadow: 0 14px 32px -12px rgba(20,83,45,.2); border-color: #c9ddd0; transform: translateY(-2px); }

.pcr-photo { grid-area: photo; position: relative; width: 124px; height: 124px; border-radius: 14px; overflow: hidden; background: #e8f3ec; display: block; align-self: start; }
.pcr-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; transition: transform .4s ease; }
.pcr:hover .pcr-photo img { transform: scale(1.05); }
.pcr-badge { position: absolute; left: 6px; bottom: 6px; font-size: 10px; font-weight: 800; padding: 3px 7px; border-radius: 6px; cursor: help; }
.pcr-badge.top { background: rgba(212,162,76,.97); color: #14532d; }
.pcr-badge.ver { background: rgba(20,83,45,.9); color: #fff; }

.pcr-main { grid-area: main; min-width: 0; display: flex; flex-direction: column; gap: 6px; padding-right: 36px; }
.pcr-name { display: inline-flex; align-items: center; gap: 6px; font-size: 18.5px; font-weight: 800; color: #0b1712; text-decoration: none; line-height: 1.25; width: fit-content; max-width: 100%; }
.pcr-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pcr-name:hover { color: #1e7a4c; }
.pcr-role { font-size: 13.5px; font-weight: 700; color: #1e7a4c; }
.pcr-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; font-size: 13px; color: #475569; font-weight: 500; }
.pcr-meta span { display: inline-flex; align-items: center; gap: 5px; }
.pcr-meta i { color: #1e7a4c; font-size: 13px; }
.pcr-rate b { color: #0f172a; font-weight: 800; }
.pcr-rate small { color: #94a3b8; font-size: 12px; }
.pcr-modes { display: flex; flex-wrap: wrap; gap: 6px; }
.pcr-modes span { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; color: #14532d; background: #eef6f1; border-radius: 6px; padding: 3px 8px; }
.pcr-modes span.ip { background: #fbf3e2; color: #7a5413; }
.pcr-modes i { font-size: 11.5px; }
.pcr-bio { grid-area: bio; min-width: 0; margin: 0; font-size: 13.5px; line-height: 1.5; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; padding: 0; }
.pcr-specs { grid-area: specs; min-width: 0; display: flex; flex-wrap: wrap; align-items: flex-start; align-content: flex-start; gap: 6px; margin-top: 2px; }
.pcr-spec { font-size: 11.5px; font-weight: 600; color: #334155; background: #f4f6f5; border: 1px solid #e2e8e4; padding: 3px 9px; border-radius: 999px; }
.pcr-spec.hit { background: #1e7a4c; border-color: #1e7a4c; color: #fff; }
.pcr-spec.more { background: #fff; color: #1e7a4c; border-color: #cfe3d6; text-decoration: none; }

.pcr-side { grid-area: side; display: flex; flex-direction: column; align-items: stretch; gap: 8px; padding-left: 20px; border-left: 1px dashed #dfe8e2; justify-content: center; }
.pcr-fee { font-size: 17px; font-weight: 800; color: #14532d; line-height: 1.2; }
.pcr-fee small { display: block; font-size: 11.5px; font-weight: 600; color: #64748b; margin-top: 2px; }
.pcr-next { display: flex; align-items: center; flex-wrap: wrap; gap: 2px 6px; font-size: 12.5px; font-weight: 700; color: #334155; }
.pcr-next i { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; flex-shrink: 0; }
.pcr-next.today { color: #1e7a4c; }
.pcr-next.today i { background: #22a35a; box-shadow: 0 0 0 3px rgba(34,163,90,.18); }
.pcr-next small { font-size: 11.5px; font-weight: 600; color: #64748b; }
.pcr-acts { display: flex; flex-direction: column; gap: 8px; }
.pcr-book { display: block; text-align: center; padding: 10px 0; border-radius: 10px; background: #1e7a4c; color: #fff !important; font-size: 13.5px; font-weight: 800; text-decoration: none; box-shadow: 0 6px 14px -6px rgba(30,122,76,.6); }
.pcr-book:hover { background: #186640; }
.pcr-view { display: block; text-align: center; padding: 9px 0; border-radius: 10px; border: 1.5px solid #cfdcd4; color: #26463a !important; font-size: 13px; font-weight: 700; text-decoration: none; }
.pcr-view:hover { border-color: #1e7a4c; color: #1e7a4c !important; }

.pcr-bk { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 9px; border: 1.5px solid #e3ebe6; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.pcr-bk:hover, .pcr-bk.on { border-color: #ecd3a3; background: #fffaf0; }

@media (max-width: 767px) {
  .pcr { grid-template-columns: 84px minmax(0, 1fr); grid-template-areas: "photo main" "bio bio" "specs specs" "side side"; grid-template-rows: auto; column-gap: 14px; row-gap: 10px; padding: 14px; border-radius: 14px; }
  .pcr:hover { transform: none; }
  .pcr-photo { width: 84px; height: 84px; border-radius: 12px; }
  .pcr-name { font-size: 16px; }
  .pcr-role { font-size: 12.5px; }
  .pcr-main { gap: 5px; padding-right: 30px; }
  .pcr-meta { font-size: 12px; gap: 3px 10px; }
  .pcr-bio { font-size: 13px; }
  .pcr-specs { margin-top: 0; }
  .pcr-spec.lg { display: none; }
  .pcr-side { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px; padding: 12px 0 0; border-left: none; border-top: 1px dashed #dfe8e2; }
  .pcr-fee { font-size: 15px; }
  .pcr-next { grid-column: 2; grid-row: 1; justify-content: flex-end; font-size: 12px; }
  .pcr-next small { display: none; }
  .pcr-acts { grid-column: 1 / -1; flex-direction: row; }
  .pcr-acts a { flex: 1; }
  .pcr-book, .pcr-view { padding: 10px 0; font-size: 13px; }
}
`;

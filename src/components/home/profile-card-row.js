import Link from "next/link";
import React, { useState, useEffect } from "react";
import ImageTag from "../../utils/image-tag";
import { getMinMaxPrice } from "../../utils/helpers";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import StarIcon from "@mui/icons-material/Star";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import { postData } from "../../utils/actions";
import { imagePath, InsertFavriouteTherapistUrl, RemoveFavriouteTherapistUrl } from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";

function list(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((v) => String(v).trim()).filter(Boolean);
  return String(raw).split(",").map((v) => v.trim()).filter(Boolean);
}

function expLabel(raw) {
  if (!raw) return "";
  const v = String(raw).trim();
  return /year|yr/i.test(v) ? v.replace(/years?/i, "yrs") : `${v} yrs`;
}

/* Directory list row (Practo-style): photo · details · fees + actions, so therapists are easy to compare. */
export default function ProfileCardRow({ data, favrioutes }) {
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
  const reviews = data.reviews || [];
  const avg = reviews.length ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;
  const langs = list(data.language_spoken);
  const expertise = list(data.experties);
  const price = getMinMaxPrice(data.fees || []);
  const exp = expLabel(data.year_of_exp);
  const profileHref = `/view-profile/${data._id}`;

  return (
    <article className="pcr">
      <style dangerouslySetInnerHTML={{ __html: `
        .pcr {
          position: relative; display: grid; grid-template-columns: 124px minmax(0, 1fr) 210px; gap: 20px; align-items: center;
          background: #fff; border: 1px solid #e3ebe6; border-radius: 16px; padding: 16px;
          box-shadow: 0 2px 10px rgba(15,61,36,.04); transition: box-shadow .2s ease, border-color .2s ease, transform .2s ease;
        }
        .pcr:hover { box-shadow: 0 14px 32px -12px rgba(15,61,36,.2); border-color: #c9ddd0; transform: translateY(-2px); }

        .pcr-photo { position: relative; width: 124px; height: 124px; border-radius: 14px; overflow: hidden; background: #e8f5e9; display: block; }
        .pcr-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; transition: transform .4s ease; }
        .pcr:hover .pcr-photo img { transform: scale(1.05); }
        .pcr-badge { position: absolute; left: 6px; bottom: 6px; font-size: 10px; font-weight: 800; padding: 3px 7px; border-radius: 6px; }
        .pcr-badge.top { background: rgba(212,175,55,.96); color: #0f3d24; }
        .pcr-badge.ver { background: rgba(15,61,36,.9); color: #fff; }

        .pcr-main { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
        .pcr-name { display: inline-flex; align-items: center; gap: 6px; font-size: 18.5px; font-weight: 800; color: #132a1c; text-decoration: none; line-height: 1.25; width: fit-content; max-width: 100%; }
        .pcr-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pcr-name:hover { color: #166534; }
        .pcr-role { font-size: 13.5px; font-weight: 700; color: #166534; }
        .pcr-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; font-size: 13px; color: #475569; font-weight: 500; }
        .pcr-meta span { display: inline-flex; align-items: center; gap: 5px; }
        .pcr-meta i { color: #16a34a; font-size: 13px; }
        .pcr-rate b { color: #0f172a; font-weight: 800; }
        .pcr-rate small { color: #94a3b8; font-size: 12px; }
        .pcr-specs { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 2px; }
        .pcr-specs-label { font-size: 12px; font-weight: 700; color: #64748b; margin-right: 2px; }
        .pcr-spec.more { background: #fff; color: #1d4ed8; border-color: #bfdbfe; }
        .pcr-spec { font-size: 11.5px; font-weight: 600; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 3px 9px; border-radius: 999px; }

        .pcr-side { display: flex; flex-direction: column; align-items: stretch; gap: 8px; padding-left: 20px; border-left: 1px dashed #dfe8e2; align-self: stretch; justify-content: center; }
        .pcr-fee { font-size: 17px; font-weight: 800; color: #0f3d24; line-height: 1.2; }
        .pcr-fee small { display: block; font-size: 11.5px; font-weight: 600; color: #64748b; margin-top: 2px; }
        .pcr-book { display: block; text-align: center; padding: 10px 0; border-radius: 10px; background: linear-gradient(135deg, #1a6b3a, #0f3d24); color: #fff !important; font-size: 13.5px; font-weight: 800; text-decoration: none; box-shadow: 0 6px 14px -6px rgba(15,61,36,.5); }
        .pcr-book:hover { filter: brightness(1.12); }
        .pcr-view { display: block; text-align: center; padding: 9px 0; border-radius: 10px; border: 1.5px solid #cfdcd4; color: #26463a !important; font-size: 13px; font-weight: 700; text-decoration: none; }
        .pcr-view:hover { border-color: #166534; color: #166534 !important; }

        .pcr-bk { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 9px; border: 1.5px solid #e3ebe6; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .pcr-bk:hover, .pcr-bk.on { border-color: #fde68a; background: #fffbeb; }
        .pcr-main { padding-right: 36px; }

        @media (max-width: 767px) {
          .pcr { grid-template-columns: 84px minmax(0, 1fr); gap: 12px 14px; padding: 14px; border-radius: 14px; align-items: start; }
          .pcr-photo { width: 84px; height: 84px; border-radius: 12px; }
          .pcr-name { font-size: 16px; }
          .pcr-role { font-size: 12.5px; }
          .pcr-meta { font-size: 12px; gap: 3px 10px; }
          .pcr-specs { display: none; }
          .pcr-side { grid-column: 1 / -1; flex-direction: row; align-items: center; padding: 12px 0 0; border-left: none; border-top: 1px dashed #dfe8e2; }
          .pcr-fee { flex: 1; font-size: 15px; }
          .pcr-book, .pcr-view { padding: 9px 14px; font-size: 12.5px; }
        }
      ` }} />

      <Link href={profileHref} className="pcr-photo" aria-label={`${name} — view profile`}>
        <ImageTag alt={name} src={`${imagePath}/${data.user?.profile}`} />
        {data.priority === 1 && <span className="pcr-badge top">★ Top Pick</span>}
        {data.priority === 2 && <span className="pcr-badge ver">✓ Verified</span>}
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
              <StarIcon sx={{ color: "#f59e0b", fontSize: 16 }} /> <b>{avg}</b> <small>({reviews.length} reviews)</small>
            </span>
          )}
          {exp && <span><i className="feather-briefcase" /> {exp} experience</span>}
          {langs.length > 0 && <span><i className="feather-globe" /> {langs.slice(0, 3).join(", ")}</span>}
          {data.state && <span><i className="feather-map-pin" /> {data.state}</span>}
        </div>
        {expertise.length > 0 && (
          <div className="pcr-specs" aria-label="Areas of expertise">
            <span className="pcr-specs-label">Expertise:</span>
            {expertise.slice(0, 4).map((s) => <span key={s} className="pcr-spec">{s}</span>)}
            {expertise.length > 4 && <span className="pcr-spec more">+{expertise.length - 4} more</span>}
          </div>
        )}
      </div>

      <div className="pcr-side">
        <div className="pcr-fee">
          {price && price !== "--" ? <>{price}<small>per session</small></> : <>Fees on request<small>ask while booking</small></>}
        </div>
        <Link href={`/book/${data._id}`} className="pcr-book">Book Now</Link>
        <Link href={profileHref} className="pcr-view">View Profile</Link>
      </div>

      {showBookmark && (
        <button type="button" className={`pcr-bk${bookmark ? " on" : ""}`} onClick={handleBookmark}
          aria-label={bookmark ? "Remove from saved therapists" : "Save therapist"} aria-pressed={bookmark}>
          {bookmark
            ? <BookmarkAddedIcon sx={{ fontSize: 17, color: "#f59e0b" }} />
            : <BookmarkBorderIcon sx={{ fontSize: 17, color: "#94a3b8" }} />}
        </button>
      )}
    </article>
  );
}

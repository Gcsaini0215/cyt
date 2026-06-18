import Link from "next/link";
import ImageTag from "../../utils/image-tag";
import { getMinMaxPrice } from "../../utils/helpers";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import React, { useState, useEffect } from "react";
import { postData } from "../../utils/actions";
import {
  imagePath,
  InsertFavriouteTherapistUrl,
  RemoveFavriouteTherapistUrl,
} from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";
import StarIcon from "@mui/icons-material/Star";

const typeColors = {
  psychologist:  { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  counsellor:    { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe" },
  counselor:     { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe" },
  therapist:     { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
  psychiatrist:  { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "life coach":  { bg: "#fef9c3", color: "#92400e", border: "#fde68a" },
  coach:         { bg: "#fef9c3", color: "#92400e", border: "#fde68a" },
  default:       { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
};

function getTypeColor(profileType) {
  if (!profileType) return typeColors.default;
  const key = profileType.toLowerCase();
  for (const k of Object.keys(typeColors)) {
    if (key.includes(k)) return typeColors[k];
  }
  return typeColors.default;
}

export default function ProfileCardVert({ data, favrioutes }) {
  const [bookmark, setBookmark] = useState(favrioutes?.includes(data._id) || false);
  const [showBookmark, setShowBookmark] = useState(true);
  const [fees, setFees] = useState([]);

  const reviews = data.reviews || [];
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : null;

  const serviceChips = data.services
    ? data.services.split(",").map(s => s.trim()).filter(Boolean).slice(0, 2)
    : [];
  const firstLang = data.language_spoken?.split(",")[0]?.trim() || "";

  useEffect(() => {
    const token = getDecodedToken();
    if (token && token.role === 1) setShowBookmark(false);
    setBookmark(favrioutes?.includes(data._id) || false);
    setFees(data.fees || []);
  }, [data, favrioutes]);

  const handleBookmark = (id, val) => {
    setBookmark(p => !p);
    if (!val) postData(InsertFavriouteTherapistUrl, { therapistId: id }).catch(() => {});
    else postData(RemoveFavriouteTherapistUrl, { therapistId: id }).catch(() => {});
  };

  const price = getMinMaxPrice(fees);

  return (
    <div style={{ height: "100%" }}>
      <style>{`
        .vtc-card {
          display: flex;
          flex-direction: row;
          border-radius: 18px;
          background: #fff;
          border: 1px solid #eef2f7;
          box-shadow: 0 3px 16px rgba(0,0,0,.06);
          overflow: hidden;
          height: 100%;
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s;
        }
        .vtc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 34px rgba(0,0,0,.11);
          border-color: #bbf7d0;
        }

        /* ── Left: image ─────────────────────── */
        .vtc-img-col {
          width: 150px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          background: #e8f5e9;
        }
        .vtc-img {
          display: block;
          width: 150px;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform .5s ease;
        }
        .vtc-card:hover .vtc-img { transform: scale(1.07); }

        /* right fade on image */
        .vtc-img-fade {
          position: absolute;
          top: 0; right: 0;
          width: 28px; height: 100%;
          background: linear-gradient(to right, transparent, #fff);
          pointer-events: none;
          z-index: 2;
        }

        /* priority badge */
        .vtc-pri {
          position: absolute;
          bottom: 10px; left: 8px; z-index: 3;
          font-size: 10px; font-weight: 800;
          padding: 3px 8px; border-radius: 20px; color: #fff;
        }
        .vtc-pri.rec { background: rgba(34,135,86,.9); }
        .vtc-pri.ver { background: rgba(37,99,235,.9); }

        /* ── Right: content ──────────────────── */
        .vtc-body {
          flex: 1;
          min-width: 0;
          padding: 14px 15px 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        /* name row */
        .vtc-name-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 6px;
        }
        .vtc-name {
          font-size: 15.5px;
          font-weight: 800;
          color: #1e293b;
          text-decoration: none;
          line-height: 1.25;
          flex: 1;
          min-width: 0;
        }
        .vtc-name:hover { color: #228756; }

        /* bookmark */
        .vtc-bk {
          width: 30px; height: 30px; flex-shrink: 0;
          border-radius: 8px; border: 1.5px solid #e8edf2;
          background: #f8fafc;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .2s; margin-top: 1px;
        }
        .vtc-bk:hover, .vtc-bk.on { border-color: #fde68a; background: #fffbeb; }

        /* type badge */
        .vtc-type {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11.5px; font-weight: 700;
          padding: 4px 10px; border-radius: 20px;
          width: fit-content; letter-spacing: .2px;
        }
        .vtc-type-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }

        /* rating row */
        .vtc-rating {
          display: inline-flex; align-items: center; gap: 3px;
          background: #fffbeb; border: 1px solid #fde68a;
          border-radius: 20px; padding: 2px 8px;
          width: fit-content;
        }
        .vtc-rating span { font-size: 12px; font-weight: 700; color: #92400e; }

        /* meta row */
        .vtc-meta {
          display: flex; align-items: center;
          flex-wrap: wrap; gap: 3px;
        }
        .vtc-meta-it {
          display: flex; align-items: center; gap: 3px;
          font-size: 12px; color: #64748b; font-weight: 600;
        }
        .vtc-meta-it i { color: #228756; font-size: 11px; }
        .vtc-sep { color: #e2e8f0; font-size: 11px; margin: 0 2px; }

        /* price */
        .vtc-price {
          font-size: 14px; font-weight: 800; color: #228756;
        }

        /* chips */
        .vtc-chips { display: flex; flex-wrap: wrap; gap: 5px; }
        .vtc-chip {
          background: #f8fafc; color: #475569;
          font-size: 11px; font-weight: 700;
          padding: 2px 9px; border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        /* action buttons */
        .vtc-btns { display: flex; gap: 6px; margin-top: auto; }
        .vtc-btn-out {
          flex: 1; text-align: center; display: block;
          padding: 8px 0; border-radius: 9px;
          border: 1.5px solid #e2e8f0; color: #475569;
          font-weight: 700; font-size: 12px; text-decoration: none;
          transition: all .2s;
        }
        .vtc-btn-out:hover { border-color: #228756; color: #228756; }
        .vtc-btn-fill {
          flex: 1.3; text-align: center; display: block;
          padding: 8px 0; border-radius: 9px;
          background: linear-gradient(135deg, #228756, #1a6b44);
          color: #fff; font-weight: 700; font-size: 12px;
          text-decoration: none;
          box-shadow: 0 3px 10px rgba(34,135,86,.22);
          transition: all .2s;
        }
        .vtc-btn-fill:hover {
          box-shadow: 0 6px 16px rgba(34,135,86,.32);
          transform: translateY(-1px);
        }

        /* ── Mobile (<576px) ─────────────────── */
        @media(max-width: 575px) {
          .vtc-img-col { width: 110px; }
          .vtc-img { width: 110px; }
          .vtc-body { padding: 11px 12px 12px 10px; gap: 6px; }
          .vtc-name { font-size: 14px; }
          .vtc-btn-out, .vtc-btn-fill { font-size: 11.5px; padding: 7px 0; }
          .vtc-chips { display: none; }
        }
      `}</style>

      <div className="vtc-card">

        {/* ── Image column ──────────────────────── */}
        <div className="vtc-img-col">
          <Link href={`/view-profile/${data._id}`} style={{ display: "block", height: "100%" }}>
            <ImageTag
              alt={data.user?.name || "Therapist"}
              className="vtc-img"
              src={`${imagePath}/${data.user?.profile}`}
            />
          </Link>
          {/* right-edge fade to blend into white card */}
          <div className="vtc-img-fade"></div>

          {data.priority === 1 && <span className="vtc-pri rec">★ Top Pick</span>}
          {data.priority === 2 && <span className="vtc-pri ver">✓ Verified</span>}
        </div>

        {/* ── Content column ────────────────────── */}
        <div className="vtc-body">

          {/* Name + bookmark */}
          <div className="vtc-name-row">
            <Link href={`/view-profile/${data._id}`} className="vtc-name">
              {data.user?.name || "Therapist"}
            </Link>
            {showBookmark && (
              <button
                className={`vtc-bk${bookmark ? " on" : ""}`}
                onClick={() => handleBookmark(data._id, bookmark)}
              >
                {bookmark
                  ? <BookmarkAddedIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                  : <BookmarkBorderIcon sx={{ fontSize: 16, color: "#94a3b8" }} />}
              </button>
            )}
          </div>

          {/* Profile type */}
          {data.profile_type && (() => {
            const tc = getTypeColor(data.profile_type);
            return (
              <span className="vtc-type" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                <span className="vtc-type-dot" style={{ background: tc.color }}></span>
                {data.profile_type}
              </span>
            );
          })()}

          {/* Rating */}
          {avgRating && (
            <div className="vtc-rating">
              <StarIcon sx={{ color: "#f59e0b", fontSize: 13 }} />
              <span>{avgRating} ({reviewCount} reviews)</span>
            </div>
          )}

          {/* Location · Exp · Language */}
          <div className="vtc-meta">
            {data.state && (
              <>
                <div className="vtc-meta-it">
                  <i className="feather-map-pin"></i>{data.state}
                </div>
                {(data.year_of_exp || firstLang) && <span className="vtc-sep">·</span>}
              </>
            )}
            {data.year_of_exp && (
              <>
                <div className="vtc-meta-it">
                  <i className="feather-briefcase"></i>{data.year_of_exp}
                </div>
                {firstLang && <span className="vtc-sep">·</span>}
              </>
            )}
            {firstLang && (
              <div className="vtc-meta-it">
                <i className="feather-globe"></i>{firstLang}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="vtc-price">{price}</div>

          {/* Specialty chips */}
          {serviceChips.length > 0 && (
            <div className="vtc-chips">
              {serviceChips.map(s => <span key={s} className="vtc-chip">{s}</span>)}
            </div>
          )}

          {/* Buttons */}
          <div className="vtc-btns">
            <Link href={`/view-profile/${data._id}`} className="vtc-btn-out">
              View Profile
            </Link>
            <Link href={`/book/${data._id}`} className="vtc-btn-fill">
              Book Now
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import ImageTag from "../../utils/image-tag";
import { getMinMaxPrice } from "../../utils/helpers";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import React, { useState, useEffect } from "react";
import { postData } from "../../utils/actions";
import { imagePath, InsertFavriouteTherapistUrl, RemoveFavriouteTherapistUrl } from "../../utils/url";
import { getDecodedToken } from "../../utils/jwt";
import StarIcon from "@mui/icons-material/Star";

const typeColors = {
  psychologist: { bg:"#dbeafe", color:"#1d4ed8", border:"#bfdbfe" },
  counsellor:   { bg:"#ede9fe", color:"#6d28d9", border:"#ddd6fe" },
  counselor:    { bg:"#ede9fe", color:"#6d28d9", border:"#ddd6fe" },
  therapist:    { bg:"#f0fdf4", color:"#166534", border:"#bbf7d0" },
  psychiatrist: { bg:"#fff7ed", color:"#c2410c", border:"#fed7aa" },
  "life coach": { bg:"#fef9c3", color:"#92400e", border:"#fde68a" },
  coach:        { bg:"#fef9c3", color:"#92400e", border:"#fde68a" },
  default:      { bg:"#f1f5f9", color:"#475569", border:"#e2e8f0" },
};

function getTypeColor(pt) {
  if (!pt) return typeColors.default;
  const k = pt.toLowerCase();
  for (const key of Object.keys(typeColors)) { if (k.includes(key)) return typeColors[key]; }
  return typeColors.default;
}

export default function ProfileCardVert({ data, favrioutes }) {
  const [bookmark, setBookmark] = useState(favrioutes?.includes(data._id) || false);
  const [showBookmark, setShowBookmark] = useState(true);
  const [fees, setFees] = useState([]);

  const reviews = data.reviews || [];
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviewCount).toFixed(1)
    : null;

  const serviceChips = data.services
    ? data.services.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3)
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
  const tc = getTypeColor(data.profile_type);
  const initials = (data.user?.name || "T").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ height:"100%" }}>
      <style>{`
        .pvc {
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #eef2f7;
          box-shadow: 0 2px 14px rgba(0,0,0,.06);
          overflow: hidden;
          height: 100%;
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s;
          position: relative;
        }
        .pvc:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,.12);
          border-color: #bbf7d0;
        }

        /* ── Photo ── */
        .pvc-photo {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: linear-gradient(135deg,#e8f5e9,#dbeafe);
          flex-shrink: 0;
        }
        .pvc-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform .5s ease;
          display: block;
        }
        .pvc:hover .pvc-photo img { transform: scale(1.06); }

        /* photo fallback initials */
        .pvc-initials {
          position: absolute; inset:0;
          display: flex; align-items: center; justify-content: center;
          font-size: 42px; font-weight: 900; color: #228756;
          opacity: .18; pointer-events:none; user-select:none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        /* gradient overlay on photo bottom */
        .pvc-photo-grad {
          position: absolute; bottom:0; left:0; right:0; height:80px;
          background: linear-gradient(to top, rgba(0,0,0,.48), transparent);
          pointer-events: none;
        }

        /* rating pill on photo */
        .pvc-rating-pill {
          position: absolute; bottom:10px; left:12px;
          display: inline-flex; align-items:center; gap:4px;
          background: rgba(255,255,255,.95);
          border-radius: 20px; padding: 3px 10px 3px 7px;
          box-shadow: 0 2px 8px rgba(0,0,0,.18);
        }
        .pvc-rating-pill span { font-size:12px; font-weight:800; color:#0f172a; }

        /* bookmark */
        .pvc-bk {
          position: absolute; top:10px; right:10px;
          width:34px; height:34px; border-radius:10px;
          background:rgba(255,255,255,.92); border:none;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.14);
          transition:all .2s; backdrop-filter:blur(4px);
        }
        .pvc-bk:hover { background:#fff; transform:scale(1.08); }

        /* badge top-left */
        .pvc-badge {
          position:absolute; top:10px; left:10px;
          font-size:10px; font-weight:800;
          padding:3px 9px; border-radius:20px; color:#fff;
          letter-spacing:.3px;
        }
        .pvc-badge-top  { background:rgba(34,135,86,.92); }
        .pvc-badge-ver  { background:rgba(37,99,235,.92); }

        /* ── Body ── */
        .pvc-body {
          flex:1; display:flex; flex-direction:column;
          padding: 16px 16px 14px;
          gap: 8px;
        }

        /* name */
        .pvc-name {
          font-size:16px; font-weight:800; color:#0f172a;
          text-decoration:none; line-height:1.25;
          display:block;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .pvc-name:hover { color:#228756; }

        /* type badge */
        .pvc-type {
          display:inline-flex; align-items:center; gap:5px;
          font-size:11.5px; font-weight:700;
          padding:4px 11px; border-radius:20px;
          width:fit-content;
        }
        .pvc-type-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

        /* meta row */
        .pvc-meta { display:flex; align-items:center; flex-wrap:wrap; gap:5px; }
        .pvc-meta-it { display:flex; align-items:center; gap:4px; font-size:12px; color:#64748b; font-weight:600; }
        .pvc-meta-it svg { color:#10b981; flex-shrink:0; }
        .pvc-dot { color:#d1d5db; font-size:10px; }

        /* price */
        .pvc-price-row { display:flex; align-items:baseline; gap:6px; }
        .pvc-price { font-size:15px; font-weight:900; color:#228756; }
        .pvc-price-label { font-size:11.5px; color:#94a3b8; font-weight:600; }

        /* chips */
        .pvc-chips { display:flex; flex-wrap:wrap; gap:5px; }
        .pvc-chip {
          background:#f8fafc; color:#475569;
          font-size:11px; font-weight:700;
          padding:3px 10px; border-radius:20px;
          border:1px solid #e2e8f0;
          white-space:nowrap;
        }

        /* divider */
        .pvc-div { height:1px; background:#f1f5f9; margin:2px 0; }

        /* buttons */
        .pvc-btns { display:flex; gap:7px; margin-top:auto; padding-top:4px; }
        .pvc-btn-out {
          flex:1; text-align:center; display:block;
          padding:9px 0; border-radius:11px;
          border:1.5px solid #e2e8f0; color:#475569;
          font-weight:700; font-size:12.5px; text-decoration:none;
          transition:all .2s; font-family:inherit;
        }
        .pvc-btn-out:hover { border-color:#228756; color:#228756; background:#f0fdf4; }
        .pvc-btn-fill {
          flex:1.4; text-align:center; display:block;
          padding:9px 0; border-radius:11px;
          background:linear-gradient(135deg,#228756,#1a6b44);
          color:#fff; font-weight:800; font-size:12.5px;
          text-decoration:none;
          box-shadow:0 3px 12px rgba(34,135,86,.25);
          transition:all .2s; font-family:inherit;
        }
        .pvc-btn-fill:hover { box-shadow:0 6px 20px rgba(34,135,86,.38); transform:translateY(-1px); color:#fff; text-decoration:none; }

        /* ── Mobile ── */
        @media(max-width:575px){
          .pvc-photo { height:170px; }
          .pvc-body { padding:13px 13px 12px; gap:7px; }
          .pvc-name { font-size:15px; }
          .pvc-chips { display:none; }
          .pvc-btn-out, .pvc-btn-fill { font-size:12px; padding:8px 0; }
        }
      `}</style>

      <div className="pvc">

        {/* ── Photo ── */}
        <div className="pvc-photo">
          <div className="pvc-initials">{initials}</div>
          <Link href={`/view-profile/${data._id}`} style={{ display:"block", height:"100%" }}>
            <ImageTag
              alt={data.user?.name || "Therapist"}
              src={`${imagePath}/${data.user?.profile}`}
              style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }}
            />
          </Link>
          <div className="pvc-photo-grad" />

          {/* Rating pill */}
          {avgRating && (
            <div className="pvc-rating-pill">
              <StarIcon sx={{ color:"#f59e0b", fontSize:13 }} />
              <span>{avgRating}</span>
              <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>({reviewCount})</span>
            </div>
          )}

          {/* Priority badge */}
          {data.priority === 1 && <span className="pvc-badge pvc-badge-top">★ Top Pick</span>}
          {data.priority === 2 && <span className="pvc-badge pvc-badge-ver">✓ Verified</span>}

          {/* Bookmark */}
          {showBookmark && (
            <button className="pvc-bk" onClick={() => handleBookmark(data._id, bookmark)} aria-label="Save">
              {bookmark
                ? <BookmarkAddedIcon sx={{ fontSize:17, color:"#f59e0b" }} />
                : <BookmarkBorderIcon sx={{ fontSize:17, color:"#94a3b8" }} />}
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div className="pvc-body">

          {/* Name */}
          <Link href={`/view-profile/${data._id}`} className="pvc-name">
            {data.user?.name || "Therapist"}
          </Link>

          {/* Type */}
          {data.profile_type && (
            <span className="pvc-type" style={{ background:tc.bg, color:tc.color, border:`1px solid ${tc.border}` }}>
              <span className="pvc-type-dot" style={{ background:tc.color }} />
              {data.profile_type}
            </span>
          )}

          {/* Meta */}
          <div className="pvc-meta">
            {data.state && (
              <>
                <div className="pvc-meta-it">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {data.state}
                </div>
                {(data.year_of_exp || firstLang) && <span className="pvc-dot">•</span>}
              </>
            )}
            {data.year_of_exp && (
              <>
                <div className="pvc-meta-it">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                  {data.year_of_exp} Yrs
                </div>
                {firstLang && <span className="pvc-dot">•</span>}
              </>
            )}
            {firstLang && (
              <div className="pvc-meta-it">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                {firstLang}
              </div>
            )}
          </div>

          {/* Price */}
          {price && (
            <div className="pvc-price-row">
              <span className="pvc-price">{price}</span>
              <span className="pvc-price-label">per session</span>
            </div>
          )}

          {/* Specialty chips */}
          {serviceChips.length > 0 && (
            <div className="pvc-chips">
              {serviceChips.map(s => <span key={s} className="pvc-chip">{s}</span>)}
            </div>
          )}

          <div className="pvc-div" />

          {/* Buttons */}
          <div className="pvc-btns">
            <Link href={`/view-profile/${data._id}`} className="pvc-btn-out">View Profile</Link>
            <Link href={`/book/${data._id}`} className="pvc-btn-fill">Book Now</Link>
          </div>

        </div>
      </div>
    </div>
  );
}

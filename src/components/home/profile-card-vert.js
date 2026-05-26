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

export default function ProfileCardVert({ data, favrioutes }) {
  const [isSm, setIsSm] = useState(false);
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
    const mq = window.matchMedia("(max-width: 575px)");
    setIsSm(mq.matches);
    const h = e => setIsSm(e.matches);
    mq.addListener(h);
    return () => mq.removeListener(h);
  }, []);

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
          border-radius: 22px;
          background: #fff;
          overflow: hidden;
          border: 1px solid #eef2f7;
          box-shadow: 0 4px 20px rgba(0,0,0,.06);
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform .3s ease, box-shadow .3s ease, border-color .3s;
        }
        .vtc-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 20px 50px rgba(0,0,0,.12);
          border-color: #c7ecd8;
        }

        /* ── Image ────────────────────────────── */
        .vtc-img-box { position: relative; overflow: hidden; flex-shrink: 0; background: #e8f5e9; }
        .vtc-img {
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          object-position: center top;
          transition: transform .55s ease;
        }
        .vtc-card:hover .vtc-img { transform: scale(1.06); }

        /* gradient overlay */
        .vtc-grad {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,.75) 0%,
            rgba(0,0,0,.25) 45%,
            transparent 72%
          );
          pointer-events: none;
        }

        /* name + type + rating in overlay */
        .vtc-ov {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 14px 14px 14px;
          pointer-events: none;
        }
        .vtc-ov-name {
          color: #fff;
          font-size: 18px;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 5px;
          text-shadow: 0 1px 6px rgba(0,0,0,.4);
        }
        .vtc-ov-bottom { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
        .vtc-ov-type {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(34,135,86,.8);
          color: #fff;
          font-size: 11px; font-weight: 700;
          padding: 3px 9px; border-radius: 20px;
        }
        .vtc-ov-star {
          display: flex; align-items: center; gap: 3px;
          background: rgba(0,0,0,.35);
          backdrop-filter: blur(6px);
          border-radius: 20px;
          padding: 3px 9px;
        }
        .vtc-ov-star span { color: #fde68a; font-size: 12px; font-weight: 800; }

        /* price badge — top right */
        .vtc-price {
          position: absolute; top: 12px; right: 12px; z-index: 3;
          background: rgba(255,255,255,.95);
          color: #1e293b;
          font-size: 13px; font-weight: 800;
          padding: 4px 12px; border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,.15);
          backdrop-filter: blur(4px);
        }

        /* priority badge — top left */
        .vtc-pri {
          position: absolute; top: 12px; left: 12px; z-index: 3;
          font-size: 11px; font-weight: 700;
          padding: 4px 11px; border-radius: 20px; color: #fff;
        }
        .vtc-pri.rec { background: rgba(34,135,86,.88); }
        .vtc-pri.ver { background: rgba(37,99,235,.88); }

        /* ── Card body ────────────────────────── */
        .vtc-body {
          padding: 14px 16px 16px;
          display: flex; flex-direction: column; gap: 10px;
          flex: 1;
        }

        /* meta row: location · exp · language */
        .vtc-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
        .vtc-meta-it {
          display: flex; align-items: center; gap: 4px;
          font-size: 13px; color: #64748b; font-weight: 600;
        }
        .vtc-meta-it i { color: #228756; font-size: 12px; }
        .vtc-sep { color: #cbd5e1; font-size: 11px; margin: 0 2px; }

        /* specialty chips */
        .vtc-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .vtc-chip {
          background: #f0fdf4; color: #166534;
          font-size: 11.5px; font-weight: 700;
          padding: 4px 11px; border-radius: 20px;
          border: 1px solid #bbf7d0;
        }

        /* action row */
        .vtc-act { display: flex; gap: 7px; align-items: center; margin-top: auto; padding-top: 2px; }
        .vtc-bk {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          border: 1.5px solid #e2e8f0; background: #f8fafc;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .2s;
        }
        .vtc-bk:hover, .vtc-bk.on { border-color: #fde68a; background: #fffbeb; }
        .vtc-btn-out {
          flex: 1; display: block; text-align: center;
          padding: 10px 0; border-radius: 11px;
          border: 1.5px solid #e2e8f0; color: #475569;
          font-weight: 700; font-size: 13px; text-decoration: none;
          transition: all .2s;
        }
        .vtc-btn-out:hover { border-color: #228756; color: #228756; background: #f0fdf4; }
        .vtc-btn-fill {
          flex: 1.4; display: block; text-align: center;
          padding: 10px 0; border-radius: 11px;
          background: linear-gradient(135deg, #228756, #1a6b44);
          color: #fff; font-weight: 700; font-size: 13px;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(34,135,86,.25);
          transition: all .2s;
        }
        .vtc-btn-fill:hover {
          box-shadow: 0 8px 22px rgba(34,135,86,.35);
          transform: translateY(-1px);
        }

        /* ── Mobile tweaks (<576px) ──────────── */
        @media(max-width: 575px) {
          .vtc-card { border-radius: 18px; }
          .vtc-ov-name { font-size: 16px; }
          .vtc-body { padding: 12px 13px 14px; gap: 9px; }
          .vtc-price { font-size: 12px; padding: 3px 9px; top: 8px; right: 8px; }
          .vtc-pri { font-size: 10px; padding: 3px 8px; top: 8px; left: 8px; }
          .vtc-btn-out, .vtc-btn-fill { font-size: 12.5px; padding: 9px 0; }
          .vtc-bk { width: 36px; height: 36px; }
        }
      `}</style>

      <div className="vtc-card">

        {/* ── Image section ───────────────────── */}
        <div className="vtc-img-box">
          <Link href={`/view-profile/${data._id}`}>
            <ImageTag
              alt={data.user?.name || "Therapist"}
              className="vtc-img"
              src={`${imagePath}/${data.user?.profile}`}
            />
            <div className="vtc-grad"></div>

            {/* Name + type + rating overlay */}
            <div className="vtc-ov">
              <div className="vtc-ov-name">{data.user?.name || "Therapist"}</div>
              <div className="vtc-ov-bottom">
                <span className="vtc-ov-type">
                  <i className="feather-user" style={{ fontSize: 11 }}></i>
                  {data.profile_type}
                </span>
                {avgRating && (
                  <div className="vtc-ov-star">
                    <StarIcon sx={{ color: "#fbbf24", fontSize: 13 }} />
                    <span>{avgRating} ({reviewCount})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price — top right */}
            <div className="vtc-price">{price}</div>

            {/* Priority badge — top left */}
            {data.priority === 1 && <span className="vtc-pri rec">★ Recommended</span>}
            {data.priority === 2 && <span className="vtc-pri ver">✓ Verified</span>}
          </Link>
        </div>

        {/* ── Card body ───────────────────────── */}
        <div className="vtc-body">

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

          {/* Specialty chips */}
          {serviceChips.length > 0 && (
            <div className="vtc-chips">
              {serviceChips.map(s => <span key={s} className="vtc-chip">{s}</span>)}
            </div>
          )}

          {/* Bookmark + buttons */}
          <div className="vtc-act">
            {showBookmark && (
              <button
                className={`vtc-bk${bookmark ? " on" : ""}`}
                onClick={() => handleBookmark(data._id, bookmark)}
              >
                {bookmark
                  ? <BookmarkAddedIcon sx={{ fontSize: 19, color: "#f59e0b" }} />
                  : <BookmarkBorderIcon sx={{ fontSize: 19, color: "#94a3b8" }} />}
              </button>
            )}
            <Link href={`/view-profile/${data._id}`} className="vtc-btn-out">
              View Profile
            </Link>
            <Link href={`/therapist-checkout/${data._id}`} className="vtc-btn-fill">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

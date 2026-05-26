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
  const [isMobile, setIsMobile] = useState(false);
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
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const h = (e) => setIsMobile(e.matches);
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
    <div className="vtc-root">
      <style>{`
        .vtc-root { height: 100%; }
        .vtc-card { border-radius:18px; background:#fff; border:1px solid #f1f5f9; box-shadow:0 4px 20px rgba(0,0,0,.05); overflow:hidden; display:flex; flex-direction:column; height:100%; transition:transform .25s,box-shadow .25s,border-color .25s; }
        .vtc-card:hover { transform:translateY(-5px); box-shadow:0 12px 36px rgba(0,0,0,.1); border-color:#c7ecd8; }
        .vtc-img-box { position:relative; overflow:hidden; flex-shrink:0; }
        .vtc-img { display:block; width:100%; aspect-ratio:4/3; object-fit:cover; object-position:center top; transition:transform .45s ease; }
        .vtc-card:hover .vtc-img { transform:scale(1.06); }
        .vtc-grad { position:absolute; bottom:0; left:0; right:0; height:55%; background:linear-gradient(to top,rgba(0,0,0,.5),transparent); pointer-events:none; }
        .vtc-price { position:absolute; bottom:10px; left:12px; background:#fff; color:#1e293b; font-size:13px; font-weight:800; padding:4px 10px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.15); z-index:2; }
        .vtc-badge { position:absolute; top:10px; left:10px; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; color:#fff; z-index:2; backdrop-filter:blur(6px); }
        .vtc-badge.rec { background:rgba(34,135,86,.88); }
        .vtc-badge.ver { background:rgba(37,99,235,.88); }
        .vtc-body { padding:16px; display:flex; flex-direction:column; gap:10px; flex:1; }
        .vtc-name { font-size:17px; font-weight:800; color:#1e293b; text-decoration:none; line-height:1.2; }
        .vtc-name:hover { color:#228756; }
        .vtc-type { display:inline-flex; align-items:center; gap:4px; background:#f0fdf4; color:#228756; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; }
        .vtc-loc { font-size:12px; color:#64748b; font-weight:600; display:flex; align-items:center; gap:3px; }
        .vtc-pill { background:#f8fafc; color:#475569; font-size:12px; font-weight:600; padding:4px 10px; border-radius:8px; display:flex; align-items:center; gap:5px; border:1px solid #f1f5f9; }
        .vtc-pill i { color:#228756; font-size:12px; }
        .vtc-chip { background:#f0fdf4; color:#166534; font-size:11px; font-weight:700; padding:3px 9px; border-radius:20px; }
        .vtc-bk { border:none; background:#f8fafc; width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:background .2s; border:1px solid #f1f5f9; }
        .vtc-bk:hover { background:#fff7ed; }
        .vtc-star { display:flex; align-items:center; gap:2px; background:#fffbeb; border:1px solid #fde68a; padding:2px 7px; border-radius:20px; }
        .vtc-btn-row { display:flex; gap:8px; margin-top:auto; padding-top:4px; }
        .vtc-btn-out { flex:1; text-align:center; padding:9px 0; border-radius:10px; border:1.5px solid #e2e8f0; color:#475569; font-weight:700; font-size:13px; text-decoration:none; transition:all .2s; }
        .vtc-btn-out:hover { border-color:#228756; color:#228756; }
        .vtc-btn-fill { flex:1; text-align:center; padding:9px 0; border-radius:10px; background:#228756; color:#fff; font-weight:700; font-size:13px; text-decoration:none; transition:all .2s; box-shadow:0 4px 12px rgba(34,135,86,.22); }
        .vtc-btn-fill:hover { background:#1a6b44; transform:translateY(-1px); box-shadow:0 6px 16px rgba(34,135,86,.3); }

        /* ── Mobile: horizontal card ─────────────── */
        @media(max-width:767px){
          .vtc-card { flex-direction:row; height:auto; }
          .vtc-img-box { width:120px; min-height:150px; flex-shrink:0; border-radius:0; }
          .vtc-img { width:120px; height:100%; aspect-ratio:unset; }
          .vtc-grad { height:40%; }
          .vtc-price { font-size:11px; padding:2px 7px; bottom:7px; left:7px; }
          .vtc-badge { font-size:10px; padding:2px 7px; top:7px; left:7px; }
          .vtc-body { padding:13px 13px 13px 14px; gap:7px; }
          .vtc-name { font-size:15px; }
          .vtc-chips-mob { display:none; }
          .vtc-pill { font-size:11px; padding:3px 8px; }
          .vtc-btn-row { gap:6px; }
          .vtc-btn-out, .vtc-btn-fill { font-size:12px; padding:7px 0; border-radius:8px; }
        }
      `}</style>

      <div className="vtc-card">
        {/* ── Image ───────────────────────────── */}
        <div className="vtc-img-box">
          <Link href={`/view-profile/${data._id}`}>
            <ImageTag
              alt={data.user?.name || "Therapist"}
              className="vtc-img"
              src={`${imagePath}/${data.user?.profile}`}
            />
            <div className="vtc-grad"></div>
            <div className="vtc-price">{price}</div>
            {data.priority === 1 && <span className="vtc-badge rec">★ Recommended</span>}
            {data.priority === 2 && <span className="vtc-badge ver">✓ Verified</span>}
          </Link>
        </div>

        {/* ── Body ────────────────────────────── */}
        <div className="vtc-body">
          {/* name row */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:6 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <Link href={`/view-profile/${data._id}`} className="vtc-name">
                {data.user?.name || "Therapist"}
              </Link>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginTop:4 }}>
                <span className="vtc-type">
                  <i className="feather-user" style={{ fontSize:11 }}></i>
                  {data.profile_type}
                </span>
                {data.state && (
                  <span className="vtc-loc">
                    <i className="feather-map-pin" style={{ fontSize:11 }}></i>
                    {data.state}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
              {avgRating && (
                <div className="vtc-star">
                  <StarIcon sx={{ color:"#f59e0b", fontSize:14 }} />
                  <span style={{ fontSize:12, fontWeight:700, color:"#92400e" }}>{avgRating}</span>
                  <span style={{ fontSize:11, color:"#b45309" }}>({reviewCount})</span>
                </div>
              )}
              {showBookmark && (
                <button className="vtc-bk" onClick={() => handleBookmark(data._id, bookmark)}>
                  {bookmark
                    ? <BookmarkAddedIcon sx={{ fontSize:18, color:"#f59e0b" }} />
                    : <BookmarkBorderIcon sx={{ fontSize:18, color:"#94a3b8" }} />}
                </button>
              )}
            </div>
          </div>

          {/* meta pills */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {data.year_of_exp && (
              <div className="vtc-pill">
                <i className="feather-briefcase"></i>{data.year_of_exp}
              </div>
            )}
            {firstLang && (
              <div className="vtc-pill">
                <i className="feather-globe"></i>{firstLang}
              </div>
            )}
          </div>

          {/* service chips — hidden on mobile */}
          {serviceChips.length > 0 && (
            <div className="vtc-chips-mob" style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {serviceChips.map(s => <span key={s} className="vtc-chip">{s}</span>)}
            </div>
          )}

          {/* action buttons */}
          <div className="vtc-btn-row">
            <Link href={`/view-profile/${data._id}`} className="vtc-btn-out">View Profile</Link>
            <Link href={`/therapist-checkout/${data._id}`} className="vtc-btn-fill">Book Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import ImageTag from "../../utils/image-tag";
import { truncateString } from "../../utils/helpers";
import { imagePath } from "../../utils/url";

export default function WellnessCard({ data }) {
  return (
    <>
      <style>{`
        .wc-card {
          display:flex; flex-direction:column;
          background:#fff; border-radius:18px;
          border:1px solid #f1f5f9;
          box-shadow:0 2px 12px rgba(0,0,0,.06);
          overflow:hidden; height:100%;
          text-decoration:none; position:relative;
          transition:transform .25s ease, box-shadow .25s ease;
        }
        .wc-card:hover {
          transform:translateY(-6px);
          box-shadow:0 18px 40px rgba(0,0,0,.13);
          border-color:#bbf7d0;
        }
        .wc-img-wrap {
          position:relative; overflow:hidden;
          aspect-ratio:16/9; flex-shrink:0;
        }
        .wc-img {
          width:100%; height:100%; object-fit:cover;
          transition:transform .5s ease;
          display:block;
        }
        .wc-card:hover .wc-img { transform:scale(1.06); }
        .wc-img-overlay {
          position:absolute; inset:0;
          background:linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 55%);
        }
        .wc-badge {
          position:absolute; top:12px; left:12px;
          background:rgba(34,135,86,.92); color:#fff;
          font-size:10px; font-weight:800;
          padding:4px 10px; border-radius:20px;
          letter-spacing:.4px; backdrop-filter:blur(4px);
        }
        .wc-price-badge {
          position:absolute; bottom:12px; right:12px;
          background:rgba(255,255,255,.95); color:#228756;
          font-size:13px; font-weight:900;
          padding:4px 10px; border-radius:20px;
          box-shadow:0 2px 8px rgba(0,0,0,.15);
        }
        .wc-body {
          padding:16px 18px 18px;
          display:flex; flex-direction:column; gap:10px; flex:1;
        }
        .wc-title {
          font-size:15px; font-weight:800;
          color:#1e293b; line-height:1.35; margin:0;
          display:-webkit-box; -webkit-line-clamp:2;
          -webkit-box-orient:vertical; overflow:hidden;
        }
        .wc-card:hover .wc-title { color:#228756; }
        .wc-meta {
          display:flex; align-items:center; gap:6px;
          font-size:12px; color:#64748b; font-weight:600;
        }
        .wc-meta i { color:#228756; font-size:12px; }
        .wc-footer {
          display:flex; align-items:center;
          justify-content:space-between; margin-top:auto;
        }
        .wc-price-wrap {}
        .wc-price-label { font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:.5px; }
        .wc-price { font-size:20px; font-weight:900; color:#228756; line-height:1; }
        .wc-mrp { font-size:12px; color:#cbd5e1; text-decoration:line-through; margin-left:4px; }
        .wc-cta {
          display:inline-flex; align-items:center; gap:5px;
          background:linear-gradient(135deg,#228756,#1a6b44);
          color:#fff; font-size:12.5px; font-weight:700;
          padding:8px 16px; border-radius:50px;
          text-decoration:none;
          box-shadow:0 4px 12px rgba(34,135,86,.25);
          transition:all .2s; white-space:nowrap;
        }
        .wc-card:hover .wc-cta {
          box-shadow:0 6px 18px rgba(34,135,86,.35);
          transform:translateY(-1px);
        }
        .wc-cta i { font-size:11px; transition:transform .2s; }
        .wc-card:hover .wc-cta i { transform:translateX(3px); }
      `}</style>

      <Link href={`/workshop-detail/${data._id}`} className="wc-card">

        {/* Image */}
        <div className="wc-img-wrap">
          <ImageTag
            alt={data.title}
            loading="lazy"
            className="wc-img"
            src={`${imagePath}/${data.workshop_image}`}
          />
          <div className="wc-img-overlay"></div>
          {data.category && <span className="wc-badge">{data.category}</span>}
          <span className="wc-price-badge">₹{data.price}</span>
        </div>

        {/* Body */}
        <div className="wc-body">
          <h4 className="wc-title">{data.title}</h4>

          {data.event_date && (
            <div className="wc-meta">
              <i className="feather-calendar"></i>
              <span>{data.event_date}</span>
              {data.event_time && (
                <>
                  <span style={{ color:"#e2e8f0" }}>·</span>
                  <i className="feather-clock"></i>
                  <span>{data.event_time}</span>
                </>
              )}
            </div>
          )}

          <div className="wc-footer">
            <div className="wc-price-wrap">
              <div className="wc-price-label">Investment</div>
              <div style={{ display:"flex", alignItems:"baseline" }}>
                <span className="wc-price">₹{data.price}</span>
                {data.mrp && <span className="wc-mrp">₹{data.mrp}</span>}
              </div>
            </div>
            <span className="wc-cta">
              Join Now <i className="feather-arrow-right"></i>
            </span>
          </div>
        </div>

      </Link>
    </>
  );
}

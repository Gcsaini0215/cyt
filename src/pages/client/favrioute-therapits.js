import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import ClientShell from "../../components/client/client-shell";
import { fetchById, postData } from "../../utils/actions";
import { GetFavoriteTherapistUrl, RemoveFavoriteTherapistUrl, imagePath } from "../../utils/url";
import { profilePath, bookPath } from "../../utils/therapist-slug";
import { cityOf, languagesOf, minFeeOf } from "../../utils/related-therapists";
import { usePager, Pager } from "../../components/therapists/pager";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";

/* Therapists the client saved with the heart on a profile / directory card. */

const photoOf = (t) => {
  const p = t?.user?.profile;
  if (!p || p === "null") return "";
  return /^https?:/.test(p) ? p : `${imagePath}/${p}`;
};

export default function SavedTherapists() {
  const [list, setList] = useState(null); // null = loading
  const [err, setErr] = useState("");
  const pg = usePager(list || [], 9);

  const load = () => {
    setErr("");
    fetchById(GetFavoriteTherapistUrl)
      .then((r) => setList(Array.isArray(r?.data) ? r.data : []))
      .catch(() => { setList([]); setErr("Couldn't load your saved therapists — please refresh"); });
  };
  useEffect(load, []);

  const remove = async (therapistId) => {
    const before = list;
    setList((l) => l.filter((f) => f.therapist._id !== therapistId));
    try {
      const r = await postData(RemoveFavoriteTherapistUrl, { therapistId });
      if (!r?.status) throw new Error(r?.message);
      toast.success("Removed from saved");
    } catch (e) {
      setList(before);
      toast.error(e?.response?.data?.message || e?.message || "Couldn't remove — please try again");
    }
  };

  return (
    <ClientShell title="My Shortlist">
      <style dangerouslySetInnerHTML={{ __html: SV_CSS }} />
      <div className="sv">
        <h1>My shortlist</h1>
        <p className="sv-sub">Therapists you saved with the <FavoriteRoundedIcon /> — book a session or view their profile.</p>

        {err && <p className="sv-err" role="alert">{err}</p>}

        {list === null ? (
          <div className="sv-grid">{[0, 1, 2].map((i) => <div key={i} className="sv-skel" />)}</div>
        ) : list.length === 0 ? (
          <div className="sv-empty">
            <FavoriteRoundedIcon />
            <b>No saved therapists yet</b>
            <p>Tap the heart on any therapist&apos;s card to keep them here for later.</p>
            <Link href="/client/find" className="sv-btn primary"><PersonSearchRoundedIcon /> Find a therapist</Link>
          </div>
        ) : (
          <div data-pager-scope>
          <div className="sv-grid">
            {pg.items.map(({ _id, therapist: t }) => {
              const photo = photoOf(t);
              const name = t.user?.name || "Therapist";
              const city = cityOf(t);
              const langs = languagesOf(t).slice(0, 3).join(", ");
              const fee = minFeeOf(t);
              return (
                <div key={_id} className="sv-card">
                  <button type="button" className="sv-heart" onClick={() => remove(t._id)} aria-label={`Remove ${name} from saved`} title="Remove from saved">
                    <FavoriteRoundedIcon />
                  </button>
                  <Link href={profilePath(t)} className="sv-top">
                    <span className="sv-av">{photo ? <img src={photo} alt="" /> : name.charAt(0)}</span>
                    <span className="sv-who">
                      <b>{name}</b>
                      <span>{t.profile_type || "Psychologist"}</span>
                    </span>
                  </Link>
                  <ul className="sv-meta">
                    {city && <li><PlaceRoundedIcon /> {city}</li>}
                    {langs && <li><TranslateRoundedIcon /> {langs}</li>}
                  </ul>
                  <div className="sv-foot">
                    <span className="sv-fee">{fee ? <>From <b>₹{fee.toLocaleString("en-IN")}</b></> : ""}</span>
                    <Link href={profilePath(t)} className="sv-btn ghost">Profile</Link>
                    <Link href={bookPath(t)} className="sv-btn primary">Book</Link>
                  </div>
                </div>
              );
            })}
          </div>
          <Pager pg={pg} noun="therapists" />
          </div>
        )}
      </div>
    </ClientShell>
  );
}

const SV_CSS = `
.sv h1 { font-size: clamp(21px, 2.4vw, 26px); font-weight: 800; margin: 0; letter-spacing: -.3px; color: #0f172a; font-family: inherit; }
.sv-sub { margin: 4px 0 16px; font-size: 14px; color: #64748b; }
.sv-sub svg { font-size: 16px; color: #e11d48; vertical-align: -3px; }
.sv-err { color: #dc2626; font-weight: 600; font-size: 13.5px; }
.sv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 12px; }
.sv-skel { height: 190px; border-radius: 16px; background: linear-gradient(90deg,#eef2f0 0%,#f7f9f8 40%,#eef2f0 80%); background-size: 600px 100%; animation: svsk 1.3s infinite linear; }
@keyframes svsk { from { background-position: -300px 0; } to { background-position: 300px 0; } }
.sv-card { position: relative; background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.sv-heart { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #fecdd3; background: #fff1f2; color: #e11d48; display: grid; place-items: center; cursor: pointer; }
.sv-heart:hover { background: #ffe4e6; } .sv-heart svg { font-size: 19px; }
.sv-top { display: flex; align-items: center; gap: 12px; padding-right: 40px; min-width: 0; color: #0f172a !important; text-decoration: none !important; }
.sv-av { width: 60px; height: 60px; border-radius: 16px; background: #e7f6ec; color: #166534; display: grid; place-items: center; font-weight: 800; font-size: 22px; flex-shrink: 0; overflow: hidden; }
.sv-av img { width: 100%; height: 100%; object-fit: cover; }
.sv-who { min-width: 0; }
.sv-who b { display: block; font-size: 16px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sv-who span { display: block; font-size: 12.5px; color: #64748b; margin-top: 2px; }
.sv-meta { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.sv-meta li { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sv-meta svg { font-size: 16px; color: #166534; flex-shrink: 0; }
.sv-foot { display: flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px solid #eef2f0; }
.sv-fee { flex: 1; font-size: 12.5px; color: #64748b; } .sv-fee b { color: #0f172a; font-size: 14px; }
.sv-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 14px; border-radius: 10px; font-size: 13.5px; font-weight: 800; text-decoration: none !important; border: 1px solid transparent; font-family: inherit; }
.sv-btn svg { font-size: 18px; }
.sv-btn.primary { background: linear-gradient(135deg, #14532d, #16a34a); color: #fff !important; }
.sv-btn.ghost { background: #fff; color: #166534 !important; border-color: #cfe3d6; }
.sv-empty { background: #fff; border: 1px dashed #cfe3d6; border-radius: 16px; padding: 34px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.sv-empty > svg { font-size: 38px; color: #fda4af; }
.sv-empty b { font-size: 16px; } .sv-empty p { margin: 0 0 10px; font-size: 13.5px; color: #64748b; }
`;

import React, { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import MainLayout from "../components/therapists/main-layout";
import { PT_CSS } from "../components/therapists/portal-ui";
import useTherapistStore from "../store/therapistStore";
import { deleteById, fetchById, postData } from "../utils/actions";
import {
  CreateCouponsUrl, DeleteCouponsUrl, GetCouponsUrl, SuggestCouponUrl, ToggleCouponStatusUrl, UpdateCouponsUrl,
} from "../utils/url";
import { CouponTicket, COUPON_TICKET_CSS, copyText, offerLabel, tillLabel } from "../components/global/coupon-ui";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

/* Therapist → Coupons. A therapist makes their own discount codes; live ones marked "show on profile"
   show in an Offers section on their public profile, and any code can be typed on the booking page.
   A use = a paid booking with the code (counted on the server). */

const STATE = {
  active: { label: "Live", cls: "ok" },
  paused: { label: "Paused", cls: "mut" },
  scheduled: { label: "Starts later", cls: "warn" },
  expired: { label: "Expired", cls: "mut" },
  used_up: { label: "Fully used", cls: "warn" },
};

// dates are picked as IST calendar days: valid from the start of the first day to the end of the last
const istDay = (d) => (d ? new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) : "");
const today = () => istDay(new Date());
const addDays = (n) => istDay(new Date(Date.now() + n * 864e5));
const PRESETS = [[7, "1 week"], [30, "1 month"], [90, "3 months"], [365, "1 year"]];

const blank = () => ({
  code: "", title: "", discount_type: "percentage", discount_value: "", max_usage: "50",
  valid_from: today(), valid_until: addDays(30), show_on_profile: true,
});

const errMsg = (e, fallback) => e?.response?.data?.message || e?.message || fallback;

const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L look-alikes
const localCode = (name) => {
  const base = (String(name || "").replace(/^(dr|mr|ms|mrs)\.?\s+/i, "").split(/\s+/)[0] || "")
    .toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "CYT";
  return base + Array.from({ length: 3 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join("");
};

function CouponEditor({ initial, name, onClose, onSaved }) {
  const editing = !!initial?._id;
  const [f, setF] = useState(() => (editing ? {
    code: initial.code, title: initial.title || "", discount_type: initial.discount_type,
    discount_value: String(initial.discount_value), max_usage: String(initial.max_usage || 1),
    valid_from: istDay(initial.valid_from), valid_until: istDay(initial.valid_until),
    show_on_profile: initial.show_on_profile !== false,
  } : blank()));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [genBusy, setGenBusy] = useState(false);
  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErr(""); };

  // the server picks a code nobody has; if it can't be reached, make one here (Save still checks it's free)
  const generate = useCallback(async () => {
    setGenBusy(true);
    let code = "";
    try {
      const r = await fetchById(SuggestCouponUrl);
      code = r?.data?.code || "";
    } catch (e) { /* fall back below */ }
    setF((p) => ({ ...p, code: code || localCode(name) }));
    setErr("");
    setGenBusy(false);
  }, [name]);

  // a new coupon starts with a generated code, so "Create" is two taps away
  useEffect(() => { if (!editing) generate(); }, [editing, generate]);

  const formRef = useRef(null);
  useEffect(() => { formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [initial]);

  const save = async () => {
    const code = f.code.trim().toUpperCase();
    const value = Number(f.discount_value), uses = Number(f.max_usage);
    if (!/^[A-Z0-9]{3,15}$/.test(code)) return setErr("Code: 3–15 letters or numbers, no spaces.");
    if (!value || value <= 0) return setErr("Enter the discount.");
    if (f.discount_type === "percentage" && value > 90) return setErr("A % discount can be at most 90%.");
    if (!uses || uses < 1) return setErr("Enter how many times it can be used.");
    if (!f.valid_from || !f.valid_until) return setErr("Pick the dates.");
    if (f.valid_until < f.valid_from) return setErr("The end date must be after the start date.");
    if (!editing && f.valid_until < today()) return setErr("The end date must be today or later.");
    const body = {
      code, title: f.title.trim(), discount_type: f.discount_type, discount_value: value, max_usage: uses,
      valid_from: `${f.valid_from}T00:00:00+05:30`, valid_until: `${f.valid_until}T23:59:59+05:30`,
      show_on_profile: f.show_on_profile, coupon_for: "Therapist",
    };
    setBusy(true);
    try {
      const r = await postData(editing ? `${UpdateCouponsUrl}/${initial._id}` : CreateCouponsUrl, body);
      if (r?.status) { toast.success(editing ? "Coupon updated" : "Coupon created"); onSaved(r.data); }
      else setErr(r?.message || "Couldn't save the coupon.");
    } catch (e) { setErr(errMsg(e, "Couldn't save the coupon.")); }
    setBusy(false);
  };

  const preview = { ...f, code: f.code.toUpperCase(), discount_value: Number(f.discount_value) || 0, valid_until: f.valid_until ? `${f.valid_until}T12:00:00+05:30` : null };

  return (
    <section className="pt-card cp-form" ref={formRef} aria-labelledby="cp-ed-h">
      <div className="pt-card-h">
        <h2 id="cp-ed-h">{editing ? `Edit ${initial.code}` : "New coupon"}</h2>
        <button className="cp-x" onClick={onClose} aria-label="Close"><CloseRoundedIcon /></button>
      </div>
      <div className="cp-fgrid">
        <div>
          <label className="cp-l">Coupon code</label>
          <div className="cp-row">
            <input className="cp-in mono" value={f.code} maxLength={15} placeholder="e.g. ASHA20"
              onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
            <button type="button" className="pt-btn outline" onClick={generate} disabled={genBusy}><AutoFixHighRoundedIcon /> {genBusy ? "…" : "Generate"}</button>
          </div>

          <label className="cp-l">Discount</label>
          <div className="cp-row">
            <div className="cp-seg" role="group" aria-label="Discount type">
              <button type="button" className={f.discount_type === "percentage" ? "on" : ""} onClick={() => set("discount_type", "percentage")}>% off</button>
              <button type="button" className={f.discount_type === "flat" ? "on" : ""} onClick={() => set("discount_type", "flat")}>₹ off</button>
            </div>
            <input className="cp-in" inputMode="numeric" value={f.discount_value} placeholder={f.discount_type === "percentage" ? "20" : "200"}
              onChange={(e) => set("discount_value", e.target.value.replace(/\D/g, "").slice(0, 5))} />
          </div>

          <label className="cp-l">Short line for clients <span>(optional)</span></label>
          <input className="cp-in" value={f.title} maxLength={60} placeholder="e.g. First session offer" onChange={(e) => set("title", e.target.value)} />

          <div className="cp-2">
            <div>
              <label className="cp-l">Starts</label>
              <input className="cp-in" type="date" value={f.valid_from} onChange={(e) => set("valid_from", e.target.value)} />
            </div>
            <div>
              <label className="cp-l">Ends</label>
              <input className="cp-in" type="date" value={f.valid_until} min={f.valid_from || undefined} onChange={(e) => set("valid_until", e.target.value)} />
            </div>
          </div>
          <div className="cp-presets">
            {PRESETS.map(([n, l]) => (
              <button type="button" key={n} onClick={() => set("valid_until", istDay(new Date(new Date(`${f.valid_from || today()}T12:00:00+05:30`).getTime() + n * 864e5)))}>{l}</button>
            ))}
          </div>

          <label className="cp-l">How many bookings can use it</label>
          <input className="cp-in" inputMode="numeric" value={f.max_usage} onChange={(e) => set("max_usage", e.target.value.replace(/\D/g, "").slice(0, 5))} />
          <p className="cp-hint">Counted only when a client pays for the session.</p>

          <label className="cp-sw">
            <input type="checkbox" checked={f.show_on_profile} onChange={(e) => set("show_on_profile", e.target.checked)} />
            <span className="cp-sw-t" aria-hidden="true" />
            <span><b>Show on my profile</b><small>Shown in the Offers section of your profile. Off = a private code you share yourself.</small></span>
          </label>

        </div>
        <div className="cp-side">
          <div className="cp-prev">
            <small>How clients see it</small>
            <CouponTicket c={preview} />
          </div>
          {err && <div className="pt-err" role="alert">{err}</div>}
          <div className="cp-acts2">
            <button className="pt-btn primary" onClick={save} disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create coupon"}</button>
            <button className="pt-btn outline" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CouponsPage() {
  const router = useRouter();
  const therapistInfo = useTherapistStore((s) => s.therapistInfo);
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null); // null | {} (new) | coupon
  const [confirmDel, setConfirmDel] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await fetchById(GetCouponsUrl);
      setList(r?.status ? (r.data || []).filter((c) => (c.coupon_for || "Therapist") === "Therapist") : []);
      setError(r?.status ? "" : r?.message || "Couldn't load your coupons.");
    } catch (e) { setList([]); setError("Couldn't load your coupons — please refresh in a moment."); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // old /coupon/create and /coupon/update/<id> links land here as ?new=1 / ?edit=<id>
  useEffect(() => {
    if (!router.isReady || !list) return;
    const { new: isNew, edit } = router.query;
    if (isNew) setEditor({});
    else if (edit) { const c = list.find((x) => x._id === edit); if (c) setEditor(c); }
    if (isNew || edit) router.replace("/coupons", undefined, { shallow: true });
  }, [router.isReady, list]); // eslint-disable-line react-hooks/exhaustive-deps

  const upsert = (c) => setList((p) => { const i = p.findIndex((x) => x._id === c._id); return i < 0 ? [c, ...p] : p.map((x) => (x._id === c._id ? c : x)); });

  const toggle = async (c) => {
    try {
      const r = await fetchById(`${ToggleCouponStatusUrl}/${c._id}`);
      if (r?.status) { upsert(r.data); toast.success(r.message); } else toast.error(r?.message || "Couldn't change it.");
    } catch (e) { toast.error(errMsg(e, "Couldn't change it.")); }
  };

  const remove = async (c) => {
    try {
      const r = await deleteById(`${DeleteCouponsUrl}/${c._id}`);
      if (r?.status) { setList((p) => p.filter((x) => x._id !== c._id)); toast.success("Coupon deleted"); } else toast.error(r?.message || "Couldn't delete it.");
    } catch (e) { toast.error(errMsg(e, "Couldn't delete it.")); }
    setConfirmDel(null);
  };

  const share = async (c) => {
    if (!therapistInfo?._id) return toast.error("Your profile is still loading — try again in a second.");
    const url = `${window.location.origin}/book/${therapistInfo._id}?coupon=${encodeURIComponent(c.code)}`;
    const text = `${offerLabel(c)} on a session with me — use code ${c.code} while booking: ${url}`;
    if (navigator.share) { try { await navigator.share({ text }); return; } catch (e) { if (e?.name === "AbortError") return; } }
    if (await copyText(text)) toast.success("Booking link with the code copied");
  };
  const copyCode = async (c) => { if (await copyText(c.code)) toast.success(`${c.code} copied`); };

  const live = (list || []).filter((c) => c.state === "active");
  const onProfile = live.filter((c) => c.show_on_profile !== false);
  const uses = (list || []).reduce((n, c) => n + (c.used_count || 0), 0);

  return (
    <MainLayout>
      <Head><title>Coupons | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + COUPON_TICKET_CSS + CP_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Coupons</h1>
            <p>Make your own discount codes. Live coupons marked “show on profile” appear in the Offers section of your profile.</p>
          </div>
          <button className="pt-btn primary" onClick={() => setEditor({})}><AddRoundedIcon /> Create coupon</button>
        </div>

        {error && <div className="pt-err">{error}</div>}

        {editor && (
          <CouponEditor key={editor._id || "new"} initial={editor} name={therapistInfo?.user?.name}
            onClose={() => setEditor(null)} onSaved={(c) => { upsert(c); setEditor(null); }} />
        )}

        <div className="pt-stats">
          <div className="pt-stat"><small>Live now</small><b>{list ? live.length : "—"}</b><span>Usable today</span></div>
          <div className="pt-stat"><small>On your profile</small><b>{list ? onProfile.length : "—"}</b><span>{onProfile.length ? "Shown on your profile" : "None shown yet"}</span></div>
          <div className="pt-stat"><small>Paid bookings with a coupon</small><b>{list ? uses : "—"}</b><span>All time</span></div>
        </div>

        <div className="pt-card">
          <div className="pt-card-h"><h2>Your coupons</h2><span className="pt-chip mut">{list ? list.length : 0}</span></div>
          {!list ? [1, 2].map((i) => <div key={i} className="pt-skel" />) : list.length ? (
            <div className="cp-grid">
              {list.map((c) => {
                const st = STATE[c.state] || STATE.active;
                return (
                  <div key={c._id} className={`cp-item${c.state === "active" ? "" : " dim"}`}>
                    <CouponTicket c={c} compact />
                    <div className="cp-meta">
                      <span className={`pt-chip ${st.cls}`}>{st.label}</span>
                      {c.show_on_profile !== false ? <span className="pt-chip ok">On profile</span> : <span className="pt-chip mut">Private code</span>}
                      <span>{c.used_count || 0} of {c.max_usage} used</span>
                      <span>{tillLabel(c.valid_from)} – {tillLabel(c.valid_until)}</span>
                    </div>
                    <div className="cp-acts">
                      <label className="cp-sw sm" title={c.is_active ? "Pause" : "Make live"}>
                        <input type="checkbox" checked={!!c.is_active} onChange={() => toggle(c)} />
                        <span className="cp-sw-t" aria-hidden="true" />
                        <span>{c.is_active ? "On" : "Off"}</span>
                      </label>
                      <button className="cp-ib" onClick={() => copyCode(c)} aria-label="Copy code" title="Copy code"><ContentCopyRoundedIcon /></button>
                      <button className="cp-ib" onClick={() => share(c)} aria-label="Share booking link" title="Share booking link"><ShareRoundedIcon /></button>
                      <button className="cp-ib" onClick={() => setEditor(c)} aria-label="Edit" title="Edit"><EditRoundedIcon /></button>
                      <button className="cp-ib red" onClick={() => setConfirmDel(c)} aria-label="Delete" title="Delete"><DeleteOutlineRoundedIcon /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pt-empty">
              <LocalOfferRoundedIcon style={{ fontSize: 34, color: "#166534", marginBottom: 6 }} />
              <b>No coupons yet</b>
              Create a code like <i>20% off your first session</i>. It shows on your profile as an offer and clients apply it while booking.
              <div style={{ marginTop: 12 }}><button className="pt-btn primary" onClick={() => setEditor({})}><AddRoundedIcon /> Create your first coupon</button></div>
            </div>
          )}
        </div>
      </div>

      {confirmDel && (
        <div className="cp-ov" onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="cp-modal sm" role="alertdialog" aria-modal="true">
            <div className="cp-mb">
              <h2 style={{ fontSize: 17, margin: "0 0 6px" }}>Delete {confirmDel.code}?</h2>
              <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>Clients won't be able to use it any more. Bookings already made with it are not affected.</p>
            </div>
            <div className="cp-mf">
              <button className="pt-btn outline" onClick={() => setConfirmDel(null)}>Keep it</button>
              <button className="pt-btn primary" style={{ background: "#b91c1c" }} onClick={() => remove(confirmDel)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

const CP_CSS = `
.cp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.cp-item { border: 1px solid #e4ece7; border-radius: 14px; padding: 12px; background: #fbfdfc; min-width: 0; }
.cp-item.dim .cpt { filter: grayscale(.85); opacity: .75; }
.cp-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-top: 10px; font-size: 12.5px; color: #64748b; }
.cp-acts { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eef2f0; }
.cp-acts .cp-sw { margin-right: auto; }
.cp-ib { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e4ece7; background: #fff; color: #334155; display: grid; place-items: center; cursor: pointer; padding: 0; }
.cp-ib svg { font-size: 18px; } .cp-ib:hover { background: #e7f6ec; color: #166534; } .cp-ib.red:hover { background: #fef2f2; color: #b91c1c; }
.cp-sw { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; margin: 14px 0 0; position: relative; }
.cp-sw input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.cp-sw-t { flex: 0 0 38px; height: 22px; border-radius: 999px; background: #cbd5e1; position: relative; transition: background .15s; margin-top: 1px; }
.cp-sw-t::after { content: ""; position: absolute; left: 3px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .15s; box-shadow: 0 1px 2px rgba(0,0,0,.2); }
.cp-sw input:checked + .cp-sw-t { background: #166534; } .cp-sw input:checked + .cp-sw-t::after { transform: translateX(16px); }
.cp-sw input:focus-visible + .cp-sw-t { outline: 2px solid #166534; outline-offset: 2px; }
.cp-sw b { display: block; font-size: 14px; color: #0f172a; } .cp-sw small { display: block; font-size: 12.5px; color: #64748b; line-height: 1.45; margin-top: 2px; }
.cp-sw.sm { margin: 0; align-items: center; font-size: 13px; font-weight: 700; color: #334155; }
.cp-ov { position: fixed; inset: 0; z-index: 1300; background: rgba(15, 23, 42, .5); display: flex; align-items: center; justify-content: center; padding: 16px; }
.cp-modal { width: 100%; max-width: 520px; max-height: calc(100vh - 32px); background: #fff; border-radius: 18px; display: flex; flex-direction: column; overflow: hidden; font-family: Inter, system-ui, sans-serif; box-shadow: 0 24px 60px rgba(0,0,0,.25); }
.cp-modal.sm { max-width: 400px; }
.cp-x { border: 0; background: #f1f5f9; width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; cursor: pointer; color: #334155; padding: 0; }
.cp-mb { padding: 14px 18px; overflow-y: auto; }
.cp-mf { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 18px; border-top: 1px solid #eef2f0; background: #fbfdfc; }
.cp-l { display: block; font-size: 13px; font-weight: 700; color: #0f172a; margin: 12px 0 6px; } .cp-l:first-child { margin-top: 0; }
.cp-l span { font-weight: 500; color: #94a3b8; }
.cp-row { display: flex; gap: 8px; }
.cp-in { width: 100%; height: 44px; border: 1.5px solid #e2e8f0; border-radius: 11px; padding: 0 12px; font-size: 15px; color: #0f172a; background: #fff; font-family: inherit; min-width: 0; }
.cp-in:focus { outline: none; border-color: #166534; box-shadow: 0 0 0 3px rgba(22,101,52,.12); }
.cp-in.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 800; letter-spacing: 1.5px; }
.cp-seg { display: flex; flex: 0 0 auto; border: 1.5px solid #e2e8f0; border-radius: 11px; overflow: hidden; }
.cp-seg button { border: 0; background: #fff; padding: 0 14px; font-size: 14px; font-weight: 700; color: #475569; cursor: pointer; font-family: inherit; }
.cp-seg button.on { background: #166534; color: #fff; }
.cp-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cp-presets { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.cp-presets button { border: 1px solid #cfe3d6; background: #fff; color: #166534; border-radius: 999px; padding: 4px 12px; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit; }
.cp-presets button:hover { background: #e7f6ec; }
.cp-hint { font-size: 12px; color: #94a3b8; margin: 5px 0 0; }
.cp-form { border-color: #b7dfc5; box-shadow: 0 8px 24px rgba(22,101,52,.08); scroll-margin-top: 60px; }
.cp-form .cp-x { flex-shrink: 0; }
.cp-fgrid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; align-items: start; }
.cp-side { position: sticky; top: 56px; }
.cp-acts2 { display: flex; gap: 8px; margin-top: 12px; }
.cp-acts2 .pt-btn.primary { flex: 1; }
.cp-prev { background: #f6f8f7; border-radius: 14px; padding: 12px; }
.cp-prev > small { display: block; font-size: 11.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 8px; }
.cp-prev + .pt-err { margin: 12px 0 0; }
@media (max-width: 1023px) {
  .cp-fgrid { grid-template-columns: 1fr; gap: 14px; }
  .cp-side { position: static; }
}
@media (max-width: 767px) {
  .cp-grid { grid-template-columns: 1fr; }  .cp-ov { align-items: flex-end; padding: 0; }
  .cp-modal { max-width: none; border-radius: 18px 18px 0 0; max-height: 92vh; }
  .cp-mf { padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
}
`;

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useTherapistStore from "../../../store/therapistStore";
import { updateFeeDetailsUrl } from "../../../utils/url";
import { postData } from "../../../utils/actions";

/* Session fees in one screen: a quick "same fee for everything" bar, then every service with its
   formats as inline ₹ boxes and an on/off switch. Edits stay in a draft until "Save fees". */

const PRESETS = [500, 750, 1000, 1500, 2000];

// Accounts that may set a fee below ₹100 (CYT's own test payments). Nothing in the UI mentions
// it — everyone else keeps the "min ₹100" rule.
const LOW_FEE_ACCOUNTS = ["dpk7697@gmail.com"];

const FORMAT = {
  audio: { label: "Voice call", icon: "feather-phone" },
  video: { label: "Video call", icon: "feather-video" },
  "in-person": { label: "In-person", icon: "feather-map-pin" },
};
const fmtOf = (type) => {
  const t = String(type || "").toLowerCase();
  if (t.includes("person") || t.includes("offline")) return FORMAT["in-person"];
  if (t.includes("audio") || t.includes("voice")) return FORMAT.audio;
  if (t.includes("video")) return FORMAT.video;
  return { label: type || "Session", icon: "feather-circle" };
};
const isOn = (fee) => fee !== null && fee !== undefined && fee !== "" && Number(fee) !== 0;
const clone = (fees) => (fees || []).map((s) => ({ ...s, formats: (s.formats || []).map((f) => ({ ...f })) }));

export default function Fees({ onSuccess }) {
  const { therapistInfo } = useTherapistStore();
  const minFee = LOW_FEE_ACCOUNTS.includes(String(therapistInfo?.user?.email || "").toLowerCase().trim()) ? 1 : 100;
  const saved = therapistInfo?.fees;
  const [draft, setDraft] = useState(() => clone(saved));
  // a format switched on but not given a fee yet — kept here so its box stays open
  const [open, setOpen] = useState({});
  const [quick, setQuick] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(clone(saved)); setOpen({}); }, [saved]);

  const key = (si, fi) => `${si}-${fi}`;
  const dirty = useMemo(() => JSON.stringify(draft.map((s) => s.formats.map((f) => (isOn(f.fee) ? String(f.fee) : null))))
    !== JSON.stringify(clone(saved).map((s) => s.formats.map((f) => (isOn(f.fee) ? String(f.fee) : null)))), [draft, saved]);

  const setFee = (si, fi, v) => setDraft((d) => {
    const n = clone(d);
    n[si].formats[fi].fee = v;
    return n;
  });
  const toggle = (si, fi) => {
    const f = draft[si].formats[fi];
    if (isOn(f.fee) || open[key(si, fi)]) {
      setFee(si, fi, null);
      setOpen((o) => ({ ...o, [key(si, fi)]: false }));
    } else {
      setOpen((o) => ({ ...o, [key(si, fi)]: true }));
      if (quick) setFee(si, fi, String(quick));
    }
  };
  const applyAll = (val) => {
    const v = String(parseInt(val, 10) || "");
    if (!v) return;
    const anyOn = draft.some((s, si) => s.formats.some((f, fi) => isOn(f.fee) || open[key(si, fi)]));
    setDraft((d) => clone(d).map((s, si) => ({
      ...s,
      formats: s.formats.map((f, fi) => (!anyOn || isOn(f.fee) || open[key(si, fi)] ? { ...f, fee: v } : f)),
    })));
    toast.info(anyOn ? `₹${Number(v).toLocaleString("en-IN")} set for every format you offer — tap Save fees` : `₹${Number(v).toLocaleString("en-IN")} set for every format — tap Save fees`);
  };

  // a box that is on must hold a fee of at least the minimum
  const bad = (si, fi) => {
    const f = draft[si].formats[fi];
    const on = isOn(f.fee) || open[key(si, fi)];
    return on && !(Number(f.fee) >= minFee);
  };
  const anyBad = draft.some((s, si) => s.formats.some((_, fi) => bad(si, fi)));
  const offered = draft.flatMap((s) => s.formats.filter((f) => isOn(f.fee)).map((f) => Number(f.fee)));
  const range = offered.length ? (Math.min(...offered) === Math.max(...offered)
    ? `₹${Math.min(...offered).toLocaleString("en-IN")}`
    : `₹${Math.min(...offered).toLocaleString("en-IN")} – ₹${Math.max(...offered).toLocaleString("en-IN")}`) : "";

  const save = async () => {
    if (anyBad) { toast.error("Enter a fee of at least ₹100 for every format that's on, or switch it off"); return; }
    setSaving(true);
    try {
      // not offered = null (an empty string used to show up as a ₹0 option on the booking page)
      const fees = draft.map((s) => ({ ...s, formats: s.formats.map((f) => ({ ...f, fee: isOn(f.fee) ? String(parseInt(f.fee, 10)) : null })) }));
      const r = await postData(updateFeeDetailsUrl, { fees });
      if (r?.status) {
        toast.success("Fees saved — your profile shows them now");
        setOpen({});
        onSuccess?.();
      } else toast.error(r?.message || "Couldn't save your fees");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't save your fees — check your connection");
    }
    setSaving(false);
  };

  if (!draft.length) {
    return <p className="fe-empty">Add the services you offer in <a href="/settings">Settings → Profile</a> first — then set a fee for each here.</p>;
  }

  return (
    <div className="fe">
      <style dangerouslySetInnerHTML={{ __html: FE_CSS }} />

      <div className="fe-quick">
        <div className="fe-quick-txt"><b>Same fee for everything?</b><span>Type it once and apply it to every format you offer.</span></div>
        <div className="fe-quick-row">
          <label className="fe-money big"><span>₹</span>
            <input type="number" inputMode="numeric" min={1} placeholder="e.g. 1200" value={quick}
              onChange={(e) => setQuick(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && applyAll(quick)} />
          </label>
          <button type="button" className="fe-btn" onClick={() => applyAll(quick)} disabled={!quick}>Apply to all</button>
        </div>
        <div className="fe-presets">
          {PRESETS.map((p) => (
            <button key={p} type="button" className={String(p) === quick ? "on" : ""} onClick={() => setQuick(String(p))}>₹{p.toLocaleString("en-IN")}</button>
          ))}
        </div>
      </div>

      <div className="fe-list">
        {draft.map((s, si) => (
          <div key={s._id || si} className="fe-svc">
            <div className="fe-svc-name">{s.name}</div>
            <div className="fe-fmts">
              {s.formats.map((f, fi) => {
                const meta = fmtOf(f.type);
                const on = isOn(f.fee) || !!open[key(si, fi)];
                return (
                  <div key={fi} className={`fe-fmt${on ? " on" : ""}${bad(si, fi) ? " bad" : ""}`}>
                    <button type="button" className="fe-switch" role="switch" aria-checked={on} onClick={() => toggle(si, fi)}
                      aria-label={`${on ? "Stop offering" : "Offer"} ${s.name} by ${meta.label}`}>
                      <i />
                    </button>
                    <span className="fe-fmt-name"><i className={meta.icon} /> {meta.label}</span>
                    {on ? (
                      <label className="fe-money"><span>₹</span>
                        <input type="number" inputMode="numeric" min={1} value={f.fee ?? ""} placeholder="Fee" autoFocus={!isOn(f.fee)}
                          onChange={(e) => setFee(si, fi, e.target.value.replace(/\D/g, "").slice(0, 6))} aria-label={`${s.name} ${meta.label} fee`} />
                      </label>
                    ) : <span className="fe-off">Not offered</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={`fe-bar${dirty ? " show" : ""}`}>
        <span>{anyBad ? "Some fees are missing or below ₹100" : dirty ? `Unsaved changes${range ? ` · clients will see ${range}` : ""}` : range ? `Clients see ${range}` : "No fees set yet"}</span>
        <button type="button" className="fe-btn primary" onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save fees"}</button>
      </div>
    </div>
  );
}

const FE_CSS = `
.fe { display: flex; flex-direction: column; gap: 14px; }
.fe-empty { font-size: 14px; color: #475569; }
.fe-quick { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "txt row" "presets presets"; gap: 10px 16px; align-items: center;
  background: linear-gradient(160deg, #f0fdf4, #fff 70%); border: 1px solid #cdeedb; border-radius: 14px; padding: 14px 16px; }
.fe-quick-txt { grid-area: txt; } .fe-quick-row { grid-area: row; display: flex; gap: 8px; } .fe-presets { grid-area: presets; display: flex; gap: 6px; flex-wrap: wrap; }
.fe-quick-txt b { display: block; font-size: 15px; color: #0f172a; } .fe-quick-txt span { font-size: 12.5px; color: #64748b; }
.fe-presets button { border: 1px solid #cfe3d6; background: #fff; color: #166534; border-radius: 999px; padding: 5px 12px; font-size: 12.5px; font-weight: 800; cursor: pointer; font-family: inherit; }
.fe-presets button.on { background: #166534; color: #fff; border-color: #166534; }
.fe-money { display: inline-flex; align-items: center; gap: 4px; height: 40px; border: 1.5px solid #d6e0da; border-radius: 10px; background: #fff; padding: 0 10px; margin: 0; }
.fe-money:focus-within { border-color: #166534; box-shadow: 0 0 0 3px rgba(22,101,52,.12); }
.fe-money span { font-weight: 800; color: #64748b; }
.fe-money input { width: 78px; border: 0; outline: none; font-size: 15px; font-weight: 800; color: #0f172a; background: transparent; padding: 0; height: 100%; font-family: inherit; -moz-appearance: textfield; }
.fe-money input::-webkit-outer-spin-button, .fe-money input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.fe-money.big input { width: 110px; }
.fe-btn { height: 40px; padding: 0 16px; border-radius: 10px; border: 1.5px solid #cfe3d6; background: #fff; color: #166534; font-size: 13.5px; font-weight: 800; cursor: pointer; white-space: nowrap; font-family: inherit; }
.fe-btn.primary { background: #166534; border-color: #166534; color: #fff; }
.fe-btn:disabled { opacity: .55; cursor: default; }
.fe-list { display: flex; flex-direction: column; gap: 10px; }
.fe-svc { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 10px 16px; align-items: center; background: #fff; border: 1px solid #e3e8e5; border-radius: 14px; padding: 12px 14px; }
.fe-svc-name { font-size: 15px; font-weight: 800; color: #0f172a; }
.fe-fmts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.fe-fmt { display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 6px 10px; border: 1px solid #e3e8e5; border-radius: 12px; background: #f8faf9; min-width: 0; }
.fe-fmt.on { background: #fff; border-color: #bfe3cb; }
.fe-fmt.bad { border-color: #f59e0b; background: #fffbeb; }
.fe-fmt-name { flex: 1; min-width: 0; font-size: 13px; font-weight: 700; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fe-fmt-name i { color: #166534; margin-right: 3px; }
.fe-fmt:not(.on) .fe-fmt-name { color: #94a3b8; } .fe-fmt:not(.on) .fe-fmt-name i { color: #94a3b8; }
.fe-off { font-size: 12px; color: #94a3b8; font-weight: 600; }
.fe-fmt .fe-money { height: 36px; } .fe-fmt .fe-money input { width: 64px; font-size: 14px; }
.fe-switch { width: 36px; height: 22px; border-radius: 999px; border: 0; background: #cbd5e1; position: relative; cursor: pointer; flex-shrink: 0; padding: 0; transition: background .15s; }
.fe-switch i { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.2); transition: transform .15s; }
.fe-switch[aria-checked="true"] { background: #16a34a; } .fe-switch[aria-checked="true"] i { transform: translateX(14px); }
.fe-bar { position: sticky; bottom: 12px; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px 10px 16px; border-radius: 14px;
  background: #fff; border: 1px solid #e3e8e5; box-shadow: 0 10px 30px -14px rgba(15,23,42,.35); font-size: 13px; font-weight: 700; color: #475569; }
.fe-bar.show { border-color: #166534; background: #f0fdf4; color: #14532d; }
@media (max-width: 900px) {
  .fe-svc { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .fe-quick { grid-template-columns: 1fr; grid-template-areas: "txt" "row" "presets"; }
  .fe-quick-row .fe-money { flex: 1; } .fe-quick-row .fe-money.big input { width: 100%; }
  .fe-fmts { grid-template-columns: 1fr; }
  .fe-bar { bottom: calc(76px + env(safe-area-inset-bottom, 0px)); flex-direction: column; align-items: stretch; text-align: center; }
  .fe-bar:not(.show) { display: none; } /* phones: only when there is something to save */
  .fe-bar .fe-btn { height: 44px; }
}
`;

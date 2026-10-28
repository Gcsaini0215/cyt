import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchById, putData } from "../../../utils/actions";
import { apiUrl } from "../../../utils/url";
import { Section } from "./settings-ui";

const MapPicker = dynamic(() => import("../../therapist/map-picker"), { ssr: false });

/* Settings → Practice location: the pin for in-person sessions. Saved on its own (not with the profile
   form). Clients see only a ~1 km area around it before booking; a client with a paid in-person session
   gets the exact pin for directions. Until the therapist confirms a pin here, the area comes from the
   typed address (and the sign-up pin, from browser GPS, is often wrong). */
export default function PracticeLocation() {
  const [data, setData] = useState(null); // { pin, confirmed, area, address }
  const [pin, setPin] = useState(null);
  const [clinic, setClinic] = useState(false); // true: clients see the exact pin + address before booking
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ ok: "", err: "" });

  useEffect(() => {
    fetchById(`${apiUrl}/therapist/practice-location`)
      .then((r) => { if (r?.status) { setData(r.data); setPin(r.data.pin); setClinic(!!r.data.clinic); } else setData({}); })
      .catch(() => setData({}));
  }, []);
  if (data === null) return null;

  const dirty = !!pin && (!data.pin || pin.lat !== data.pin.lat || pin.lng !== data.pin.lng || clinic !== !!data.clinic);
  const needsConfirm = !!pin && !data.confirmed;
  const save = async () => {
    setSaving(true); setMsg({ ok: "", err: "" });
    try {
      const r = await putData(`${apiUrl}/therapist/practice-location`, { ...pin, clinic });
      setData((d) => ({ ...d, pin: r.data.pin, clinic: !!r.data.clinic, confirmed: true, area: r.data.area }));
      setMsg({ ok: "Practice location saved.", err: "" });
    } catch (e) {
      setMsg({ ok: "", err: e?.response?.data?.message || "Couldn't save — check your connection and try again." });
    } finally { setSaving(false); }
  };

  return (
    <Section title="Practice location" sub="Where clients meet you in person. Search, use your location, or tap the map — then drag the pin exactly onto your practice.">
      <MapPicker value={pin} onChange={(p) => { setPin(p); setMsg({ ok: "", err: "" }); }} search />
      <div className="stg-ploc">
        <div className="stg-ploc-kind" role="radiogroup" aria-label="What clients see before booking">
          <label className={clinic ? "on" : ""}>
            <input type="radio" name="ploc-kind" checked={clinic} onChange={() => { setClinic(true); setMsg({ ok: "", err: "" }); }} />
            <span><b>It&apos;s a clinic / centre</b><small>Clients see the exact pin and your clinic address before booking.</small></span>
          </label>
          <label className={!clinic ? "on" : ""}>
            <input type="radio" name="ploc-kind" checked={!clinic} onChange={() => { setClinic(false); setMsg({ ok: "", err: "" }); }} />
            <span><b>I see clients at home</b><small>Clients see only the area (about 1 km) — never your address.</small></span>
          </label>
        </div>
        <p>
          {clinic
            ? <>Clients see your pin and <b>{data.address || "your clinic address"}</b> on the booking page, and how far it is from them.{!data.address && " Add the address in Profile details above."}</>
            : dirty
            ? <>Save to update the area clients see — about 1 km around your pin, never your address.</>
            : data.area?.label
            ? <>Before booking, clients see only the area <b>around {data.area.label}</b> (about 1 km) and how far it is from them — never your address.</>
            : <>Before booking, clients see only the area around your pin (about 1 km) — never your address.</>}
          {!clinic && " After a paid in-person booking, the client gets this pin for directions."}
        </p>
        {needsConfirm && !dirty && <p className="warn">This pin was set when you signed up, from your device&apos;s location — check it&apos;s on your practice and save it.</p>}
        <div className="stg-ploc-acts">
          <button type="button" className="stg-btn primary" onClick={save} disabled={saving || !pin || (!dirty && !needsConfirm)}>
            {saving ? "Saving…" : needsConfirm && !dirty ? "Confirm this location" : "Save location"}
          </button>
          {msg.ok && <span className="ok">{msg.ok}</span>}
          {msg.err && <span className="err">{msg.err}</span>}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
.stg-ploc { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.stg-ploc p { margin: 0; font-size: 12.5px; color: #475569; line-height: 1.55; }
.stg-ploc-kind { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 8px; }
.stg-ploc-kind label { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border: 1.5px solid #e4ece7; border-radius: 12px; cursor: pointer; background: #fff; }
.stg-ploc-kind label.on { border-color: #166534; background: #f0faf3; }
.stg-ploc-kind input { accent-color: #166534; width: 17px; height: 17px; margin: 2px 0 0; flex-shrink: 0; }
.stg-ploc-kind b { display: block; font-size: 13.5px; color: #0f172a; } .stg-ploc-kind small { display: block; font-size: 12px; color: #64748b; margin-top: 2px; line-height: 1.4; }
.stg-ploc p.warn { color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 8px 10px; font-weight: 600; }
.stg-ploc-acts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.stg-ploc-acts .ok { font-size: 13px; font-weight: 700; color: #16a34a; } .stg-ploc-acts .err { font-size: 13px; font-weight: 700; color: #dc2626; }
` }} />
    </Section>
  );
}

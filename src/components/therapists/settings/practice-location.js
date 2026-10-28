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
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ ok: "", err: "" });

  useEffect(() => {
    fetchById(`${apiUrl}/therapist/practice-location`)
      .then((r) => { if (r?.status) { setData(r.data); setPin(r.data.pin); } else setData({}); })
      .catch(() => setData({}));
  }, []);
  if (data === null) return null;

  const dirty = !!pin && (!data.pin || pin.lat !== data.pin.lat || pin.lng !== data.pin.lng);
  const needsConfirm = !!pin && !data.confirmed;
  const save = async () => {
    setSaving(true); setMsg({ ok: "", err: "" });
    try {
      const r = await putData(`${apiUrl}/therapist/practice-location`, pin);
      setData((d) => ({ ...d, pin: r.data.pin, confirmed: true, area: r.data.area }));
      setMsg({ ok: "Practice location saved.", err: "" });
    } catch (e) {
      setMsg({ ok: "", err: e?.response?.data?.message || "Couldn't save — check your connection and try again." });
    } finally { setSaving(false); }
  };

  return (
    <Section title="Practice location" sub="Where clients meet you in person. Search, use your location, or tap the map — then drag the pin exactly onto your practice.">
      <MapPicker value={pin} onChange={(p) => { setPin(p); setMsg({ ok: "", err: "" }); }} search />
      <div className="stg-ploc">
        <p>
          {dirty
            ? <>Save to update the area clients see — about 1 km around your pin, never your address.</>
            : data.area?.label
            ? <>Before booking, clients see only the area <b>around {data.area.label}</b> (about 1 km) and how far it is from them — never your address.</>
            : <>Before booking, clients see only the area around your pin (about 1 km) — never your address.</>}
          {" "}After a paid in-person booking, the client gets this pin for directions.
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
.stg-ploc p.warn { color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 8px 10px; font-weight: 600; }
.stg-ploc-acts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.stg-ploc-acts .ok { font-size: 13px; font-weight: 700; color: #16a34a; } .stg-ploc-acts .err { font-size: 13px; font-weight: 700; color: #dc2626; }
` }} />
    </Section>
  );
}

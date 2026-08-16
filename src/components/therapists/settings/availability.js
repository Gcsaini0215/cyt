import React, { useEffect, useState } from "react";
import { allTimes } from "../../../utils/static-lists";
import useTherapistStore from "../../../store/therapistStore";
import { postData } from "../../../utils/actions";
import { updateAvailabilitiesUrl } from "../../../utils/url";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const ABR  = { Monday:"Mo", Tuesday:"Tu", Wednesday:"We", Thursday:"Th", Friday:"Fr", Saturday:"Sa", Sunday:"Su" };
const EMPTY = { active: false, slots: [{ open: "", close: "" }] };

function buildSchedule(availabilities) {
  const s = Object.fromEntries(DAYS.map(d => [d, { active: false, slots: [{ open: "", close: "" }] }]));
  if (Array.isArray(availabilities)) {
    availabilities.forEach(({ day, times }) => {
      if (s[day] && times?.length) {
        s[day] = { active: true, slots: times.map(t => ({ open: t.open || "", close: t.close || "" })) };
      }
    });
  }
  return s;
}

export default function Availability({ onSuccess }) {
  const { therapistInfo } = useTherapistStore();
  const [schedule, setSchedule] = useState(() =>
    Object.fromEntries(DAYS.map(d => [d, { ...EMPTY, slots: [{ open: "", close: "" }] }]))
  );
  const [inited, setInited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inited && therapistInfo?.user?.email) {
      setSchedule(buildSchedule(therapistInfo.availabilities));
      setInited(true);
    }
  }, [therapistInfo?.user?.email, therapistInfo?.availabilities, inited]);

  const toggle = (day) =>
    setSchedule(p => ({ ...p, [day]: { ...p[day], active: !p[day].active } }));

  const updateSlot = (day, idx, field, val) =>
    setSchedule(p => {
      const slots = p[day].slots.map((s, i) => i === idx ? { ...s, [field]: val } : s);
      return { ...p, [day]: { ...p[day], slots, active: true } };
    });

  const addSlot = (day) =>
    setSchedule(p => ({ ...p, [day]: { ...p[day], slots: [...p[day].slots, { open: "", close: "" }] } }));

  const removeSlot = (day, idx) =>
    setSchedule(p => {
      const slots = p[day].slots.filter((_, i) => i !== idx);
      return { ...p, [day]: { ...p[day], slots: slots.length ? slots : [{ open: "", close: "" }] } };
    });

  const copyToAll = (src) =>
    setSchedule(p => {
      const next = { ...p };
      const srcDay = p[src];
      DAYS.forEach(d => { next[d] = { active: srcDay.active, slots: JSON.parse(JSON.stringify(srcDay.slots)) }; });
      return next;
    });

  const handleSave = async () => {
    const active = DAYS.filter(d => schedule[d].active);
    if (!active.length) { toast.error("Enable at least one day"); return; }

    const hasSlot = active.some(d => schedule[d].slots.some(s => s.open && s.close));
    if (!hasSlot) { toast.error("Add at least one complete time slot"); return; }

    const payload = active.map(day => ({
      day,
      times: schedule[day].slots.filter(s => s.open && s.close),
    }));

    try {
      setLoading(true);
      const res = await postData(updateAvailabilitiesUrl, { schedule: payload });
      if (res?.status) {
        toast.success(res.message || "Schedule saved!");
        if (onSuccess) onSuccess();
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const activeDays = DAYS.filter(d => schedule[d].active);

  return (
    <>
      <style>{`
        .av-wrap { max-width: 680px; }
        .av-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
        .av-title { font-family: Georgia, "Times New Roman", serif; font-size:19px; font-weight:700; color:#122019; margin:0; }
        .av-sub { font-size:12.5px; color:#8a978f; margin:4px 0 0; }

        /* Day pills */
        .av-pills { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:22px; }
        .av-pill {
          width:42px; height:42px; border-radius:6px; border:1.5px solid #dbe3df;
          background:#fff; font-weight:700; font-size:11.5px; cursor:pointer;
          transition:all .15s; color:#8a978f; font-family:inherit;
          display:flex; align-items:center; justify-content:center;
        }
        .av-pill.on {
          background:#0f3d24; border-color:#0f3d24; color:#fff;
        }
        .av-pill:hover:not(.on) { border-color:#0f3d24; color:#0f3d24; background:#f0fdf4; }

        /* Day cards */
        .av-card {
          background:#fff; border:1.5px solid #ecefec; border-radius:6px;
          margin-bottom:10px; overflow:hidden;
          animation:avIn .2s ease;
        }
        @keyframes avIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .av-card-hdr {
          display:flex; align-items:center; justify-content:space-between;
          padding:12px 16px; background:#fbfaf7;
          border-bottom:1px solid #ecefec;
        }
        .av-card-day { font-size:13px; font-weight:700; color:#122019; display:flex; align-items:center; gap:8px; }
        .av-dot { width:7px; height:7px; border-radius:50%; background:#c9962c; flex-shrink:0; }
        .av-hdr-btns { display:flex; align-items:center; gap:6px; }
        .av-icon-btn {
          width:28px; height:28px; border-radius:4px; border:1.5px solid #dbe3df;
          background:#fff; cursor:pointer; display:flex; align-items:center;
          justify-content:center; transition:all .15s; color:#5b6b62; font-size:13px;
          font-family:inherit;
        }
        .av-icon-btn:hover { border-color:#0f3d24; color:#0f3d24; background:#f0fdf4; }
        .av-icon-btn.red:hover { border-color:#ef4444; color:#ef4444; background:#fff1f2; }

        /* Slots */
        .av-slots { padding:12px 16px 6px; display:flex; flex-direction:column; gap:10px; }
        .av-slot { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .av-sel {
          height:38px; border-radius:4px; border:1.5px solid #dbe3df;
          padding:0 10px; font-size:13px; font-weight:600; color:#122019;
          background:#fbfaf7; cursor:pointer; flex:1; min-width:120px; max-width:160px;
          outline:none; font-family:inherit; transition:border-color .15s;
          appearance:auto;
        }
        .av-sel:focus { border-color:#0f3d24; background:#fff; }
        .av-sep { font-size:13px; color:#8a978f; font-weight:700; flex-shrink:0; }
        .av-del {
          width:28px; height:28px; border-radius:4px; border:none;
          background:#fff1f2; color:#ef4444; cursor:pointer; display:flex;
          align-items:center; justify-content:center; font-size:14px; flex-shrink:0;
          transition:all .15s;
        }
        .av-del:hover { background:#fee2e2; }
        .av-add-slot {
          display:flex; align-items:center; gap:6px; margin:6px 16px 14px;
          border:none; background:none; font-size:11.5px; font-weight:700;
          color:#0f3d24; cursor:pointer; padding:0; font-family:inherit;
        }
        .av-add-slot:hover { opacity:.75; }

        /* Empty */
        .av-empty { text-align:center; padding:36px 16px; color:#8a978f; border:1.5px dashed #dbe3df; border-radius:6px; }
        .av-empty-icon { font-size:32px; margin-bottom:10px; }

        /* Footer */
        .av-footer { margin-top:22px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .av-save {
          height:44px; padding:0 30px; border-radius:4px; border:none;
          background:#0f3d24; color:#fff;
          font-size:13px; font-weight:700; cursor:pointer; font-family:inherit;
          display:flex; align-items:center; gap:8px; transition:background .15s, transform .15s;
        }
        .av-save:hover:not(:disabled) { background:#16512f; transform: translateY(-1px); }
        .av-save:disabled { opacity:.6; cursor:not-allowed; }
        .av-hint { font-size:12px; color:#8a978f; font-weight:500; }

        @media(max-width:480px){
          .av-pill { width:38px; height:38px; font-size:10.5px; }
          .av-sel { min-width:100px; }
        }
      `}</style>

      <div className="av-wrap">
        {/* Header */}
        <div className="av-hdr">
          <div>
            <p className="av-title">Weekly Schedule</p>
            <p className="av-sub">Tap a day to enable / disable it</p>
          </div>
        </div>

        {/* Day pills */}
        <div className="av-pills">
          {DAYS.map(day => (
            <button
              key={day}
              className={`av-pill${schedule[day].active ? " on" : ""}`}
              onClick={() => toggle(day)}
              title={day}
            >
              {ABR[day]}
            </button>
          ))}
        </div>

        {/* Active day cards */}
        {activeDays.length === 0 ? (
          <div className="av-empty">
            <div className="av-empty-icon">📅</div>
            <p style={{ fontWeight:700, margin:0, fontSize:14, color:"#64748b" }}>No days selected</p>
            <p style={{ fontSize:13, margin:"6px 0 0" }}>Tap the day buttons above to set your hours</p>
          </div>
        ) : (
          activeDays.map(day => (
            <div key={day} className="av-card">
              {/* Card header */}
              <div className="av-card-hdr">
                <div className="av-card-day">
                  <span className="av-dot" />
                  {day}
                </div>
                <div className="av-hdr-btns">
                  <button className="av-icon-btn" title={`Copy ${day} to all days`} onClick={() => copyToAll(day)}>
                    <i className="feather-copy" style={{ fontSize:13 }} />
                  </button>
                  <button className="av-icon-btn red" title="Disable day" onClick={() => toggle(day)}>
                    <i className="feather-x" style={{ fontSize:14 }} />
                  </button>
                </div>
              </div>

              {/* Time slots */}
              <div className="av-slots">
                {schedule[day].slots.map((slot, idx) => (
                  <div key={idx} className="av-slot">
                    <select
                      className="av-sel"
                      value={slot.open}
                      onChange={e => updateSlot(day, idx, "open", e.target.value)}
                    >
                      <option value="">Start time</option>
                      {allTimes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <span className="av-sep">→</span>

                    <select
                      className="av-sel"
                      value={slot.close}
                      onChange={e => updateSlot(day, idx, "close", e.target.value)}
                    >
                      <option value="">End time</option>
                      {allTimes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    {schedule[day].slots.length > 1 && (
                      <button className="av-del" onClick={() => removeSlot(day, idx)} title="Remove slot">
                        <i className="feather-trash-2" style={{ fontSize:13 }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button className="av-add-slot" onClick={() => addSlot(day)}>
                <i className="feather-plus-circle" style={{ fontSize:14 }} />
                Add another slot
              </button>
            </div>
          ))
        )}

        {/* Footer */}
        <div className="av-footer">
          <button className="av-save" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <i className="feather-save" style={{ fontSize:15 }} />}
            {loading ? "Saving…" : "Save Schedule"}
          </button>
          {activeDays.length > 0 && (
            <span className="av-hint">{activeDays.length} day{activeDays.length > 1 ? "s" : ""} selected</span>
          )}
        </div>
      </div>
    </>
  );
}

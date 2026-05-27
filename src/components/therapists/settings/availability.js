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
        .av-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
        .av-title { font-size:18px; font-weight:900; color:#1e293b; margin:0; }
        .av-sub { font-size:13px; color:#94a3b8; margin:4px 0 0; }

        /* Day pills */
        .av-pills { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px; }
        .av-pill {
          width:48px; height:48px; border-radius:50%; border:2px solid #e2e8f0;
          background:#fff; font-weight:800; font-size:12px; cursor:pointer;
          transition:all .18s; color:#94a3b8; font-family:inherit;
          display:flex; align-items:center; justify-content:center;
        }
        .av-pill.on {
          background:#228756; border-color:#228756; color:#fff;
          box-shadow:0 4px 14px rgba(34,135,86,.3);
          transform:scale(1.05);
        }
        .av-pill:hover:not(.on) { border-color:#228756; color:#228756; background:#f0fdf4; }

        /* Day cards */
        .av-card {
          background:#fff; border:1.5px solid #f1f5f9; border-radius:18px;
          margin-bottom:12px; overflow:hidden;
          box-shadow:0 1px 4px rgba(0,0,0,.04);
          animation:avIn .2s ease;
        }
        @keyframes avIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .av-card-hdr {
          display:flex; align-items:center; justify-content:space-between;
          padding:13px 18px; background:#f8fafc;
          border-bottom:1px solid #f1f5f9;
        }
        .av-card-day { font-size:14px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:8px; }
        .av-dot { width:8px; height:8px; border-radius:50%; background:#22c55e; flex-shrink:0; }
        .av-hdr-btns { display:flex; align-items:center; gap:6px; }
        .av-icon-btn {
          width:30px; height:30px; border-radius:8px; border:1.5px solid #e2e8f0;
          background:#fff; cursor:pointer; display:flex; align-items:center;
          justify-content:center; transition:all .15s; color:#64748b; font-size:14px;
          font-family:inherit;
        }
        .av-icon-btn:hover { border-color:#228756; color:#228756; background:#f0fdf4; }
        .av-icon-btn.red:hover { border-color:#ef4444; color:#ef4444; background:#fff1f2; }

        /* Slots */
        .av-slots { padding:12px 18px 6px; display:flex; flex-direction:column; gap:10px; }
        .av-slot { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .av-sel {
          height:40px; border-radius:10px; border:1.5px solid #e2e8f0;
          padding:0 10px; font-size:13px; font-weight:600; color:#1e293b;
          background:#f8fafc; cursor:pointer; flex:1; min-width:120px; max-width:160px;
          outline:none; font-family:inherit; transition:border-color .15s;
          appearance:auto;
        }
        .av-sel:focus { border-color:#228756; background:#fff; }
        .av-sep { font-size:13px; color:#94a3b8; font-weight:700; flex-shrink:0; }
        .av-del {
          width:30px; height:30px; border-radius:8px; border:none;
          background:#fff1f2; color:#ef4444; cursor:pointer; display:flex;
          align-items:center; justify-content:center; font-size:15px; flex-shrink:0;
          transition:all .15s;
        }
        .av-del:hover { background:#fee2e2; }
        .av-add-slot {
          display:flex; align-items:center; gap:6px; margin:6px 18px 14px;
          border:none; background:none; font-size:12px; font-weight:700;
          color:#228756; cursor:pointer; padding:0; font-family:inherit;
        }
        .av-add-slot:hover { opacity:.75; }

        /* Empty */
        .av-empty { text-align:center; padding:36px 16px; color:#94a3b8; }
        .av-empty-icon { font-size:36px; margin-bottom:10px; }

        /* Footer */
        .av-footer { margin-top:24px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .av-save {
          height:48px; padding:0 36px; border-radius:14px; border:none;
          background:linear-gradient(135deg,#228756,#1b6843); color:#fff;
          font-size:14px; font-weight:800; cursor:pointer; font-family:inherit;
          display:flex; align-items:center; gap:8px; transition:opacity .15s;
        }
        .av-save:hover:not(:disabled) { opacity:.88; }
        .av-save:disabled { opacity:.6; cursor:not-allowed; }
        .av-hint { font-size:12px; color:#94a3b8; font-weight:500; }

        @media(max-width:480px){
          .av-pill { width:40px; height:40px; font-size:11px; }
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

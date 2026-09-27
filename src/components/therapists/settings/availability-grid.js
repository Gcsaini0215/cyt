import React, { useEffect, useMemo, useRef, useState } from "react";
import useTherapistStore from "../../../store/therapistStore";
import { postData } from "../../../utils/actions";
import { updateAvailabilitiesUrl } from "../../../utils/url";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";

/* Weekly availability as a table: days across, hourly session slots down.
   Tap (or drag across) cells to select / unselect; tap a day or a time to toggle a whole
   column / row. Saved in the same format as before: [{ day, times: [{ open: "10:00am", close: "01:00pm" }] }],
   with consecutive hours joined into one range. */

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };
const FIRST_HOUR = 6;  // first session can start at 6 AM
const LAST_HOUR = 21;  // last session starts at 9 PM (ends 10 PM)
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i);

function toMinutes(t) {
  if (!t) return null;
  const lower = t.trim().toLowerCase();
  const isPm = lower.endsWith("pm");
  const isAm = lower.endsWith("am");
  const [hStr, mStr] = lower.replace("am", "").replace("pm", "").trim().split(":");
  let h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return null;
  const m = parseInt(mStr, 10) || 0;
  if (isPm && h !== 12) h += 12;
  if (isAm && h === 12) h = 0;
  return h * 60 + m;
}
const fmt = (h) => `${String(h % 12 || 12).padStart(2, "0")}:00${h < 12 || h === 24 ? "am" : "pm"}`;
const label = (h) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
const key = (day, h) => `${day}|${h}`;

// availabilities -> Set of "Day|hour" for every whole hour inside a saved range
function toCells(availabilities) {
  const cells = new Set();
  let offGrid = false;
  (availabilities || []).forEach(({ day, times }) => {
    (times || []).forEach(({ open, close }) => {
      const o = toMinutes(open), c = toMinutes(close);
      if (o == null || c == null) return;
      if (o % 60 || c % 60) offGrid = true;
      for (let h = Math.ceil(o / 60); (h + 1) * 60 <= c; h++) {
        if (h >= FIRST_HOUR && h <= LAST_HOUR) cells.add(key(day, h));
        else offGrid = true;
      }
    });
  });
  return { cells, offGrid };
}

// Set -> payload, joining consecutive hours into ranges
function toPayload(cells) {
  return DAYS.map((day) => {
    const hrs = HOURS.filter((h) => cells.has(key(day, h)));
    const times = [];
    hrs.forEach((h) => {
      const last = times[times.length - 1];
      if (last && last.end === h) last.end = h + 1;
      else times.push({ start: h, end: h + 1 });
    });
    return { day, times: times.map((r) => ({ open: fmt(r.start), close: fmt(r.end) })) };
  }).filter((d) => d.times.length);
}

export default function AvailabilityGrid({ onSuccess }) {
  const { therapistInfo } = useTherapistStore();
  const [cells, setCells] = useState(new Set());
  const [saved, setSaved] = useState("");
  const [offGrid, setOffGrid] = useState(false);
  const [inited, setInited] = useState(false);
  const [loading, setLoading] = useState(false);
  const drag = useRef(null); // { add: boolean } while painting with mouse / finger
  const lastTouch = useRef(0); // phones fire a mouse event after a touch — ignore it

  useEffect(() => {
    if (!inited && therapistInfo?.user?.email) {
      const { cells: c, offGrid: og } = toCells(therapistInfo.availabilities);
      setCells(c);
      setSaved(JSON.stringify(toPayload(c)));
      setOffGrid(og);
      setInited(true);
    }
  }, [therapistInfo?.user?.email, therapistInfo?.availabilities, inited]);

  useEffect(() => {
    const stop = () => { drag.current = null; };
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => { window.removeEventListener("mouseup", stop); window.removeEventListener("touchend", stop); };
  }, []);

  const payload = useMemo(() => toPayload(cells), [cells]);
  const dirty = inited && JSON.stringify(payload) !== saved;
  const perDay = (day) => HOURS.filter((h) => cells.has(key(day, h))).length;

  const setCell = (day, h, on) => setCells((prev) => {
    const k = key(day, h);
    if (prev.has(k) === on) return prev;
    const next = new Set(prev);
    if (on) next.add(k); else next.delete(k);
    return next;
  });
  const setMany = (keys, on) => setCells((prev) => {
    const next = new Set(prev);
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
    return next;
  });

  const startDrag = (day, h) => {
    const add = !cells.has(key(day, h));
    drag.current = { add };
    setCell(day, h, add);
  };
  const dragOver = (day, h) => { if (drag.current) setCell(day, h, drag.current.add); };
  const onTouchMove = (e) => {
    if (!drag.current) return;
    const t = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const d = el?.dataset?.day, h = el?.dataset?.hour;
    if (d && h) setCell(d, Number(h), drag.current.add);
  };

  const toggleDay = (day) => {
    const all = HOURS.every((h) => cells.has(key(day, h)));
    setMany(HOURS.map((h) => key(day, h)), !all);
  };
  const toggleHour = (h) => {
    const all = DAYS.every((d) => cells.has(key(d, h)));
    setMany(DAYS.map((d) => key(d, h)), !all);
  };
  const weekdays10to6 = () => setCells(new Set(DAYS.slice(0, 5).flatMap((d) => HOURS.filter((h) => h >= 10 && h < 18).map((h) => key(d, h)))));
  const copyMonday = () => setCells((prev) => {
    const mon = HOURS.filter((h) => prev.has(key("Monday", h)));
    const next = new Set();
    DAYS.forEach((d) => mon.forEach((h) => next.add(key(d, h))));
    return next;
  });

  const handleSave = async () => {
    if (!payload.length) { toast.error("Select at least one hour"); return; }
    try {
      setLoading(true);
      const res = await postData(updateAvailabilitiesUrl, { schedule: payload });
      if (res?.status) {
        toast.success(res.message || "Availability saved!");
        setSaved(JSON.stringify(payload));
        setOffGrid(false);
        if (onSuccess) onSuccess();
      } else toast.error(res?.message || "Failed to save");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const total = cells.size;

  return (
    <div className="avg">
      <style dangerouslySetInnerHTML={{ __html: `
        .avg-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .avg-tools button { border: 1px solid #d5e3da; background: #fff; border-radius: 8px; padding: 7px 12px; font-size: 12.5px; font-weight: 700; color: #0f3d24; cursor: pointer; font-family: inherit; }
        .avg-tools button:hover { background: #f0fdf4; }
        .avg-tools .danger { color: #b91c1c; border-color: #fecaca; }
        .avg-count { margin-left: auto; font-size: 13px; font-weight: 700; color: #475569; }
        .avg-note { background: #fffbeb; border: 1px solid #fde68a; color: #78350f; border-radius: 10px; padding: 9px 12px; font-size: 12.5px; margin-bottom: 12px; }
        .avg-wrap { overflow-x: auto; border: 1px solid #e3ebe6; border-radius: 12px; user-select: none; -webkit-user-select: none; touch-action: pan-y; }
        .avg-table { border-collapse: separate; border-spacing: 0; width: 100%; min-width: 620px; }
        .avg-table th { position: sticky; top: 0; z-index: 1; background: #f6faf7; padding: 8px 4px; border-bottom: 1px solid #e3ebe6; }
        .avg-day { width: 100%; border: none; background: none; cursor: pointer; font-family: inherit; font-size: 12.5px; font-weight: 800; color: #0f3d24; padding: 2px 0; }
        .avg-day small { display: block; font-size: 10.5px; font-weight: 600; color: #94a3b8; }
        .avg-time { border: none; background: none; cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 700; color: #64748b; white-space: nowrap; padding: 0 10px; width: 100%; text-align: left; }
        .avg-table td { padding: 2px; border-bottom: 1px solid #f3f6f4; }
        .avg-table td.t { width: 78px; background: #fbfdfc; }
        .avg-cell { height: 34px; border-radius: 7px; border: 1.5px dashed #d8e4dc; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: transparent; transition: background .1s; }
        .avg-cell:hover { border-color: #86efac; }
        .avg-cell.on { background: #1a6b3a; border: 1.5px solid #1a6b3a; color: #fff; }
        .avg-cell:focus-visible { outline: 2px solid #f59e0b; outline-offset: 1px; }
        .avg-save { display: flex; align-items: center; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
        .avg-save button { background: #0f3d24; color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-weight: 800; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: inherit; }
        .avg-save button:disabled { opacity: .55; cursor: not-allowed; }
        .avg-save span { font-size: 12.5px; color: #b45309; font-weight: 700; }
      ` }} />

      <div className="avg-tools">
        <button type="button" onClick={weekdays10to6}>Weekdays 10 AM – 6 PM</button>
        <button type="button" onClick={copyMonday}>Copy Monday to all days</button>
        <button type="button" className="danger" onClick={() => setCells(new Set())}>Clear all</button>
        <span className="avg-count">{total} hour{total === 1 ? "" : "s"} / week</span>
      </div>

      {offGrid && (
        <div className="avg-note">
          Some of your saved hours don&rsquo;t start on the hour (e.g. 10:30). The table shows full hours only — saving will keep the highlighted hours.
        </div>
      )}

      <div className="avg-wrap" onTouchMove={onTouchMove}>
        <table className="avg-table">
          <thead>
            <tr>
              <th />
              {DAYS.map((d) => (
                <th key={d}>
                  <button type="button" className="avg-day" onClick={() => toggleDay(d)} title={`Select / clear all of ${d}`}>
                    {SHORT[d]}<small>{perDay(d) ? `${perDay(d)} hrs` : "Off"}</small>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h}>
                <td className="t">
                  <button type="button" className="avg-time" onClick={() => toggleHour(h)} title={`Toggle ${label(h)} on every day`}>{label(h)}</button>
                </td>
                {DAYS.map((d) => {
                  const on = cells.has(key(d, h));
                  return (
                    <td key={d}>
                      <div
                        className={`avg-cell ${on ? "on" : ""}`}
                        role="checkbox" aria-checked={on} tabIndex={0}
                        aria-label={`${d} ${label(h)} – ${label(h + 1)}`}
                        data-day={d} data-hour={h}
                        onMouseDown={(e) => { e.preventDefault(); if (Date.now() - lastTouch.current > 800) startDrag(d, h); }}
                        onMouseEnter={() => dragOver(d, h)}
                        onTouchStart={() => { lastTouch.current = Date.now(); startDrag(d, h); }}
                        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setCell(d, h, !on); } }}
                      >
                        {on ? "✓" : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="avg-save">
        <button type="button" onClick={handleSave} disabled={loading || !dirty}>
          {loading ? <CircularProgress size={16} style={{ color: "#fff" }} /> : <i className="feather-save" />}
          {dirty ? "Save availability" : "Saved"}
        </button>
        {dirty && <span>You have unsaved changes</span>}
      </div>
    </div>
  );
}

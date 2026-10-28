import React, { useEffect, useRef, useState } from "react";

// Pick a location on an OpenStreetMap map (Leaflet, loaded from a CDN on first use — no API key).
// Tap / click the map or drag the pin; search a clinic / area by name; or "Use my current location".
// Browser location is often approximate (laptops and Wi-Fi go by the network, not GPS), so it reads
// the position for a few seconds, keeps the most accurate fix, draws how far off it may be, and asks
// to drag the pin onto the practice when it's not precise.

const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const INDIA = { lat: 22.5, lng: 79.0 };
const GOOD_M = 60; // a fix this accurate is good enough to stop listening
const LISTEN_MS = 9000;

let leafletPromise = null;
function loadLeaflet() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = LEAFLET_CSS;
      document.head.appendChild(css);
    }
    const s = document.createElement("script");
    s.src = LEAFLET_JS;
    s.async = true;
    s.onload = () => resolve(window.L);
    s.onerror = () => { leafletPromise = null; reject(new Error("map failed to load")); };
    document.head.appendChild(s);
  });
  return leafletPromise;
}

const meters = (m) => (m >= 1000 ? `${(m / 1000).toFixed(m >= 10000 ? 0 : 1)} km` : `${Math.round(m)} m`);

/**
 * @param {{ value: {lat:number,lng:number}|null, center?: {lat:number,lng:number}|null, onChange: (p:{lat:number,lng:number})=>void, search?: boolean }} props
 * `center` moves the view (e.g. after a PIN code lookup) without placing the pin. `search` shows the place search.
 */
export default function MapPicker({ value, center, onChange, search = false }) {
  const box = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const watchRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [err, setErr] = useState("");
  const [locating, setLocating] = useState(false);
  const [accuracy, setAccuracy] = useState(null); // metres of the last "current location" fix
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const clearCircle = () => { if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; } };
  const place = (L, lat, lng, emit) => {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", (e) => {
        const p = e.target.getLatLng();
        clearCircle(); setAccuracy(null);
        onChangeRef.current({ lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) });
      });
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (emit) onChangeRef.current({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) });
  };

  // create the map once
  useEffect(() => {
    let alive = true;
    loadLeaflet().then((L) => {
      if (!alive || !box.current || mapRef.current) return;
      const start = value || center || INDIA;
      const map = L.map(box.current, { scrollWheelZoom: false }).setView([start.lat, start.lng], value ? 17 : center ? 13 : 4);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      // default marker icons come from the same CDN folder
      L.Icon.Default.imagePath = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/";
      mapRef.current = map;
      if (value) place(L, value.lat, value.lng, false);
      map.on("click", (e) => { clearCircle(); setAccuracy(null); place(L, e.latlng.lat, e.latlng.lng, true); });
    }).catch(() => alive && setErr("The map couldn't load. Check your connection and try again."));
    return () => {
      alive = false;
      if (watchRef.current != null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; circleRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // follow PIN-code lookups
  useEffect(() => {
    if (center && mapRef.current && !value) mapRef.current.setView([center.lat, center.lng], 14);
  }, [center, value]);

  const useMyLocation = () => {
    setErr("");
    if (!navigator.geolocation) { setErr("Location isn't available on this device."); return; }
    if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    setLocating(true);
    let best = null;
    const finish = () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
      clearTimeout(stopAt);
      setLocating(false);
      if (!best) { setErr("Couldn't get your location — search your area or tap your practice on the map instead."); return; }
      const { latitude, longitude, accuracy: acc } = best;
      const L = window.L, map = mapRef.current;
      if (!L || !map) return;
      clearCircle();
      circleRef.current = L.circle([latitude, longitude], { radius: acc, color: acc > GOOD_M * 3 ? "#d97706" : "#16a34a", weight: 1, fillOpacity: 0.12 }).addTo(map);
      map.fitBounds(circleRef.current.getBounds(), { maxZoom: 17 });
      place(L, latitude, longitude, true);
      setAccuracy(acc);
    };
    // listen for a few seconds and keep the most accurate fix (the first one is often a rough network guess)
    const stopAt = setTimeout(finish, LISTEN_MS);
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.accuracy) best = pos.coords;
        if (pos.coords.accuracy <= GOOD_M) finish();
      },
      (e) => {
        if (best) { finish(); return; }
        clearTimeout(stopAt);
        if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
        setLocating(false);
        setErr(e?.code === 1 ? "Location permission is off — allow it in your browser, or search / tap your practice on the map." : "Couldn't get your location — search your area or tap your practice on the map instead.");
      },
      { enableHighAccuracy: true, timeout: LISTEN_MS, maximumAge: 0 }
    );
  };

  const runSearch = async (e) => {
    e?.preventDefault?.();
    const text = q.trim();
    if (text.length < 3) return;
    setSearching(true); setErr("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&q=${encodeURIComponent(text)}`;
      const r = await fetch(url, { headers: { "Accept-Language": "en" } });
      const list = await r.json();
      setResults(Array.isArray(list) ? list : []);
    } catch {
      setResults([]); setErr("Search isn't working right now — tap your practice on the map instead.");
    } finally { setSearching(false); }
  };
  const pick = (r) => {
    const lat = Number(r.lat), lng = Number(r.lon);
    setResults(null);
    if (!window.L || !mapRef.current) return;
    clearCircle(); setAccuracy(null);
    mapRef.current.setView([lat, lng], 17);
    place(window.L, lat, lng, true);
  };

  const rough = accuracy != null && accuracy > GOOD_M * 3;
  return (
    <div className="mp">
      <style dangerouslySetInnerHTML={{ __html: MP_CSS }} />
      {search && (
        <form className="mp-search" onSubmit={runSearch} role="search">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your clinic, building or area…" aria-label="Search a place" />
          <button type="submit" disabled={searching || q.trim().length < 3}>{searching ? "…" : "Search"}</button>
          {results && (
            <div className="mp-results">
              {results.length ? results.map((r) => (
                <button type="button" key={r.place_id} onClick={() => pick(r)}>{r.display_name}</button>
              )) : <span>No match — try the area or landmark name, then drag the pin.</span>}
            </div>
          )}
        </form>
      )}
      <div ref={box} className="tr-map" role="application" aria-label="Map — tap to place your clinic's pin" />
      <div className="tr-map-bar">
        <button type="button" className="tr-btn-sm ghost" onClick={useMyLocation} disabled={locating}>
          <i className="feather-crosshair" /> {locating ? "Finding you… keep still" : "Use my current location"}
        </button>
        <span className="tr-map-status">
          {value ? <><i className="feather-check-circle" /> Pin placed — drag it to adjust</> : "Tap your clinic on the map to place a pin"}
        </span>
      </div>
      {accuracy != null && (
        <p className={`mp-acc${rough ? " rough" : ""}`}>
          {rough
            ? `Your device only knows roughly where you are (within about ${meters(accuracy)}) — zoom in and drag the pin onto your practice before saving.`
            : `Located to within about ${meters(accuracy)}. Check the pin sits on your practice.`}
        </p>
      )}
      {err && <p className="tr-file-err">{err}</p>}
    </div>
  );
}

const MP_CSS = `
.mp .tr-map { height: 280px; border-radius: 12px; border: 1.5px solid #cbd5c9; overflow: hidden; z-index: 0; background: #e8efeb; }
.mp .tr-map-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.mp .tr-map-status { font-size: 12.5px; color: #475569; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
.mp .tr-map-status i { color: #16a34a; }
.mp .tr-btn-sm { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 9px; background: #fff; color: #166534; border: 1.5px solid #86efac; font-size: 13px; font-weight: 700; cursor: pointer; margin: 0; font-family: inherit; }
.mp .tr-btn-sm:disabled { opacity: .7; cursor: default; }
.mp .tr-file-err { margin: 6px 0 0; font-size: 12.5px; color: #dc2626; font-weight: 600; }
.mp-search { position: relative; display: flex; gap: 8px; margin-bottom: 8px; }
.mp-search input { flex: 1; min-width: 0; height: 40px; border: 1.5px solid #cbd5c9; border-radius: 10px; padding: 0 12px; font-size: 14px; font-family: inherit; }
.mp-search > button { height: 40px; padding: 0 14px; border-radius: 10px; border: 0; background: #166534; color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; }
.mp-search > button:disabled { opacity: .6; cursor: default; }
.mp-results { position: absolute; top: 44px; left: 0; right: 0; z-index: 500; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 12px 30px -12px rgba(0,0,0,.3); max-height: 240px; overflow-y: auto; }
.mp-results button { display: block; width: 100%; text-align: left; padding: 9px 12px; border: 0; border-bottom: 1px solid #f1f5f9; background: #fff; font-size: 13px; color: #0f172a; cursor: pointer; font-family: inherit; }
.mp-results button:hover { background: #f0faf3; }
.mp-results span { display: block; padding: 10px 12px; font-size: 13px; color: #64748b; }
.mp-acc { margin: 8px 0 0; font-size: 12.5px; font-weight: 600; color: #166534; }
.mp-acc.rough { color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 8px 10px; }
@media (max-width: 575px) { .mp .tr-map { height: 260px; } }
`;

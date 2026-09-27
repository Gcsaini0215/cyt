import React, { useEffect, useRef, useState } from "react";

// Pick a location on an OpenStreetMap map (Leaflet, loaded from a CDN on first use — no API key).
// Tap / click the map or drag the pin; "Use my current location" asks the browser for GPS.

const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const INDIA = { lat: 22.5, lng: 79.0 };

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

/**
 * @param {{ value: {lat:number,lng:number}|null, center?: {lat:number,lng:number}|null, onChange: (p:{lat:number,lng:number})=>void }} props
 * `center` moves the view (e.g. after a PIN code lookup) without placing the pin.
 */
export default function MapPicker({ value, center, onChange }) {
  const box = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [err, setErr] = useState("");
  const [locating, setLocating] = useState(false);

  const place = (L, lat, lng, emit) => {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", (e) => {
        const p = e.target.getLatLng();
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
      const map = L.map(box.current, { scrollWheelZoom: false }).setView([start.lat, start.lng], value ? 16 : center ? 13 : 4);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      // default marker icons come from the same CDN folder
      L.Icon.Default.imagePath = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/";
      mapRef.current = map;
      if (value) place(L, value.lat, value.lng, false);
      map.on("click", (e) => place(L, e.latlng.lat, e.latlng.lng, true));
    }).catch(() => alive && setErr("The map couldn't load. Check your connection and try again."));
    return () => {
      alive = false;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; }
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
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        if (window.L && mapRef.current) {
          mapRef.current.setView([latitude, longitude], 17);
          place(window.L, latitude, longitude, true);
        }
      },
      () => { setLocating(false); setErr("Couldn't get your location — tap your clinic on the map instead."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <div ref={box} className="tr-map" role="application" aria-label="Map — tap to place your clinic's pin" />
      <div className="tr-map-bar">
        <button type="button" className="tr-btn-sm ghost" onClick={useMyLocation} disabled={locating}>
          <i className="feather-crosshair" /> {locating ? "Finding you…" : "Use my current location"}
        </button>
        <span className="tr-map-status">
          {value ? <><i className="feather-check-circle" /> Pin placed — drag it to adjust</> : "Tap your clinic on the map to place a pin"}
        </span>
      </div>
      {err && <p className="tr-file-err">{err}</p>}
    </div>
  );
}

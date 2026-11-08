// Place search for the "practice location" map.
//   GET /api/places?q=fortis+noida[&lat=..&lng=..][&session=..]  -> { source, results: [{ id, title, sub, lat?, lng? }] }
//   GET /api/places?id=<google place id>[&session=..]             -> { source: "google", result: { id, title, sub, lat, lng } }
// Google Places (verified business locations) when GOOGLE_PLACES_API_KEY (or the old maps key) works;
// otherwise Photon (OpenStreetMap), which needs no key. The key stays on the server.

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
let googleOffUntil = 0; // after a key/quota error, skip Google for a while instead of failing every keystroke

// small per-IP limit — a person typing makes a few calls a second at most
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const h = hits.get(ip) || { n: 0, at: now };
  if (now - h.at > 60000) { h.n = 0; h.at = now; }
  h.n += 1;
  hits.set(ip, h);
  if (hits.size > 5000) hits.clear();
  return h.n > 90;
}

const SKIP = new Set(["bus_stop", "elevator", "service", "platform", "stop_position", "entrance", "parking_entrance", "toilets", "atm", "bench", "waste_basket"]);
const num = (v) => (v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v));

async function photon(q, lat, lng) {
  const u = new URL("https://photon.komoot.io/api/");
  u.searchParams.set("q", q);
  u.searchParams.set("limit", "12");
  u.searchParams.set("lang", "en");
  u.searchParams.set("bbox", "68,6,98,37.5"); // India
  if (lat != null && lng != null) { u.searchParams.set("lat", String(lat)); u.searchParams.set("lon", String(lng)); }
  const r = await fetch(u, { headers: { "User-Agent": "chooseyourtherapist.in practice-location search" }, signal: AbortSignal.timeout(6000) });
  if (!r.ok) throw new Error(`photon ${r.status}`);
  const d = await r.json();
  const seen = new Set();
  const out = [];
  for (const f of d.features || []) {
    const p = f.properties || {};
    if (SKIP.has(p.osm_value)) continue;
    const [x, y] = f.geometry?.coordinates || [];
    if (x == null || y == null) continue;
    const title = p.name || [p.housenumber, p.street].filter(Boolean).join(" ") || p.city;
    if (!title) continue;
    const sub = [p.street && p.name ? p.street : null, p.district || p.locality, p.city || p.county, p.state, p.postcode].filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i && v !== title).join(", ");
    const key = `${title.toLowerCase()}|${y.toFixed(3)},${x.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: `osm:${p.osm_type}${p.osm_id}`, title, sub, lat: +y.toFixed(6), lng: +x.toFixed(6) });
    if (out.length >= 6) break;
  }
  return out;
}

async function googleSuggest(q, lat, lng, session) {
  const body = { input: q, includedRegionCodes: ["in"], languageCode: "en" };
  if (session) body.sessionToken = session;
  if (lat != null && lng != null) body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 50000 } };
  const r = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": GOOGLE_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  if (!r.ok) { const e = new Error(`google ${r.status}`); e.status = r.status; throw e; }
  const d = await r.json();
  return (d.suggestions || []).filter((s) => s.placePrediction).slice(0, 6).map(({ placePrediction: p }) => ({
    id: p.placeId,
    title: p.structuredFormat?.mainText?.text || p.text?.text || "",
    sub: p.structuredFormat?.secondaryText?.text || "",
  }));
}

async function googleDetails(id, session) {
  const u = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`);
  if (session) u.searchParams.set("sessionToken", session);
  const r = await fetch(u, {
    headers: { "X-Goog-Api-Key": GOOGLE_KEY, "X-Goog-FieldMask": "id,displayName,formattedAddress,location" },
    signal: AbortSignal.timeout(5000),
  });
  if (!r.ok) { const e = new Error(`google ${r.status}`); e.status = r.status; throw e; }
  const p = await r.json();
  if (!p.location) throw new Error("no location");
  return { id: p.id, title: p.displayName?.text || "", sub: p.formattedAddress || "", lat: +p.location.latitude.toFixed(6), lng: +p.location.longitude.toFixed(6) };
}

const googleOn = () => GOOGLE_KEY && Date.now() > googleOffUntil;
const googleFailed = (e) => { if ([400, 401, 403, 429].includes(e?.status)) googleOffUntil = Date.now() + 10 * 60 * 1000; };

export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ message: "Method not allowed" }); }
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  if (limited(ip)) return res.status(429).json({ message: "Too many searches — wait a moment." });
  res.setHeader("Cache-Control", "no-store");

  const session = String(req.query.session || "").slice(0, 64).replace(/[^\w-]/g, "");
  const id = String(req.query.id || "").slice(0, 300);
  if (id) {
    if (!GOOGLE_KEY) return res.status(400).json({ message: "Unknown place" });
    try { return res.json({ source: "google", result: await googleDetails(id, session) }); }
    catch (e) { googleFailed(e); return res.status(502).json({ message: "Couldn't open that place — try another result." }); }
  }

  const q = String(req.query.q || "").trim().slice(0, 120);
  if (q.length < 3) return res.json({ source: "none", results: [] });
  const lat = num(req.query.lat), lng = num(req.query.lng);
  const nearLat = lat != null && Math.abs(lat) <= 90 ? lat : null;
  const nearLng = lng != null && Math.abs(lng) <= 180 ? lng : null;

  if (googleOn()) {
    try {
      const results = await googleSuggest(q, nearLat, nearLng, session);
      if (results.length) return res.json({ source: "google", results });
    } catch (e) { googleFailed(e); }
  }
  try { return res.json({ source: "osm", results: await photon(q, nearLat, nearLng) }); }
  catch { return res.status(502).json({ message: "Search isn't working right now — tap your practice on the map instead." }); }
}

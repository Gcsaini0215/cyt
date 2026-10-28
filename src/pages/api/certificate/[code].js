// The achievement certificate as a PNG:
//   /api/certificate/CYT-1A2B3C4D.png        a real one (data from the backend's public verify endpoint)
//   /api/certificate/sample-<key>.png?name=   a watermarked SAMPLE (the Achievements page previews locked ones)
import { certificatePng, SAMPLE } from "../../../utils/certificate-image";
import { apiUrl } from "../../../utils/url";

export default async function handler(req, res) {
  const raw = String(req.query.code || "").replace(/\.png$/i, "");
  try {
    if (raw.startsWith("sample-")) {
      const s = SAMPLE[raw.slice(7)] || SAMPLE.excellence_100;
      const name = String(req.query.name || "Dr. Ananya Sharma").slice(0, 60);
      const png = await certificatePng({ ...s, therapist: { name, profile_type: "Clinical Psychologist", state: "Noida" }, code: "CYT-SAMPLE", unlockedAt: new Date() }, { sample: true });
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.status(200).end(png);
    }
    const code = raw.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
    const r = await fetch(`${apiUrl}/achievements/verify/${encodeURIComponent(code)}`);
    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.status) return res.status(404).send("Certificate not found");
    const png = await certificatePng(j.data);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    if (req.query.download) res.setHeader("Content-Disposition", `attachment; filename="CYT-${j.data.key}-certificate.png"`);
    return res.status(200).end(png);
  } catch (e) {
    console.error("certificate:", e?.message);
    return res.status(500).send("Couldn't make the certificate");
  }
}

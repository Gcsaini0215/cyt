// Share card for one job: /api/og/job/<slug>.jpg (1200x630, designed graphic with the job title).
import { jobCard, careersCard, sendJpeg } from "../../../../utils/og-images";
import { apiUrl } from "../../../../utils/url";

async function openJobs() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(`${apiUrl}/careers/jobs`, { signal: ctrl.signal });
    clearTimeout(t);
    const d = await r.json();
    return Array.isArray(d?.data) ? d.data : [];
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  try {
    const slug = String(req.query.file || "").replace(/\.(jpe?g|png)$/i, "");
    const jobs = await openJobs();
    const job = jobs.find((j) => j.slug === slug);
    return sendJpeg(res, job ? await jobCard(job) : await careersCard({ roles: jobs.map((j) => j.title) }), 3600);
  } catch (e) {
    console.error("og job:", e?.message);
    res.setHeader("Cache-Control", "public, max-age=600");
    return res.redirect(302, "/api/og/site.jpg?page=careers");
  }
}

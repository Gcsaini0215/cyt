// Plain-text index of every blog article for AI assistants and answer engines (linked from
// /llms.txt): title, topic, date, one-line summary and URL — always current.
import { getAllBlogs, blogCard } from "../../utils/blog-cache";

const SITE = "https://www.chooseyourtherapist.in";

export default async function handler(req, res) {
  let posts = [];
  try { posts = (await getAllBlogs()).map(blogCard); } catch (e) { /* serve the header anyway */ }
  const byTopic = posts.reduce((m, p) => { (m[p.category] = m[p.category] || []).push(p); return m; }, {});
  const lines = [
    "# Choose Your Therapist — Mental Health Blog (article index)",
    "",
    "> Articles on anxiety, depression, OCD, stress, relationships, trauma, self-care and therapy in India, written or reviewed by verified psychologists on Choose Your Therapist (HFR ID IN0510005384). General information, not medical advice; in a crisis in India call Tele-MANAS 14416 / 1800-89-14416 (free, 24×7).",
    "",
    `- Blog home: ${SITE}/blogs`,
    `- Find a verified psychologist: ${SITE}/view-all-therapist`,
    `- Articles: ${posts.length}`,
    "",
  ];
  Object.keys(byTopic).sort().forEach((topic) => {
    lines.push(`## ${topic}`);
    byTopic[topic].forEach((p) => {
      const d = p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "";
      lines.push(`- [${p.title}](${SITE}/blog-details?id=${p.id})${d ? ` (${d}, ${p.minutes} min read)` : ""}: ${p.excerpt.replace(/\s+/g, " ").trim()}`);
    });
    lines.push("");
  });
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
  res.status(200).send(lines.join("\n"));
}

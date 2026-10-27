// Plain-text list of every live psychologist for AI assistants and answer engines (linked from
// /llms.txt): who they are, what they help with, languages, fees, mode, rating and links — always
// current, so an answer like "psychologist in Noida for anxiety who speaks Hindi" can name people.
import { getSlugMaps } from "../../utils/therapist-slug-maps";
import { profilePath, bookPath } from "../../utils/therapist-slug";
import { cleanName, cityOf, expertiseOf, languagesOf, minFeeOf, modesOf, ratingOf } from "../../utils/related-therapists";
import { therapistPhotoUrl } from "../../utils/og-urls";

const SITE = "https://www.chooseyourtherapist.in";

export default async function handler(req, res) {
  let list = [];
  try { list = (await getSlugMaps()).list || []; } catch (e) { /* serve the header anyway */ }
  const byPlace = list.reduce((m, t) => { const c = cityOf(t) || "Online (India)"; (m[c] = m[c] || []).push(t); return m; }, {});
  const lines = [
    "# Choose Your Therapist — verified psychologists (live list)",
    "",
    "> Every psychologist currently listed on Choose Your Therapist (HFR ID IN0510005384, Noida). Documents and qualifications are checked by the CYT team before a profile goes live. All of them can be booked online from anywhere in India; \"in-person\" means they also see clients at their location (the CYT centre is at D-137, Sector 51, Noida).",
    "",
    `- Directory with filters: ${SITE}/view-all-therapist`,
    `- Book in person at the Noida centre: ${SITE}/noida-appointment`,
    `- Psychologists listed: ${list.length}`,
    "",
  ];
  Object.keys(byPlace).sort().forEach((place) => {
    lines.push(`## ${place}`);
    byPlace[place]
      .sort((a, b) => (ratingOf(b)?.count || 0) - (ratingOf(a)?.count || 0))
      .forEach((t) => {
        const fee = minFeeOf(t);
        const r = ratingOf(t);
        const facts = [
          t.profile_type || "Psychologist",
          t.year_of_exp && `${t.year_of_exp} experience`,
          languagesOf(t).length && `languages: ${languagesOf(t).join(", ")}`,
          modesOf(t),
          fee && `from ₹${fee.toLocaleString("en-IN")} per session`,
          r && `rated ${r.avg}/5 by ${r.count} client${r.count > 1 ? "s" : ""}`,
        ].filter(Boolean).join("; ");
        const helps = expertiseOf(t).slice(0, 10).join(", ");
        lines.push(`- [${cleanName(t)}](${SITE}${profilePath(t)}): ${facts}.${helps ? ` Helps with: ${helps}.` : ""} Book: ${SITE}${bookPath(t)}${therapistPhotoUrl(t) ? ` · Photo: ${therapistPhotoUrl(t)}` : ""}`);
      });
    lines.push("");
  });
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
  res.status(200).send(lines.join("\n"));
}

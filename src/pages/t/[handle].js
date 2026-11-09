// Short booking link: /t/<name>?src=my-ig → the therapist's profile (keeps ?src so their insights
// count the visit as "My link" / "QR scan"). Unknown names go to the therapist directory.
import { getSlugMaps } from "../../utils/therapist-slug-maps";
import { resolveHandle } from "../../utils/my-link";
import { profilePath } from "../../utils/therapist-slug";

export async function getServerSideProps({ params, query, res }) {
  let maps = await getSlugMaps();
  let id = resolveHandle(params.handle, maps);
  if (!id) { maps = await getSlugMaps(true); id = resolveHandle(params.handle, maps); }
  res.setHeader("Cache-Control", "no-store");
  if (!id) return { redirect: { destination: "/view-all-therapist", permanent: false } };
  const t = maps.list.find((x) => String(x._id) === id);
  const src = /^my-[a-z]{2,8}$/.test(String(query.src || "")) ? String(query.src) : "my-link";
  return { redirect: { destination: `${profilePath(t)}?src=${src}`, permanent: false } };
}

export default function ShortLink() { return null; }

// Blog post URLs: /blog/<title-words>-<_id>, e.g.
//   /blog/how-to-help-a-friend-during-a-panic-attack-6ada61e9e25a42228dc19fd7
// The id at the end is what the page looks up, so a renamed post keeps working (it 301s to its
// new slug). The old /blog-details?id=<_id> links 301 here too — parameter URLs were flagged
// by the SEO audit and give Google nothing to read in the address.

const words = (title) => {
  const all = String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (all.length <= 70) return all;
  // long titles: whole words up to ~70 characters
  return all.slice(0, 71).replace(/-[^-]*$/, "");
};

export const blogSlug = (b) => {
  const id = String(b?._id || b?.id || "");
  if (!id) return "";
  const w = words(b?.title);
  return w ? `${w}-${id}` : id;
};

export const blogPath = (b) => {
  const slug = blogSlug(b);
  return slug ? `/blog/${slug}` : "/blogs";
};

export const blogIdFromSlug = (slug) => (String(slug || "").match(/([a-f0-9]{24})$/i) || [])[1] || "";

// Cover image URL for a post. The image's address has to change when the image does — /api/blog-thumb
// is cached by browsers for a day, so without the version a replaced cover kept showing the old one.
const DEFAULT_COVER = "/assets/img/blog-card-048b22.jpg";
export const blogThumb = (b, abs = "") => {
  const id = String(b?._id || b?.id || "");
  if (!id || !(b?.hasImage || b?.image)) return DEFAULT_COVER;
  const v = Date.parse(b?.updatedAt || b?.v || b?.createdAt || "") || 0;
  return `${abs}/api/blog-thumb?id=${id}${v ? `&v=${v}` : ""}`;
};

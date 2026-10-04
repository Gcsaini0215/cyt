// Therapist profile URLs use profile type + name + location instead of the Mongo _id:
//   /view-profile/counselling-psychologist-teesta-joshi-uttar-pradesh
//   (old /view-profile/<_id> 301-redirects here)

export const slugifyName = (name) =>
  (name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const isObjectId = (s) => /^[a-f0-9]{24}$/i.test(s || "");

// "Noida, Uttar Pradesh" -> "noida": the most specific part of the location.
const locationSlug = (t) => slugifyName(String(t?.state || t?.user?.state || "").split(",")[0]);

export const nameSlug = (t) => slugifyName(t?.user?.name || t?.name);

// "counselling-psychologist-teesta-joshi-uttar-pradesh"; type/location are
// left out when missing.
export const therapistSlug = (t) => {
  const name = nameSlug(t);
  if (!name) return "";
  return [slugifyName(t?.profile_type), name, locationSlug(t)].filter(Boolean).join("-");
};

// Accepts a Therapist doc ({ _id, profile_type, state, user: { name } }) or a flat { _id, name, ... }.
// Falls back to the _id when there is no name.
export const profilePath = (t) => {
  if (!t) return "/view-profile";
  return `/view-profile/${therapistSlug(t) || t._id}`;
};

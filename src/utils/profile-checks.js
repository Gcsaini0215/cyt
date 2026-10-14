// What a client-ready therapist profile needs. `tab` is the /settings tab that fixes it.
// Shared by the settings page header and the "Settings" badge in the portal menu.

export const toList = (v) =>
  Array.isArray(v) ? v : typeof v === "string" && v.trim() ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

const hasText = (v) => (typeof v === "string" ? v.trim() !== "" && v !== "null" && v !== "undefined" : v != null && v !== "");

export function profileChecks(t) {
  if (!t?.user) return [];
  return [
    { key: "photo", label: "Profile photo", done: hasText(t.user.profile), tab: "profile" },
    { key: "bio", label: "About me", done: hasText(t.user.bio) && t.user.bio.trim().length >= 80, tab: "profile" },
    { key: "qualification", label: "Qualification", done: hasText(t.qualification) && t.qualification !== "Other (Please specify)", tab: "profile" },
    { key: "experience", label: "Experience", done: hasText(t.year_of_exp), tab: "profile" },
    { key: "languages", label: "Languages", done: toList(t.language_spoken).length > 0, tab: "profile" },
    { key: "formats", label: "Session formats", done: toList(t.session_formats).filter(Boolean).length > 0, tab: "profile" },
    { key: "location", label: "Location", done: hasText(t.state), tab: "profile" },
    { key: "services", label: "Services", done: hasText(t.services), tab: "offerings" },
    { key: "expertise", label: "Expertise", done: hasText(t.experties), tab: "offerings" },
  ];
}

export const profilePct = (t) => {
  const c = profileChecks(t);
  return c.length ? Math.round((c.filter((x) => x.done).length / c.length) * 100) : 0;
};

// "?next=/book/abc" -> where to send someone after they sign in. Only same-site paths are
// allowed ("/x", not "//evil.com" or "https://…"), so the parameter can't be used to bounce
// people to another website.
export const safeNext = (raw) => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v !== "string" || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return null;
  if (/^\/(login|register)(\/|\?|$)/.test(v)) return null;
  return v;
};

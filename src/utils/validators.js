// Standard-ish email check: anchored, case-insensitive, no whitespace,
// real TLD of 2+ chars. Replaces the old unanchored /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/
// which rejected valid addresses (uppercase, .info/.co.in, etc.) and accepted junk
// like "abc a@b.co xyz".
export const isValidMail = (email) => {
  if (typeof email !== "string") return false;
  const value = email.trim();
  if (value.length < 6 || value.length > 254) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  return emailRegex.test(value);
};

// Keep only digits, capped at `length` (default 6). Used to sanitise OTP input.
export const sanitizeOtp = (value, length = 6) => {
  return String(value ?? "").replace(/\D/g, "").slice(0, length);
};

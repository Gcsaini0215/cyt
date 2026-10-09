// Phone numbers on lead forms: a country-code picker (India by default) + the local number.
// Indian numbers are still sent as the plain 10 digits (the admin, WhatsApp links and older
// leads all assume that); any other country is sent in full international form, "+966501234567".

export const COUNTRY_CODES = [
  { code: "+91", iso: "IN", name: "India", flag: "🇮🇳" },
  { code: "+966", iso: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", iso: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "+974", iso: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "+965", iso: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "+968", iso: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "+973", iso: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "+977", iso: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "+880", iso: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", iso: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+65", iso: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "+60", iso: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "+44", iso: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", iso: "US", name: "USA / Canada", flag: "🇺🇸" },
  { code: "+61", iso: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "+64", iso: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "+49", iso: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "+33", iso: "FR", name: "France", flag: "🇫🇷" },
  { code: "+353", iso: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "+27", iso: "ZA", name: "South Africa", flag: "🇿🇦" },
];

export const DEFAULT_COUNTRY = "+91";
export const isIndia = (code) => code === DEFAULT_COUNTRY;

// digits only, capped so code + number never passes the 15-digit E.164 limit
export const cleanLocal = (code, value) =>
  String(value || "").replace(/\D/g, "").slice(0, isIndia(code) ? 10 : 15 - String(code).replace(/\D/g, "").length);

export const phonePlaceholder = (code) => (isIndia(code) ? "10-digit number" : "Mobile number");

// an error message, or "" when the number looks right
export function phoneError(code, local) {
  const n = String(local || "").trim();
  if (!n) return "Please enter your mobile number.";
  if (isIndia(code)) return /^[6-9]\d{9}$/.test(n) ? "" : "Enter a valid 10-digit mobile number.";
  return /^\d{6,14}$/.test(n.replace(/^0+/, "")) ? "" : "Enter a valid mobile number for the selected country.";
}

// the value sent to the API: "9876543210" for India, "+966501234567" elsewhere (a trunk 0 dropped)
export const fullPhone = (code, local) =>
  isIndia(code) ? String(local).trim() : `${code}${String(local).trim().replace(/^0+/, "")}`;

// shown back to the visitor ("We'll reach you on +966 501234567")
export const displayPhone = (code, local) => {
  const n = String(local).trim();
  return `${code} ${isIndia(code) ? n : n.replace(/^0+/, "")}`;
};

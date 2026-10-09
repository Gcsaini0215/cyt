import React from "react";
import { COUNTRY_CODES, cleanLocal, phonePlaceholder } from "../../utils/phone";

// Country code + mobile number in one box. The code is a native <select> (works with every
// phone keyboard and screen reader); the theme styles every <select> (full width, padding, its
// own arrow), so .pf-code resets all of that.
//   <PhoneField code={code} onCode={setCode} value={phone} onChange={setPhone} />
export default function PhoneField({ code, onCode, value, onChange, id, className = "", inputClassName = "", required = false }) {
  return (
    <div className={`pf ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <select className="pf-code" aria-label="Country code" value={code}
        onChange={(e) => { onCode(e.target.value); onChange(cleanLocal(e.target.value, value)); }}>
        {COUNTRY_CODES.map((c) => <option key={c.iso} value={c.code}>{c.flag} {c.code} {c.name}</option>)}
      </select>
      <span className="pf-shown" aria-hidden="true">{COUNTRY_CODES.find((c) => c.code === code)?.flag} {code}</span>
      <input id={id} type="tel" className={`pf-num ${inputClassName}`} value={value} required={required}
        onChange={(e) => onChange(cleanLocal(code, e.target.value))}
        inputMode="numeric" autoComplete="tel-national" placeholder={phonePlaceholder(code)} />
    </div>
  );
}

// the select is invisible and laid over the short "🇮🇳 +91" label, so the box stays compact
// while the open list still shows country names
const CSS = `
.pf { position: relative; display: flex; align-items: stretch; width: 100%; min-width: 0; }
.pf .pf-shown { position: absolute; left: 0; top: 0; bottom: 0; width: 78px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  font-size: 14px; font-weight: 700; color: #14532d; border-right: 1.5px solid #dbe5df; pointer-events: none; z-index: 1; white-space: nowrap; }
.pf .pf-shown::after { content: ""; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid #64748b; margin-left: 2px; }
.pf select.pf-code { position: absolute !important; left: 0; top: 0; bottom: 0; width: 78px !important; height: 100% !important; min-width: 0; margin: 0 !important; padding: 0 !important;
  opacity: 0; cursor: pointer; z-index: 2; border: none !important; background: none !important; -webkit-appearance: none; appearance: none; font-size: 16px; }
.pf input.pf-num { padding-left: 88px !important; flex: 1; min-width: 0; }
.pf select.pf-code:focus-visible + .pf-shown { outline: 2px solid #1e7a4c; outline-offset: -2px; border-radius: 10px 0 0 10px; }
`;

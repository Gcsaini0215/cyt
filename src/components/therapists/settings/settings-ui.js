import React from "react";

/* Shared bits for the Settings page tabs: section cards, the sticky unsaved-changes bar,
   profile completeness and the page CSS (dashboard green theme). */

import { toList, profileChecks } from "../../../utils/profile-checks";
export { toList, profileChecks };

export const langLabels = (v) => toList(v).map((o) => (typeof o === "object" && o ? o.label || o.value : o)).filter(Boolean);

export function Section({ title, sub, children, aside, id }) {
  return (
    <section className="stg-sec" id={id}>
      <div className="stg-sec-head">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {aside}
      </div>
      <div className="stg-sec-body">{children}</div>
    </section>
  );
}

export function Field({ label, htmlFor, error, hint, children, full, right }) {
  return (
    <div className={`stg-field${full ? " full" : ""}${error ? " has-err" : ""}`}>
      {label && (
        <label htmlFor={htmlFor}>
          <span>{label}</span>
          {right}
        </label>
      )}
      {children}
      {error ? <span className="stg-err" role="alert">{error}</span> : hint ? <span className="stg-hint">{hint}</span> : null}
    </div>
  );
}

/* Sticky bar at the bottom of a tab. Visible while there are unsaved changes, or briefly
   after a save to show the result. Sits above the phone bottom nav. */
export function SaveBar({ dirty, saving, onSave, onDiscard, error, success, label = "Save changes" }) {
  const quiet = !dirty && !saving && !error && !success;
  return (
    <div className={`stg-savebar show${quiet ? " quiet" : ""}${error ? " err" : ""}${success && !dirty ? " ok" : ""}`} aria-live="polite">
      <span className="stg-savebar-msg">
        {error ? error : saving ? "Saving…" : dirty
          ? <><span className="long">You have unsaved changes</span><span className="short">Unsaved changes</span></>
          : success || <><span className="long">Edit any field above, then save</span><span className="short">No changes yet</span></>}
      </span>
      <div className="stg-savebar-btns">
        {dirty && !saving && onDiscard && (
          <button type="button" className="stg-btn ghost" onClick={onDiscard}>Discard</button>
        )}
        {!success || dirty ? (
          <button type="button" className="stg-btn primary" onClick={onSave} disabled={saving}>
            {saving ? <span className="stg-spin" aria-hidden="true" /> : null}
            {saving ? "Saving" : label}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* Scroll to the first field with an error (after React paints it). */
export const scrollToFirstError = () =>
  setTimeout(() => {
    const el = document.querySelector(".stg-field.has-err");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top, behavior: "smooth" });
    el.querySelector("input,select,textarea")?.focus({ preventScroll: true });
  }, 30);

export const STG_CSS = `
.stg, .stg-dlg { --g: #166534; --g-dk: #0f3d24; --g-bg: #e7f6ec; --line: #e4ece7; --ink: #0f172a; --mut: #64748b; --faint: #94a3b8;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: var(--ink); }
.stg { max-width: 1180px; margin: 0 auto 24px; }
.stg *, .stg *::before, .stg *::after { box-sizing: border-box; }

/* header */
.stg-head { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 18px 20px; display: flex; gap: 16px; align-items: center; }
.stg-ava { width: 64px; height: 64px; border-radius: 16px; object-fit: cover; flex-shrink: 0; background: var(--g-bg); color: var(--g);
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; border: 1px solid var(--line); }
.stg-head-main { flex: 1; min-width: 0; }
.stg-head h1 { font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -.2px; color: var(--ink); line-height: 1.25; font-family: inherit; }
.stg-head .stg-mail { font-size: 13px; color: var(--mut); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stg-prog { margin-top: 10px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.stg-prog-bar { flex: 0 1 220px; height: 7px; border-radius: 9px; background: #edf2ef; overflow: hidden; min-width: 120px; }
.stg-prog-bar i { display: block; height: 100%; border-radius: 9px; background: linear-gradient(90deg, #22c55e, var(--g)); transition: width .4s ease; }
.stg-prog-txt { font-size: 12.5px; font-weight: 700; color: var(--g); }
.stg-prog-txt.warn { color: #b45309; }
.stg-missing { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.stg-missing button { border: 1px dashed #f0c27b; background: #fffbeb; color: #92400e; font-size: 11.5px; font-weight: 700; border-radius: 999px; padding: 3px 10px; cursor: pointer; }
.stg-missing button:hover { background: #fef3c7; }
.stg-head-act { display: flex; gap: 8px; flex-shrink: 0; align-self: flex-start; }

/* buttons */
.stg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 40px; padding: 0 16px; border-radius: 10px;
  font-size: 13.5px; font-weight: 700; cursor: pointer; border: 1px solid transparent; text-decoration: none !important; white-space: nowrap;
  transition: background .15s ease, border-color .15s ease, color .15s ease; font-family: inherit; }
.stg-btn svg { font-size: 18px; }
.stg-btn.primary { background: var(--g); color: #fff !important; }
.stg-btn.primary:hover { background: var(--g-dk); }
.stg-btn.primary:disabled { opacity: .7; cursor: default; }
.stg-btn.outline { background: #fff; color: var(--g) !important; border-color: #cfe3d6; }
.stg-btn.outline:hover { background: var(--g-bg); }
.stg-btn.ghost { background: transparent; color: var(--mut) !important; border-color: var(--line); }
.stg-btn.ghost:hover { background: #f4f7f5; color: var(--ink) !important; }
.stg-btn.danger { background: #fff; color: #dc2626 !important; border-color: #fecaca; }
.stg-btn.danger:hover { background: #fef2f2; }
.stg-spin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; animation: stgspin .7s linear infinite; }
@keyframes stgspin { to { transform: rotate(360deg); } }

/* tabs */
.stg-tabs { position: sticky; top: var(--tn-h, 56px); z-index: 20; margin: 14px -4px 0; padding: 8px 4px; background: #f4f6f5; }
.stg-tabs-in { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 5px; }
.stg-tabs-in::-webkit-scrollbar { display: none; }
.stg-tab { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 16px; border-radius: 10px; border: 0;
  background: transparent; color: var(--mut); font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; }
.stg-tab svg { font-size: 19px; }
.stg-tab:hover { color: var(--g); background: #f4f7f5; }
.stg-tab.active { background: var(--g-bg); color: var(--g); }
.stg-tab .dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; }

/* info box */
.stg-info { display: flex; gap: 10px; align-items: flex-start; background: #f0f9ff; border: 1px solid #cfe8f7; color: #0c4a6e; border-radius: 12px;
  padding: 10px 14px; font-size: 13px; line-height: 1.5; margin: 6px 0 14px; }
.stg-info svg { font-size: 18px; color: #0284c7; flex-shrink: 0; margin-top: 1px; }
.stg-info a { color: var(--g) !important; font-weight: 700; }

/* sections + fields */
.stg-sec { background: #fff; border: 1px solid var(--line); border-radius: 16px; margin-bottom: 14px; scroll-margin-top: 130px; }
.stg-sec-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 16px 20px 0; }
.stg-sec-head h2 { font-size: 15.5px; font-weight: 800; margin: 0; color: var(--ink); font-family: inherit; letter-spacing: -.1px; }
.stg-sec-head p { font-size: 12.5px; color: var(--mut); margin: 3px 0 0; line-height: 1.45; }
.stg-cards.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.stg-sec-body { padding: 14px 20px 20px; }
.stg-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; }
.stg-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.stg-field.full { grid-column: 1 / -1; }
.stg-field > label { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin: 0;
  font-size: 12.5px; font-weight: 700; color: #334155; text-transform: none; letter-spacing: 0; }
.stg-field > label small { font-weight: 600; color: var(--faint); font-size: 11.5px; }
.stg .stg-input, .stg-field input:not([type=file]):not([type=checkbox]):not([type=radio]), .stg-field select, .stg-field textarea {
  width: 100%; height: 44px; border: 1px solid #d6e0da !important; border-radius: 10px !important; background: #fff; padding: 0 12px;
  font-size: 14.5px; color: var(--ink); font-family: inherit; box-shadow: none; transition: border-color .15s ease, box-shadow .15s ease; margin: 0; line-height: normal; }
.stg-field select { padding-right: 32px; appearance: none; -webkit-appearance: none; cursor: pointer;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center; }
.stg-field textarea { height: auto; min-height: 160px; padding: 10px 12px; line-height: 1.6; resize: vertical; }
.stg-field input:focus, .stg-field select:focus, .stg-field textarea:focus { border-color: var(--g) !important; box-shadow: 0 0 0 3px rgba(22,101,52,.12) !important; outline: none; }
.stg-field input[readonly] { background: #f6f8f7; color: var(--mut); }
.stg-field.has-err input, .stg-field.has-err select, .stg-field.has-err textarea { border-color: #ef4444 !important; }
.stg-err { font-size: 12px; color: #dc2626; font-weight: 600; }
.stg-hint { font-size: 12px; color: var(--faint); }
.stg-count { font-size: 11.5px; font-weight: 700; color: var(--faint); }
.stg-count.ok { color: var(--g); } .stg-count.warn { color: #b45309; }
.stg-tip { font-size: 12.5px; color: var(--mut); background: #f8faf9; border: 1px dashed #d6e0da; border-radius: 10px; padding: 9px 12px; line-height: 1.5; }

/* react-select inside settings */
.stg .stg-rs .select__control { min-height: 44px; border-radius: 10px; border-color: #d6e0da; box-shadow: none; }
.stg .stg-rs .select__control--is-focused { border-color: var(--g); box-shadow: 0 0 0 3px rgba(22,101,52,.12); }
.stg .stg-rs .select__input-container, .stg .stg-rs input { height: auto !important; border: 0 !important; box-shadow: none !important; }
.stg .stg-rs .select__multi-value { background: var(--g-bg); border-radius: 7px; }
.stg .stg-rs .select__multi-value__label { color: var(--g); font-weight: 700; font-size: 13px; }
.stg .stg-rs .select__multi-value__remove { color: var(--g); border-radius: 0 7px 7px 0; }
.stg .stg-rs .select__multi-value__remove:hover { background: #fee2e2; color: #dc2626; }
.stg .stg-rs .select__menu { z-index: 30; border-radius: 10px; overflow: hidden; }

/* photo */
.stg-photo { display: flex; align-items: center; gap: 18px; }
.stg-photo-img { width: 104px; height: 104px; border-radius: 20px; object-fit: cover; border: 1px solid var(--line); background: var(--g-bg); color: var(--g);
  display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 800; flex-shrink: 0; }
.stg-photo-txt b { display: block; font-size: 14px; }
.stg-photo-txt p { font-size: 12.5px; color: var(--mut); margin: 3px 0 10px; }
.stg-photo-txt .stg-new { display: inline-block; font-size: 11.5px; font-weight: 700; color: #b45309; background: #fffbeb; border-radius: 999px; padding: 2px 9px; margin-left: 8px; }

/* choice cards (session formats, services, payment method) */
.stg-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.stg-card { position: relative; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1.5px solid #dfe7e2; border-radius: 12px;
  background: #fff; cursor: pointer; text-align: left; font-family: inherit; min-height: 60px; width: 100%; transition: border-color .15s ease, background .15s ease; }
.stg-card:hover { border-color: #9fcbb0; }
.stg-card.on { border-color: var(--g); background: #f3fbf6; }
.stg-card-ic { width: 38px; height: 38px; border-radius: 10px; background: var(--g-bg); color: var(--g); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stg-card.on .stg-card-ic { background: var(--g); color: #fff; }
.stg-card-ic svg { font-size: 20px; }
.stg-card b { display: block; font-size: 13.5px; font-weight: 700; color: var(--ink); line-height: 1.25; }
.stg-card small { display: block; font-size: 11.5px; color: var(--mut); margin-top: 2px; line-height: 1.3; }
.stg-card-tick { margin-left: auto; width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #cbd5d0; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.stg-card.on .stg-card-tick { background: var(--g); border-color: var(--g); }
.stg-card.on .stg-card-tick::after { content: ""; width: 8px; height: 4.5px; border: 2px solid #fff; border-top: 0; border-right: 0; transform: rotate(-45deg) translate(1px, -1px); }

/* expertise */
.stg-exp-tools { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; }
.stg-search { position: relative; flex: 1; }
.stg-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--faint); font-size: 19px; pointer-events: none; }
.stg-search input { padding-left: 38px !important; }
.stg-cats { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin-bottom: 12px; padding-bottom: 2px; }
.stg-cats::-webkit-scrollbar { display: none; }
.stg-cat { flex: 0 0 auto; height: 34px; padding: 0 13px; border-radius: 999px; border: 1px solid var(--line); background: #fff; color: var(--mut);
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 6px; }
.stg-cat.active { background: var(--g-dk); border-color: var(--g-dk); color: #fff; }
.stg-cat i { font-style: normal; font-size: 11px; background: var(--g-bg); color: var(--g); border-radius: 999px; padding: 0 7px; line-height: 18px; }
.stg-cat.active i { background: rgba(255,255,255,.2); color: #fff; }
.stg-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.stg-chip { height: 36px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #dfe7e2; background: #fff; color: #334155; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 6px; transition: all .15s ease; }
.stg-chip:hover { border-color: #9fcbb0; color: var(--g); }
.stg-chip.on { background: var(--g); border-color: var(--g); color: #fff; }
.stg-chip.on::before { content: "✓"; font-size: 12px; }
.stg-chip small { font-size: 11px; opacity: .7; font-weight: 600; }
.stg-picked { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.stg-picked span { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: var(--g); background: var(--g-bg); border-radius: 999px; padding: 4px 6px 4px 10px; }
.stg-picked button { border: 0; background: transparent; color: var(--g); cursor: pointer; width: 18px; height: 18px; border-radius: 50%; line-height: 1; font-size: 14px; padding: 0; }
.stg-picked button:hover { background: #fee2e2; color: #dc2626; }
.stg-empty { font-size: 13px; color: var(--faint); padding: 8px 0; }
.stg-link { border: 0; background: none; color: var(--g); font-weight: 700; font-size: 13px; cursor: pointer; padding: 0; font-family: inherit; }
.stg-link:hover { text-decoration: underline; }

/* payments */
.stg-saved { display: flex; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 12px; background: #f3fbf6; border: 1px solid #cfe3d6; margin-bottom: 14px; }
.stg-saved svg { color: var(--g); font-size: 22px; flex-shrink: 0; }
.stg-saved b { font-size: 13.5px; display: block; }
.stg-saved small { font-size: 12.5px; color: var(--mut); display: block; margin-top: 1px; font-variant-numeric: tabular-nums; }
.stg-bank { font-size: 12px; font-weight: 700; color: var(--g); }
.stg-bank.bad { color: #dc2626; }
.stg-inputwrap { position: relative; }
.stg-eye { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); border: 0; background: none; color: var(--faint); width: 34px; height: 34px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.stg-eye:hover { background: #f4f7f5; color: var(--ink); }
.stg-eye svg { font-size: 19px; }

/* account */
.stg-linkrow.stg-field { display: flex; flex-direction: row; gap: 8px; align-items: center; }
.stg-linkrow input { flex: 1; }
.stg-kv { display: grid; grid-template-columns: 140px 1fr; gap: 8px 12px; font-size: 13.5px; }
.stg-kv dt { color: var(--mut); font-weight: 600; } .stg-kv dd { margin: 0; font-weight: 700; word-break: break-word; }

/* google connect */
.stg-gconn { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #cfe3d6; background: #f3fbf6; border-radius: 12px; }
.stg-gconn-ic { width: 38px; height: 38px; border-radius: 10px; background: #fff; border: 1px solid #e4ece7; display: grid; place-items: center; font-weight: 800; font-size: 18px;
  color: #4285f4; flex-shrink: 0; }
.stg-gconn b { display: block; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stg-gconn small { display: block; font-size: 12.5px; color: var(--mut); margin-top: 1px; }
.stg-gsteps { margin: 0; padding-left: 18px; display: grid; gap: 6px; font-size: 13.5px; color: #334155; line-height: 1.5; }

/* email preference switches */
.stg-prefs { list-style: none; margin: 0; padding: 0; }
.stg-prefs li { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 0; border-top: 1px solid #eef2f0; margin: 0; }
.stg-prefs li:first-child { border-top: 0; padding-top: 2px; }
.stg-prefs b { display: block; font-size: 14px; font-weight: 700; }
.stg-prefs small { display: block; font-size: 12.5px; color: var(--mut); margin-top: 1px; line-height: 1.4; }
.stg-switch { position: relative; width: 46px; height: 28px; border-radius: 999px; border: 0; background: #cbd5d0; cursor: pointer; flex-shrink: 0; padding: 0; transition: background .18s ease; }
.stg-switch i { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .18s ease; }
.stg-switch.on { background: var(--g); }
.stg-switch.on i { transform: translateX(18px); }
.stg-switch:disabled { opacity: .7; cursor: default; }
.stg-switch.locked { opacity: .55; display: inline-block; }

/* sticky save bar */
.stg-savebar { position: sticky; bottom: 12px; z-index: 25; display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: #0f172a; color: #fff; border-radius: 14px; padding: 10px 10px 10px 18px; margin-top: 4px; box-shadow: 0 14px 34px -10px rgba(15,23,42,.45);
  transform: translateY(16px); opacity: 0; pointer-events: none; transition: transform .2s ease, opacity .2s ease; min-height: 60px; }
.stg-savebar.show { transform: none; opacity: 1; pointer-events: auto; }
.stg-savebar.ok { background: var(--g); }
.stg-savebar.quiet { background: #fff; color: var(--mut); border: 1px solid var(--line); box-shadow: 0 10px 28px -14px rgba(15,23,42,.25); }
.stg-savebar.quiet .stg-btn.primary { background: var(--g); color: #fff !important; }
.stg-savebar.quiet .stg-btn.primary:hover { background: var(--g-dk); }
.stg-savebar.err { background: #b91c1c; }
.stg-savebar-msg { font-size: 13.5px; font-weight: 600; min-width: 0; }
.stg-savebar-btns { display: flex; gap: 8px; flex-shrink: 0; }
.stg-savebar .stg-btn.ghost { color: #e2e8f0 !important; border-color: rgba(255,255,255,.25); }
.stg-savebar .stg-btn.ghost:hover { background: rgba(255,255,255,.1); color: #fff !important; }
.stg-savebar .stg-btn.primary { background: #22c55e; color: #052e16 !important; }
.stg-savebar .stg-btn.primary:hover { background: #4ade80; }
.stg-savebar.err .stg-btn.primary { background: #fff; color: #b91c1c !important; }
.stg-savebar .stg-spin { border-color: rgba(5,46,22,.3); border-top-color: #052e16; }

/* the chat bubble would sit on top of the save bar */
body:has(.stg-savebar.show:not(.quiet)) .cw-fab { opacity: 0; pointer-events: none; }
@media (max-width: 767px) { body:has(.stg-savebar) .cw-fab { display: none; } }
.stg-savebar-msg .short { display: none; }

/* preview card */
.stg-pv { font-family: Inter, system-ui, sans-serif; }
.stg-pv-top { display: flex; gap: 14px; align-items: center; }
.stg-pv-img { width: 84px; height: 84px; border-radius: 16px; object-fit: cover; flex-shrink: 0; background: #e7f6ec; color: #166534; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 800; }
.stg-pv h3 { font-size: 18px; font-weight: 800; margin: 0; color: #0f172a; font-family: inherit; }
.stg-pv .t { font-size: 12.5px; color: #166534; font-weight: 700; margin-top: 2px; }
.stg-pv .q { font-size: 12.5px; color: #64748b; margin-top: 2px; }
.stg-pv ul { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 8px; }
.stg-pv li { display: flex; gap: 8px; align-items: flex-start; font-size: 13px; color: #334155; margin: 0; }
.stg-pv li svg { font-size: 17px; color: #166534; flex-shrink: 0; margin-top: 1px; }
.stg-pv .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.stg-pv .tags span { font-size: 11.5px; font-weight: 700; color: #166534; background: #e7f6ec; border-radius: 999px; padding: 3px 10px; }
.stg-pv .bio { font-size: 13px; color: #475569; line-height: 1.6; margin: 12px 0 0; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.stg-pv .miss { color: #b45309; font-style: italic; }

/* tablet */
@media (max-width: 1023px) {
  .stg-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
/* phones */
@media (max-width: 430px) { .stg-tab svg { display: none; } .stg-tab { padding: 0 11px; } }
@media (max-width: 767px) {
  .stg { margin-bottom: 8px; }
  .stg-head { flex-wrap: wrap; padding: 16px; gap: 12px; border-radius: 14px; }
  .stg-ava { width: 54px; height: 54px; font-size: 20px; border-radius: 14px; }
  .stg-head h1 { font-size: 18px; }
  .stg-head-act { width: 100%; }
  .stg-head-act .stg-btn { flex: 1; }
  .stg-prog-bar { flex-basis: 100%; }
  .stg-tabs { margin: 10px -16px 0; padding: 8px 16px; }
  .stg-tab { padding: 0 12px; font-size: 13.5px; gap: 6px; }
  .stg-tabs-in { gap: 2px; }
  .stg-sec { border-radius: 14px; }
  .stg-sec-head { padding: 14px 16px 0; }
  .stg-sec-body { padding: 12px 16px 16px; }
  .stg-grid { grid-template-columns: 1fr; gap: 14px; }
  .stg-cards { grid-template-columns: 1fr; }
  .stg-photo-img { width: 84px; height: 84px; font-size: 30px; border-radius: 18px; }
  .stg-savebar { bottom: calc(72px + env(safe-area-inset-bottom, 0px)); padding: 8px 8px 8px 14px; border-radius: 12px; }
  .stg-savebar-msg { font-size: 12.5px; }
  .stg-savebar-msg .long { display: none; } .stg-savebar-msg .short { display: inline; }
  .stg-cards.two { grid-template-columns: 1fr; }
  .stg-sec-head p, .stg-photo-txt p, .stg-tip { line-height: 1.45; }
  .stg-savebar .stg-btn { height: 38px; padding: 0 12px; font-size: 13px; }
  .stg-kv { grid-template-columns: 1fr; gap: 2px; }
  .stg-kv dd { margin-bottom: 8px; }
  .stg-exp-tools { flex-wrap: wrap; }
}
`;

/* Page chrome for the simpler therapist-portal pages (Payouts, Help & support):
   same tokens as the dashboard / settings. */
export const PT_CSS = `
.pt { --g: #14532d; --g-dk: #0f3d24; --g-bg: #e7f6ec; --line: #e4ece7; --ink: #0f172a; --mut: #64748b; --faint: #94a3b8;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: var(--ink); max-width: 1180px; margin: 0 auto 24px; }
.pt *, .pt *::before, .pt *::after { box-sizing: border-box; }
.pt-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.pt-head h1 { font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -.2px; color: var(--ink); font-family: inherit; }
.pt-head p { font-size: 13.5px; color: var(--mut); margin: 4px 0 0; line-height: 1.45; }
.pt-card { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 16px 18px; margin-bottom: 14px; min-width: 0; }
.pt-card-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.pt-card-h h2 { font-size: 15.5px; font-weight: 800; margin: 0; color: var(--ink); font-family: inherit; }
.pt-card-h a, .pt-link { font-size: 13px; font-weight: 700; color: var(--g) !important; text-decoration: none !important; }
.pt-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
.pt-stat { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px; }
.pt-stat small { display: block; font-size: 12px; font-weight: 700; color: var(--mut); }
.pt-stat b { display: block; font-size: 22px; font-weight: 800; margin-top: 4px; font-variant-numeric: tabular-nums; }
.pt-stat span { display: block; font-size: 11.5px; color: var(--faint); margin-top: 2px; }
.pt-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 42px; padding: 0 16px; border-radius: 11px; font-size: 14px;
  font-weight: 700; cursor: pointer; border: 1px solid transparent; text-decoration: none !important; white-space: nowrap; font-family: inherit; }
.pt-btn svg { font-size: 19px; }
.pt-btn.primary { background: var(--g); color: #fff !important; } .pt-btn.primary:hover { background: var(--g-dk); }
.pt-btn.primary:disabled { opacity: .65; cursor: default; }
.pt-btn.outline { background: #fff; color: var(--g) !important; border-color: #cfe3d6; } .pt-btn.outline:hover { background: var(--g-bg); }
.pt-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; border-radius: 999px; padding: 3px 10px; white-space: nowrap; }
.pt-chip.ok { background: #e7f6ec; color: #14532d; } .pt-chip.warn { background: #fef3c7; color: #92400e; } .pt-chip.mut { background: #f1f5f9; color: #475569; }
.pt-empty { text-align: center; padding: 26px 12px; color: var(--mut); font-size: 13.5px; line-height: 1.55; }
.pt-empty b { display: block; color: var(--ink); font-size: 15px; margin-bottom: 4px; }
.pt-skel { height: 64px; border-radius: 12px; margin-bottom: 8px; background: linear-gradient(90deg,#eef2f0 0%,#f7f9f8 40%,#eef2f0 80%); background-size: 600px 100%; animation: ptsk 1.3s infinite linear; }
@keyframes ptsk { from { background-position: -300px 0; } to { background-position: 300px 0; } }
.pt-err { font-size: 13px; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; }
@media (max-width: 767px) {
  .pt-head h1 { font-size: 19px; }
  .pt-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
  .pt-stats .pt-stat:first-child { grid-column: 1 / -1; }
  .pt-stat b { font-size: 19px; }
  .pt-card { padding: 14px; border-radius: 14px; }
}

/* ═══ Apple / iPhone look for every page built on this chrome (2026-11-18) ═══ */
.pt { --ap-ink: #1c1c1e; --ap-2: #6e6e73; --ap-3: #8e8e93; --ap-line: rgba(60,60,67,.12); --ap-fill: #f2f4f3; --ap-green: #1e8a4f; color: var(--ap-ink); }
.pt-head { margin-bottom: 18px; }
.pt-head h1 { font-size: clamp(26px, 2.6vw, 32px); font-weight: 800; letter-spacing: -.03em; color: var(--ap-ink); }
.pt-head p { font-size: 14.5px; color: var(--ap-2); margin-top: 4px; }
.pt-card { border: 0; border-radius: 22px; padding: 18px 20px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
.pt-card-h { margin-bottom: 14px; }
.pt-card-h h2 { font-size: 17px; font-weight: 700; letter-spacing: -.02em; color: var(--ap-ink); }
.pt-card-h a, .pt-link { font-size: 13.5px; font-weight: 600; color: var(--ap-green) !important; }
.pt-stats { gap: 12px; margin-bottom: 16px; }
.pt-stat { border: 0; border-radius: 20px; padding: 16px 18px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
.pt-stat small { font-size: 13.5px; font-weight: 600; color: var(--ap-ink); }
.pt-stat b { font-size: clamp(24px, 2.4vw, 30px); letter-spacing: -.03em; color: var(--ap-ink); margin-top: 6px; }
.pt-stat span { font-size: 12.5px; color: var(--ap-3); }
.pt-stat:nth-child(1) b { color: #1e8a4f; }
/* buttons: rounded, green primary, tinted secondary */
.pt-btn { border-radius: 12px; border: 0; font-weight: 700; transition: transform .15s ease, background .15s ease; }
.pt-btn:hover { transform: translateY(-1px); } .pt-btn:active { transform: translateY(1px) scale(.98); }
.pt-btn.primary { background: linear-gradient(180deg, #2fb36a, #1e8a4f 55%, #17763f); box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 8px 16px -10px rgba(23,118,63,.8); }
.pt-btn.primary:hover { background: linear-gradient(180deg, #34c172, #1f9455 55%, #17763f); }
.pt-btn.outline { background: #e3f4e9; color: #14532d !important; border: 0; }
.pt-btn.outline:hover { background: #d2ecdb; }
.pt-chip.ok { background: #e3f4e9; color: #15803d; } .pt-chip.warn { background: #fff1e0; color: #b45309; } .pt-chip.mut { background: #f2f2f7; color: #3c3c43; }
.pt-empty { color: var(--ap-3); } .pt-empty b { color: var(--ap-ink); font-size: 16px; }
.pt-err { background: #ffecea; border: 0; color: #b42318; border-radius: 12px; }
.pt-skel { border-radius: 16px; }
/* form fields: filled like iOS */
.pt input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=color]), .pt select, .pt textarea {
  background-color: var(--ap-fill); border: 1px solid transparent; border-radius: 12px; color: var(--ap-ink); }
.pt input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=color]):focus, .pt select:focus, .pt textarea:focus {
  outline: none; background-color: #fff; border-color: #34c759; box-shadow: 0 0 0 4px rgba(52,199,89,.18); }
/* plain tables on these pages: a clean iOS list */
.pt table { border-collapse: separate; border-spacing: 0; }
.pt th { color: var(--ap-3); font-weight: 600; text-transform: none; letter-spacing: 0; }
@media (prefers-reduced-motion: reduce) { .pt-btn { transition: none; } .pt-btn:hover, .pt-btn:active { transform: none; } }
@media (max-width: 767px) {
  .pt-head h1 { font-size: 24px; }
  .pt-card { border-radius: 20px; padding: 16px; }
  .pt-stat { border-radius: 18px; padding: 13px 14px; }
  .pt-stat b { font-size: 22px; }
  .pt input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=color]), .pt select, .pt textarea { font-size: 16px; }
}
`;

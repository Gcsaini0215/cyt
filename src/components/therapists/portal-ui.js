/* Page chrome for the simpler therapist-portal pages (Payouts, Help & support):
   same tokens as the dashboard / settings. */
export const PT_CSS = `
.pt { --g: #166534; --g-dk: #0f3d24; --g-bg: #e7f6ec; --line: #e4ece7; --ink: #0f172a; --mut: #64748b; --faint: #94a3b8;
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
.pt-chip.ok { background: #e7f6ec; color: #166534; } .pt-chip.warn { background: #fef3c7; color: #92400e; } .pt-chip.mut { background: #f1f5f9; color: #475569; }
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
`;

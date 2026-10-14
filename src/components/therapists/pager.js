import React, { useEffect, useMemo, useRef, useState } from "react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

/* Pagination for therapist-portal lists.
   const pg = usePager(items, 10, resetKey);  →  render pg.items, then <Pager pg={pg} />
   resetKey: anything that changes the list's meaning (filter, search, sort) — goes back to page 1.
   <Pager compact /> is the small "‹ 2 / 5 ›" version for dashboard cards. */

export function usePager(list, size = 10, resetKey = "") {
  const [page, setPage] = useState(1);
  const total = list?.length || 0;
  const pages = Math.max(1, Math.ceil(total / size));
  useEffect(() => { setPage(1); }, [resetKey]);
  // the list shrank (deleted / filtered elsewhere) → stay on a page that exists
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);
  const cur = Math.min(page, pages);
  const items = useMemo(() => (list || []).slice((cur - 1) * size, cur * size), [list, cur, size]);
  return { page: cur, pages, total, size, items, setPage, from: total ? (cur - 1) * size + 1 : 0, to: Math.min(cur * size, total) };
}

// 1 … 4 5 6 … 12
function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const out = [1];
  const lo = Math.max(2, page - 1), hi = Math.min(pages - 1, page + 1);
  if (lo > 2) out.push("…a");
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < pages - 1) out.push("…b");
  out.push(pages);
  return out;
}

export function Pager({ pg, compact = false, noun = "", scrollTo = true }) {
  const ref = useRef(null);
  if (!pg || pg.pages <= 1) return null;
  const go = (p) => {
    pg.setPage(Math.max(1, Math.min(pg.pages, p)));
    // bring the top of the list back into view (not for the small card pagers)
    if (scrollTo && !compact && ref.current) {
      const list = ref.current.closest("[data-pager-scope]") || ref.current.parentElement;
      const y = list.getBoundingClientRect().top + window.scrollY - 80;
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  if (compact) {
    return (
      <div className="pgr pgr-c" ref={ref}>
        <button type="button" onClick={() => go(pg.page - 1)} disabled={pg.page <= 1} aria-label="Previous"><ChevronLeftRoundedIcon /></button>
        <span>{pg.page} / {pg.pages}</span>
        <button type="button" onClick={() => go(pg.page + 1)} disabled={pg.page >= pg.pages} aria-label="Next"><ChevronRightRoundedIcon /></button>
        <style dangerouslySetInnerHTML={{ __html: PGR_CSS }} />
      </div>
    );
  }
  return (
    <nav className="pgr" ref={ref} aria-label="Pages">
      <span className="pgr-info">Showing <b>{pg.from}–{pg.to}</b> of <b>{pg.total}</b>{noun ? ` ${noun}` : ""}</span>
      <div className="pgr-btns">
        <button type="button" className="pgr-nav" onClick={() => go(pg.page - 1)} disabled={pg.page <= 1}><ChevronLeftRoundedIcon /><span>Prev</span></button>
        {pageList(pg.page, pg.pages).map((p) => (typeof p === "string"
          ? <span key={p} className="pgr-gap">…</span>
          : <button type="button" key={p} className={`pgr-num${p === pg.page ? " on" : ""}`} onClick={() => go(p)} aria-current={p === pg.page ? "page" : undefined}>{p}</button>))}
        <button type="button" className="pgr-nav" onClick={() => go(pg.page + 1)} disabled={pg.page >= pg.pages}><span>Next</span><ChevronRightRoundedIcon /></button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: PGR_CSS }} />
    </nav>
  );
}

const PGR_CSS = `
.pgr { display: flex; align-items: center; justify-content: space-between; gap: 10px 14px; flex-wrap: wrap; margin: 14px 0 4px; font-family: inherit; }
.pgr-info { font-size: 13px; color: #64748b; }
.pgr-info b { color: #0f172a; font-weight: 700; }
.pgr-btns { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.pgr button { display: inline-flex; align-items: center; justify-content: center; gap: 2px; height: 36px; min-width: 36px; padding: 0 9px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; color: #334155; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background .12s, border-color .12s; }
.pgr button:hover:not(:disabled) { background: #f0fdf4; border-color: #bbe5c8; color: #166534; }
.pgr button:disabled { opacity: .4; cursor: default; }
.pgr button svg { font-size: 20px; }
.pgr .pgr-num.on { background: #166534; border-color: #166534; color: #fff; }
.pgr-gap { padding: 0 4px; color: #94a3b8; font-weight: 700; }
.pgr-c { justify-content: center; gap: 10px; margin: 0; padding: 10px 12px; border-top: 1px solid #eef2f0; }
.pgr-c span { font-size: 12.5px; font-weight: 700; color: #475569; font-variant-numeric: tabular-nums; min-width: 44px; text-align: center; }
.pgr-c button { height: 30px; min-width: 30px; padding: 0; border-radius: 9px; }
@media (max-width: 600px) {
  .pgr { justify-content: center; }
  .pgr-info { width: 100%; text-align: center; }
  .pgr-nav span { display: none; }
  .pgr button { height: 38px; min-width: 38px; }
}
`;

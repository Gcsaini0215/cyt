import React, { useState } from "react";

/* Client-side paging for trainee portal lists. usePager(items, size) → { slice, page, pages, total, size, setPage } */
export function usePager(items, size) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const cur = Math.min(page, pages);
  return { slice: items.slice((cur - 1) * size, cur * size), page: cur, pages, total, size, setPage };
}

export function Pager({ pg }) {
  if (pg.pages <= 1) return null;
  const from = (pg.page - 1) * pg.size + 1;
  const to = Math.min(pg.total, pg.page * pg.size);
  const nums = [];
  for (let n = 1; n <= pg.pages; n += 1) if (n === 1 || n === pg.pages || Math.abs(n - pg.page) <= 1) nums.push(n);
  return (
    <nav className="tg-pg" aria-label="Pages">
      <span>{from}–{to} of {pg.total}</span>
      <div>
        <button type="button" disabled={pg.page === 1} onClick={() => pg.setPage(pg.page - 1)} aria-label="Previous page"><i className="feather-chevron-left" aria-hidden="true" /></button>
        {nums.map((n, i) => (
          <React.Fragment key={n}>
            {i > 0 && n - nums[i - 1] > 1 && <em>…</em>}
            <button type="button" className={n === pg.page ? "on" : ""} onClick={() => pg.setPage(n)} aria-current={n === pg.page ? "page" : undefined}>{n}</button>
          </React.Fragment>
        ))}
        <button type="button" disabled={pg.page === pg.pages} onClick={() => pg.setPage(pg.page + 1)} aria-label="Next page"><i className="feather-chevron-right" aria-hidden="true" /></button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: PG_CSS }} />
    </nav>
  );
}

const PG_CSS = `
.tg-pg { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 14px; font-size: 12.5px; color: #64748b; font-weight: 600; }
.tg-pg > div { display: flex; align-items: center; gap: 4px; }
.tg-pg button { min-width: 34px; height: 34px; padding: 0 8px; border-radius: 10px; border: 1px solid #e2e8e4; background: #fff; font: inherit; font-size: 13px; font-weight: 700; color: #334155; cursor: pointer; display: grid; place-items: center; }
.tg-pg button.on { background: #14532d; border-color: #14532d; color: #fff; }
.tg-pg button:disabled { opacity: .4; cursor: not-allowed; }
.tg-pg em { font-style: normal; color: #94a3b8; }
`;

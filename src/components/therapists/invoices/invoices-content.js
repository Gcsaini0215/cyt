import React, { useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import { buildInvoiceHtml, printInvoice } from "../../../utils/invoice-template";
import useTherapistStore from "../../../store/therapistStore";

const PERIODS = [
  { key: "all", label: "All" },
  { key: "month", label: "This month" },
  { key: "last", label: "Last month" },
  { key: "year", label: "This year" },
];

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const fmtDate = (d) => (d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "—");
const fmtTime = (d) => (d ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }) : "");
const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";

function inPeriod(d, key) {
  if (key === "all") return true;
  if (!d) return false;
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  if (key === "month") return d >= new Date(y, m, 1);
  if (key === "last") return d >= new Date(y, m - 1, 1) && d < new Date(y, m, 1);
  if (key === "year") return d >= new Date(y, 0, 1);
  return true;
}

function downloadCsv(rows) {
  const head = ["Invoice no", "Client", "Phone", "Service", "Mode", "Session date", "Paid on", "Method", "Transaction ID", "Amount (INR)", "Status"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [r.number, r.client_name, r.client_phone, r.service, r.format, fmtDate(r.booking_date), fmtDate(r.paid_on), r.method, r.txn_id, r.amount, r.status].map(q).join(","));
  const blob = new Blob(["﻿" + [head.map(q).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `cyt-invoices-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const styles = `
  .iv-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#fff;border:1px solid #e4ece7;border-radius:12px;padding:10px;margin-bottom:12px;box-shadow:0 1px 2px rgba(15,23,42,.04);}
  .iv-search{position:relative;flex:1 1 240px;min-width:0;}
  .iv-search svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:19px;color:#94a3b8;}
  .iv-search input{width:100%;height:40px;border:1.5px solid #dbe3df;border-radius:10px;background:#f8faf9;padding:0 12px 0 36px;font-size:13.5px;outline:none;transition:border-color .15s,background .15s;font-family:inherit;}
  .iv-search input:focus{border-color:#166534;background:#fff;}
  .iv-periods{display:flex;gap:4px;background:#f1f5f3;border-radius:10px;padding:3px;overflow-x:auto;scrollbar-width:none;}
  .iv-periods::-webkit-scrollbar{display:none;}
  .iv-period{border:0;background:none;border-radius:8px;padding:7px 12px;font-size:12.5px;font-weight:700;color:#5b6b62;cursor:pointer;white-space:nowrap;font-family:inherit;transition:background .15s,color .15s;}
  .iv-period.on{background:#fff;color:#0f3d24;box-shadow:0 1px 3px rgba(15,23,42,.12);}
  .iv-csv{display:inline-flex;align-items:center;gap:6px;height:40px;border:1.5px solid #dbe3df;background:#fff;border-radius:10px;padding:0 14px;font-size:12.5px;font-weight:700;color:#14251b;cursor:pointer;font-family:inherit;white-space:nowrap;}
  .iv-csv:hover:not(:disabled){border-color:#166534;color:#166534;}
  .iv-csv:disabled{opacity:.5;cursor:default;}

  .iv-card{background:#fff;border:1px solid #e4ece7;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,.04),0 10px 26px rgba(15,23,42,.05);}
  .iv-head{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #eef2f0;}
  .iv-head b{font-size:14px;color:#0f172a;}
  .iv-head span{font-size:12.5px;color:#5b6b62;font-weight:600;}
  table.iv-t{width:100%;border-collapse:collapse;}
  .iv-t th,.iv-t td{border-left:0!important;border-right:0!important;border-top:0!important;}
  .iv-t th{font-size:10.5px;letter-spacing:.6px;text-transform:uppercase;color:#8a978f;font-weight:700;text-align:left;padding:10px 16px;background:#f8faf9;border-bottom:1px solid #eef2f0;white-space:nowrap;}
  .iv-t td{padding:12px 16px;border-bottom:1px solid #f0f3f1;font-size:13px;color:#14251b;vertical-align:middle;}
  .iv-t tr:last-child td{border-bottom:0;}
  .iv-t tbody tr{transition:background .12s;cursor:pointer;}
  .iv-t tbody tr:hover{background:#f8fbf9;}
  .iv-no{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;font-weight:700;}
  .iv-who{display:flex;align-items:center;gap:10px;min-width:0;}
  .iv-av{width:34px;height:34px;border-radius:9px;background:#e7f6ec;color:#166534;font-weight:800;font-size:12.5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .iv-sub{font-size:11.5px;color:#7b8a81;margin-top:1px;}
  .iv-amt{font-weight:800;text-align:right;white-space:nowrap;}
  .iv-pill{display:inline-block;font-size:11px;font-weight:800;color:#166534;background:#e7f6ec;border-radius:999px;padding:3px 10px;}
  .iv-acts{display:flex;justify-content:flex-end;gap:6px;}
  .iv-ib{width:32px;height:32px;border-radius:8px;border:1px solid #e4ece7;background:#fff;color:#5b6b62;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;}
  .iv-ib:hover{color:#166534;border-color:#166534;background:#f0fdf4;}
  .iv-ib svg{font-size:18px;}

  .iv-list{display:none;}
  .iv-item{display:flex;gap:12px;padding:14px 14px;border-bottom:1px solid #f0f3f1;cursor:pointer;}
  .iv-item:last-child{border-bottom:0;}
  .iv-item-main{flex:1;min-width:0;}
  .iv-item-top{display:flex;justify-content:space-between;gap:8px;align-items:baseline;}
  .iv-item-name{font-weight:800;font-size:14px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .iv-item-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;}
  @media (max-width:760px){ table.iv-t{display:none;} .iv-list{display:block;} .iv-csv span{display:none;} .iv-search{flex-basis:100%;} .iv-periods{flex:1 1 0;min-width:0;} .iv-csv{padding:0 11px;} }

  .iv-empty{padding:48px 20px;text-align:center;color:#5b6b62;}
  .iv-empty-ic{width:64px;height:64px;border-radius:16px;background:#f0fdf4;color:#166534;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;}
  .iv-empty h3{font-size:16px;font-weight:800;color:#0f172a;margin:0 0 4px;}
  .iv-empty p{font-size:13px;margin:0;}

  .iv-sk{background:linear-gradient(90deg,#e3e9e5 0%,#f1f5f2 40%,#e3e9e5 80%);background-size:200% 100%;animation:ivShim 1.2s ease-in-out infinite;border-radius:6px;height:14px;}
  @keyframes ivShim{from{background-position:100% 0}to{background-position:-100% 0}}

  .iv-ovl{position:fixed;inset:0;z-index:1299;background:rgba(15,32,25,.5);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:ivFade .2s ease both;}
  .iv-modal{position:fixed;inset:0;margin:auto;z-index:1300;width:min(880px,calc(100vw - 20px));height:min(92vh,1000px);background:#f4f7f5;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 30px 80px -20px rgba(15,61,36,.5);animation:ivIn .28s cubic-bezier(.2,.8,.2,1) both;}
  .iv-ovl.is-closing{animation:ivFadeOut .18s ease both;}
  .iv-modal.is-closing{animation:ivOut .18s ease both;}
  @keyframes ivFade{from{opacity:0}to{opacity:1}}
  @keyframes ivFadeOut{from{opacity:1}to{opacity:0}}
  @keyframes ivIn{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
  @keyframes ivOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(10px) scale(.98)}}
  .iv-mhdr{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#fff;border-bottom:1px solid #e4ece7;border-top:3px solid #c9962c;flex-wrap:wrap;}
  .iv-mt{flex:1;min-width:0;}
  .iv-mt b{display:block;font-size:15px;color:#0f172a;}
  .iv-mt span{font-size:12px;color:#5b6b62;font-weight:600;}
  .iv-btn{display:inline-flex;align-items:center;gap:6px;height:36px;border-radius:9px;padding:0 14px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit;border:1.5px solid #dbe3df;background:#fff;color:#14251b;}
  .iv-btn.primary{background:#0f3d24;border-color:#0f3d24;color:#fff;}
  .iv-btn.primary:hover{background:#134e2b;}
  .iv-btn svg{font-size:17px;}
  .iv-close{width:36px;height:36px;border-radius:9px;border:1.5px solid #dbe3df;background:#fbfaf7;color:#5b6b62;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;}
  .iv-paper{flex:1;overflow:auto;padding:16px;display:flex;justify-content:center;}
  .iv-frame-wrap{flex-shrink:0;box-shadow:0 10px 30px rgba(15,23,42,.12);background:#fff;}
  .iv-frame-wrap iframe{border:0;display:block;transform-origin:0 0;}
  @media (max-width:600px){ .iv-btn span{display:none;} .iv-btn{padding:0 10px;} .iv-paper{padding:10px;} }
  @media (prefers-reduced-motion:reduce){ .iv-ovl,.iv-modal,.iv-sk{animation:none;} }
`;

// A4 at 96dpi
const A4_W = 794, A4_H = 1123;

function InvoicePreview({ row, therapist, onClose }) {
  const [closing, setClosing] = useState(false);
  const [scale, setScale] = useState(1);
  const paperRef = useRef(null);
  const html = useMemo(() => buildInvoiceHtml(row.raw, therapist), [row, therapist]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 180);
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fit the A4 page to the modal width.
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, (el.clientWidth - 24) / A4_W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className={`iv-ovl${closing ? " is-closing" : ""}`} onClick={close} />
      <div className={`iv-modal${closing ? " is-closing" : ""}`} role="dialog" aria-modal="true" aria-label={`Invoice ${row.number}`}>
        <div className="iv-mhdr">
          <div className="iv-mt">
            <b>{row.number}</b>
            <span>{row.client_name} · {fmtDate(row.booking_date)} · {inr(row.amount)}</span>
          </div>
          <button type="button" className="iv-btn primary" onClick={() => printInvoice(row.raw, therapist)}>
            <DownloadRoundedIcon /> <span>Download PDF</span>
          </button>
          <button type="button" className="iv-btn" onClick={() => printInvoice(row.raw, therapist)}>
            <PrintRoundedIcon /> <span>Print</span>
          </button>
          <button type="button" className="iv-close" onClick={close} aria-label="Close"><CloseRoundedIcon /></button>
        </div>
        <div className="iv-paper" ref={paperRef}>
          <div className="iv-frame-wrap" style={{ width: A4_W * scale, height: A4_H * scale }}>
            <iframe title={`Invoice ${row.number}`} srcDoc={html} width={A4_W} height={A4_H} style={{ transform: `scale(${scale})` }} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function InvoicesContent({ invoices = [], loading }) {
  const { therapistInfo } = useTherapistStore();
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState("all");
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return invoices.filter((r) =>
      inPeriod(r.booking_date, period) &&
      (!needle || [r.client_name, r.client_phone, r.number, r.txn_id, r.service].some((v) => (v || "").toLowerCase().includes(needle)))
    );
  }, [invoices, q, period]);
  const shownTotal = rows.reduce((s, r) => s + r.amount, 0);
  const download = (r, e) => { e?.stopPropagation(); printInvoice(r.raw, therapistInfo); };

  const empty = !loading && rows.length === 0;
  const noneAtAll = invoices.length === 0;

  return (
    <div style={{ paddingBottom: 40 }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="iv-bar">
        <div className="iv-search">
          <SearchRoundedIcon />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client, phone, invoice or transaction ID" aria-label="Search invoices" />
        </div>
        <div className="iv-periods" role="tablist" aria-label="Period">
          {PERIODS.map((p) => (
            <button key={p.key} type="button" role="tab" aria-selected={period === p.key} className={`iv-period${period === p.key ? " on" : ""}`} onClick={() => setPeriod(p.key)}>{p.label}</button>
          ))}
        </div>
        <button type="button" className="iv-csv" disabled={!rows.length} onClick={() => downloadCsv(rows)}>
          <FileDownloadRoundedIcon sx={{ fontSize: 18 }} /> <span>Export CSV</span>
        </button>
      </div>

      <div className="iv-card">
        <div className="iv-head">
          <b>{loading ? "Loading invoices…" : `${rows.length} invoice${rows.length === 1 ? "" : "s"}`}</b>
          {!loading && rows.length > 0 && <span>Total {inr(shownTotal)}</span>}
        </div>

        {loading ? (
          <div style={{ padding: 16, display: "grid", gap: 14 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.1fr 1.6fr 1fr .8fr .6fr", gap: 16, alignItems: "center" }}>
                <div className="iv-sk" /><div className="iv-sk" style={{ height: 30 }} /><div className="iv-sk" /><div className="iv-sk" /><div className="iv-sk" />
              </div>
            ))}
          </div>
        ) : empty ? (
          <div className="iv-empty">
            <div className="iv-empty-ic"><ReceiptLongRoundedIcon sx={{ fontSize: 32 }} /></div>
            <h3>{noneAtAll ? "No invoices yet" : "No invoices match"}</h3>
            <p>{noneAtAll ? "Invoices appear here automatically once a client pays for a session." : "Try a different search or period."}</p>
          </div>
        ) : (
          <>
            <table className="iv-t">
              <thead>
                <tr><th>Invoice</th><th>Client</th><th>Session</th><th>Payment</th><th style={{ textAlign: "right" }}>Amount</th><th style={{ textAlign: "right" }}>Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} onClick={() => setSelected(r)}>
                    <td><div className="iv-no">{r.number}</div><div className="iv-sub">#{String(r.id).slice(-8).toUpperCase()}</div></td>
                    <td>
                      <div className="iv-who">
                        <div className="iv-av">{initials(r.client_name)}</div>
                        <div style={{ minWidth: 0 }}><div style={{ fontWeight: 700 }}>{r.client_name}</div>{r.client_phone && <div className="iv-sub">{r.client_phone}</div>}</div>
                      </div>
                    </td>
                    <td><div style={{ fontWeight: 600 }}>{fmtDate(r.booking_date)}</div><div className="iv-sub">{fmtTime(r.booking_date)} · {r.format}</div></td>
                    <td><span className="iv-pill">{r.status}</span>{r.method && <div className="iv-sub" style={{ marginTop: 4 }}>{r.method}</div>}</td>
                    <td className="iv-amt">{inr(r.amount)}</td>
                    <td>
                      <div className="iv-acts">
                        <Tooltip title="View invoice"><button type="button" className="iv-ib" onClick={(e) => { e.stopPropagation(); setSelected(r); }} aria-label="View invoice"><VisibilityRoundedIcon /></button></Tooltip>
                        <Tooltip title="Download PDF"><button type="button" className="iv-ib" onClick={(e) => download(r, e)} aria-label="Download PDF"><DownloadRoundedIcon /></button></Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="iv-list">
              {rows.map((r) => (
                <div key={r.id} className="iv-item" onClick={() => setSelected(r)}>
                  <div className="iv-av">{initials(r.client_name)}</div>
                  <div className="iv-item-main">
                    <div className="iv-item-top">
                      <div className="iv-item-name">{r.client_name}</div>
                      <div className="iv-amt">{inr(r.amount)}</div>
                    </div>
                    <div className="iv-sub">{r.number}</div>
                    <div className="iv-item-meta">
                      <span className="iv-sub">{fmtDate(r.booking_date)} · {r.format}</span>
                      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span className="iv-pill">{r.status}</span>
                        <button type="button" className="iv-ib" onClick={(e) => download(r, e)} aria-label="Download PDF"><DownloadRoundedIcon /></button>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selected && <InvoicePreview row={selected} therapist={therapistInfo} onClose={() => setSelected(null)} />}
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";

/* Draw a signature (mouse / finger / stylus) or upload a photo of it. Calls onChange with a PNG data
   URL, or "" when cleared. `value` shows a saved signature. */

const W = 600, H = 200;

export default function SignaturePad({ value, onChange, disabled }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const touched = useRef(false); // the user drew / uploaded in this session
  const [err, setErr] = useState("");

  const fit = (ctx, img) => {
    const r = Math.min((W - 20) / img.width, (H - 20) / img.height, 2);
    const w = img.width * r, h = img.height * r;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  };

  // show the saved signature (until the user starts over)
  useEffect(() => {
    const c = ref.current; if (!c || touched.current) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    if (!value) return;
    const img = new Image();
    img.onload = () => { if (!touched.current) { ctx.clearRect(0, 0, W, H); fit(ctx, img); } };
    img.src = value;
  }, [value]);

  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const emit = () => {
    const png = ref.current.toDataURL("image/png");
    onChange(png.length > 380000 ? ref.current.toDataURL("image/jpeg", 0.8) : png);
  };
  const down = (e) => {
    if (disabled) return;
    e.preventDefault();
    try { ref.current.setPointerCapture(e.pointerId); } catch (x) { /* older browsers */ }
    if (!touched.current) { ref.current.getContext("2d").clearRect(0, 0, W, H); touched.current = true; }
    drawing.current = true;
    last.current = pos(e);
    const ctx = ref.current.getContext("2d");
    ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(last.current.x, last.current.y, 1.5, 0, Math.PI * 2); ctx.fill();
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = ref.current.getContext("2d");
    const p = pos(e);
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 3.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
  };
  const up = () => { if (!drawing.current) return; drawing.current = false; emit(); };
  const clear = () => { ref.current.getContext("2d").clearRect(0, 0, W, H); touched.current = true; setErr(""); onChange(""); };
  const upload = (e) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    if (!/^image\/(png|jpe?g)$/.test(f.type)) { setErr("Upload a PNG or JPG image."); return; }
    if (f.size > 5 * 1024 * 1024) { setErr("That image is too large (max 5 MB)."); return; }
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { const ctx = ref.current.getContext("2d"); ctx.clearRect(0, 0, W, H); fit(ctx, img); touched.current = true; setErr(""); emit(); URL.revokeObjectURL(url); };
    img.src = url;
  };

  return (
    <div className="sgp">
      <style dangerouslySetInnerHTML={{ __html: SGP_CSS }} />
      <div className="sgp-box">
        <canvas
          ref={ref} width={W} height={H} className={`sgp-c${disabled ? " off" : ""}`} aria-label="Signature pad — draw your signature"
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}
        />
        <span className="sgp-line" aria-hidden="true">Sign above</span>
      </div>
      <div className="sgp-acts">
        <button type="button" onClick={clear} disabled={disabled}>Clear</button>
        <label className={disabled ? "off" : ""}>Upload a photo instead<input type="file" accept="image/png,image/jpeg" onChange={upload} disabled={disabled} hidden /></label>
      </div>
      {err && <p className="sgp-err">{err}</p>}
    </div>
  );
}

const SGP_CSS = `
.sgp-box { position: relative; width: 100%; max-width: 440px; }
.sgp-c { display: block; width: 100%; aspect-ratio: 3 / 1; background: #fff; border: 1.5px dashed #b9d4c3; border-radius: 12px; touch-action: none; cursor: crosshair; }
.sgp-c.off { cursor: default; opacity: .7; }
.sgp-line { position: absolute; left: 18px; right: 18px; bottom: 22%; border-top: 1px solid #cbd5e1; font-size: 10px; color: #94a3b8; padding-top: 2px; pointer-events: none; }
.sgp-acts { display: flex; gap: 14px; margin-top: 6px; }
.sgp-acts button, .sgp-acts label { border: 0; background: none; padding: 0; font: inherit; font-size: 12.5px; font-weight: 700; color: #1d4ed8; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
.sgp-acts .off, .sgp-acts button:disabled { color: #94a3b8; cursor: default; }
.sgp-err { margin: 6px 0 0; font-size: 12.5px; font-weight: 700; color: #b91c1c; }
`;

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

// Same client-side canvas captcha used on the cyt-admin login, restyled to the
// main site's green. No external service — the code lives only in the browser
// and is checked locally before the OTP request is sent.
const CAPTCHA_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no easily-confused 0/O/1/I/L
const CAPTCHA_LENGTH = 5;

function generateCaptchaText() {
  let text = "";
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    text += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return text;
}

function drawCaptcha(canvas, text) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#f0fdf4");
  bg.addColorStop(1, "#dcfce7");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(22,163,74,${0.15 + Math.random() * 0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.lineTo(Math.random() * w, Math.random() * h);
    ctx.stroke();
  }
  for (let i = 0; i < 22; i++) {
    ctx.fillStyle = `rgba(22,163,74,${0.12 + Math.random() * 0.18})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  const colors = ["#15803d", "#16a34a", "#22bb33", "#2f7a4d"];
  const charWidth = w / (text.length + 1);
  ctx.textBaseline = "middle";
  ctx.font = "bold 22px 'Segoe UI', monospace";
  [...text].forEach((ch, i) => {
    ctx.save();
    ctx.translate(charWidth * (i + 0.85), h / 2 + (Math.random() * 8 - 4));
    ctx.rotate(((Math.random() * 28 - 14) * Math.PI) / 180);
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
}

/**
 * Ref API:
 *  - isValid(): boolean — does the typed code match the drawn code
 *  - refresh(): regenerate a new code and clear the input
 *  - clear():   clear only the typed input
 */
const CanvasCaptcha = forwardRef(function CanvasCaptcha({ disabled = false }, ref) {
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    setCaptchaText(generateCaptchaText());
  }, []);

  useEffect(() => {
    if (captchaText) drawCaptcha(canvasRef.current, captchaText);
  }, [captchaText]);

  const refresh = () => {
    setCaptchaText(generateCaptchaText());
    setInput("");
  };

  useImperativeHandle(ref, () => ({
    isValid: () => input.trim().length > 0 && input.trim().toUpperCase() === captchaText,
    refresh,
    clear: () => setInput(""),
  }));

  return (
    <div className="captcha-row">
      <canvas
        ref={canvasRef}
        width={116}
        height={46}
        className="captcha-canvas"
        aria-hidden="true"
      />
      <button
        type="button"
        className="captcha-refresh"
        onClick={refresh}
        title="Refresh code"
        aria-label="Refresh security code"
        disabled={disabled}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 4v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 9a7.5 7.5 0 1 1 1.8 7.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <input
        className="captcha-input"
        type="text"
        placeholder="Enter code"
        value={input}
        onChange={(e) => setInput(e.target.value.toUpperCase().slice(0, CAPTCHA_LENGTH))}
        maxLength={CAPTCHA_LENGTH}
        autoComplete="off"
        aria-label="Security code"
        disabled={disabled}
      />
    </div>
  );
});

export default CanvasCaptcha;

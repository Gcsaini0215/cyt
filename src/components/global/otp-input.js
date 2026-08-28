import React, { useEffect, useRef } from "react";

const LEN = 6;

const boxStyle = {
  width: "100%",
  minWidth: 0,
  flex: 1,
  textAlign: "center",
  fontSize: 22,
  fontWeight: 700,
  padding: "12px 0",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  boxSizing: "border-box",
  transition: "all 0.2s ease",
};

const boxFocusStyle = {
  borderColor: "#22bb33",
  boxShadow: "0 0 0 3px rgba(34, 187, 51, 0.12)",
};

/**
 * 6-box segmented OTP input.
 *  - auto-focus first box (autoFocus)
 *  - type to advance, Backspace to go back, Arrow keys to move
 *  - paste a full code into any box and it distributes across all boxes
 *  - digits only, mobile numeric keypad, browser one-time-code autofill
 *
 * Props: value (string), onChange(str), onComplete(str), disabled, autoFocus
 */
export default function OtpInput({
  value = "",
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
}) {
  const inputsRef = useRef([]);

  const digits = value.replace(/\D/g, "").slice(0, LEN).split("");
  while (digits.length < LEN) digits.push("");

  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => inputsRef.current[0]?.focus(), 50);
    return () => clearTimeout(t);
  }, [autoFocus]);

  const emit = (arr) => {
    const next = arr.join("").replace(/\D/g, "").slice(0, LEN);
    onChange && onChange(next);
    if (next.length === LEN) onComplete && onComplete(next);
  };

  const focusAt = (i) => {
    const idx = Math.max(0, Math.min(i, LEN - 1));
    inputsRef.current[idx]?.focus();
  };

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const arr = [...digits];

    if (!raw) {
      arr[i] = "";
      emit(arr);
      return;
    }

    // A single field can receive multiple chars (autofill / fast typing).
    let idx = i;
    for (const ch of raw.split("")) {
      if (idx >= LEN) break;
      arr[idx] = ch;
      idx += 1;
    }
    emit(arr);
    focusAt(idx);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = [...digits];
      if (arr[i]) {
        arr[i] = "";
        emit(arr);
      } else if (i > 0) {
        arr[i - 1] = "";
        emit(arr);
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, LEN);
    if (!text) return;
    const arr = Array(LEN).fill("");
    text.split("").forEach((ch, idx) => {
      arr[idx] = ch;
    });
    emit(arr);
    focusAt(text.length);
  };

  return (
    <div
      style={{ display: "flex", gap: 8, justifyContent: "space-between" }}
      onPaste={handlePaste}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`OTP digit ${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => {
            e.target.select();
            Object.assign(e.target.style, boxFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.boxShadow = "none";
          }}
          style={boxStyle}
        />
      ))}
    </div>
  );
}

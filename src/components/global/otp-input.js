import React, { useEffect, useRef } from "react";

const LEN = 6;

const boxStyle = {
  width: "100%",
  minWidth: 0,
  flex: 1,
  height: 56,
  textAlign: "center",
  fontSize: 24,
  fontWeight: 800,
  color: "#0b1712",
  padding: 0,
  background: "#f8faf9",
  border: "1.5px solid #dbe5df",
  borderRadius: 12,
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color .15s ease, box-shadow .15s ease, background .15s ease",
};

const boxFocusStyle = {
  borderColor: "#1e7a4c",
  background: "#fff",
  boxShadow: "0 0 0 3px #dcefe3",
};

/**
 * 6-box segmented OTP input.
 *  - auto-focus first box (autoFocus)
 *  - type to advance, Backspace to go back, Arrow keys to move
 *  - paste a full code into any box and it distributes across all boxes
 *  - autofill (iOS "From Mail", Android one-time-code) can drop the whole code into one
 *    box — so boxes don't cap input at one character; extra digits flow into the next boxes
 *  - digits only, mobile numeric keypad
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
  const lastCompleted = useRef("");

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
    // fire once per complete code (a paste + its change event must not submit twice)
    if (next.length === LEN && next !== lastCompleted.current) {
      lastCompleted.current = next;
      onComplete && onComplete(next);
    }
    if (next.length < LEN) lastCompleted.current = "";
  };

  const focusAt = (i) => {
    const idx = Math.max(0, Math.min(i, LEN - 1));
    inputsRef.current[idx]?.focus();
  };

  const handleChange = (i, e) => {
    let raw = e.target.value.replace(/\D/g, "");
    const arr = [...digits];

    if (!raw) {
      arr[i] = "";
      emit(arr);
      return;
    }

    // typing over a filled box gives "old+new" — keep just the new digit
    if (raw.length === 2 && digits[i] && raw.startsWith(digits[i])) raw = raw.slice(1);

    // a whole code typed / autofilled into one box flows across the boxes
    if (raw.length >= LEN) {
      emit(raw.slice(0, LEN).split(""));
      focusAt(LEN - 1);
      return;
    }
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
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, LEN);
    if (!text) return;
    const arr = Array(LEN).fill("");
    text.split("").forEach((ch, idx) => { arr[idx] = ch; });
    emit(arr);
    focusAt(text.length);
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }} role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? LEN : 2}
          value={d}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${LEN}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => {
            e.target.select();
            Object.assign(e.target.style, boxFocusStyle);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#dbe5df";
            e.target.style.background = "#f8faf9";
            e.target.style.boxShadow = "none";
          }}
          style={boxStyle}
        />
      ))}
    </div>
  );
}

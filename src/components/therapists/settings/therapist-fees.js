import React, { useState } from "react";
import useTherapistStore from "../../../store/therapistStore";
import { updateFeeDetailsUrl } from "../../../utils/url";
import { postData } from "../../../utils/actions";
import FormProgressBar from "../../global/form-progressbar";
import FormMessage from "../../global/form-message";
import { toast } from "react-toastify";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

const PRESETS = [500, 750, 1000, 1500, 2000, 2500];

const FORMAT_CFG = [
  { label: "Audio Call",  icon: <MicIcon sx={{ fontSize: 20 }} />,      color: "#0ea5e9", light: "#f0f9ff", border: "#bae6fd" },
  { label: "Video Call",  icon: <VideocamIcon sx={{ fontSize: 20 }} />, color: "#8b5cf6", light: "#f5f3ff", border: "#ddd6fe" },
  { label: "In-Person",   icon: <PersonIcon sx={{ fontSize: 20 }} />,   color: "#ec4899", light: "#fdf2f8", border: "#fbcfe8" },
];

function getCfg(name, index) {
  const n = (name || "").toLowerCase();
  if (n.includes("audio") || index === 0) return FORMAT_CFG[0];
  if (n.includes("video") || index === 1) return FORMAT_CFG[1];
  if (n.includes("person") || index === 2) return FORMAT_CFG[2];
  return { label: name || "Session", icon: null, color: "#64748b", light: "#f8fafc", border: "#e2e8f0" };
}

function FeeCard({ format, si, fi, setFee }) {
  const cfg = getCfg(format.type || format.name, fi);
  const fee = format.fee;
  const hasfee = fee !== null && fee !== "" && fee !== undefined && fee !== 0;
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState("");

  const applyFee = (val) => {
    const n = parseInt(val);
    if (isNaN(n) || n < 100) { toast.error("Enter a valid fee (min ₹100)"); return; }
    setFee(si, fi, String(n));
    setEditing(false);
    setCustom("");
  };

  const removeFee = () => {
    setFee(si, fi, "");
    setEditing(false);
    setCustom("");
  };

  if (!hasfee && !editing) {
    return (
      <div style={{
        borderRadius: 14, border: "1.5px dashed #e2e8f0", background: "#f8fafc",
        padding: "20px 18px", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 10, minHeight: 140, cursor: "pointer",
        transition: "all .15s",
      }}
        onClick={() => setEditing(true)}
        onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.background = cfg.light; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
          {cfg.icon}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>{cfg.label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff", border: `1.5px solid ${cfg.border}`, borderRadius: 8, padding: "6px 14px", color: cfg.color, fontSize: 12, fontWeight: 700 }}>
          <AddIcon sx={{ fontSize: 14 }} /> Set Fee
        </div>
      </div>
    );
  }

  if (editing || !hasfee) {
    return (
      <div style={{ borderRadius: 14, border: `1.5px solid ${cfg.border}`, background: cfg.light, padding: "18px 16px", minHeight: 140 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              {cfg.icon}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{cfg.label}</span>
          </div>
          {hasfee && (
            <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </button>
          )}
        </div>

        {/* Preset chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {PRESETS.map(p => (
            <button key={p} onClick={() => applyFee(p)}
              style={{ padding: "5px 11px", borderRadius: 20, border: `1.5px solid ${cfg.border}`, background: "#fff", color: cfg.color, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = cfg.color; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = cfg.color; }}>
              ₹{p.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontWeight: 800, fontSize: 15, color: "#1e293b" }}>₹</span>
            <input type="number" placeholder="Custom" value={custom} onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyFee(custom)}
              style={{ width: "100%", height: 38, paddingLeft: 26, borderRadius: 9, border: `1.5px solid ${cfg.border}`, fontSize: 14, fontWeight: 700, background: "#fff", color: "#1e293b", outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={() => applyFee(custom)}
            style={{ height: 38, padding: "0 14px", borderRadius: 9, border: "none", background: cfg.color, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Set
          </button>
        </div>
      </div>
    );
  }

  // Has fee — show it prominently
  return (
    <div style={{ borderRadius: 14, border: `1.5px solid ${cfg.border}`, background: cfg.light, padding: "18px 16px", minHeight: 140, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            {cfg.icon}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{cfg.label}</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setEditing(true)} title="Edit fee"
            style={{ background: "none", border: "none", cursor: "pointer", color: cfg.color, padding: 4, borderRadius: 6 }}>
            <EditIcon sx={{ fontSize: 15 }} />
          </button>
          <button onClick={removeFee} title="Remove"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 6 }}>
            <CloseIcon sx={{ fontSize: 15 }} />
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: cfg.color, letterSpacing: "-1px" }}>
          ₹{Number(fee).toLocaleString()}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>per session</div>
      </div>
    </div>
  );
}

export default function Fees({ onSuccess }) {
  const { therapistInfo, setFee } = useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      const response = await postData(updateFeeDetailsUrl, { fees: therapistInfo.fees });
      if (response.status) {
        setSuccess(response.message);
        toast.success("Fees saved successfully!");
        if (onSuccess) onSuccess();
      } else {
        setError(response.message || "Something went wrong");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="rbt-dashboard-content-wrapper">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
          Select a preset or enter a custom fee for each session format. Leave empty to mark as not offered.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {therapistInfo.fees.map((feeItem, si) => (
          <div key={si}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 14 }}>{feeItem.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {feeItem.formats.map((format, fi) => (
                <FeeCard key={fi} format={format} si={si} fi={fi} setFee={setFee} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28 }}>
        <FormMessage error={error} success={success} />
        {loading && <FormProgressBar />}
        <div className="rbt-form-group">
          <button className="rbt-btn btn-gradient submit-btn"
            onClick={handleSubmit}
            style={{ padding: "0 40px", height: "52px", borderRadius: "12px", fontWeight: "600" }}>
            Save Fees
          </button>
        </div>
      </div>
    </div>
  );
}

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
  { label: "Audio Call",  icon: <MicIcon sx={{ fontSize: 18 }} />,      color: "#0f3d24", light: "#f0fdf4", border: "#c8ddd0" },
  { label: "Video Call",  icon: <VideocamIcon sx={{ fontSize: 18 }} />, color: "#0f3d24", light: "#f0fdf4", border: "#c8ddd0" },
  { label: "In-Person",   icon: <PersonIcon sx={{ fontSize: 18 }} />,   color: "#0f3d24", light: "#f0fdf4", border: "#c8ddd0" },
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
        borderRadius: 6, border: "1.5px dashed #dbe3df", background: "#fbfaf7",
        padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 8, minHeight: 128, cursor: "pointer",
        transition: "all .15s",
      }}
        onClick={() => setEditing(true)}
        onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.background = cfg.light; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#dbe3df"; e.currentTarget.style.background = "#fbfaf7"; }}>
        <div style={{ width: 36, height: 36, borderRadius: 4, background: "#ecefec", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a978f" }}>
          {cfg.icon}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#8a978f" }}>{cfg.label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff", border: `1.5px solid ${cfg.border}`, borderRadius: 4, padding: "5px 12px", color: cfg.color, fontSize: 11.5, fontWeight: 700 }}>
          <AddIcon sx={{ fontSize: 13 }} /> Set Fee
        </div>
      </div>
    );
  }

  if (editing || !hasfee) {
    return (
      <div style={{ borderRadius: 6, border: `1.5px solid ${cfg.border}`, background: cfg.light, padding: "16px 14px", minHeight: 128 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 4, background: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              {cfg.icon}
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#122019" }}>{cfg.label}</span>
          </div>
          {hasfee && (
            <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a978f", padding: 2 }}>
              <CloseIcon sx={{ fontSize: 15 }} />
            </button>
          )}
        </div>

        {/* Preset chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {PRESETS.map(p => (
            <button key={p} onClick={() => applyFee(p)}
              style={{ padding: "5px 10px", borderRadius: 4, border: `1.5px solid ${cfg.border}`, background: "#fff", color: cfg.color, fontSize: 11.5, fontWeight: 700, cursor: "pointer", transition: "all .12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = cfg.color; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = cfg.color; }}>
              ₹{p.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontWeight: 800, fontSize: 14, color: "#122019" }}>₹</span>
            <input type="number" placeholder="Custom" value={custom} onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyFee(custom)}
              style={{ width: "100%", height: 36, paddingLeft: 26, borderRadius: 4, border: `1.5px solid ${cfg.border}`, fontSize: 13, fontWeight: 700, background: "#fff", color: "#122019", outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={() => applyFee(custom)}
            style={{ height: 36, padding: "0 13px", borderRadius: 4, border: "none", background: cfg.color, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            Set
          </button>
        </div>
      </div>
    );
  }

  // Has fee — show it prominently
  return (
    <div style={{ borderRadius: 6, border: `1.5px solid ${cfg.border}`, background: cfg.light, padding: "16px 14px", minHeight: 128, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 4, background: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            {cfg.icon}
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#122019" }}>{cfg.label}</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setEditing(true)} title="Edit fee"
            style={{ background: "none", border: "none", cursor: "pointer", color: cfg.color, padding: 4, borderRadius: 4 }}>
            <EditIcon sx={{ fontSize: 14 }} />
          </button>
          <button onClick={removeFee} title="Remove"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 4 }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: cfg.color, letterSpacing: "-0.5px", fontFamily: "Georgia, 'Times New Roman', serif" }}>
          ₹{Number(fee).toLocaleString()}
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: "#8a978f", textTransform: "uppercase", letterSpacing: "0.5px" }}>per session</div>
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
      <div style={{ marginBottom: 22, paddingBottom: 14, borderBottom: "1.5px solid #ecefec" }}>
        <div style={{ fontSize: 12.5, color: "#5b6b62", fontWeight: 500 }}>
          Select a preset or enter a custom fee for each session format. Leave empty to mark as not offered.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {therapistInfo.fees.map((feeItem, si) => (
          <div key={si}>
            <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 16, fontWeight: 700, color: "#122019", marginBottom: 12 }}>{feeItem.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
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

import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, Paper, Chip } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import BarChartIcon from "@mui/icons-material/BarChart";

const CustomTooltip = ({ active, payload, label, metric }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <Box sx={{
      background: "#fff",
      border: "1.5px solid #f1f5f9",
      borderRadius: "12px",
      p: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      minWidth: 130,
    }}>
      <Typography sx={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, mb: 0.8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: entry?.color || "#228756", flexShrink: 0 }} />
        <Typography sx={{ fontSize: "14px", color: "#1e293b", fontWeight: 900, letterSpacing: "-0.3px" }}>
          {metric === "revenue"
            ? `₹${Number(entry?.value || 0).toLocaleString("en-IN")}`
            : `${entry?.value ?? 0} sessions`}
        </Typography>
      </Box>
    </Box>
  );
};

export default function PerformanceChart({ weeklyData = [], monthlyData = [] }) {
  const [period, setPeriod] = useState(0);   // 0 = this week, 1 = 6 months
  const [metric, setMetric] = useState("revenue");

  const data        = period === 0 ? weeklyData : monthlyData;
  const totalRev    = data.reduce((s, d) => s + (d.revenue  || 0), 0);
  const totalSes    = data.reduce((s, d) => s + (d.sessions || 0), 0);
  const strokeColor = metric === "revenue" ? "#228756" : "#0ea5e9";
  const gradId      = metric === "revenue" ? "gRev" : "gSes";

  return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: "1.5px solid #f1f5f9", background: "#fff", overflow: "hidden" }}>

      {/* ── summary bar ── */}
      <Box sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 2,
        px: { xs: "16px", md: "26px" }, pt: { xs: "16px", md: "20px" }, pb: { xs: "12px", md: "14px" },
        borderBottom: "1px solid #f8fafc",
      }}>
        {/* totals */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: "9px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", mb: 0.3 }}>
              {period === 0 ? "Week Revenue" : "6-Mo Revenue"}
            </Typography>
            <Typography sx={{ fontSize: { xs: "18px", md: "22px" }, fontWeight: 900, color: "#1b5e20", lineHeight: 1, letterSpacing: "-0.5px" }}>
              ₹{totalRev.toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Box sx={{ width: "1.5px", height: 36, background: "#f1f5f9", flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: "9px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", mb: 0.3 }}>
              {period === 0 ? "Week Sessions" : "6-Mo Sessions"}
            </Typography>
            <Typography sx={{ fontSize: { xs: "18px", md: "22px" }, fontWeight: 900, color: "#0ea5e9", lineHeight: 1, letterSpacing: "-0.5px" }}>
              {totalSes}
            </Typography>
          </Box>
        </Box>

        {/* controls */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
          {/* period toggle */}
          <Box sx={{ display: "flex", background: "#f8fafc", borderRadius: "10px", p: "2.5px", gap: "2px" }}>
            {[
              { label: "Week",  icon: <ShowChartIcon sx={{ fontSize: 12 }} /> },
              { label: "6 Mo",  icon: <BarChartIcon  sx={{ fontSize: 12 }} /> },
            ].map((t, i) => (
              <Box key={i} onClick={() => setPeriod(i)} sx={{
                display: "flex", alignItems: "center", gap: 0.5,
                px: 1.4, py: 0.5, borderRadius: "8px", cursor: "pointer",
                background: period === i ? "#fff" : "transparent",
                color: period === i ? "#1e293b" : "#94a3b8",
                fontSize: "11px", fontWeight: 700,
                boxShadow: period === i ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
                userSelect: "none",
              }}>
                {t.icon} {t.label}
              </Box>
            ))}
          </Box>
          {/* metric chips */}
          <Box sx={{ display: "flex", gap: 0.6 }}>
            {[
              { key: "revenue",  label: "Revenue",  color: "#228756", bg: "#f0fdf4" },
              { key: "sessions", label: "Sessions", color: "#0ea5e9", bg: "#f0f9ff" },
            ].map(m => (
              <Chip key={m.key} label={m.label} size="small" onClick={() => setMetric(m.key)}
                sx={{
                  height: 22, fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "6px",
                  background: metric === m.key ? m.bg : "#f8fafc",
                  color: metric === m.key ? m.color : "#94a3b8",
                  border: `1px solid ${metric === m.key ? m.color + "40" : "transparent"}`,
                  transition: "all 0.15s",
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── chart ── */}
      <Box sx={{ px: { xs: "4px", md: "12px" }, pb: { xs: "14px", md: "20px" }, pt: "10px", width: "100%", height: { xs: 190, md: 240 } }}>
        <ResponsiveContainer width="100%" height="100%">
          {period === 0 ? (
            <AreaChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#228756" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#228756" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gSes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickFormatter={v => metric === "revenue" ? (v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`) : v} />
              <Tooltip content={<CustomTooltip metric={metric} />} />
              <Area type="monotone" dataKey={metric}
                stroke={strokeColor} strokeWidth={2.5}
                fill={`url(#${gradId})`}
                dot={{ fill: strokeColor, r: 3.5, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 5.5, fill: strokeColor, strokeWidth: 2.5, stroke: "#fff" }}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickFormatter={v => metric === "revenue" ? (v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`) : v} />
              <Tooltip content={<CustomTooltip metric={metric} />} />
              <Bar dataKey={metric} fill={strokeColor} radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

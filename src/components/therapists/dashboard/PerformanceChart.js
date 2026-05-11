import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, Paper, Chip } from "@mui/material";

const defaultData = [
  { name: "Mon", sessions: 4, revenue: 2400 },
  { name: "Tue", sessions: 3, revenue: 1800 },
  { name: "Wed", sessions: 6, revenue: 3600 },
  { name: "Thu", sessions: 4, revenue: 2400 },
  { name: "Fri", sessions: 7, revenue: 4200 },
  { name: "Sat", sessions: 2, revenue: 1200 },
  { name: "Sun", sessions: 1, revenue: 600 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        background: "#fff",
        border: "1.5px solid #f1f5f9",
        borderRadius: "12px",
        p: "10px 16px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      }}>
        <Typography sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, mb: 0.5 }}>{label}</Typography>
        <Typography sx={{ fontSize: "14px", color: "#1e293b", fontWeight: 800 }}>
          {payload[0]?.name === "revenue" ? `₹${payload[0].value.toLocaleString("en-IN")}` : `${payload[0].value} sessions`}
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function PerformanceChart({ data }) {
  const chartData = data || defaultData;
  const [metric, setMetric] = useState("revenue");

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: "20px 16px", md: "24px 28px" },
        borderRadius: "20px",
        background: "#fff",
        border: "1.5px solid #f1f5f9",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "15px", color: "#1e293b", lineHeight: 1.2 }}>
            Weekly Performance
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500, mt: 0.3 }}>
            Sessions & earnings overview
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {["revenue", "sessions"].map((m) => (
            <Chip
              key={m}
              label={m === "revenue" ? "Revenue" : "Sessions"}
              size="small"
              onClick={() => setMetric(m)}
              sx={{
                height: 26,
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                borderRadius: "8px",
                background: metric === m ? "#228756" : "#f1f5f9",
                color: metric === m ? "#fff" : "#64748b",
                transition: "all 0.2s",
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ width: "100%", height: { xs: 180, md: 220 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#228756" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#228756" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(v) => metric === "revenue" ? `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}` : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#228756"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorMetric)"
              dot={{ fill: "#228756", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#228756", strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

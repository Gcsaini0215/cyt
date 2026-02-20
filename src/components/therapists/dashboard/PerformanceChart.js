import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Box, Typography, Paper } from "@mui/material";

const defaultData = [
  { name: "Mon", sessions: 4, revenue: 2400 },
  { name: "Tue", sessions: 3, revenue: 1800 },
  { name: "Wed", sessions: 6, revenue: 3600 },
  { name: "Thu", sessions: 4, revenue: 2400 },
  { name: "Fri", sessions: 7, revenue: 4200 },
  { name: "Sat", sessions: 2, revenue: 1200 },
  { name: "Sun", sessions: 1, revenue: 600 },
];

export default function PerformanceChart({ data }) {
  const chartData = data || defaultData;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: "24px",
        background: "#ffffff",
        border: "1px solid #f1f5f9",
        mt: 1,
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
      }}
    >
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#1e293b", mb: 0.5, letterSpacing: '-0.5px' }}>
            Revenue Growth
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#64748b", fontWeight: 600 }}>
            Session performance and earnings analytics
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 1, borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Current Week
          </Typography>
        </Box>
      </Box>

      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#228756" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#228756" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#228756" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

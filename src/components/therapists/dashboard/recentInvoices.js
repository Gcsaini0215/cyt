import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";

export default function RecentInvoices({ data }) {
  const invoices = data || [];

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "15px", color: "#1e293b" }}>
          Recent Invoices
        </Typography>
        <Button
          component={Link}
          href="/clinic-patients"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
          sx={{ color: "#228756", fontWeight: 700, textTransform: "none", fontSize: "12px", px: 0 }}
        >
          View All
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1.5px solid #f1f5f9",
          overflow: "auto",
        }}
      >
        <Table sx={{ minWidth: 460 }}>
          <TableHead>
            <TableRow sx={{ background: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", py: 1.5, borderBottom: "1px solid #f1f5f9" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", py: 1.5, borderBottom: "1px solid #f1f5f9" }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", py: 1.5, borderBottom: "1px solid #f1f5f9" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", py: 1.5, borderBottom: "1px solid #f1f5f9" }}>Amount</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", py: 1.5, borderBottom: "1px solid #f1f5f9" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  sx={{ "&:hover": { bgcolor: "#fafafa" }, "&:last-child td": { border: 0 } }}
                >
                  <TableCell sx={{ fontWeight: 600, fontSize: "12px", color: "#64748b", py: 1.8 }}>
                    #{invoice.invoice_id || invoice.id}
                  </TableCell>
                  <TableCell sx={{ py: 1.8 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: "#f0fdf4",
                          color: "#228756",
                        }}
                      >
                        {invoice.client_name?.charAt(0)}
                      </Avatar>
                      <Typography sx={{ fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>
                        {invoice.client_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#64748b", fontSize: "12px", fontWeight: 500, py: 1.8 }}>
                    {invoice.booking_date}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#1e293b", fontSize: "13px", py: 1.8 }}>
                    ₹{invoice.amount}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.8 }}>
                    <Chip
                      label={invoice.status || "Success"}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "10px",
                        fontWeight: 700,
                        borderRadius: "5px",
                        background: "#f0fdf4",
                        color: "#2ecc71",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: "#94a3b8", fontSize: "13px" }}>
                    No recent invoices
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

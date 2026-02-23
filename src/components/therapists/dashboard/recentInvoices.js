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
  IconButton, 
  Chip,
  Button,
  Avatar
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";

export default function RecentInvoices({ data }) {
  const invoices = data || [];

  return (
    <Box sx={{ mt: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
          Recent Invoices
        </Typography>
        <Button 
          component={Link} 
          href="/therapists/invoices" 
          endIcon={<ArrowForwardIcon />}
          sx={{ color: '#228756', fontWeight: 700, textTransform: 'none' }}
        >
          View All
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid #f1f5f9', 
        overflow: { xs: 'auto', sm: 'hidden' },
        overflowY: { xs: 'hidden', sm: 'visible' }
      }}>
        <Table sx={{ minWidth: { xs: '600px', sm: '100%' } }}>
          <TableHead sx={{ bgcolor: '#f8fafc', position: { xs: 'sticky', sm: 'unset' }, top: 0, zIndex: 5 }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Amount</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow key={invoice.id} sx={{ '&:hover': { bgcolor: '#fbfcfd' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>#{invoice.invoice_id || invoice.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: '#e8f5e9', color: '#228756' }}>
                        {invoice.client_name?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{invoice.client_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.875rem' }}>{invoice.booking_date}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>₹{invoice.amount}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" sx={{ color: '#228756', bgcolor: '#e8f5e9' }}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>No recent invoices</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

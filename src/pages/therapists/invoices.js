import React, { useState, useEffect } from "react";
import InvoicesHeader from "../../components/therapists/invoices/invoices-header";
import InvoicesContent from "../../components/therapists/invoices/invoices-content";
import MainLayout from "../../components/therapists/main-layout";
import { GetDashboardDataUrl, getBookings } from "../../utils/url";
import { fetchById } from "../../utils/actions";
import { Box, LinearProgress } from "@mui/material";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      // We fetch both dashboard data (which might have recent invoices)
      // and bookings to ensure we have a comprehensive list
      const [dashRes, bookingsRes] = await Promise.all([
        fetchById(GetDashboardDataUrl),
        fetchById(getBookings)
      ]);

      let allInvoices = [];

      // 1. Get from dashboard data if available
      if (dashRes.status && dashRes.data?.recent_invoices) {
        allInvoices = [...dashRes.data.recent_invoices];
      }

      // 2. Supplement from bookings if they have transaction info and aren't already included
      if (bookingsRes.status && bookingsRes.data) {
        const bookingInvoices = bookingsRes.data
          .filter(b => b.transaction && b.transaction.status?.name === "Success")
          .map(b => ({
            id: b._id || b.id,
            invoice_id: b.transaction?.transaction_id || b.id,
            client_name: b.client?.name || "Client",
            booking_date: b.booking_date,
            amount: b.transaction?.amount || 0,
            status: "Paid",
            booking_id: b.id
          }));

        // Merge and avoid duplicates by ID
        const existingIds = new Set(allInvoices.map(inv => inv.id));
        bookingInvoices.forEach(inv => {
          if (!existingIds.has(inv.id)) {
            allInvoices.push(inv);
          }
        });
      }

      setInvoices(allInvoices);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <InvoicesHeader />
        
        {loading ? (
          <Box sx={{ width: '100%', mt: 4 }}>
            <LinearProgress color="success" />
          </Box>
        ) : (
          <InvoicesContent invoices={invoices} />
        )}
      </Box>
    </MainLayout>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import InvoicesHeader from "../../components/therapists/invoices/invoices-header";
import InvoicesContent from "../../components/therapists/invoices/invoices-content";
import MainLayout from "../../components/therapists/main-layout";
import { GetDashboardDataUrl, getBookings } from "../../utils/url";
import { fetchById } from "../../utils/actions";
import { invoiceNumber, toAmount } from "../../utils/invoice-template";

const PAID = /success|paid|completed/i;

// One row per paid session booking (the backend has no separate invoice
// records — an invoice is a booking with a successful transaction).
function toRow(b) {
  const tx = b.transaction || {};
  return {
    id: b._id,
    number: invoiceNumber(b),
    client_name: b.client?.name || b.cname || "Client",
    client_phone: b.client?.phone || "",
    service: b.service || "Therapy session",
    format: b.format || "Online",
    booking_date: b.booking_date ? new Date(b.booking_date) : null,
    paid_on: tx.createdAt ? new Date(tx.createdAt) : null,
    amount: toAmount(tx.amount ?? b.amount),
    method: tx.payment_method || "",
    txn_id: tx.transaction_id || "",
    status: "Paid",
    raw: b,
  };
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [since, setSince] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const [dashRes, bookingsRes] = await Promise.allSettled([
        fetchById(GetDashboardDataUrl),
        fetchById(getBookings),
      ]);
      const dash = dashRes.status === "fulfilled" ? dashRes.value : null;
      const bookings = bookingsRes.status === "fulfilled" && bookingsRes.value?.status ? bookingsRes.value.data || [] : [];

      // Same "start fresh" date as the dashboard overview: older invoices are
      // hidden here, not deleted.
      const sinceDate = dash?.status && dash.data?.since ? new Date(dash.data.since) : null;
      setSince(sinceDate);

      const rows = bookings
        .filter((b) => b.transaction && PAID.test(b.transaction.status?.name || ""))
        .map(toRow)
        .filter((r) => !sinceDate || (r.booking_date && r.booking_date >= sinceDate))
        .sort((a, b) => (b.booking_date?.getTime() || 0) - (a.booking_date?.getTime() || 0));
      setInvoices(rows);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <MainLayout>
      <InvoicesHeader invoices={invoices} loading={loading} since={since} />
      <InvoicesContent invoices={invoices} loading={loading} />
    </MainLayout>
  );
}

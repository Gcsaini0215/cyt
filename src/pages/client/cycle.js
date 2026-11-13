import React from "react";
import ClientShell from "../../components/client/client-shell";
import CycleCare from "../../components/cycle/cycle-care";

// Cycle & Mood Care in the client portal (the section itself: components/cycle/cycle-care.js)
export default function CyclePage() {
  return (
    <ClientShell title="Cycle & Mood">
      <CycleCare portal="client" />
    </ClientShell>
  );
}

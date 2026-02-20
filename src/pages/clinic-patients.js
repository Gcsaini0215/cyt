import React from "react";
import MainLayout from "../components/therapists/main-layout";
import ClientLogs from "../components/therapists/clinic/patient-logs";

export default function ClinicPatientsPage() {
  return (
    <MainLayout>
      <ClientLogs />
    </MainLayout>
  );
}

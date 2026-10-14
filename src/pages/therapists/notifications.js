import React from "react";
import MainLayout from "../../components/therapists/main-layout";
import Notification from "../../components/therapists/dashboard/notifications";
import { TeamInboxSection } from "../../components/therapists/team-inbox";
export default function Notifications() {
  return (
    <MainLayout>
      <TeamInboxSection />
      <Notification />
    </MainLayout>
  );
}

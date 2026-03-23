import React from "react";
import MainLayout from "../components/therapists/main-layout";
import { Box, Typography, Breadcrumbs } from "@mui/material";
import Link from "next/link";
import CaseHistoryForm from "../components/therapists/case-history/CaseHistoryForm";

export default function CaseHistoryPage() {
  return (
    <MainLayout>
      <Box sx={{ pb: 5 }}>
        <CaseHistoryForm />
      </Box>
    </MainLayout>
  );
}

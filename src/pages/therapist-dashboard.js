import React from "react";
import MainLayout from "../components/therapists/main-layout";
import PerformanceComponent from "../components/therapists/dashboard/performance";
import TodayAppointment from "../components/therapists/dashboard/todayappointment";
import UpcomingAppointment from "../components/therapists/dashboard/upcommingappointment";
import RecentInvoices from "../components/therapists/dashboard/recentInvoices";
import PerformanceChart from "../components/therapists/dashboard/PerformanceChart";
import QuickActions from "../components/therapists/dashboard/QuickActions";
import { GetDashboardDataUrl, getBookings, GetMyWorkshopBooking } from "../utils/url";
import { LinearProgress, Grid, Box, Typography, Paper, useMediaQuery } from "@mui/material";
import { fetchById } from "../utils/actions";
import useTherapistStore from "../store/therapistStore";
import Link from "next/link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssessmentIcon from "@mui/icons-material/Assessment";

function MobileQuickActions() {
  const actions = [
    { title: "Create Event", icon: <AddBoxIcon />, to: "/workshops", color: "#0ea5e9" },
    { title: "Report", icon: <AssessmentIcon />, to: "/create-report", color: "#f59e0b" },
    { title: "Availability", icon: <ScheduleIcon />, to: "/settings", color: "#8b5cf6" },
    { title: "Invoices", icon: <ConfirmationNumberIcon />, to: "/clinic-patients", color: "#2ecc71" },
  ];
  return (
    <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 0.5, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
      {actions.map((a, i) => (
        <Link key={i} href={a.to} style={{ textDecoration: "none", flexShrink: 0 }}>
          <Box sx={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8,
            px: 2, py: 1.5, borderRadius: "14px",
            border: "1.5px solid #f1f5f9", background: "#fff",
            minWidth: 72, transition: "all 0.15s",
            "&:active": { background: "#f8fafc" }
          }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: a.color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {React.cloneElement(a.icon, { sx: { fontSize: 18, color: a.color } })}
            </Box>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#475569", textAlign: "center", lineHeight: 1.2 }}>
              {a.title}
            </Typography>
          </Box>
        </Link>
      ))}
    </Box>
  );
}

function ProfileCompletionCard({ checks, pct }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: "20px", border: "1.5px solid #f1f5f9", background: "#fff", overflow: "hidden" }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "15px", color: "#1e293b" }}>Profile Setup</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: "13px", color: pct === 100 ? "#2ecc71" : "#228756" }}>
            {pct}%
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, mb: 2 }}>
          Complete to attract more clients
        </Typography>
        <Box sx={{ height: 6, borderRadius: 3, background: "#f1f5f9", overflow: "hidden", mb: 2.5 }}>
          <Box sx={{
            height: "100%", width: `${pct}%`, borderRadius: 3,
            background: "linear-gradient(90deg, #228756, #2ecc71)",
            transition: "width 0.4s ease",
          }} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
          {checks.map((c, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              {c.done
                ? <CheckCircleIcon sx={{ fontSize: 15, color: "#2ecc71", flexShrink: 0 }} />
                : <RadioButtonUncheckedIcon sx={{ fontSize: 15, color: "#cbd5e1", flexShrink: 0 }} />
              }
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: c.done ? "#94a3b8" : "#1e293b", textDecoration: c.done ? "line-through" : "none" }}>
                {c.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      {pct < 100 && (
        <Link href="/settings" style={{ textDecoration: "none" }}>
          <Box sx={{
            mx: 3, mb: 2.5, py: 1.2, borderRadius: "10px",
            background: "linear-gradient(135deg, #228756, #2ecc71)",
            textAlign: "center", cursor: "pointer",
            "&:hover": { opacity: 0.9 }, transition: "opacity 0.2s",
          }}>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>Complete Profile</Typography>
          </Box>
        </Link>
      )}
    </Paper>
  );
}

export default function TherapistDashboard() {
  const isMobile = useMediaQuery("(max-width: 1200px)");
  const [pageData, setPageData] = React.useState({});
  const [upcomingList, setUpcomingList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { therapistInfo, fetchTherapistInfo, paymentStore } = useTherapistStore();

  const getDashboardData = async () => {
    try {
      const [dashRes, bookingsRes, workshopRes] = await Promise.all([
        fetchById(GetDashboardDataUrl),
        fetchById(getBookings),
        fetchById(GetMyWorkshopBooking),
      ]);

      let dashboardData = dashRes.status ? dashRes.data : {};
      let totalEarnings = 0;
      let upcomingSessionsCount = 0;
      let dynamicInvoices = [];
      let filteredUpcoming = [];

      if (bookingsRes.status) {
        const bookings = bookingsRes.data || [];
        totalEarnings += bookings.reduce((sum, b) => {
          const bS = (b.status || "").toLowerCase();
          const pS = (b.transaction?.status?.name || "").toLowerCase();
          if (bS === "completed" || pS === "success" || pS === "completed") {
            const amt = parseFloat(b.transaction?.amount || b.amount || b.fee || 0);
            return sum + (isNaN(amt) ? 0 : amt);
          }
          return sum;
        }, 0);

        const upcoming = bookings.filter((b) => b.status !== "Completed" && b.status !== "Cancelled");
        upcomingSessionsCount = upcoming.length;
        filteredUpcoming = upcoming.map((b) => ({
          id: b._id || b.id,
          name: b.client?.name || "Unknown Client",
          date: b.booking_date,
          badge: b.format || "Online",
          imgSrc: b.client?.photo,
        }));

        dynamicInvoices = bookings
          .filter((b) => b.transaction?.amount)
          .slice(0, 5)
          .map((b) => ({
            id: b._id,
            invoice_id: b.transaction?.transaction_id?.slice(-8) || b._id?.slice(-8),
            client_name: b.client?.name || "Unknown Client",
            booking_date: new Date(b.booking_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            amount: b.transaction?.amount,
            status: b.transaction?.status?.name || "Success",
          }));
      }

      if (workshopRes.status) {
        totalEarnings += (workshopRes.data || []).reduce((sum, b) => {
          const s = (b.payment_status || "").toLowerCase();
          return s === "success" || s === "completed" ? sum + parseFloat(b.amount || 0) : sum;
        }, 0);
      }

      setPageData({ ...dashboardData, total_earnings: Math.round(totalEarnings), upcoming_sessions_count: upcomingSessionsCount, dynamic_invoices: dynamicInvoices });
      setUpcomingList(filteredUpcoming);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    getDashboardData();
    if (!therapistInfo?.user?.email) fetchTherapistInfo();
  }, []);

  const profileChecks = React.useMemo(() => {
    const t = therapistInfo;
    return [
      { label: "Basic info", done: !!(t?.user?.name && t?.user?.phone) },
      { label: "Profile photo", done: !!t?.user?.profile },
      { label: "Availability set", done: t?.availabilities?.length > 0 },
      { label: "Fee configured", done: t?.fees?.some((f) => f.formats?.some((fmt) => fmt.fee)) },
      { label: "Payment details", done: !!(paymentStore?.ac_number || paymentStore?.upi) },
    ];
  }, [therapistInfo, paymentStore]);

  const completionPct = Math.round((profileChecks.filter((c) => c.done).length / profileChecks.length) * 100);

  return (
    <MainLayout>
      {loading ? (
        <Box sx={{ width: "100%", mt: 2 }}>
          <LinearProgress color="success" />
        </Box>
      ) : (
        <Box sx={{ pt: 0.5, pb: 4 }}>
          <PerformanceComponent pageData={pageData} />

          {/* Mobile layout */}
          {isMobile ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Quick actions horizontal scroll */}
              <MobileQuickActions />

              {/* Today sessions */}
              <TodayAppointment data={pageData?.today_appointments} />

              {/* Upcoming sessions */}
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "15px", color: "#1e293b", mb: 1.5 }}>
                  Upcoming Sessions
                </Typography>
                <UpcomingAppointment data={upcomingList} />
              </Box>

              {/* Chart */}
              <PerformanceChart data={pageData?.weekly_performance} />

              {/* Invoices */}
              <RecentInvoices data={pageData?.dynamic_invoices} />

              {/* Profile completion */}
              <ProfileCompletionCard checks={profileChecks} pct={completionPct} />
            </Box>
          ) : (
            /* Desktop layout */
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <PerformanceChart data={pageData?.weekly_performance} />
                <Box sx={{ mt: 3 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "15px", color: "#1e293b", mb: 1.5 }}>
                    Upcoming Sessions
                  </Typography>
                  <UpcomingAppointment data={upcomingList} />
                </Box>
                <TodayAppointment data={pageData?.today_appointments} />
                <RecentInvoices data={pageData?.dynamic_invoices} />
              </Grid>

              <Grid item xs={12} lg={4}>
                <Box sx={{ position: "sticky", top: "90px", display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <ProfileCompletionCard checks={profileChecks} pct={completionPct} />
                  <QuickActions />
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </MainLayout>
  );
}

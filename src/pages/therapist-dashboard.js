import React from "react";
import MainLayout from "../components/therapists/main-layout";
import PerformanceComponent from "../components/therapists/dashboard/performance";
import TodayAppointment from "../components/therapists/dashboard/todayappointment";
import UpcomingAppointment from "../components/therapists/dashboard/upcommingappointment";
import RecentInvoices from "../components/therapists/dashboard/recentInvoices";
import PerformanceChart from "../components/therapists/dashboard/PerformanceChart";
import QuickActions from "../components/therapists/dashboard/QuickActions";
import { GetDashboardDataUrl, getBookings, GetMyWorkshopBooking } from "../utils/url";
import { LinearProgress, Grid, Box, Paper, Avatar, Typography } from "@mui/material";
import { fetchById } from "../utils/actions";

export default function TherapistDashboard() {
  const [pageData, setPageData] = React.useState({});
  const [upcomingList, setUpcomingList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const getDashboardData = async () => {
    try {
      // Parallel fetch for dashboard data, bookings and workshop bookings
      const [dashRes, bookingsRes, workshopRes] = await Promise.all([
        fetchById(GetDashboardDataUrl),
        fetchById(getBookings),
        fetchById(GetMyWorkshopBooking)
      ]);

      let dashboardData = dashRes.status ? dashRes.data : {};
      let totalEarnings = 0;
      let upcomingSessionsCount = 0;
      let dynamicInvoices = [];
      let filteredUpcoming = [];

      // 1. Process regular session bookings
      if (bookingsRes.status) {
        const bookings = bookingsRes.data || [];
        
        // Calculate earnings from regular session bookings
        const sessionEarnings = bookings.reduce((sum, booking) => {
          // Robust status check (Case-insensitive)
          const bStatus = (booking.status || "").toLowerCase();
          const pStatus = (booking.transaction?.status?.name || "").toLowerCase();
          
          if (bStatus === "completed" || pStatus === "success" || pStatus === "completed") {
            // Check multiple potential amount fields
            const amount = parseFloat(booking.transaction?.amount || booking.amount || booking.fee || 0);
            return sum + (isNaN(amount) ? 0 : amount);
          }
          return sum;
        }, 0);
        
        totalEarnings += sessionEarnings;

        const upcomingSessions = bookings.filter(booking => 
          booking.status !== "Completed" && booking.status !== "Cancelled"
        );
        upcomingSessionsCount = upcomingSessions.length;
        
        filteredUpcoming = upcomingSessions.map(b => ({
          id: b._id || b.id,
          name: b.client?.name || "Unknown Client",
          date: b.booking_date,
          badge: b.format || "Online",
          imgSrc: b.client?.photo
        }));

        dynamicInvoices = bookings
          .filter(b => b.transaction?.amount)
          .slice(0, 5)
          .map(b => ({
            id: b._id,
            invoice_id: b.transaction?.transaction_id?.slice(-8) || b._id?.slice(-8),
            client_name: b.client?.name || "Unknown Client",
            booking_date: new Date(b.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: b.transaction?.amount,
            status: b.transaction?.status?.name || "Success",
            full_data: b
          }));
      }

      // 2. Process workshop bookings for earnings
      if (workshopRes.status) {
        const workshopBookings = workshopRes.data || [];
        const workshopEarnings = workshopBookings.reduce((sum, booking) => {
          const status = (booking.payment_status || "").toLowerCase();
          if (status === "success" || status === "completed") {
            return sum + parseFloat(booking.amount || 0);
          }
          return sum;
        }, 0);
        totalEarnings += workshopEarnings;
      }

      dashboardData = {
        ...dashboardData,
        total_earnings: Math.round(totalEarnings),
        upcoming_sessions_count: upcomingSessionsCount,
        dynamic_invoices: dynamicInvoices
      };

      setPageData(dashboardData);
      setUpcomingList(filteredUpcoming);
    } catch (err) {
      console.error("Dashboard Data Fetch Error:", err);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <MainLayout>
      {loading ? (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress color="success" />
        </Box>
      ) : (
        <Box sx={{ pt: 1, pb: 4 }}>
          {/* Top Banner and Summary Stats */}
          <PerformanceComponent pageData={pageData} />

          <Grid container spacing={5} sx={{ mt: -3 }}>
            {/* Left Column: Analytics and Recent Activity */}
            <Grid item xs={12} lg={8}>
              <PerformanceChart data={pageData?.weekly_performance} />
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}>
                  Upcoming Sessions
                </Typography>
                <Box sx={{ 
                  overflowX: { xs: 'auto', sm: 'visible' },
                  overflowY: { xs: 'hidden', sm: 'visible' },
                  pb: { xs: 2, sm: 0 }
                }}>
                  <UpcomingAppointment data={upcomingList} />
                </Box>
              </Box>
              
              <TodayAppointment data={pageData?.today_appointments} />
              
              <RecentInvoices data={pageData?.dynamic_invoices} />
            </Grid>

            {/* Right Column: Quick Actions and Secondary Info */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: { lg: 'sticky' }, top: '120px' }}>
                <QuickActions />
                
                {/* Secondary Info/Notifications */}
                <Paper sx={{ 
                  mt: 5, 
                  p: 4, 
                  borderRadius: '24px', 
                  background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                  color: '#fff',
                  boxShadow: '0 10px 30px rgba(25, 118, 210, 0.25)',
                  border: 'none'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                      <i className="feather-zap"></i>
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>
                      Pro Tip
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.95, lineHeight: 1.6 }}>
                    "Keep your profile updated with your latest expertise and available slots to attract more patients this month."
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </MainLayout>
  );
}

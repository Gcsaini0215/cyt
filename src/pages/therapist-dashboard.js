import React from "react";
import MainLayout from "../components/therapists/main-layout";
import PerformanceComponent from "../components/therapists/dashboard/performance";
import { GetDashboardDataUrl } from "../utils/url";
import LinearProgress from "@mui/material/LinearProgress";
import { fetchById } from "../utils/actions";
export default function TherapistDashboard() {
  const [pageData, setPageData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const getDashboardData = async () => {
    try {
      const res = await fetchById(GetDashboardDataUrl);
      if (res.status) {
        setPageData(res.data);
      } else {
        console.log("Failed to fetch data");
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <MainLayout>
      {loading ? <LinearProgress /> : <div></div>}
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <PerformanceComponent pageData={pageData} />
          {/* <Upcomingappointment /> */}
          {/* <TodayAppointment /> */}
        </div>
      </div>
    </MainLayout>
  );
}

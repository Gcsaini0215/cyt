import { useEffect, useState, useCallback } from "react";

import MainLayout from "../components/therapists/main-layout";
import AppointmentsContent from "../components/therapists/appointment/appointment-content";
import { toast } from "react-toastify";
import { fetchById } from "../utils/actions";
import { getBookings } from "../utils/url";
import PageProgressBar from "../components/global/page-progress";

export default function AppointmentsPage() {
  const [data, setData] = useState([]);
  const [statusList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);

  const getData = useCallback(async () => {
    try {
      // Don't set loading to true for background updates
      const res = await fetchById(getBookings);
      if (res.status) {
        setData(res.data);
        setDataList(res.statuslist);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    getData().finally(() => setLoading(false));
  }, [getData]);

  return (
    <MainLayout>
      {loading ? <PageProgressBar /> : data && data.length === 0 ? <div
        style={{
          background: "#fff", borderRadius: 6, borderTop: "3px solid #c9962c", border: "1px solid #ecefec",
          boxShadow: "0 4px 20px rgba(15,61,36,0.08)", paddingBottom: 44, paddingTop: 44,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
        }}
      >
        <div style={{ width: 72, height: 72, borderRadius: 6, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: '#0f3d24' }}>
          <i className="feather-calendar" style={{ fontSize: 34 }}></i>
        </div>
        <h3 className="fw-bold mb-2" style={{ fontSize: 21, color: '#122019', fontFamily: "Georgia, 'Times New Roman', serif" }}>
          No Bookings Yet
        </h3>
        <p className="mb-0" style={{ fontSize: 14, color: '#5b6b62', maxWidth: 380 }}>
          Your bookings will appear here once clients start scheduling sessions with you. Keep your profile updated!
        </p>
      </div>
        : <AppointmentsContent appointments={data} statusList={statusList} onRefresh={getData} />}
    </MainLayout>
  );
}

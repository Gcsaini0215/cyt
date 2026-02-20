import { useEffect, useState } from "react";

import AppointmentPageSidebar from "../components/therapists/appointment/appointmentheader";
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

  const getData = async () => {
    try {
      setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <MainLayout>
      <AppointmentPageSidebar />
      {loading ? <PageProgressBar /> : data && data.length === 0 ? <div
        className="flex flex-col items-center justify-center p-12 bg-white rounded-[24px] border border-[#f1f5f9] text-center"
        style={{ marginLeft: 10, paddingBottom: 40, paddingTop: 40 }}
      >
        <div style={{ width: 80, height: 80, borderRadius: '20px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: '#228756' }}>
          <i className="feather-calendar" style={{ fontSize: 40 }}></i>
        </div>
        <h3 className="font-bold mb-2" style={{ fontSize: 24, color: '#1e293b' }}>
          No Bookings Yet
        </h3>
        <p className="text-gray-500 mb-6" style={{ fontSize: 16, maxWidth: 400 }}>
          Your bookings will appear here once clients start scheduling sessions with you. Keep your profile updated!
        </p>
      </div>
        : <AppointmentsContent appointments={data} statusList={statusList} onRefresh={getData} />}
    </MainLayout>
  );
}

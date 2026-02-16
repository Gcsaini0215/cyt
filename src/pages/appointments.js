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
        className="min-h-[320px] flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm text-center"
        style={{ marginLeft: 10, paddingBottom: 20 }}
      >
        <h3 className="font-semibold mb-2" style={{ fontSize: 16 }}>
          No Bookings Yet
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Your booking will appear here once clients start booking sessions with you.
        </p>
      </div>
        : <AppointmentsContent appointments={data} statusList={statusList} onRefresh={getData} />}
    </MainLayout>
  );
}

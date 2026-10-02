import { useEffect, useState, useCallback } from "react";

import MainLayout from "../components/therapists/main-layout";
import AppointmentsContent from "../components/therapists/appointment/appointment-content";
import { toast } from "react-toastify";
import { fetchById } from "../utils/actions";
import { getBookings } from "../utils/url";

// In-body placeholder shaped like the real page (title, stat tiles, cards) —
// replaces the old full-screen loader that covered the nav on every visit.
const skeletonStyles = `
  .aps-blk{background:linear-gradient(90deg,#e3e9e5 0%,#f1f5f2 40%,#e3e9e5 80%);background-size:200% 100%;animation:apsShim 1.2s ease-in-out infinite;border-radius:6px;}
  @keyframes apsShim{from{background-position:100% 0}to{background-position:-100% 0}}
  .aps-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:18px 0 16px;}
  .aps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
  @media (max-width:1100px){.aps-grid{grid-template-columns:repeat(2,1fr);}}
  @media (max-width:768px){.aps-stats{grid-template-columns:repeat(2,1fr);}.aps-grid{grid-template-columns:1fr;}}
  @media (prefers-reduced-motion:reduce){.aps-blk{animation:none;}}
`;

function AppointmentsSkeleton() {
  return (
    <div className="content container-fluid pb-4" aria-busy="true" aria-label="Loading sessions">
      <style dangerouslySetInnerHTML={{ __html: skeletonStyles }} />
      <div className="aps-blk" style={{ width: 140, height: 22 }} />
      <div className="aps-blk" style={{ width: 260, height: 12, marginTop: 8 }} />
      <div className="aps-stats">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="aps-blk" style={{ height: 64 }} />)}
      </div>
      <div className="aps-blk" style={{ height: 38, marginBottom: 14 }} />
      <div className="aps-grid">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="aps-blk" style={{ height: 150 }} />)}
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const [data, setData] = useState([]);
  const [statusList, setDataList] = useState([]);
  // Start in the loading state so the first paint is the skeleton, not a
  // flash of "No Bookings Yet" before the fetch begins.
  const [loading, setLoading] = useState(true);

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
    getData().finally(() => setLoading(false));
  }, [getData]);

  return (
    <MainLayout>
      {loading ? <AppointmentsSkeleton /> : data && data.length === 0 ? <div
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

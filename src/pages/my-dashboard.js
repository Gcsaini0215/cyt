import React, { useState } from "react";
import UserLayout from "../components/dashboard/user-layout";
import PageWrapper from "../components/global/page-wrapper";
import DashboardStatics from "../components/dashboard/dashboard-statics";
import DashInfo from "../components/dashboard/dash-info";
import { getClientDashboardDataUrl } from "../utils/url";
import { fetchById } from "../utils/actions";
import { toast } from "react-toastify";

export default function UserDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    try {
      const res = await fetchById(getClientDashboardDataUrl);
      if (res.status) {
        setData(res.data);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong");
    }
    setLoading(false);
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <div id="__next">
      <UserLayout title={data && data.notify?.title}>
        <PageWrapper pageTitle={"My Dashboard"} loading={loading}>
          <DashboardStatics data={data}/>
          <DashInfo />
        </PageWrapper>
      </UserLayout>
    </div>
  );
}

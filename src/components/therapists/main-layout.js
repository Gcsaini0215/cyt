import React from "react";
import { useRouter } from "next/router";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import DashboardTopNav from "./top-nav";
import useMediaQuery from "@mui/material/useMediaQuery";
import { checkProfileSet } from "../../utils/url";
import { fetchById } from "../../utils/actions";

export default function MainLayout(props) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const { profileSet, setProfileSet } = useTherapistStore();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  React.useEffect(() => {
    if (!profileSet) {
      const getData = async () => {
        try {
          const res = await fetchById(checkProfileSet);
          if (res.status) setProfileSet(res.data.check);
        } catch (err) {
          console.log(err);
        }
      };
      getData();
    }
  }, [profileSet]);

  return (
    <>
      <DashboardTopNav />
      <div
        className="rbt-dashboard-area"
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          paddingTop: "56px",
          paddingBottom: isMobile ? "80px" : "0",
        }}
      >
        <main style={{ padding: isMobile ? "16px 10px" : "28px 40px" }}>
          <div className="container-fluid" style={{ maxWidth: "1500px", margin: "0 auto" }}>
            {props.children}
          </div>
        </main>
      </div>
    </>
  );
}

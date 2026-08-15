import React from "react";
import { useRouter } from "next/router";
import useTherapistStore from "../../store/therapistStore";
import { removeToken } from "../../utils/jwt";
import DashboardTopNav from "./top-nav";
import TherapistSideNav from "./side-nav";
import ChatWidget from "./ChatWidget";
import useMediaQuery from "@mui/material/useMediaQuery";
import { checkProfileSet } from "../../utils/url";
import { fetchById } from "../../utils/actions";

export default function MainLayout(props) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  // Matches the breakpoint where DashboardTopNav swaps its top nav for a
  // bottom nav and TherapistSideNav hides itself (960px) — used to reserve
  // the right amount of layout space instead of the tighter "sm" breakpoint.
  const isNavStacked = useMediaQuery("(max-width:960px)");
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
      <TherapistSideNav />
      <ChatWidget />
      <div
        className="rbt-dashboard-area"
        style={{
          background: "#f8faf9",
          minHeight: "100vh",
          paddingTop: "38px",
          paddingLeft: isNavStacked ? 0 : 56,
          paddingBottom: isNavStacked ? "80px" : "0",
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

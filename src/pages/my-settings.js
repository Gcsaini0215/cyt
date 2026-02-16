import React from "react";
import { fetchById } from "../utils/actions";
import { getUserUrl } from "../utils/url";
import { errorColor } from "../utils/colors";
import MyProfile from "../components/dashboard/my-profile";
import UserLayout from "../components/dashboard/user-layout";

export default function ClientSettings() {
  const [pageData, setPageData] = React.useState();
  const [error, setError] = React.useState(null);

  const getData = async () => {
    try {
      const res = await fetchById(getUserUrl);
      if (res.status) {
        setPageData(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <UserLayout>
      {error && (
        <div>
          <p style={{ color: errorColor }}>{error}</p>
        </div>
      )}
      {pageData && (
        <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
          <div className="content">
            <div className="section-title">
              <h4 className="rbt-title-style-3">Edit Profile</h4>
            </div>

            <div className="tab-content">
              {pageData && <MyProfile data={pageData} />}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}

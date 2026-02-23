import React from "react";
import MainLayout from "../../components/therapists/main-layout";
import dynamic from "next/dynamic";
import { fetchById } from "../../utils/actions";
import { getWorkshopByIdUrl } from "../../utils/url";
import ErrorPage from "../error-page";
import { useRouter } from "next/router";
import FormProgressBar from "../../components/global/form-progressbar";

const UpdateWorkshop = dynamic(
  () => import("../../components/therapists/workshops/update-workshop"),
  { ssr: false }
);

export default function UpdateWorkshopPage() {
  const router = useRouter();
  const { id  } = router.query;
  const [data, setData] = React.useState({});

  React.useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetchById(`${getWorkshopByIdUrl}/${id}`);
        if (res.status) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (id) {
      getData();
    }
  }, [id]);
  return (
    <MainLayout>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Update Workshops</h4>
          </div>
          {Object.keys(data).length > 0 ? (
            <UpdateWorkshop data={data} />
          ) : (
            <FormProgressBar />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

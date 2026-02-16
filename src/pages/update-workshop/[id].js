import React from "react";
import MainLayout from "../../components/therapists/main-layout";
import UpdateWorkshop from "../../components/therapists/workshops/update-workshop";
import { fetchById } from "../../utils/actions";
import { getWorkshopByIdUrl } from "../../utils/url";
import { useParams } from "react-router-dom";
import ErrorPage from "../error-page";
import FormProgressBar from "../../components/global/form-progressbar";

export default function UpdateWorkshopPage() {
  const { id } = useParams();
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

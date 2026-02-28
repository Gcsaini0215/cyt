import React from "react";
import Footer from "../../components/footer";
import WorkshopDetail from "../../components/home/workshop-detail";
import MyNavbar from "../../components/navbar";
import { fetchData } from "../../utils/actions";
import { getWorkshopWebUrl } from "../../utils/url";
import ErrorPage from "../error-page";
import { useRouter } from "next/router";
import PageLoading from "../../components/page-loading";

export default function WrokshopDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = React.useState(null);
  const [workshopByThisUser, setWorkshopByThisUser] = React.useState([]);
  const [moreWorkshop, setMoreWorkshop] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetchData(`${getWorkshopWebUrl}/${id}`);
        if (res.status) {
          setData(res.data);
          setWorkshopByThisUser(res.workshopByThisUser || []);
          setMoreWorkshop(res.similarWorkshop || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      getData();
    }
  }, [id]);

  return loading ? (
    <PageLoading />
  ) : (
    <div id="__next">
      <main className="">
        <MyNavbar />
        <main className="rbt-main-wrapper">
          {data ? (
            <WorkshopDetail
              data={data}
              workshopByThisUser={workshopByThisUser}
              moreWorkshop={moreWorkshop}
            />
          ) : (
            <ErrorPage />
          )}
        </main>
        <Footer />
      </main>
    </div>
  );
}

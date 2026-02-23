import { useParams } from "next/router";
import MainLayout from "../../../components/therapists/main-layout";
import { GetCoupansUrl } from "../../../utils/url";
import { fetchById } from "../../../utils/actions";
import ErrorPage from "../../error-page";
import React,{ useState } from "react";
import { useRouter } from "next/router";
import UpdateCoupan from "../../../components/therapists/coupans/update";

export default function UpdateCoupanPage() {
      const router = useRouter();
  const { id  } = router.query;
       const [data, setData] = useState({});

        React.useEffect(() => {
          const getData = async () => {
            try {
              const res = await fetchById(`${GetCoupansUrl}/${id}`);
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

    console.log("dataaaaa",data);
  return (
    <MainLayout>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Update Coupan</h4>
          </div>
          {data && Object.keys(data).length>0 && <UpdateCoupan pageData={data}/>}
        </div>
      </div>
    </MainLayout>
  );
}

import  { useEffect, useState } from "react";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { fetchData } from "../../utils/actions";
import { getPaymentQrUrl } from "../../utils/url";
import PageProgressBar from "../../components/global/page-progress";
import { useCallback } from "react";
import { toast } from "react-toastify";
import WorkshopPaymentPending from "../../components/therapists/workshops/workshop-pending-payment";
import { useRouter } from "next/router";
import PageBreadCrumb from "../../components/global/page-breadcrumb";

export default function PaymentWorkshopPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getData = useCallback(async () => {
    try {
      const res = await fetchData(`${getPaymentQrUrl}/${id}`);
      console.log("res",res);
      if (res.status) {
        setData(res.data);
      } else {
        setError(res.message);
        toast.error(res.message);
      }
      setLoading(false);
    } catch (err) {
      console.log("err",err);
      setError(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  }, [id]);

  useEffect(() => {
    getData();
  }, [getData]);

  return loading ? (
    <PageProgressBar />
  ) : (
    <div id="__next">
      <MyNavbar />
      <PageBreadCrumb title="Payment" linkTitle="Workshop Payment"/>
      {data && Object.keys(data).length > 0 ? <WorkshopPaymentPending pageData={data} />:<h5 className="title mt--15" style={{color:"red",paddingLeft:"20px"}}>{error}</h5>}
      <NewsLetter />
      <Footer />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { fetchData } from "../../utils/actions";
import { pendingPaymentUrl } from "../../utils/url";
import PageProgressBar from "../../components/global/page-progress";
import { useCallback } from "react";
import PaymentPending from "../../components/view_profile/payment-pending";
import { toast } from "react-toastify";
import PageBreadCrumb from "../../components/global/page-breadcrumb";

export default function PaymentPendingPage() {
  const { id } = useParams();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);


  const getData = useCallback(async () => {
    try {
      const res = await fetchData(`${pendingPaymentUrl}/${id}`);

      if (res.status) {
        setData(res.data);
      } else {
        toast.error(res.message);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(true);
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
      <PageBreadCrumb title="Payment" linkTitle="Payment"/>
      {data && Object.keys(data).length > 0 && <PaymentPending pageData={data} />}
      <NewsLetter />
      <Footer />
    </div>
  );
}

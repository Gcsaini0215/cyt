import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { fetchData } from "../../utils/actions";
import { getPaymentQrUrl } from "../../utils/url";
import WorkshopPaymentPending from "../../components/therapists/workshops/workshop-pending-payment";
import PageBreadCrumb from "../../components/global/page-breadcrumb";

export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const res = await fetchData(`${getPaymentQrUrl}/${id}`);
    if (res.status) {
      return { props: { data: res.data, error: "" } };
    }
    return { props: { data: null, error: res.message || "Something went wrong" } };
  } catch (err) {
    console.error("Error fetching workshop payment QR for SSR:", err);
    return { props: { data: null, error: err?.response?.data?.message || "Something went wrong" } };
  }
}

export default function PaymentWorkshopPage({ data, error }) {
  return (
    <div id="__next">
      <MyNavbar />
      <PageBreadCrumb title="Payment" linkTitle="Workshop Payment"/>
      {data && Object.keys(data).length > 0
        ? <WorkshopPaymentPending pageData={data} />
        : <h5 className="title mt--15" style={{ color: "red", paddingLeft: "20px" }}>{error}</h5>}
      <NewsLetter />
      <Footer />
    </div>
  );
}

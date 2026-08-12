import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { fetchData } from "../../utils/actions";
import { pendingPaymentUrl } from "../../utils/url";
import PaymentPending from "../../components/view_profile/payment-pending";
import PageBreadCrumb from "../../components/global/page-breadcrumb";

export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const res = await fetchData(`${pendingPaymentUrl}/${id}`);
    if (res.status) {
      return { props: { data: res.data } };
    }
  } catch (err) {
    console.error("Error fetching pending payment for SSR:", err);
  }
  return { props: { data: null } };
}

export default function PaymentPendingPage({ data }) {
  return (
    <div id="__next">
      <MyNavbar />
      <PageBreadCrumb title="Payment" linkTitle="Payment"/>
      {data && Object.keys(data).length > 0 && <PaymentPending pageData={data} />}
      <NewsLetter />
      <Footer />
    </div>
  );
}

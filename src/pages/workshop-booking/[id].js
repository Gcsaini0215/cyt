import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { fetchData } from "../../utils/actions";
import { getWorkshopWebUrl } from "../../utils/url";
import ErrorPage from "../error-page";
import WorkshopCheckout from "../../components/therapists/workshops/workshop-checkout";
import PageBreadCrumb from "../../components/global/page-breadcrumb";

export async function getServerSideProps(context) {
    const { id } = context.params;
    try {
        const res = await fetchData(`${getWorkshopWebUrl}/${id}`);
        if (res.status) {
            return { props: { data: res.data } };
        }
    } catch (err) {
        console.error("Error fetching workshop for SSR:", err);
    }
    return { props: { data: null } };
}

export default function WorkshopBookingPage({ data }) {
    if (!data) {
        return <ErrorPage />;
    }

    return (
        <div id="__next">
            <MyNavbar />
            <PageBreadCrumb title="Confirm Your Program Access" linkTitle="Checkout"/>
            {Object.keys(data).length > 0 && <WorkshopCheckout data={data} />}

            <NewsLetter />
            <Footer />
        </div>
    );
}

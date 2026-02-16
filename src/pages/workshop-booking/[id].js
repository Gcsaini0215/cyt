import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { fetchData } from "../../utils/actions";
import { getWorkshopWebUrl } from "../../utils/url";
import ErrorPage from "../error-page";
import PageProgressBar from "../../components/global/page-progress";
import WorkshopCheckout from "../../components/therapists/workshops/workshop-checkout";
import PageBreadCrumb from "../../components/global/page-breadcrumb";
export default function WorkshopBookingPage() {
    const { id } = useParams();
    const [data, setData] = useState();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await fetchData(`${getWorkshopWebUrl}/${id}`);
                if (res.status) {
                    setData(res.data);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            getData();
        }
    }, [id]);

    if (error) {
        return <ErrorPage />;
    }

    return loading ? (
        <PageProgressBar />
    ) : (
        <div id="__next">
            <MyNavbar />
            <PageBreadCrumb title="Confirm Your Program Access" linkTitle="Checkout"/>
            {Object.keys(data).length > 0 && <WorkshopCheckout data={data} />}
           
            <NewsLetter />
            <Footer />
        </div>
    );
}

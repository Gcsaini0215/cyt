import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../../components/footer";
import MyNavbar from "../../components/navbar";
import NewsLetter from "../../components/home/newsletter";
import { fetchData } from "../../utils/actions";
import { getTherapistProfile } from "../../utils/url";
import ErrorPage from "../error-page";
import PageProgressBar from "../../components/global/page-progress";
import TherapistCheckout from "../../components/view_profile/checkout";
import { useCallback } from "react";
import PageBreadCrumb from "../../components/global/page-breadcrumb";
export default function TherapistCheckoutPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const getData = useCallback(async () => {
    try {
      const res = await fetchData(getTherapistProfile + id);

      if (res.status && Object.keys(res.data).length > 0) {
        setProfile(res.data);
      } else {
        setError(true);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    getData();
  }, [getData]);

  if (error) {
    return <ErrorPage />;
  }

  return loading ? (
    <PageProgressBar />
  ) : (
    <div id="__next">
      <MyNavbar />
      <PageBreadCrumb title="Checkout" linkTitle="Checkout"/>
      {Object.keys(profile).length > 0 && <TherapistCheckout profile={profile} />}
      <NewsLetter />
      <Footer />
    </div>
  );
}

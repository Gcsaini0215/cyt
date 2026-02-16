import React, { useState } from "react";
import UserLayout from "../../components/dashboard/user-layout";
import FavTherapistCard from "../../components/dashboard/fav-therapist-card";
import { fetchById, postData } from "../../utils/actions";
import {
  GetFavriouteTherapistUrl,
  RemoveFavriouteTherapistUrl,
} from "../../utils/url";
import PageWrapper from "../../components/global/page-wrapper";
import { toast } from "react-toastify";

export default function FavriouteTherapistPage() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    try {
      const res = await fetchById(GetFavriouteTherapistUrl);
      if (res && res.data) {
        setData(res.data);
      } else if (res && res.message) {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleRemoveFav = async (id) => {
    const filter = data.filter((item) => item.therapist._id !== id);
    setData(filter);
    try {
      const response = await postData(RemoveFavriouteTherapistUrl, {
        therapistId: id,
      });
      if (!response.status) {
        toast.error(response.message);
        getData();
      }
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <UserLayout>
      <PageWrapper pageTitle={"Shortlist Therapist"} loading={loading}>
        <div className="row gy-5">
          {data && Object.keys(data).length > 0 ? (
           data.length>0 && data.map((item) => {
              return (
                <div className="col-lg-4 col-md-6 col-12" key={item._id}>
                  <FavTherapistCard
                    data={item}
                    key={item._id}
                    removeFav={handleRemoveFav}
                  />
                </div>
              );
            })
          ) : (
            <h6>No Therapist Found</h6>
          )}
        </div>
      </PageWrapper>
    </UserLayout>
  );
}

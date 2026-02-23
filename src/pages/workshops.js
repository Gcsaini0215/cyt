import MainLayout from "../components/therapists/main-layout";
import React from "react";
import Link from "next/link";

import { deleteWorkshopUrl, getWorkshopsUrl } from "../utils/url";
import { fetchById } from "../utils/actions";
import ErrorPage from "./error-page";
import WorkshopCard from "../components/therapists/workshops/workshop-card";
export default function Workshops() {
  const [data, setData] = React.useState([]);

  const getData = async () => {
    try {
      const res = await fetchById(getWorkshopsUrl, { page: 1 });
      if (res.status) {
        setData(res.data);
      } else {
        return <ErrorPage />;
      }
    } catch (err) {
      return <ErrorPage />;
    }
  };

  const handleDelete = (id) => {
    const updatedData = data.filter((item) => item._id !== id);
    setData(updatedData);
    deleteWorkshop(id);
  };

  const deleteWorkshop = async (id) => {
    try {
      await fetchById(deleteWorkshopUrl, {
        id: id,
      });
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <MainLayout>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Create Event</h4>
          </div>
          <div class="rbt-callto-action rbt-cta-default style-2">
            <div class="content-wrapper overflow-hidden pt--30 pb--30 bg-color-primary-opacity">
              <div class="row gy-5 align-items-end">
                <div class="col-lg-8">
                  <div class="inner">
                    <div class="content text-left">
                      <h5 class="mb--5">Notify your all clients & students.</h5>
                      <p class="b3">Events/Wrokshops/Internships/Trainings</p>
                    </div>
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="call-to-btn text-start text-lg-end position-relative">
                    <Link class="rbt-btn btn-sm" href="/create-workshop">
                      <span data-text="Create Workshop">Create Event</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tab-content mt--40">
            {data && data.length > 0 && (
              <div className="row g-5">
                {data.map((item) => {
                  return (
                    <WorkshopCard
                      key={item._id}
                      data={item}
                      onDelete={handleDelete}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

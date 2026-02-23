import React, { useState } from "react";
import UserLayout from "../../components/dashboard/user-layout";
import { fetchById } from "../../utils/actions";
import { GetMyWorkshopBooking } from "../../utils/url";
import PageWrapper from "../../components/global/page-wrapper";
import CreateTable from "../../components/global/create-table";
import { toast } from "react-toastify";
import Link from "next/link";
const columns = [
  "Posted By",
  "Title",
  "Category",
  "Level",
  "Event Date",
  "Student",
  "Payment Status",
];

export default function MyWorkshopBookingsPage() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    try {
      const res = await fetchById(GetMyWorkshopBooking);
      if (res.status) {
        setData(res.data);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <UserLayout>
      <PageWrapper pageTitle={"My Events"} loading={loading}>
        <div className="row gy-5">
          {data && data.length > 0 ? (
            <CreateTable columns={columns}>
              {data.map((item) => {
                return (
                  <tr key={item._id}>
                    <td>
                      <Link href={`/view-profile/${item.workshop.post_by._id}`} target="_blank"><span style={{ fontSize: "14px", color: "#2e70afff", cursor: "pointer" }}>{item.workshop.post_by.profile_code}</span></Link>
                      <br /> <span style={{ fontSize: "15px", lineHeight: 1.3, display: "inline-block" }}>{item.workshop.post_by.user.name}</span>
                    </td>
                    
                    <td title={item.workshop?.title}>
                      <Link href={`/workshop-detail/${item.workshop._id}`} target="_blank"><span style={{ fontSize: "14px", lineHeight: 1.3, display: "inline-block",color: "#2e70afff", cursor: "pointer" }}>
                        {item.workshop?.title?.slice(0, 15)}
                        {item.workshop?.title?.length > 15 && "..."}
                      </span>
                      </Link>
                    </td>
                    <td>{item.workshop.category}</td>
                    <td>
                      <span className="apponitment-types" style={{ marginTop: "-8px" }}>
                        <li>{item.workshop.level}</li>
                      </span>
                      <span style={{ fontSize: "14px", lineHeight: 1.3, display: "inline-block" }}>
                        {item.workshop.language}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "14px", lineHeight: 1.3, display: "inline-block" }}>
                        {item.workshop.event_date}
                      </span></td>
                     <td>
                       {item.is_student?
                       <>
                        <span style={{fontSize:"13px", lineHeight: 1.3, display: "inline-block"}} title={item.program_name}> {item.program_name.slice(0, 15)}
                        {item.program_name.length > 15 && "..."}</span><br/>
                        <span style={{fontSize:"13px", lineHeight: 1.3, display: "inline-block",paddingTop:"-10px"}} title={item.institution_name}> {item.institution_name.slice(0,15)}
                           {item.institution_name.length > 15 && "..."}
                        </span>
                          </>:"-"
                        }
                    </td>
                    <td>
                      <span className="rbt-badge-5 bg-primary-opacity">{item.transaction.status.name}</span>
                      <span style={{ fontSize: "14px" }}>₹ {item.transaction.amount}</span>
                    </td>

                  </tr>
                );
              })}
            </CreateTable>
          ) : (
            <h6>No Booking Found</h6>
          )}
        </div>
      </PageWrapper>
    </UserLayout>
  );
}

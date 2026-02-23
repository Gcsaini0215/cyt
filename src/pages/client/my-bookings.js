import React, { useState } from "react";
import UserLayout from "../../components/dashboard/user-layout";
import { fetchById } from "../../utils/actions";
import { getBookings } from "../../utils/url";
import PageWrapper from "../../components/global/page-wrapper";
import CreateTable from "../../components/global/create-table";
import { toast } from "react-toastify";
import { formatDateTime } from "../../utils/time";
import Link from "next/link";
const columns = [
  "Therapist",
  "Service",
  "Booked For",
  "Booked at",
  "Pin",
  "Notes",
  "Status",
  "Payment Status",
];

export default function MyBookingsPage() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    try {
      const res = await fetchById(getBookings);
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
      <PageWrapper pageTitle={"My Bookings"} loading={loading}>
        <div className="row gy-5">
          {data && data.length > 0 ? (
            <CreateTable columns={columns}>
              {data.map((item) => {
                return (
                  <tr key={item._id}>
                    <td>
                       <Link href={`/view-profile/${item.therapist._id}`} target="_blank"><span style={{fontSize:"14px",color:"#2e70afff",cursor:"pointer"}}>{item.therapist.profile_code}</span></Link>
                     <br/> <span style={{fontSize:"15px",lineHeight:1.3,display:"inline-block"}}>{item.therapist.user.name}</span>
                      </td>
                    <td><p>
                        <span style={{fontSize:"14px",lineHeight:1.3,display:"inline-block"}}>
                            {item.service}
                        </span>
                        <span className="apponitment-types" style={{marginTop:"-8px"}}>
                            <li>{item.format}</li>
                        </span>
                    </p></td>
                    <td>
                       {item.whom==="Self"?<span style={{fontSize:"14px"}}>Self</span>:
                       <>
                        <span style={{fontSize:"13px"}}><i className="fa-solid fa-clock"></i> {item.cname}</span>
                        <span style={{fontSize:"13px"}}><i className="fa-solid fa-clock"></i> {item.age}</span>
                        <span style={{fontSize:"13px"}}><i className="fa-solid fa-clock"></i> {item.relation_with_client}</span>
                        </>
                        }
                    </td>
                    <td><span style={{fontSize:"13.5px",}}>{formatDateTime(item.booking_date)}</span></td>
                    <td><span style={{fontSize:"14px"}}>{item.otp}</span></td>
                    <td title={item.notes}>
                     <span style={{fontSize:"15px",lineHeight:1.3,display:"inline-block"}}> {item.notes?.length > 20
                        ? item.notes.substring(0, 20) + "..."
                        : item.notes}
                        </span>
                    </td>
                    <td><span style={{fontSize:"13.5px"}}>{item.status}</span>
                       {item.status!=="New"?
                       <>
                        <span style={{fontSize:"13px"}}><i className="fa-solid fa-clock"></i> {formatDateTime(item.session_started_at)}</span>
                        <span style={{fontSize:"13px"}}><i className="fa-solid fa-clock"></i> {formatDateTime(item.session_completed_at)}</span>
                         </>:""}
                        </td>
                    <td>
                      <span className="rbt-badge-5 bg-primary-opacity">{item.transaction.status.name}</span>
                      <span style={{fontSize:"14px"}}>₹ {item.transaction.amount}</span>
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

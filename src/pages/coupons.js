import React, { useState } from "react";
import { deleteById, fetchById } from "../utils/actions";
import { DeleteCoupansUrl, GetCoupansUrl } from "../utils/url";
import PageWrapper from "../components/global/page-wrapper";
import CreateTable from "../components/global/create-table";
import { toast } from "react-toastify";
import MainLayout from "../components/therapists/main-layout";
import { formatDate } from "../utils/time";
import { useNavigate } from "react-router-dom";
import CouponSwitch from "../components/therapists/coupans/coupan-switch";
import { EditDeleteButton } from "../components/therapists/coupans/edit-delete-button";

const columns = [
    "Code",
    "Value",
    "Max Usage",
    "Used",
    "For",
    "Valid From",
    "Valid Till",
    "Status",
    "Actions",
];

export default function CoupansPage() {
    const navigate = useNavigate();
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = useState(false);

    const getData = async () => {
        try {
            const res = await fetchById(GetCoupansUrl);
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

    const handleButtonClick = () => {
        navigate("/coupon/create")
    }

    const handleDelete = async (id) => {
        try {
            const res = await deleteById(`${DeleteCoupansUrl}/${id}`);
            if (res?.status) {
                toast.success("Delete Successfully!");
                setData((prevCoupons) => prevCoupons.filter((c) => c._id !== id));
            } else {
                toast.error(res?.message || "Failed to delete");
            }
        } catch (error) {
            toast.error("Error in deleting the coupon");
        } 
    };

    const handleNavigate = (id) => {
        navigate(`/coupon/update/${id}`)
    }

    React.useEffect(() => {
        getData();
    }, []);

    return (
        <MainLayout>
            <PageWrapper pageTitle={"My Coupans"} loading={loading} buttonTitle="Create Coupan" onClick={handleButtonClick}>
                <div className="row gy-5">
                    {data && data.length > 0 ? (
                        <CreateTable columns={columns}>
                            {data.map((item) => {
                                return (
                                    <tr key={item._id}>
                                        <th>{item.code}</th>
                                        <td>{item.discount_type === "percentage" ? `${item.discount_value}%` : `₹${item.discount_value}`}</td>
                                        <td>
                                            {item.max_usage}
                                        </td>
                                        <td>{item.used_count}</td>
                                        <td>{item.coupon_for}</td>
                                        <td>{formatDate(item.valid_from)}</td>
                                        <td title={item.valid_until}>
                                            {formatDate(item.valid_until)}
                                        </td>
                                        <td>
                                            <CouponSwitch item={item} />
                                        </td>
                                        <td>
                                            <EditDeleteButton handleNavigate={() => { handleNavigate(item._id) }} onDelete={() => { handleDelete(item._id) }} />
                                        </td>

                                    </tr>
                                );
                            })}
                        </CreateTable>
                    ) : (
                        <h6>No Coupons Found</h6>
                    )}
                </div>
            </PageWrapper>
        </MainLayout>
    );
}

import React, { useEffect } from "react";


import { useRouter } from "next/router";
import {
    Dialog,
    DialogContent,
    DialogActions,
} from "@mui/material";
import WorkshopCheckoutCard from "./workshop-checkout-card";
import { ApplyCouponUrl, bookWorkshopUrl, verifyOtpUrl } from "../../../utils/url";
import useUserStore from "../../../store/userStore";
import FormProgressBar from "../../global/form-progressbar";
import { postData } from "../../../utils/actions";
import FormMessage from "../../global/form-message";
import { toast } from "react-toastify";
import { getToken } from "../../../utils/jwt";


export default function WorkshopCheckout({ data }) {
    const { userInfo } = useUserStore();
    const router = useRouter();
    const [error, setError] = React.useState("");
    const [couponError, setCouponError] = React.useState("");
    const [otpError, setOtpError] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [otp, setOtp] = React.useState("");
    const [bookingId, setBookingId] = React.useState();

    const [info, setInfo] = React.useState({
        name: userInfo.name || "",
        phone: "",
        email: "",
        amount: "",
        is_student: false,
        program_name: "",
        institution_name: "",
        therapist: "",
        is_logged_in: false,
        user_id: "",
        workshopId: ""
    });

    const [amountInfo, setAmountInfo] = React.useState({
        coupon: "",
        amount: 0,
        tax: 0,
        subtotal: 0,
        discount: 0,
        discount_type: "",
        discount_value: 0,
        afterdiscount: 0
    })

    const handleStudentChange = (e) => {
        setInfo((prev) => ({
            ...prev,
            is_student: e.target.value === "yes"
        }));
    };

    const handleChange = (name, value) => {
        if (name === "name" || name === "email" || name === "program_name" || name === "institution_name") {
            setInfo((prevInfo) => ({
                ...prevInfo,
                [name]: value,
            }));
        } else if (name === "phone") {
            const formattedValue = value.replace(/\D/g, "");
            if (formattedValue.length <= 10) {
                setInfo((prevInfo) => ({
                    ...prevInfo,
                    [name]: formattedValue,
                }));
            }
        }
        else if (name === "otp") {
            const formattedValue = value.replace(/\D/g, "").slice(0, 6);
            setOtp(formattedValue);
        } else {
            setInfo((prevInfo) => ({
                ...prevInfo,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async () => {
        setSuccess("");
        if (!info.is_logged_in && info.name.length === "") {
            setError("Please enter name");
            return;
        } else if (!info.is_logged_in && info.phone.length !== 10) {
            setError("Please enter phone number");
            return;
        }
        else if (!info.is_logged_in && !userInfo.email && info.email === "") {
            setError("Please Enter Email id.");
            return;
        } else if (info.is_student && info.program_name.length < 4) {
            setError("Please enter valid program name.");
            return;
        } else if (info.is_student && info.institution_name === "") {
            setError("Please select relation with client.");
            return;
        } else {
            setError("");
            setLoading(true);
            try {
                setLoading(true);

                const response = await postData(bookWorkshopUrl, info);
                if (response.status) {
                    setBookingId(response.data.id);
                    setOpen(true);

                } else {
                    setError(response.message);

                }
            } catch (error) {
                console.log(error);
                setError(error?.response?.data?.message);
            }
            setLoading(false);
        }
    };

    const onClose = () => {
        setOpen(false);
    }

    const verifyOtp = async () => {
        setOtpError("");
        if (otp.length !== 6) {
            setOtpError("Please enter valid OTP");
            return;
        }
        let email = info.email;
        const value = {
            email,
            otp,
        };
        try {
            setLoading(true);
            const response = await postData(verifyOtpUrl, value);
            if (response.status) {
                setOtpError("");
                setOtp("");
                router.push(`/workshop-pending/${bookingId}`);
            } else {
                setOtpError(response.message);
            }
        } catch (error) {
            setSuccess("");
            setOtpError(error.response.data.message);
        }
        setLoading(false);
    };

    const setConfigFn = async (data) => {
        const token = getToken();
        setInfo((prev) => ({
            ...prev,
            therapist: data.post_by._id,
            amount: data.price,
            is_logged_in: token ? true : false,
            user_id: userInfo._id || "",
            workshopId: data._id,
            email: userInfo.email || "",
        }));
        setAmountInfo((prev) => ({
            ...prev,
            amount: data.price,
        }))
    }


    const handleCouponApply = async () => {
        setCouponError("");
        try {
            if (amountInfo.coupon === "") {
                setCouponError("Please Enter Coupon Code");
                return false;
            }
            if (amountInfo.coupon.length > 10) {
                setCouponError("Coupon is Invalid");
                return false;
            }
            const reqData = {
                therapist_id: data.post_by._id,
                code: amountInfo.coupon,
                apply_for: "Workshop"
            }
            const res = await postData(ApplyCouponUrl, reqData);
            if (res?.status && res?.data) {
                const { discount_type, discount_value } = res.data;
                setAmountInfo((prev) => ({
                    ...prev,
                    discount_type,
                    discount_value
                }));
                toast.success("Coupon applied successfully!");
            } else {
                setCouponError(res.message);;
                toast.error(res?.message || "Invalid coupon");
            }

        } catch (error) {
            setCouponError(error.response.data.message || "Error applying coupon");
        }

    }




    useEffect(() => {
        let discount = 0;

        if (amountInfo.discount_type === "flat") {
            discount = amountInfo.discount_value;
        } else if (amountInfo.discount_type === "percentage") {
            discount = (amountInfo.amount * amountInfo.discount_value) / 100;
        }

        discount = Math.min(discount, amountInfo.amount);
        let afterdiscount = amountInfo.amount - discount;
        setAmountInfo((prev) => ({
            ...prev,
            discount,
            afterdiscount,
        }));
        setInfo((prev) => ({
            ...prev,
            amount: afterdiscount
        }))
    }, [amountInfo.amount, amountInfo.discount_type, amountInfo.discount_value]);

    console.log("info after", info);


    return (
        <div className="checkout_area bg-color-white ">
            <div className="container">
                <div className="row g-5 checkout-form">
                    <div className="col-lg-7">
                        <WorkshopCheckoutCard pageData={data} />
                        <div className="checkout-content-wrapper mt--20">
                            <div id="billing-form">
                                <h4 className="checkout-title">Billing Details</h4>
                                <FormMessage success={success} error={error} />
                                <div className="row mt--15">
                                    <div className="row mt--15">
                                        <label htmlFor="">Are you student?</label>
                                        <div className="col-6 col-md-6 col-lg-6 mb--10">
                                            <div className="row">
                                                <div className="col-6 col-md-6 col-lg-6">
                                                    <>
                                                        <input
                                                            type="radio"
                                                            id="student_no"
                                                            name="is_student"
                                                            value="no"
                                                            checked={info.is_student === false}
                                                            onChange={handleStudentChange}
                                                            style={{ width: '60px' }}
                                                        />
                                                        <label htmlFor="student_no">No</label>
                                                    </>
                                                </div>
                                                <div className="col-6 col-md-6 col-lg-6">
                                                    <>
                                                        <input
                                                            type="radio"
                                                            id="student_yes"
                                                            name="is_student"
                                                            value="yes"
                                                            checked={info.is_student === true}
                                                            onChange={handleStudentChange}
                                                            style={{ width: '60px' }}
                                                        />
                                                        <label htmlFor="student_yes">Yes</label>
                                                    </>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                    {!info.is_logged_in &&
                                        <> <div className="col-md-6 col-12 mb--10">
                                            <label htmlFor="name">Full Name*</label>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={info.name}
                                                id="name"
                                                name="name"
                                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            />
                                        </div>

                                            <div className="col-md-6 col-12 mb--10">
                                                <label htmlFor="phone">Whatsapp no*</label>
                                                <input
                                                    type="text"
                                                    placeholder="Whatsapp number"
                                                    id="phone"
                                                    name="phone"
                                                    value={info.phone || ""}
                                                    onChange={(e) =>
                                                        handleChange(e.target.name, e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="col-md-6 col-12 mb--10">
                                                <label htmlFor="phone">Email*</label>
                                                <input
                                                    type="text"
                                                    placeholder="Email"
                                                    id="email"
                                                    name="email"
                                                    value={info.email}
                                                    onChange={(e) =>
                                                        handleChange(e.target.name, e.target.value)
                                                    }
                                                />
                                            </div>
                                        </>}

                                    {info.is_student && <>

                                        <div className="col-md-6 col-12 mb--10">
                                            <label htmlFor="phone">Program Name*</label>
                                            <input
                                                type="text"
                                                placeholder="Program Name"
                                                id="program_name"
                                                name="program_name"
                                                value={info.program_name}
                                                onChange={(e) =>
                                                    handleChange(e.target.name, e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 col-12 mb--10">
                                            <label htmlFor="phone">Institution Name*</label>
                                            <input
                                                type="text"
                                                placeholder="Institution Name"
                                                id="institution_name"
                                                name="institution_name"
                                                value={info.institution_name}
                                                onChange={(e) =>
                                                    handleChange(e.target.name, e.target.value)
                                                }
                                            />
                                        </div>
                                    </>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-5">

                        <div className="col-12 mb--30">
                            <div className="checkout-cart-total">
                                <h4>
                                    Program <span>Total</span>
                                </h4>
                                <ul>
                                    <li style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                                        {data.title}
                                        <span>₹{amountInfo.amount}</span>
                                    </li>
                                </ul>

                                <p>
                                    Sub Total<span>₹{amountInfo.amount}</span>
                                </p>
                                {
                                    amountInfo.discount != 0 && <p>
                                        Coupon Discount<span>₹{amountInfo.discount}</span>
                                    </p>
                                }
                                <div className="mt--10" style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                                    <div >
                                        <input
                                            type="text"
                                            placeholder="Use Coupon"
                                            id="coupon"
                                            name="coupon"
                                            value={amountInfo.coupon}
                                            onChange={(e) =>
                                                setAmountInfo((prev) => ({
                                                    ...prev,
                                                    coupon: e.target.value
                                                }))
                                            }
                                            style={{ marginBottom: 0 }}
                                        />
                                        {couponError && <span style={{ color: "red", fontSize: "12px", }}>{couponError}</span>}
                                    </div>
                                    <div >
                                        <a class="rbt-btn btn-sm" onClick={handleCouponApply}>Apply</a>
                                    </div>
                                </div>

                                <h4 className="mt--30">
                                    Grand Total <span style={{ fontSize: "26px", }}>₹{amountInfo.afterdiscount}</span>
                                </h4>
                                <div className="plceholder-button mt--10">
                                    {loading ? (
                                        <FormProgressBar />
                                    ) : (
                                        <button
                                            className="rbt-btn btn-gradient hover-icon-reverse mb--20"
                                            onClick={handleSubmit}
                                        >
                                            <span className="icon-reverse-wrapper">
                                                <span className="btn-text">Continue</span>
                                                <span className="btn-icon">
                                                    <i className="feather-arrow-right"></i>
                                                </span>
                                                <span className="btn-icon">
                                                    <i className="feather-arrow-right"></i>
                                                </span>
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <Dialog open={open} onClose={(event, reason) => {
                if (reason === "backdropClick" || reason === "escapeKeyDown") {
                    return;
                }
                onClose(event, reason);
            }} maxWidth="sm" fullWidth >
                <div style={{ padding: "8px" }}>
                    <h5>Enter OTP</h5>
                    <FormMessage success={success} error={otpError} />
                    <DialogContent dividers>
                        <div className="col-md-6 col-12 mb--10">
                            <label htmlFor="phone">OTP*</label>
                            <input
                                type="text"
                                placeholder="OTP"
                                id="otp"
                                value={otp}
                                name="otp"
                                onChange={(e) =>
                                    handleChange(e.target.name, e.target.value)
                                }
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <div className="plceholder-button mt--10">
                            {loading ? (
                                <FormProgressBar />
                            ) : (
                                <button
                                    className="rbt-btn btn-gradient hover-icon-reverse"
                                    onClick={verifyOtp}
                                >
                                    <span className="icon-reverse-wrapper">
                                        <span className="btn-text">Submit</span>
                                        <span className="btn-icon">
                                            <i className="feather-arrow-right"></i>
                                        </span>
                                        <span className="btn-icon">
                                            <i className="feather-arrow-right"></i>
                                        </span>
                                    </span>
                                </button>
                            )}
                        </div>
                    </DialogActions>
                </div>
            </Dialog>
        </div>
    );
}

import React, { useState } from "react";
import {
  getAccountDetailsUrl,
  updateAccountDetailsUrl,
} from "../../../utils/url";
import { fetchById, postData } from "../../../utils/actions";
import useTherapistStore from "../../../store/therapistStore";
import FormMessage from "../../global/form-message";
import FormProgressBar from "../../global/form-progressbar";

export default function PaymentDetails({ onSuccess }) {
  const { paymentStore, setPaymentStore, setMultiplePaymentStore } =
    useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (
      paymentStore.upi === "" &&
      (paymentStore.ac_name.length < 3 ||
        paymentStore.ac_number === "" ||
        paymentStore.ifsc.length < 4)
    ) {
      setError("Either enter account details or upi id");
      return;
    } else {
      setError("");
      setLoading(true);
      const reqData = {
        upi: paymentStore.upi,
        ac_name: paymentStore.ac_name,
        ac_number: paymentStore.ac_number,
        ifsc: paymentStore.ifsc,
      };

      try {
        const response = await postData(updateAccountDetailsUrl, reqData);
        if (response.status) {
          setSuccess(response.message);
          setError("");
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setError("Something went wrong");
        }
      } catch (error) {
        setError(error?.response?.data?.message || "Something went wrong");
      }
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!hasFetched && paymentStore.ac_name === "" && paymentStore.upi === "") {
      const getData = async () => {
        try {
          setPageLoading(true);
          const res = await fetchById(getAccountDetailsUrl);
          if (res.data && Object.keys(res.data).length > 0) {
            setMultiplePaymentStore(res.data);
          }
        } catch (err) {
          setError(err.message);
        }
        setPageLoading(false);
        setHasFetched(true);
      };
      getData();
    }
  }, [paymentStore.ac_name, paymentStore.upi, hasFetched]);

  if (pageLoading) return <FormProgressBar />;

  return (
    <div className="rbt-dashboard-content-wrapper">
      <div className="rbt-profile-row rbt-default-form row row--15">
        <div className="col-12 mb--20">
          <h5 className="title">Payment & Bank Details</h5>
          <p className="description" style={{ fontSize: '14px' }}>
            Choose your preferred payment method to receive payouts.
          </p>
        </div>

        <div className="col-lg-12">
          <div className="rbt-shadow-box p--30 mb--30 border-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px', background: '#fff' }}>
            <h6 className="rbt-title-style-2 mb--20" style={{ color: '#1e293b', fontWeight: 700 }}>Option 1: Bank Account</h6>
            <div className="row g-4">
              <div className="col-12">
                <div className="rbt-form-group">
                  <label htmlFor="accountName" style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Bank Account Name</label>
                  <input
                    id="accountName"
                    type="text"
                    style={{ borderRadius: '10px', height: '50px', border: '1px solid #e2e8f0' }}
                    value={paymentStore.ac_name}
                    onChange={(e) => setPaymentStore("ac_name", e.target.value)}
                    placeholder="Enter Account Holder Name"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="rbt-form-group">
                  <label htmlFor="accountNumber" style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Account Number</label>
                  <input
                    id="accountNumber"
                    type="text"
                    style={{ borderRadius: '10px', height: '50px', border: '1px solid #e2e8f0' }}
                    value={paymentStore.ac_number}
                    onChange={(e) => setPaymentStore("ac_number", e.target.value)}
                    placeholder="Enter Account Number"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="rbt-form-group">
                  <label htmlFor="ifsc" style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>IFSC Code</label>
                  <input
                    id="ifsc"
                    type="text"
                    style={{ borderRadius: '10px', height: '50px', border: '1px solid #e2e8f0' }}
                    value={paymentStore.ifsc}
                    onChange={(e) => setPaymentStore("ifsc", e.target.value)}
                    placeholder="Enter IFSC Code"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 text-center mb--30">
          <div className="section-title">
            <span className="subtitle bg-secondary-opacity text-secondary px-4 py-2 rounded-pill" style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '1px' }}>OR</span>
          </div>
        </div>

        <div className="col-lg-12">
          <div className="rbt-shadow-box p--30 mb--30 border-0" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px', background: '#fff' }}>
            <h6 className="rbt-title-style-2 mb--20" style={{ color: '#1e293b', fontWeight: 700 }}>Option 2: UPI Transfer</h6>
            <div className="rbt-form-group">
              <label htmlFor="upiId" style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>UPI ID</label>
              <input
                id="upiId"
                type="text"
                name="upi"
                style={{ borderRadius: '10px', height: '50px', border: '1px solid #e2e8f0' }}
                value={paymentStore.upi}
                onChange={(e) => setPaymentStore("upi", e.target.value)}
                placeholder="example@upi"
              />
            </div>
          </div>
        </div>

        <div className="col-12">
          <FormMessage error={error} success={success} />
          <div className="rbt-form-group d-none">
            <button className="rbt-btn btn-gradient submit-btn" onClick={handleSubmit}>
              Update
            </button>
          </div>
          {loading && <FormProgressBar />}
        </div>
      </div>
    </div>
  );
}

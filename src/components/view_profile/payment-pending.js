import React from "react";


import FormMessage from "../global/form-message";
import { postData } from "../../utils/actions";
import { savePaymentUrl} from "../../utils/url";
import FormProgressBar from "../global/form-progressbar";
import QrcodeCard from "../global/qrcode-card";
import PaymentSuccessModal from "./payment-success-popup";
import { getToken, setToken } from "../../utils/jwt";
export default function PaymentPending({ pageData }) {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [transactionId, setTransanctionId] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [success, setSuccess] = React.useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (transactionId.length < 4) {
      setError("Please enter valid transation id");
      return;
    } else {
      setError("");
      setLoading(true);
      const data = {
        booking_id: pageData.booking_id,
        transactionId,
      };
      try {
        setLoading(true);
        const response = await postData(savePaymentUrl, data);
        if (response.status) {
          const token = getToken();
          if (!token) {
            setToken(response.token);
          }
          setSuccess("Payment Recevided successfully");
          setOpen(true);

        } else {
          setError(response.message);

        }
      } catch (error) {
        setError(error?.response?.data?.message);

      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="checkout_area bg-color-white ">
      <div className="container">
        <div className="row g-5 checkout-form">
          <div className="col-lg-7">
            <QrcodeCard pageData={pageData} />
          </div>
          <div className="col-lg-5">
            <div className="col-12 mb--20">

              <div className="checkout-cart-total">
                <h4 style={{ fontSize: 24 }}>Transaction Id</h4>

                <div className="single-list" style={{ marginTop: 15 }}>
                  <h5 className="price-title" style={{ fontSize: "16px" }}>
                    Enter Transaction Id
                  </h5>

                  <div className="col-md-12 col-12 mb--10">
                    <input
                      type="text"
                      placeholder="Transaction Id"
                      id="transaction id"
                      value={transactionId}
                      onChange={(e) => setTransanctionId(e.target.value)}
                    />
                  </div>
                  <FormMessage success={success} error={error} />
                  <div className="plceholder-button mt--10">
                    {loading ? (
                      <FormProgressBar />
                    ) : (
                      <button
                        className="rbt-btn btn-gradient hover-icon-reverse"
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
      </div>
      <PaymentSuccessModal open={open} onClose={() => setOpen(false)} navigateTo="/my-bookings" />
    </div>
  );
}

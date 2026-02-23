import React, { useState } from "react";
import { FaInfoCircle, FaMicrophone, FaVideo, FaUser } from "react-icons/fa";

import useTherapistStore from "../../../store/therapistStore";
import { updateFeeDetailsUrl } from "../../../utils/url";
import { postData } from "../../../utils/actions";
import FormProgressBar from "../../global/form-progressbar";
import FormMessage from "../../global/form-message";
import { toast } from "react-toastify";

export default function Fees({ onSuccess }) {
  const { therapistInfo, setFee } = useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await postData(updateFeeDetailsUrl, { fees: therapistInfo.fees });
      if (response.status) {
        setSuccess(response.message);
        setError("");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.message || "Something went wrong");
      }
    } catch (error) {
      setError(error?.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  if (pageLoading) return <FormProgressBar />;

  return (
    <div className="rbt-dashboard-content-wrapper">
      <div className="rbt-profile-row rbt-default-form">
        <div className="section-title mb--20">
          <h5 className="title mb--5">Session Fees</h5>
          <p className="description" style={{ fontSize: '14px' }}>
            <i className="feather-info mr--5 text-primary"></i>
            Enter your fees for different session formats. Price range should be between 500-2500 INR.
          </p>
        </div>

        <div className="rbt-table-wrapper">
          <table className="rbt-table table table-borderless">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>
                  <FaMicrophone className="mr--5" /> Audio
                </th>
                <th>
                  <FaVideo className="mr--5" /> Video
                </th>
                <th>
                  <FaUser className="mr--5" /> In-person
                </th>
              </tr>
            </thead>
            <tbody>
              {therapistInfo.fees.map((feeItem, serviceIndex) => (
                <tr key={serviceIndex}>
                  <td style={{ verticalAlign: 'middle', fontWeight: 500 }}>
                    {feeItem.name}
                    <FaInfoCircle
                      title={`Short information about ${feeItem.name}`}
                      style={{ marginLeft: 8, fontSize: 12, color: '#666', cursor: 'help' }}
                    />
                  </td>
                  {feeItem.formats.map((format, formatIndex) => (
                    <td key={formatIndex}>
                      <div className="rbt-form-group mb--0">
                        <input
                          type="number"
                          placeholder="Price"
                          style={{ height: 45, borderRadius: 8 }}
                          value={format?.fee || ""}
                          onChange={(e) =>
                            setFee(serviceIndex, formatIndex, e.target.value)
                          }
                          onBlur={(e) => {
                            let value = parseInt(e.target.value);
                            if (e.target.value !== "" && (isNaN(value) || value < 500 || value > 2500)) {
                              setFee(serviceIndex, formatIndex, "");
                              toast.error("Price must be between 500 and 2500");
                            }
                          }}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-12 mt--30">
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

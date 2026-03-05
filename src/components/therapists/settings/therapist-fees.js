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

        <div className="rbt-table-wrapper" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="rbt-table table table-borderless" style={{ minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '15px', borderRadius: '8px 0 0 8px' }}>Service Name</th>
                <th style={{ padding: '15px' }}>
                  <FaMicrophone className="mr--5" style={{ color: '#0ea5e9' }} /> Audio
                </th>
                <th style={{ padding: '15px' }}>
                  <FaVideo className="mr--5" style={{ color: '#8b5cf6' }} /> Video
                </th>
                <th style={{ padding: '15px', borderRadius: '0 8px 8px 0' }}>
                  <FaUser className="mr--5" style={{ color: '#ec4899' }} /> In-person
                </th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '10px solid transparent' }}>
              {therapistInfo.fees.map((feeItem, serviceIndex) => (
                <tr key={serviceIndex} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ verticalAlign: 'middle', fontWeight: 600, color: '#1e293b', padding: '20px 15px' }}>
                    {feeItem.name}
                    <FaInfoCircle
                      title={`Short information about ${feeItem.name}`}
                      style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8', cursor: 'help' }}
                    />
                  </td>
                  {feeItem.formats.map((format, formatIndex) => (
                    <td key={formatIndex} style={{ padding: '15px' }}>
                      <div className="rbt-form-group mb--0">
                        <div style={{ position: 'relative' }}>
                          <span style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: '#64748b',
                            fontSize: '14px'
                          }}>₹</span>
                          <input
                            type="number"
                            placeholder="Price"
                            style={{ 
                              height: 45, 
                              borderRadius: 10, 
                              paddingLeft: '25px',
                              border: '1px solid #e2e8f0',
                              fontSize: '15px',
                              fontWeight: '500'
                            }}
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

import React, { useState } from "react";
import { postData } from "../../../utils/actions";
import { changePasswordUrl } from "../../../utils/url";
import FormMessage from "../../global/form-message";
import FormProgressBar from "../../global/form-progressbar";
import { removeToken } from "../../../utils/jwt";
import { useRouter } from "next/router";

export default function Password() {
  const router = useRouter();
  const [data, setData] = React.useState({
    password: "",
    npassword: "",
    cpassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (field, value) => {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: "" }));
    setData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});

    const errors = {};
    if (data.password.length < 6) {
      errors.password = "Please enter valid current password (min 6 chars)";
    }
    if (data.npassword.length < 6) {
      errors.npassword = "New password must be at least 6 characters";
    }
    if (data.cpassword.length < 6) {
      errors.cpassword = "Confirm password must be at least 6 characters";
    }
    if (data.npassword !== data.cpassword && data.npassword.length >= 6) {
      errors.cpassword = "Confirm password is not same as password";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    } else {
      setError("");
      setLoading(true);
      try {
        const response = await postData(changePasswordUrl, data);
        if (response.status) {
          setError("");
          setSuccess("Password has been changed! Redirecting to login page");
          removeToken();
          setTimeout(() => {
            router.push("/login");
          }, 5000);
        } else {
          setError("Something went wrong");
        }
      } catch (error) {
        setError(error?.response?.data?.message || "Something went wrong");
      }
      setLoading(false);
    }
  };

  return (
    <div
      className="tab-pane fade active show"
      id="password"
      role="tabpanel"
      aria-labelledby="password-tab"
    >
      <div className="rbt-profile-row rbt-default-form row row--15">
        <div className="col-12">
          <div className="rbt-form-group">
            <label htmlFor="currentpassword">Current Password</label>
            <input
              id="currentpassword"
              type="password"
              placeholder="Current Password"
              value={data.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            {fieldErrors.password && <span className="text-danger" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>{fieldErrors.password}</span>}
          </div>
        </div>
        <div className="col-12">
          <div className="rbt-form-group">
            <label htmlFor="newpassword">New Password</label>
            <input
              id="newpassword"
              type="password"
              placeholder="New Password"
              value={data.npassword}
              onChange={(e) => handleChange("npassword", e.target.value)}
            />
            {fieldErrors.npassword && <span className="text-danger" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>{fieldErrors.npassword}</span>}
          </div>
        </div>
        <div className="col-12">
          <div className="rbt-form-group">
            <label htmlFor="retypenewpassword">Re-type New Password</label>
            <input
              id="retypenewpassword"
              type="password"
              placeholder="Re-type New Password"
              value={data.cpassword}
              onChange={(e) => handleChange("cpassword", e.target.value)}
            />
            {fieldErrors.cpassword && <span className="text-danger" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>{fieldErrors.cpassword}</span>}
          </div>
        </div>
        <FormMessage error={error} success={success} />
        <div className="col-12 mt--10">
          <div className="rbt-form-group">
            {loading ? (
              <FormProgressBar />
            ) : (
              <button className="rbt-btn btn-gradient" onClick={handleSubmit}>
                Update
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

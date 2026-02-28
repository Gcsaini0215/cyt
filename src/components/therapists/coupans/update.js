import { useState, useEffect } from "react";
import { postData } from "../../../utils/actions";
import FormMessage from "../../global/form-message";
import FormProgressBar from "../../global/form-progressbar";
import { UpdateCoupansUrl } from "../../../utils/url";
import { useRouter } from "next/router";


export default function UpdateCoupan({ pageData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [minDate, setMinDate] = useState("");

  const [info, setInfo] = useState({
    code: pageData.code || "",
    discount_type: pageData.discount_type || "",
    discount_value: pageData.discount_value || "",
    max_usage: pageData.max_usage || "",
    valid_from: pageData.valid_from || "",
    valid_until: pageData.valid_until || "",
    coupon_for: pageData.coupon_for || "Therapist"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    if (name === "discount_value" || name === "max_usage") {
      if (!/^\d*$/.test(value)) {
        return;
      }
      newValue = value.slice(0, 4);
    }

    if (name === "code") {
      newValue = value.slice(0, 15);
    }

    if (name === "valid_from" || name === "valid_until") {
      newValue = new Date(value).toISOString();
    }

    setInfo((prevInfo) => ({
      ...prevInfo,
      [name]: newValue,
    }));
  };



  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (info.code === "") {
      setError("Please enter code.");
      return;
    } else if (info.discount_type === "") {
      setError("Please select discount type.");
      return;
    } else if (info.discount_value === "") {
      setError("Please enter discount value.");
      return;
    } else if (info.max_usage === "") {
      setError("Please enter max usage count.");
      return;
    } else if (info.valid_from === "") {
      setError("Please select valid from date.");
      return;
    } else if (info.valid_until === "") {
      setError("Please select valid until date.");
      return;
    } else {
      setError("");
      setLoading(true);

      try {
        const response = await postData(`${UpdateCoupansUrl}/${pageData._id}`, info);
        if (response.status) {
          setSuccess(response.message);
          setError("");
          router.push("/coupons");
        } else {
          setError("Something went wrong");
        }
      } catch (error) {
        setError(error.response.data.message);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
  }, []);

  const selectStyle = { lineHeight: "20px", height: "50px" };
  return (
    <div
      className="tab-pane fade active show"
      id="profile"
      role="tabpanel"
      aria-labelledby="profile-tab"
    >
      <div className="rbt-profile-row rbt-default-form row row--15">
        <div className="col-12">
          <div className="rbt-form-group">
            <label htmlFor="title">Coupan Code</label>
            <input
              id="title"
              type="text"
              name="code"
              value={info.code}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="discount_type">Discount Type</label>
            <select
              id="discount_type"
              style={selectStyle}
              value={info.discount_type}
              name="discount_type"
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>

            </select>
          </div>
        </div>

        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="discount_value">Discount value</label>
            <input
              id="discount_value"
              type="tel"
              value={info.discount_value}
              name="discount_value"
              onChange={handleChange}
            />
          </div>
        </div>


        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="valid_from">Valid From</label>
            <input
              id="valid_from"
              type="date"
              name="valid_from"
              value={info.valid_from ? info.valid_from.split("T")[0] : ""}
              min={minDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="valid_until">Valid Until</label>
            <input
              id="valid_until"
              type="date"
              name="valid_until"
              value={info.valid_until ? info.valid_until.split("T")[0] : ""}
              min={minDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="max_usage">Max Usage</label>
            <input
              id="mrp"
              type="tel"
              value={info.max_usage}
              name="max_usage"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="coupon_for">Can be used for?</label>
            <select
              id="coupon_for"
              style={selectStyle}
              value={info.coupon_for}
              name="coupon_for"
              onChange={handleChange}
            >
              <option value="Therapist" selected>Therapist Booking</option>
              <option value="Workshop">Workshop Booking</option>

            </select>
          </div>
        </div>
        <div className="mt--20">
          <FormMessage error={error} success={success} />
        </div>
        <div className="col-12 mt--20">
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

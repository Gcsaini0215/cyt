import { stateList } from "../../utils/static-lists";
import React, { useState, useRef } from "react";
import { imagePath, updateUserUrl } from "../../utils/url";
import ImageTag from "../../utils/image-tag";
import { postFormData } from "../../utils/actions";
import FormMessage from "../global/form-message";
import FormProgressBar from "../global/form-progressbar";
import useUserStore from "../../store/userStore";
import { getAge } from "../../utils/time";
export default function MyProfile(props) {
  const { userInfo, setInfo } = useUserStore();
  const { data } = props;
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [dob, setDob] = useState(data.dob || "");
  const [anumber, setAnumber] = useState(data.anumber || "");
  const [name, setName] = useState(data.name || "");
  const [nickName, setNickName] = useState(data.nickname || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [state, setState] = useState(data.state || "Select");
  const [gender, setGender] = useState(data.gender || "Select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (name === "") {
      setError("Name can not be empty");
      return;
    } else if (phone === "") {
      setError("Phone Number can not be empty");
      return;
    } else {
      setError("");
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("name", name);
      formData.append("nickname", nickName);
      formData.append("phone", phone);
      formData.append("dob", dob);
      formData.append("anumber", anumber);
      formData.append("state", state);
      formData.append("gender", gender);
      formData.append("age", dob !== "" ? getAge(dob) : "");

      try {
        setLoading(true);
        const response = await postFormData(updateUserUrl, formData);
        if (response.status) {
          setSuccess(response.message);
          setError("");
          if (previewImage !== null) {
            setInfo("profile", previewImage);
          }
          setInfo("name", name);
        } else {
          setError("Something went wrong");
        }
      } catch (error) {
        setError(error?.response?.data?.message || "Something went wrong");
      }
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  const selectStyle = { lineHeight: "20px", height: "50px" };
  return (
    <div
      className="tab-pane fade active show"
      id="profile"
      role="tabpanel"
      aria-labelledby="profile-tab"
    >
      <div className="rbt-dashboard-content-wrapper">
        <div
          className="tutor-bg-photo bg_image bg_image_dash"
          style={{ height: 200 }}
        ></div>
        <div className="rbt-tutor-information">
          <div className="rbt-tutor-information-left">
            <div className="thumbnail rbt-avatars size-lg position-relative">
              <ImageTag
                alt={userInfo.name}
                style={{ height: 120, width: 120, borderRadius: "50%" }}
                src={previewImage != null ? previewImage : `${imagePath}/${userInfo.profile}`}
              />
              <div className="rbt-edit-photo-inner">
                <button
                  className="rbt-edit-photo"
                  title="Upload Photo"
                  onClick={handleImageUpload}
                >
                  {loading ? (
                    <FormProgressBar />
                  ) : (
                    <i className="feather-camera"></i>
                  )}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div className="tutor-content">
              <h5 className="title">{name}</h5>
              <div className="rbt-review">
                <h6 className="title">{userInfo.email}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rbt-profile-row rbt-default-form row row--15">
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              id="fullname"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="fullname">Nick Name</label>
            <input
              id="fullname"
              type="text"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              style={selectStyle}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="phonenumber">Phone Number</label>
            <input
              id="phonenumber"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="phonenumber">Alternate Number</label>
            <input
              id="phonenumber"
              type="tel"
              value={anumber}
              onChange={(e) => setAnumber(e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="phonenumber">Date of Birth</label>
            <input
              id="phonenumber"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="state">State</label>
            <select
              id="state"
              style={selectStyle}
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              {stateList.map((item) => {
                return (
                  <option key={item === "Select" ? "" : item} value={item}>
                    {item}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <FormMessage error={error} success={success} />
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
